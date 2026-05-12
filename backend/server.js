const express = require('express');
const cors = require('cors');
require('dotenv').config();
const pool = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

// Init table
pool.query(`
  CREATE TABLE IF NOT EXISTS todos (
    id SERIAL PRIMARY KEY,
    task TEXT NOT NULL,
    completed BOOLEAN DEFAULT false
  )
`);

// GET all todos
app.get('/todos', async (req, res) => {
  const result = await pool.query('SELECT * FROM todos ORDER BY id ASC');
  res.json(result.rows);
});

// POST create todo
app.post('/todos', async (req, res) => {
  const { task } = req.body;
  const result = await pool.query(
    'INSERT INTO todos (task) VALUES ($1) RETURNING *',
    [task]
  );
  res.json(result.rows[0]);
});

// PUT update todo
app.put('/todos/:id', async (req, res) => {
  const { id } = req.params;
  const { task, completed } = req.body;
  const result = await pool.query(
    'UPDATE todos SET task=$1, completed=$2 WHERE id=$3 RETURNING *',
    [task, completed, id]
  );
  res.json(result.rows[0]);
});

// DELETE todo
app.delete('/todos/:id', async (req, res) => {
  const { id } = req.params;
  await pool.query('DELETE FROM todos WHERE id=$1', [id]);
  res.json({ message: 'Deleted' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));