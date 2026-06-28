import { useState, useEffect } from 'react'

function App() {
  const [tasks, setTasks] = useState([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  // 1. Fetch existing tasks from our Spring Boot backend when the page loads
  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    try {
      const response = await fetch('https://glowing-succotash-5grp4rp9j6jpc4pjw-8080.app.github.dev/api/tasks')
      const data = await response.json()
      setTasks(data)
    } catch (error) {
      console.error('Error fetching tasks:', error)
    }
  }

  // 2. Send a brand new task to our Spring Boot backend database
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim()) return

    const newTask = {
      title,
      description,
      status: 'TODO'
    }

    try {
      const response = await fetch('https://glowing-succotash-5grp4rp9j6jpc4pjw-8080.app.github.dev/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTask),
      })

      if (response.ok) {
        setTitle('')
        setDescription('')
        fetchTasks() // Instantly refresh the task list on screen
      }
    } catch (error) {
      console.error('Error creating task:', error)
    }
  }

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '0 20px', fontFamily: 'sans-serif', color: '#333' }}>
      <h2 style={{ borderBottom: '2px solid #646cff', paddingBottom: '10px' }}>Collaborative Project Manager</h2>
      
      {/* Task Creation Form */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '30px' }}>
        <h3>Create New Task</h3>
        <input 
          type="text" 
          placeholder="Task Title" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)}
          style={{ padding: '10px', fontSize: '16px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <textarea 
          placeholder="Task Description" 
          value={description} 
          onChange={(e) => setDescription(e.target.value)}
          style={{ padding: '10px', fontSize: '16px', borderRadius: '4px', border: '1px solid #ccc', minHeight: '80px' }}
        />
        <button type="submit" style={{ padding: '12px', fontSize: '16px', backgroundColor: '#646cff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
          Add Task
        </button>
      </form>

      {/* Live Task List Display */}
      <h3>Project Board</h3>
      {tasks.length === 0 ? (
        <p style={{ color: '#666', fontStyle: 'italic' }}>No tasks found. Add a task above to get started!</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {tasks.map((task) => (
            <div key={task.id} style={{ padding: '15px', borderRadius: '6px', border: '1px solid #ddd', backgroundColor: '#f9f9f9', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
              <h4 style={{ margin: '0 0 8px 0', color: '#1a1a1a' }}>{task.title}</h4>
              <p style={{ margin: '0 0 10px 0', color: '#555', fontSize: '14px' }}>{task.description}</p>
              <span style={{ fontSize: '12px', padding: '4px 8px', borderRadius: '4px', backgroundColor: '#e2e8f0', fontWeight: 'bold', color: '#4a5568' }}>
                {task.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default App