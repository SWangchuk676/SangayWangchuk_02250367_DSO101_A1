import { useEffect, useState } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL;

function App() {
  const [todos, setTodos] = useState([]);
  const [task, setTask] = useState('');
  const [editId, setEditId] = useState(null);
  const [editTask, setEditTask] = useState('');

  const fetchTodos = async () => {
    const res = await axios.get(`${API}/todos`);
    setTodos(res.data);
  };

  useEffect(() => { fetchTodos(); }, []);

  const addTodo = async () => {
    if (!task.trim()) return;
    await axios.post(`${API}/todos`, { task });
    setTask('');
    fetchTodos();
  };

  const deleteTodo = async (id) => {
    await axios.delete(`${API}/todos/${id}`);
    fetchTodos();
  };

  const toggleComplete = async (todo) => {
    await axios.put(`${API}/todos/${todo.id}`, {
      task: todo.task,
      completed: !todo.completed,
    });
    fetchTodos();
  };

  const saveEdit = async (id) => {
    await axios.put(`${API}/todos/${id}`, { task: editTask, completed: false });
    setEditId(null);
    fetchTodos();
  };

  return (
    <div style={{ maxWidth: 500, margin: '50px auto', fontFamily: 'Arial' }}>
      <h1>📝 To-Do List</h1>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          value={task}
          onChange={e => setTask(e.target.value)}
          placeholder="Add a task..."
          style={{ flex: 1, padding: 8 }}
        />
        <button onClick={addTodo} style={{ padding: '8px 16px' }}>Add</button>
      </div>

      <ul style={{ listStyle: 'none', padding: 0, marginTop: 20 }}>
        {todos.map(todo => (
          <li key={todo.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <input type="checkbox" checked={todo.completed} onChange={() => toggleComplete(todo)} />
            {editId === todo.id ? (
              <>
                <input value={editTask} onChange={e => setEditTask(e.target.value)} style={{ flex: 1, padding: 4 }} />
                <button onClick={() => saveEdit(todo.id)}>Save</button>
                <button onClick={() => setEditId(null)}>Cancel</button>
              </>
            ) : (
              <>
                <span style={{ flex: 1, textDecoration: todo.completed ? 'line-through' : 'none' }}>
                  {todo.task}
                </span>
                <button onClick={() => { setEditId(todo.id); setEditTask(todo.task); }}>Edit</button>
                <button onClick={() => deleteTodo(todo.id)}>Delete</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;