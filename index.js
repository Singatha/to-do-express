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
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL
  )
`);

// Get all tasks
app.get('/tasks', (req, res) => {
  db.all('SELECT * FROM tasks', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ tasks: rows });
    }
  });
});

// Create task
app.post('/tasks', (req, res) => {
  const { name, description } = req.body;

  db.run('INSERT INTO tasks (name, description) VALUES (?, ?)', [name, description], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ message: 'Task created successfully', todoId: this.lastID });
    }
  });
})

// Update task
app.put('/tasks/:id', (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;

  db.run('UPDATE tasks SET name = ?, description = ? WHERE id = ?', [name, description, id], function(err) {
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
app.delete('/tasks/:id', (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM tasks WHERE id = ?', id, function(err) {
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
