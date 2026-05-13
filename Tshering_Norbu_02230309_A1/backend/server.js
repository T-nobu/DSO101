require('dotenv').config();
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Use /data directory for Docker, local directory for development
const dbDir = process.env.DOCKER_ENV ? '/app/data' : __dirname;
const dbPath = path.join(dbDir, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

// Create table if it doesn't exist
db.run("CREATE TABLE IF NOT EXISTS tasks (id INTEGER PRIMARY KEY AUTOINCREMENT, description TEXT NOT NULL, completed INTEGER DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)");

// GET all tasks
app.get('/api/tasks', (req, res) => {
  db.all("SELECT * FROM tasks ORDER BY id DESC", (err, rows) => {
    if (err) {
      console.error(err.message);
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// GET single task
app.get('/api/tasks/:id', (req, res) => {
  const { id } = req.params;
  db.get("SELECT * FROM tasks WHERE id = ?", [id], (err, row) => {
    if (err) {
      console.error(err.message);
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }
    res.json(row);
  });
});

// POST create new task
app.post('/api/tasks', (req, res) => {
  const { description } = req.body;
  
  if (!description || description.trim() === '') {
    res.status(400).json({ error: 'Description is required' });
    return;
  }

  db.run("INSERT INTO tasks (description) VALUES (?)", [description], function(err) {
    if (err) {
      console.error(err.message);
      res.status(500).json({ error: err.message });
      return;
    }
    
    db.get("SELECT * FROM tasks WHERE id = ?", [this.lastID], (err, row) => {
      if (err) {
        console.error(err.message);
        res.status(500).json({ error: err.message });
        return;
      }
      res.status(201).json(row);
    });
  });
});

// PUT update task
app.put('/api/tasks/:id', (req, res) => {
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

  db.run(query, values, function(err) {
    if (err) {
      console.error(err.message);
      res.status(500).json({ error: err.message });
      return;
    }
    
    if (this.changes === 0) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }
    
    db.get("SELECT * FROM tasks WHERE id = ?", [id], (err, row) => {
      if (err) {
        console.error(err.message);
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(row);
    });
  });
});

// DELETE task
app.delete('/api/tasks/:id', (req, res) => {
  const { id } = req.params;
  
  db.run("DELETE FROM tasks WHERE id = ?", [id], function(err) {
    if (err) {
      console.error(err.message);
      res.status(500).json({ error: err.message });
      return;
    }
    
    if (this.changes === 0) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }
    
    res.json({ message: 'Task deleted successfully', id: parseInt(id) });
  });
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
