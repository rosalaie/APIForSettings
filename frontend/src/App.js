import './App.css'
import { useEffect, useState } from 'react'

function App() {
  const [users, setUsers] = useState([])

  useEffect(() => {
    fetch('http://localhost:3000/users')
      .then(res => res.json())
      .then(data => setUsers(data))
  }, [])

  return (
    <div>
      <h1>Usuários</h1>
      {users.map(user => (
        <p key={user.id}>{user.nome}</p>
      ))}
    </div>
  )
}

export default App