const express = require('express');
const request = require('supertest');
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

describe('Unit tests', () => {
  test('basic sanity check (sample test)', () => {
    expect(1 + 1).toBe(2);
  });
});

describe('Todo API integration tests', () => {
  let app;
  let db;
  let testDbPath;

  beforeAll(() => {
    testDbPath = path.join(__dirname, 'test-database.sqlite');
    if (fs.existsSync(testDbPath)) fs.unlinkSync(testDbPath);

    db = new Database(testDbPath);
    db.exec(
      'CREATE TABLE IF NOT EXISTS tasks (id INTEGER PRIMARY KEY AUTOINCREMENT, description TEXT NOT NULL, completed INTEGER DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)'
    );

    app = express();
    app.use(express.json());

    app.get('/api/tasks', (req, res) => {
      res.json(db.prepare('SELECT * FROM tasks ORDER BY id DESC').all());
    });

    app.post('/api/tasks', (req, res) => {
      const { description } = req.body;
      if (!description || description.trim() === '') {
        res.status(400).json({ error: 'Description is required' });
        return;
      }
      const result = db.prepare('INSERT INTO tasks (description) VALUES (?)').run(description);
      const row = db.prepare('SELECT * FROM tasks WHERE id = ?').get(result.lastInsertRowid);
      res.status(201).json(row);
    });

    app.put('/api/tasks/:id', (req, res) => {
      const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
      if (!task) {
        res.status(404).json({ error: 'Task not found' });
        return;
      }
      if (req.body.description !== undefined) {
        db.prepare('UPDATE tasks SET description = ? WHERE id = ?').run(req.body.description, req.params.id);
      }
      if (req.body.completed !== undefined) {
        db.prepare('UPDATE tasks SET completed = ? WHERE id = ?').run(req.body.completed, req.params.id);
      }
      res.json(db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id));
    });

    app.delete('/api/tasks/:id', (req, res) => {
      const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
      if (!task) {
        res.status(404).json({ error: 'Task not found' });
        return;
      }
      db.prepare('DELETE FROM tasks WHERE id = ?').run(req.params.id);
      res.json({ message: 'Task deleted successfully' });
    });
  });

  afterAll(() => {
    if (db) db.close();
    if (fs.existsSync(testDbPath)) fs.unlinkSync(testDbPath);
  });

  test('GET /api/tasks returns empty list', async () => {
    const res = await request(app).get('/api/tasks');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  test('POST /api/tasks creates a task', async () => {
    const res = await request(app).post('/api/tasks').send({ description: 'Learn CI/CD' });
    expect(res.status).toBe(201);
    expect(res.body.description).toBe('Learn CI/CD');
  });

  test('PUT /api/tasks/:id updates a task', async () => {
    const created = await request(app).post('/api/tasks').send({ description: 'Before' });
    const res = await request(app)
      .put(`/api/tasks/${created.body.id}`)
      .send({ completed: 1 });
    expect(res.status).toBe(200);
    expect(res.body.completed).toBe(1);
  });

  test('DELETE /api/tasks/:id removes a task', async () => {
    const created = await request(app).post('/api/tasks').send({ description: 'Remove me' });
    const res = await request(app).delete(`/api/tasks/${created.body.id}`);
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Task deleted successfully');
  });
});
