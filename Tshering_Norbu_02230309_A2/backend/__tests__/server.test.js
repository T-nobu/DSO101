const express = require('express');
const request = require('supertest');
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

describe('Backend API Tests', () => {
  let app;
  let db;
  let testDbPath;

  beforeAll(() => {
    // Create a test database
    testDbPath = path.join(__dirname, 'test-database.sqlite');
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
    
    db = new Database(testDbPath);
    db.exec("CREATE TABLE IF NOT EXISTS tasks (id INTEGER PRIMARY KEY AUTOINCREMENT, description TEXT NOT NULL, completed INTEGER DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)");

    // Create a test Express app with the same routes
    app = express();
    app.use(express.json());

    // GET all tasks
    app.get('/api/tasks', (req, res) => {
      try {
        const rows = db.prepare("SELECT * FROM tasks ORDER BY id DESC").all();
        res.json(rows);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    // GET single task
    app.get('/api/tasks/:id', (req, res) => {
      try {
        const { id } = req.params;
        const row = db.prepare("SELECT * FROM tasks WHERE id = ?").get(id);
        
        if (!row) {
          res.status(404).json({ error: 'Task not found' });
          return;
        }
        res.json(row);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    // POST create new task
    app.post('/api/tasks', (req, res) => {
      try {
        const { description } = req.body;
        
        if (!description || description.trim() === '') {
          res.status(400).json({ error: 'Description is required' });
          return;
        }

        const result = db.prepare("INSERT INTO tasks (description) VALUES (?)").run(description);
        const row = db.prepare("SELECT * FROM tasks WHERE id = ?").get(result.lastInsertRowid);
        res.status(201).json(row);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    // PUT update task
    app.put('/api/tasks/:id', (req, res) => {
      try {
        const { id } = req.params;
        const { description, completed } = req.body;

        const task = db.prepare("SELECT * FROM tasks WHERE id = ?").get(id);
        if (!task) {
          res.status(404).json({ error: 'Task not found' });
          return;
        }

        if (description !== undefined) {
          if (!description || description.trim() === '') {
            res.status(400).json({ error: 'Description is required' });
            return;
          }
          db.prepare("UPDATE tasks SET description = ? WHERE id = ?").run(description, id);
        }

        if (completed !== undefined) {
          db.prepare("UPDATE tasks SET completed = ? WHERE id = ?").run(completed, id);
        }

        const row = db.prepare("SELECT * FROM tasks WHERE id = ?").get(id);
        res.json(row);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    // DELETE task
    app.delete('/api/tasks/:id', (req, res) => {
      try {
        const { id } = req.params;
        const task = db.prepare("SELECT * FROM tasks WHERE id = ?").get(id);
        
        if (!task) {
          res.status(404).json({ error: 'Task not found' });
          return;
        }

        db.prepare("DELETE FROM tasks WHERE id = ?").run(id);
        res.json({ success: true, message: 'Task deleted successfully' });
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

  describe('GET /api/tasks', () => {
    test('should return an empty array initially', async () => {
      const response = await request(app).get('/api/tasks');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });
  });

  describe('POST /api/tasks', () => {
    test('should create a new task', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({ description: 'Test task' });
      
      expect(response.status).toBe(201);
      expect(response.body.description).toBe('Test task');
      expect(response.body.completed).toBe(0);
    });

    test('should fail when description is empty', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({ description: '' });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Description is required');
    });

    test('should fail when description is missing', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({});
      
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Description is required');
    });
  });

  describe('GET /api/tasks/:id', () => {
    test('should return a specific task', async () => {
      // First create a task
      const createResponse = await request(app)
        .post('/api/tasks')
        .send({ description: 'Task to retrieve' });
      
      const taskId = createResponse.body.id;

      // Then get it
      const response = await request(app)
        .get(`/api/tasks/${taskId}`);
      
      expect(response.status).toBe(200);
      expect(response.body.description).toBe('Task to retrieve');
    });

    test('should return 404 for non-existent task', async () => {
      const response = await request(app)
        .get('/api/tasks/9999');
      
      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Task not found');
    });
  });

  describe('PUT /api/tasks/:id', () => {
    test('should update task description', async () => {
      // Create a task
      const createResponse = await request(app)
        .post('/api/tasks')
        .send({ description: 'Original description' });
      
      const taskId = createResponse.body.id;

      // Update it
      const response = await request(app)
        .put(`/api/tasks/${taskId}`)
        .send({ description: 'Updated description' });
      
      expect(response.status).toBe(200);
      expect(response.body.description).toBe('Updated description');
    });

    test('should update task completion status', async () => {
      // Create a task
      const createResponse = await request(app)
        .post('/api/tasks')
        .send({ description: 'Task to complete' });
      
      const taskId = createResponse.body.id;

      // Mark as completed
      const response = await request(app)
        .put(`/api/tasks/${taskId}`)
        .send({ completed: 1 });
      
      expect(response.status).toBe(200);
      expect(response.body.completed).toBe(1);
    });

    test('should return 404 for non-existent task', async () => {
      const response = await request(app)
        .put('/api/tasks/9999')
        .send({ description: 'New description' });
      
      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Task not found');
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    test('should delete a task', async () => {
      // Create a task
      const createResponse = await request(app)
        .post('/api/tasks')
        .send({ description: 'Task to delete' });
      
      const taskId = createResponse.body.id;

      // Delete it
      const response = await request(app)
        .delete(`/api/tasks/${taskId}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verify it's deleted
      const getResponse = await request(app)
        .get(`/api/tasks/${taskId}`);
      
      expect(getResponse.status).toBe(404);
    });

    test('should return 404 for non-existent task', async () => {
      const response = await request(app)
        .delete('/api/tasks/9999');
      
      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Task not found');
    });
  });
});
