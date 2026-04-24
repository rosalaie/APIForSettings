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

        <table>
          <thead>
            <tr className="cabecalho">
              <th>ID</th>
              <th>Nome</th>
              <th>Email</th>
              <th>Ações</th>
            </tr>
          </thead>

          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.nome}</td>
                <td>{user.email}</td>
                <td className="buttontable">
                  <button
                    className="btntable btn-excluir"
                    onClick={async () => {
                      await fetch(`http://localhost:3000/users/${user.id}`, {
                        method: 'DELETE'
                      })
                      listarUsuarios()
                    }}
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

      </main>
    </>
  )
}

export default App