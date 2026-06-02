require('dotenv').config();
const express = require('express');
const Database = require('better-sqlite3');
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true
  })
);
app.use(express.json());

const dbDir = process.env.DOCKER_ENV ? '/app/data' : __dirname;
const dbPath = path.join(dbDir, 'database.sqlite');
const db = new Database(dbPath);

db.exec(
  'CREATE TABLE IF NOT EXISTS tasks (id INTEGER PRIMARY KEY AUTOINCREMENT, description TEXT NOT NULL, completed INTEGER DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)'
);

app.get('/', (req, res) => {
  res.json({
    name: 'A4 Todo API',
    course: 'DSO101 Assignment 4',
    endpoints: { tasks: '/api/tasks', health: '/health' }
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', database: 'SQLite' });
});

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
    const row = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
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
    const updates = [];
    const values = [];

    if (description !== undefined) {
      updates.push('description = ?');
      values.push(description);
    }
    if (completed !== undefined) {
      updates.push('completed = ?');
      values.push(completed ? 1 : 0);
    }
    if (updates.length === 0) {
      res.status(400).json({ error: 'No fields to update' });
      return;
    }

    values.push(id);
    const result = db.prepare(`UPDATE tasks SET ${updates.join(', ')} WHERE id = ?`).run(...values);
    if (result.changes === 0) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }
    res.json(db.prepare('SELECT * FROM tasks WHERE id = ?').get(id));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/tasks/:id', (req, res) => {
  try {
    const result = db.prepare('DELETE FROM tasks WHERE id = ?').run(req.params.id);
    if (result.changes === 0) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }
    res.json({ message: 'Task deleted successfully', id: parseInt(req.params.id, 10) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

if (require.main === module) {
  app.listen(port, () => {
    console.log(`A4 Todo API running on http://localhost:${port}`);
  });
}

module.exports = app;
