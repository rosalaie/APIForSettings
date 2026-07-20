// frontend/src/pages/Categorias.jsx
import { useEffect, useState } from 'react';
import { FaTags, FaPlus, FaTrash, FaEdit } from 'react-icons/fa'; // Importação corrigida aqui!

export default function Categorias() {
  const [categorias, setCategorias] = useState([]);
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [mostrarForm, setMostrarForm] = useState(false);
  const [erro, setErro] = useState('');

  // 1. LISTAR CATEGORIAS
  async function listarCategorias() {
    try {
      const res = await fetch('http://localhost:3000/categories');
      const data = await res.json();
      setCategorias(data);
    } catch (err) {
      setErro('Erro ao carregar categorias.');
    }
  }

  // 2. CADASTRAR CATEGORIA
  async function handleSalvar(e) {
    e.preventDefault();
    setErro('');
    try {
      const res = await fetch('http://localhost:3000/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, descricao })
      });
      
      const data = await res.json();

      if (!res.ok) {
        setErro(data.error || 'Erro ao salvar categoria.');
        return;
      }
      
      setNome('');
      setDescricao('');
      setMostrarForm(false);
      listarCategorias();
    } catch (err) {
      setErro('Erro de conexão com o servidor.');
    }
  }

  // 3. DELETAR CATEGORIA
  async function handleDeletar(id, nomeCategoria) {
    if (window.confirm(`Deseja mesmo excluir a categoria "${nomeCategoria}"?`)) {
      setErro('');
      try {
        const res = await fetch(`http://localhost:3000/categories/${id}`, { method: 'DELETE' });
        const data = await res.json();

        if (!res.ok) {
          // Exibe o aviso se houver produtos amarrados nela
          alert(data.error || 'Não foi possível excluir a categoria.');
          return;
        }

        listarCategorias();
      } catch (err) {
        setErro('Erro ao tentar excluir a categoria.');
      }
    }
  }

  useEffect(() => { 
    listarCategorias(); 
  }, []);

  return (
    <>
      {/* CABEÇALHO */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Categorias do Catálogo</h2>
          <p className="page-subtitle">Organize seus produtos por seções e tipos.</p>
        </div>
        <button className="novo-btn" onClick={() => setMostrarForm(true)}>
          <FaPlus style={{ marginRight: '8px', fontSize: '12px' }} /> Nova Categoria
        </button>
      </div>

      {erro && <p className="error-message">{erro}</p>}

      {/* TABELA DE LISTAGEM */}
      <div className="user-list-card">
        <table className="user-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome da Categoria</th>
              <th>Descrição</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {categorias.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
                  Nenhuma categoria cadastrada.
                </td>
              </tr>
            ) : (
              categorias.map(cat => (
                <tr key={cat.id}>
                  <td className="user-id">{cat.id}</td>
                  <td className="user-name" style={{ fontWeight: '600' }}>{cat.nome}</td>
                  <td>{cat.descricao || 'Sem descrição'}</td>
                  <td className="table-actions">
                    <button 
                      className="action-btn delete" 
                      title="Excluir" 
                      onClick={() => handleDeletar(cat.id, cat.nome)}
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL DE CADASTRO */}
      {mostrarForm && (
        <div className="modal-overlay">
          <form className="modal-content" style={{ width: '400px' }} onSubmit={handleSalvar}>
            <button type="button" className="modal-close-btn" onClick={() => setMostrarForm(false)}>×</button>
            <h3 className="modal-title">Nova Categoria</h3>
            
            <div className="form-group">
              <label className="form-label">Nome *</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Ex: Vestidos de Festa" 
                value={nome} 
                onChange={e => setNome(e.target.value)} 
                required 
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Descrição</label>
              <textarea 
                className="form-input" 
                placeholder="Breve descrição sobre as peças dessa categoria..." 
                value={descricao} 
                onChange={e => setDescricao(e.target.value)} 
                style={{ height: '70px', resize: 'none', fontFamily: 'inherit' }} 
              />
            </div>
            
            <div className="modal-actions">
              <button type="button" className="modal-btn cancelar" onClick={() => setMostrarForm(false)}>Cancelar</button>
              <button type="submit" className="modal-btn salvar">Salvar</button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}