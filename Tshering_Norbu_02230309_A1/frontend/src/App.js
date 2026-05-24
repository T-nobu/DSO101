// frontend/src/App.js - COMPLETE FILE
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

// Get API URL from environment variable
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [editingTask, setEditingTask] = useState(null);
  const [editDescription, setEditDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch tasks on component mount
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/tasks`);
      setTasks(response.data);
      setError('');
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setError('Failed to load tasks. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const addTask = async () => {
    if (newTask.trim() === '') {
      setError('Please enter a task description');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api/tasks`, {
        description: newTask
      });
      setTasks([response.data, ...tasks]);
      setNewTask('');
      setError('');
    } catch (error) {
      console.error('Error adding task:', error);
      setError('Failed to add task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const deleteTask = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;

    setLoading(true);
    try {
      await axios.delete(`${API_URL}/api/tasks/${id}`);
      setTasks(tasks.filter(task => task.id !== id));
      setError('');
    } catch (error) {
      console.error('Error deleting task:', error);
      setError('Failed to delete task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (task) => {
    setEditingTask(task);
    setEditDescription(task.description);
  };

  const cancelEdit = () => {
    setEditingTask(null);
    setEditDescription('');
  };

  const updateTask = async () => {
    if (editDescription.trim() === '') {
      setError('Task description cannot be empty');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.put(`${API_URL}/api/tasks/${editingTask.id}`, {
        description: editDescription
      });
      setTasks(tasks.map(task => 
        task.id === editingTask.id ? response.data : task
      ));
      setEditingTask(null);
      setEditDescription('');
      setError('');
    } catch (error) {
      console.error('Error updating task:', error);
      setError('Failed to update task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleComplete = async (task) => {
    setLoading(true);
    try {
      const response = await axios.put(`${API_URL}/api/tasks/${task.id}`, {
        completed: !task.completed
      });
      setTasks(tasks.map(t => 
        t.id === task.id ? response.data : t
      ));
      setError('');
    } catch (error) {
      console.error('Error toggling task:', error);
      setError('Failed to update task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      addTask();
    }
  };

  const handleEditKeyPress = (e) => {
    if (e.key === 'Enter') {
      updateTask();
    }
  };

  return (
    <div className="App">
      <div className="container">
        <h1>📝 To-Do List Application</h1>
        
        {error && <div className="error-message">{error}</div>}
        
        <div className="add-task-section">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter a new task..."
            disabled={loading}
            className="task-input"
          />
          <button onClick={addTask} disabled={loading} className="add-button">
            {loading ? 'Adding...' : 'Add Task'}
          </button>
        </div>

        <div className="tasks-section">
          <h2>Your Tasks ({tasks.length})</h2>
          {loading && tasks.length === 0 ? (
            <div className="loading">Loading tasks...</div>
          ) : tasks.length === 0 ? (
            <div className="empty-state">No tasks yet. Add one above!</div>
          ) : (
            <ul className="tasks-list">
              {tasks.map((task) => (
                <li key={task.id} className={`task-item ${task.completed ? 'completed' : ''}`}>
                  {editingTask && editingTask.id === task.id ? (
                    <div className="edit-mode">
                      <input
                        type="text"
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        onKeyPress={handleEditKeyPress}
                        className="edit-input"
                        autoFocus
                      />
                      <button onClick={updateTask} className="save-button">Save</button>
                      <button onClick={cancelEdit} className="cancel-button">Cancel</button>
                    </div>
                  ) : (
                    <div className="task-content">
                      <input
                        type="checkbox"
                        checked={task.completed === 1}
                        onChange={() => toggleComplete(task)}
                        className="task-checkbox"
                      />
                      <span className="task-text">{task.description}</span>
                      <div className="task-buttons">
                        <button onClick={() => startEdit(task)} className="edit-button">
                          Edit
                        </button>
                        <button onClick={() => deleteTask(task.id)} className="delete-button">
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;