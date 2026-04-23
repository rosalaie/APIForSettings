import './App.css'
import { useEffect, useState } from 'react'

function App() {
  const [users, setUsers] = useState([])
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [erro, setErro] = useState('')

  async function listarUsuarios() {
    const res = await fetch('http://localhost:3000/users')
    const data = await res.json()
    setUsers(data)
  }async function criarUsuario() {
  setErro('')

  try {
    const res = await fetch('http://localhost:3000/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ nome, email })
    })

    let data
    try {
      data = await res.json()
    } catch {
      data = { error: 'Resposta inválida do servidor' }
    }

    if (!res.ok) {
      setErro(data.error || 'Erro ao cadastrar')
      return
    }

    setNome('')
    setEmail('')
    listarUsuarios()

  } catch (err) {
    setErro('Erro de conexão com o servidor')
  }
}

  

  useEffect(() => {
    listarUsuarios()
  }, [])

  return (
    <div style={styles.container}>
      <div style={styles.card}>

        <h1 style={styles.title}>Cadastro de Usuários</h1>

        {erro && <p style={styles.error}>{erro}</p>}

        <input
          style={styles.input}
          placeholder="Nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />

        <input
          style={styles.input}
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button onClick={criarUsuario} style={styles.button}>
          Cadastrar
        </button>

        <h2 style={styles.subtitle}>Lista</h2>

        {users.map(user => (
          <div key={user.id} style={styles.user}>
            {user.nome} - {user.email}
          </div>
        ))}

      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    background: '#f3f4f6',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  card: {
    background: '#fff',
    padding: 20,
    borderRadius: 12,
    width: 350,
    boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
  },
  title: {
    textAlign: 'center',
    marginBottom: 15
  },
  input: {
    width: '100%',
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
    border: '1px solid #ccc'
  },
  button: {
    width: '100%',
    padding: 10,
    background: '#3b82f6',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer'
  },
  subtitle: {
    marginTop: 20
  },
  user: {
    background: '#f9fafb',
    padding: 8,
    borderRadius: 8,
    marginTop: 5
  },
  error: {
    color: 'red',
    fontSize: 14,
    marginBottom: 10
  }
}

export default App