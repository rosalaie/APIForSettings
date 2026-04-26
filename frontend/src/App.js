import './App.css'
import { useEffect, useState } from 'react'

function App() {
  const [users, setUsers] = useState([])
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [erro, setErro] = useState('')

  async function listarUsuarios() {
    try {
      const res = await fetch('http://localhost:3000/users')
      const data = await res.json()
      setUsers(data)
    } catch {
      setErro('Erro ao carregar usuários')
    }
  }

  async function criarUsuario() {
    setErro('')
    try {
      const res = await fetch('http://localhost:3000/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ nome, email })
      })

      const data = await res.json()

      if (!res.ok) {
        setErro(data.error)
        return
      }

      setNome('')
      setEmail('')
      listarUsuarios()
    } catch {
      setErro('Erro de conexão com o servidor')
    }
  }

  useEffect(() => {
    listarUsuarios()
  }, [])

  const styles = {
  grid: {
    display: 'flex',
    flexDirection: 'column',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: 10,
    marginTop: 20
  },
  card: {
    background: '#fff',
    padding: 15,
    borderRadius: 8,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems:'center',
    boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
  },
  nome: {
    marginBottom: 5
  },
  email: {
    color: '#555',
    marginBottom: 10
  },
  actions: {
    display: 'flex',
    justifyContent: 'space-between'
  },
  edit: {
    background: '#f59e0b',
    border: 'none',
    color: '#fff',
    padding: '5px 10px',
    borderRadius: 6,
    cursor: 'pointer'
  },
  delete: {
    background: '#ef4444',
    border: 'none',
    color: '#fff',
    padding: '5px 10px',
    borderRadius: 6,
    cursor: 'pointer'
  }
}
  return (
    <>
      {/* MENU */}
     

     

      {/* FORMULÁRIO */}
      <main>
        <h2>Novo Usuário</h2>

        {erro && <p style={{ color: 'red', textAlign: 'center' }}>{erro}</p>}

        <form onSubmit={(e) => e.preventDefault()}>
          <div>
            <label>Nome</label><br />
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
          </div>

          <div>
            <label>Email</label><br />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="button">
            <button className="btn btn-salvar" onClick={criarUsuario}>
              Salvar
            </button>
            <button
              className="btn btn-cancelar"
              onClick={() => {
                setNome('')
                setEmail('')
              }}
            >
              Cancelar
            </button>
          </div>
        </form>

        {/* LISTA */}
        

        
<h2>Lista de Usuários</h2>

<div style={styles.grid}>
  {users.map(user => (
    <div key={user.id} style={styles.card}>
      <h3 style={styles.nome}>{user.nome}</h3>
      <p style={styles.email}>{user.email}</p>

      <div style={styles.actions}>
        <button style={styles.edit}>Editar</button>

        <button
          style={styles.delete}
          onClick={async () => {
            await fetch(`http://localhost:3000/users/${user.id}`, {
              method: 'DELETE'
            })
            listarUsuarios()
          }}
        >
          Excluir
        </button>
      </div>
    </div>
  ))}
</div>
      </main>
    </>
  )
}

export default App