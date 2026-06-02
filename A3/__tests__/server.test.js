const express = require('express');
const request = require('supertest');
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

describe('Todo API', () => {
  let app;
  let db;
  let testDbPath;

  beforeAll(() => {
    testDbPath = path.join(__dirname, 'test-database.sqlite');
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }

    db = new Database(testDbPath);
    db.exec(
      'CREATE TABLE IF NOT EXISTS tasks (id INTEGER PRIMARY KEY AUTOINCREMENT, description TEXT NOT NULL, completed INTEGER DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)'
    );

    app = express();
    app.use(express.json());

    app.get('/api/tasks', (req, res) => {
      try {
        const rows = db.prepare('SELECT * FROM tasks ORDER BY id DESC').all();
        res.json(rows);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    app.get('/api/tasks/:id', (req, res) => {
      try {
        const { id } = req.params;
        const row = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);

        if (!row) {
          res.status(404).json({ error: 'Task not found' });
          return;
        }
        res.json(row);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    app.post('/api/tasks', (req, res) => {
      try {
        const { description } = req.body;

        if (!description || description.trim() === '') {
          res.status(400).json({ error: 'Description is required' });
          return;
        }

        const result = db.prepare('INSERT INTO tasks (description) VALUES (?)').run(description);
        const row = db.prepare('SELECT * FROM tasks WHERE id = ?').get(result.lastInsertRowid);
        res.status(201).json(row);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    app.put('/api/tasks/:id', (req, res) => {
      try {
        const { id } = req.params;
        const { description, completed } = req.body;

        const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
        if (!task) {
          res.status(404).json({ error: 'Task not found' });
          return;
        }

        if (description !== undefined) {
          db.prepare('UPDATE tasks SET description = ? WHERE id = ?').run(description, id);
        }

        if (completed !== undefined) {
          db.prepare('UPDATE tasks SET completed = ? WHERE id = ?').run(completed, id);
        }

        const row = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
        res.json(row);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    app.delete('/api/tasks/:id', (req, res) => {
      try {
        const { id } = req.params;
        const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);

        if (!task) {
          res.status(404).json({ error: 'Task not found' });
          return;
        }

        db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
        res.json({ message: 'Task deleted successfully', id: parseInt(id, 10) });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });
  });

  afterAll(() => {
    if (db) db.close();
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
  });

  test('GET /api/tasks returns empty list initially', async () => {
    const response = await request(app).get('/api/tasks');
    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  test('POST /api/tasks creates a task', async () => {
    const response = await request(app).post('/api/tasks').send({ description: 'Test task' });
    expect(response.status).toBe(201);
    expect(response.body.description).toBe('Test task');
    expect(response.body.completed).toBe(0);
  });

  test('POST /api/tasks rejects empty description', async () => {
    const response = await request(app).post('/api/tasks').send({ description: '' });
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Description is required');
  });

  test('GET /api/tasks/:id returns a task', async () => {
    const created = await request(app).post('/api/tasks').send({ description: 'Find me' });
    const response = await request(app).get(`/api/tasks/${created.body.id}`);
    expect(response.status).toBe(200);
    expect(response.body.description).toBe('Find me');
  });

  test('PUT /api/tasks/:id updates a task', async () => {
    const created = await request(app).post('/api/tasks').send({ description: 'Before' });
    const response = await request(app)
      .put(`/api/tasks/${created.body.id}`)
      .send({ description: 'After', completed: 1 });
    expect(response.status).toBe(200);
    expect(response.body.description).toBe('After');
    expect(response.body.completed).toBe(1);
  });

  test('DELETE /api/tasks/:id removes a task', async () => {
    const created = await request(app).post('/api/tasks').send({ description: 'Delete me' });
    const response = await request(app).delete(`/api/tasks/${created.body.id}`);
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Task deleted successfully');
  });
});
