const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Create a new database connection
const db = new sqlite3.Database('database.db');

// Create a table (if not exists)
db.run(`
  CREATE TABLE IF NOT EXISTS task (
    task_id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_name TEXT NOT NULL,
    task_description VARCHAR(255),
    task_status VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
`);

// Get all tasks
app.get('/tasks', (req, res) => {
  db.all('SELECT * FROM task', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ tasks: rows });
    }
  });
});

// Create task
app.post('/create', (req, res) => {
  const { task_name, task_description, task_status } = req.body;

  db.run('INSERT INTO task (task_name, task_description, task_status) VALUES (?, ?, ?)', [task_name, task_description, task_status], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ message: 'Task created successfully', todoId: this.lastID });
    }
  });
})

// Update task
app.put('/update/:id', (req, res) => {
  const { id } = req.params;
  const { task_name, task_description, task_status } = req.body;

  db.run('UPDATE task SET task_name = ?, task_description = ?, task_status = ? WHERE task_id = ?', [task_name, task_description, task_status, id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (this.changes === 0) {
      res.status(404).json({ message: 'Task not found' });
    } else {
      res.json({ message: 'Task updated successfully' });
    }
  });
})

// Delete task
app.delete('/delete/:id', (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM task WHERE task_id = ?', id, function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (this.changes === 0) {
      res.status(404).json({ message: 'Tasks not found' });
    } else {
      res.json({ message: 'Tasks deleted successfully' });
    }
  });
})

app.listen(PORT, () => {
  console.log(`Tasks app listening on port ${PORT}`)
})
