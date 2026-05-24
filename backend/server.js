require('dotenv').config();
const express = require('express');
const Database = require('better-sqlite3');
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 5000;

// CORS configuration - allow all origins in development, specific origins in production
const corsOptions = {
  origin: function(origin, callback) {
    const allowedOrigins = [
      'https://app-frontend-87kf.onrender.com',
      'https://app-backend-8l9n.onrender.com',
      'https://be-todo.onrender.com',
      'https://fe-todo.onrender.com',
      'http://localhost:3000',
      'http://localhost:5000',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5000'
    ];
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed'), false);
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// Use /data directory for Docker, local directory for development
const dbDir = process.env.DOCKER_ENV ? '/app/data' : __dirname;
const dbPath = path.join(dbDir, 'database.sqlite');
const db = new Database(dbPath);

// Create table if it doesn't exist
db.exec("CREATE TABLE IF NOT EXISTS tasks (id INTEGER PRIMARY KEY AUTOINCREMENT, description TEXT NOT NULL, completed INTEGER DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)");

// GET all tasks
app.get('/api/tasks', (req, res) => {
  try {
    const rows = db.prepare("SELECT * FROM tasks ORDER BY id DESC").all();
    res.json(rows);
  } catch (err) {
    console.error(err.message);
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
    console.error(err.message);
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
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

// PUT update task
app.put('/api/tasks/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { description, completed } = req.body;

    let updates = [];
    let values = [];

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
    const query = "UPDATE tasks SET " + updates.join(', ') + " WHERE id = ?";
    const result = db.prepare(query).run(...values);

    if (result.changes === 0) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }
    
    const row = db.prepare("SELECT * FROM tasks WHERE id = ?").get(id);
    res.json(row);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

// DELETE task
app.delete('/api/tasks/:id', (req, res) => {
  try {
    const { id } = req.params;
    const result = db.prepare("DELETE FROM tasks WHERE id = ?").run(id);
    
    if (result.changes === 0) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }
    
    res.json({ message: 'Task deleted successfully', id: parseInt(id) });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', database: 'SQLite' });
});

// Start server
app.listen(port, () => {
  console.log('Backend server running on http://localhost:' + port);
  console.log('SQLite database location: ' + dbPath);
});
