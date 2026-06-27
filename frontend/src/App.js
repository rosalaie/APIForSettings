// src/App.js
import './App.css'
import { useEffect, useState } from 'react'

// Uma representação simplificada de ícones para o menu
const IconPlaceholder = () => <div style={{ width: '16px', height: '16px', background: '#ccc', borderRadius: '4px', marginRight: '10px' }}></div>;

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

  return (
    <div className="app-layout">
      {/* 1. BARRA LATERAL (SIDEBAR) */}
      <aside className="sidebar">
        <div className="sidebar-title">
          <IconPlaceholder /> {/* Substitua por um ícone real se tiver */}
          Sistema de Usuários
        </div>
        
        <nav className="sidebar-menu">
          <a href="#" className="menu-item active">
            <IconPlaceholder /> Usuários
          </a>
          <a href="#" className="menu-item">
            <IconPlaceholder /> Dashboard
          </a>
          <a href="#" className="menu-item">
            <IconPlaceholder /> Configurações
          </a>
        </nav>

        <div className="sidebar-user">
          <div className="avatar-circle">AD</div>
          <div className="user-info">
            <div className="user-name">Administrador</div>
            <div className="user-status">admin@admin.com</div>
          </div>
        </div>
      </aside>

      {/* 2. ÁREA PRINCIPAL */}
      <main className="main-content">
        {/* TOPO (TOPBAR) */}
        <header className="topbar">
          <div className="topbar-left">
            <button className="icon-btn" title="Menu">☰</button>
            <button className="icon-btn" title="Voltar">⬅</button>
            <div className="sidebar-title" style={{color: '#333', fontSize: '18px', margin: 0}}>Usuários</div>
          </div>

          <div className="topbar-right">
            <button className="icon-btn">⚙️</button>
            <button className="icon-btn" title="Sair">⏻</button>
          </div>
        </header>

        {/* CONTEÚDO PRINCIPAL (CONTENT AREA) */}
        <div className="content-area">
          <div className="page-header">
            <div>
              <h2 className="page-title">Usuários</h2>
              <p className="page-subtitle">Gerencie os usuários cadastrados no sistema.</p>
            </div>
            <button
              className="novo-btn"
              onClick={() => setMostrarForm(true)}
            >
              + Novo usuário
            </button>
          </div>

          {erro && <p className="error-message">{erro}</p>}

          {/* LISTA DE USUÁRIOS NO CARTÃO (CARD) */}
          <div className="user-list-card">
            <div className="search-container">
              <span className="search-icon-placeholder">🔍</span>
              <input type="text" className="search-input" placeholder="Buscar usuário por nome ou email..." />
            </div>

            {users.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#666' }}>Nenhum usuário cadastrado</p>
            ) : (
              <table className="user-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nome</th>
                    <th>Email</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id}>
                      <td className="user-id">{user.id}</td>
                      <td className="user-name">{user.nome}</td>
                      <td className="user-email">{user.email}</td>
                      <td className="table-actions">
                        <button className="action-btn edit" title="Editar">
                          ✏️
                        </button>
                        <button
                          className="action-btn delete"
                          title="Excluir"
                          onClick={async () => {
                            // Um prompt simples para confirmação
                            if (window.confirm(`Tem certeza que deseja excluir o usuário ${user.nome}?`)) {
                              await fetch(`http://localhost:3000/users/${user.id}`, {
                                method: 'DELETE'
                              })
                              listarUsuarios()
                            }
                          }}
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>

      {/* FORMULÁRIO (MODAL) */}
      {mostrarForm && (
        <div className="modal-overlay">
          <form className="modal-content" onSubmit={(e) => e.preventDefault()}>
            <button className="modal-close-btn" onClick={() => setMostrarForm(false)}>×</button>
            <h3 className="modal-title">Novo usuário</h3>
            
            <div className="form-group">
              <label className="form-label">Nome</label>
              <input
                type="text"
                className="form-input"
                placeholder="Digite o nome do usuário"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-input"
                placeholder="Digite o email do usuário"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="modal-btn cancelar"
                onClick={() => {
                  setMostrarForm(false)
                  setNome('')
                  setEmail('')
                  setErro('')
                }}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="modal-btn salvar"
                onClick={criarUsuario}
              >
                Salvar
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

export default App