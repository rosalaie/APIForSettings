import './App.css'
import { useEffect, useState } from 'react'

function App() {
  const [mostrarForm, setMostrarForm] = useState(false)
  const [users, setUsers] = useState([])
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [erro, setErro] = useState('')

  async function listarUsuarios() {
    try {
      const res = await fetch('http://localhost:3000/users')

      if (!res.ok) {
        throw new Error('Erro ao buscar usuários')
      }

      const data = await res.json()
      setUsers(data)

    } catch (err) {
      console.error(err)
      setErro('Erro ao carregar usuários')
    }
  }

  async function criarUsuario() {
    setErro('')
    try {
      const res = await fetch('http://localhost:3000/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email })
      })

      const data = await res.json()

      if (!res.ok) {
        setErro(data.error)
        return
      }

      setNome('')
      setEmail('')
      setMostrarForm(false)
      listarUsuarios()

    } catch {
      setErro('Erro de conexão com o servidor')
    }
  }

  useEffect(() => {
    listarUsuarios()
  }, [])

  const styles = {
    topbar: {
      height: 60,
      background: '#1f2937',
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 20px',
      boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
    },
    left: {
      display: 'flex',
      gap: 10
    },
    center: {
      position: 'absolute',
      left: '50%',
      transform: 'translateX(-50%)'
    },
    right: {
      display: 'flex',
      gap: 10
    },
    title: {
      margin: 0,
      fontSize: 18
    },
    iconBtn: {
      background: 'transparent',
      border: 'none',
      color: '#fff',
      fontSize: 16,
      cursor: 'pointer',
      padding: 8,
      borderRadius: 6,
      opacity: 0.8
    },
    container: {
      maxWidth: 1100,
      margin: 'auto',
      padding: 20
    },
    grid: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      marginTop: 20
    },
    card: {
      background: '#fff',
      padding: 15,
      borderRadius: 8,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
    },
    nome: { marginBottom: 5 },
    email: { color: '#555' },
    actions: {
      display: 'flex',
      gap: 10
    },
    novoBtn: {
      background: '#2563eb',
      color: '#fff',
      border: 'none',
      padding: '10px 15px',
      borderRadius: 8,
      cursor: 'pointer',
      marginBottom: 20
    },
    formBox: {
      background: '#fff',
      padding: 15,
      borderRadius: 10,
      marginBottom: 20,
      boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
    },
    salvar: {
      background: '#16a34a',
      color: '#fff',
      border: 'none',
      padding: '8px 12px',
      borderRadius: 6,
      cursor: 'pointer'
    },
    cancelar: {
      background: '#dc2626',
      color: '#fff',
      border: 'none',
      padding: '8px 12px',
      borderRadius: 6,
      cursor: 'pointer'
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
    },
    error: {
      color: 'red',
      marginBottom: 10,
      textAlign: 'center'
    }
  }

  return (
    <>
      {/* TOPO */}
      <header style={styles.topbar}>
        <div style={styles.left}>
          <button style={styles.iconBtn} title="Menu">☰</button>
          <button style={styles.iconBtn} title="Voltar">⬅</button>
        </div>

        <div style={styles.center}>
          <h3 style={styles.title}>Usuários</h3>
        </div>

        <div style={styles.right}>
          <button style={styles.iconBtn}>⚙️</button>
          <button style={styles.iconBtn} title="Sair">⏻</button>
        </div>
      </header>

      {/* CONTEÚDO */}
      <main style={styles.container}>
        <h2>Usuários</h2>

        {/* BOTÃO DIREITA */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            style={styles.novoBtn}
            onClick={() => setMostrarForm(true)}
          >
            Adicionar usuário
          </button>
        </div>

        {erro && <p style={styles.error}>{erro}</p>}

        {/* FORM */}
        {mostrarForm && (
          <form onSubmit={(e) => e.preventDefault()} style={styles.formBox}>
            <input
              type="text"
              placeholder="Nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <div style={styles.actions}>
              <button onClick={criarUsuario} style={styles.salvar}>
                Salvar
              </button>

              <button
                onClick={() => {
                  setMostrarForm(false)
                  setNome('')
                  setEmail('')
                  setErro('')
                }}
                style={styles.cancelar}
              >
                Cancelar
              </button>
            </div>
          </form>
        )}

        {/* LISTA */}
        {users.length === 0 ? (
          <p>Nenhum usuário cadastrado</p>
        ) : (
          <div style={styles.grid}>
            {users.map(user => (
              <div key={user.id} style={styles.card}>
                <div>
                  <h3 style={styles.nome}>{user.nome}</h3>
                  <p style={styles.email}>{user.email}</p>
                </div>

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
        )}
      </main>
    </>
  )
}

export default App