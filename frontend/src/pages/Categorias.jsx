// frontend/src/pages/Categorias.jsx
import { useEffect, useState } from 'react';
import { FaPlus, FaTrash, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

export default function Categorias() {
  const [categorias, setCategorias] = useState([]);
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [mostrarForm, setMostrarForm] = useState(false);
  const [erro, setErro] = useState('');

  // ESTADOS DE PAGINAÇÃO (10 por página)
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 10;

  // 1. LISTAR CATEGORIAS
  async function listarCategorias() {
    try {
      const res = await fetch('http://localhost:3000/categories');
      const data = await res.json();
      // Garantia para EVITAR erro de .map is not a function
      if (Array.isArray(data)) {
        setCategorias(data);
      } else if (data && Array.isArray(data.categories)) {
        setCategorias(data.categories);
      } else {
        setCategorias([]);
      }
    } catch (err) {
      setErro('Erro ao carregar categorias.');
      setCategorias([]);
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
          alert(data.error || 'Não foi possível excluir a categoria.');
          return;
        }

        listarCategorias();
      } catch (err) {
        setErro('Erro ao tentar excluir a categoria.');
      }
    }
  }

  // --- LÓGICA DE PAGINAÇÃO ---
  const listaCategorias = Array.isArray(categorias) ? categorias : [];
  const totalPaginas = Math.ceil(listaCategorias.length / itensPorPagina) || 1;
  const indiceInicial = (paginaAtual - 1) * itensPorPagina;
  const categoriasPaginadas = listaCategorias.slice(indiceInicial, indiceInicial + itensPorPagina);

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

      {/* TABELA DE LISTAGEM SEM A COLUNA ID */}
      <div className="user-list-card">
        <table className="user-table">
          <thead>
            <tr>
              <th>Nome da Categoria</th>
              <th>Descrição</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {listaCategorias.length === 0 ? (
              <tr>
                <td colSpan="3" style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
                  Nenhuma categoria cadastrada.
                </td>
              </tr>
            ) : (
              categoriasPaginadas.map(cat => (
                <tr key={cat.id}>
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

        {/* BARRA DE PAGINAÇÃO PADRONIZADA (MAX 10 ITENS POR PÁGINA) */}
        {listaCategorias.length > 0 && (
          <div className="pagination-container">
            <span className="pagination-info">
              Exibindo {indiceInicial + 1} a {Math.min(indiceInicial + itensPorPagina, listaCategorias.length)} de {listaCategorias.length} categorias
            </span>

            <div className="pagination-buttons">
              <button 
                className="page-btn" 
                onClick={() => setPaginaAtual(prev => Math.max(prev - 1, 1))}
                disabled={paginaAtual === 1}
              >
                <FaChevronLeft style={{ fontSize: '10px', marginRight: '4px' }} /> Anterior
              </button>

              {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(num => (
                <button
                  key={num}
                  className={`page-btn ${paginaAtual === num ? 'active' : ''}`}
                  onClick={() => setPaginaAtual(num)}
                >
                  {num}
                </button>
              ))}

              <button 
                className="page-btn" 
                onClick={() => setPaginaAtual(prev => Math.min(prev + 1, totalPaginas))}
                disabled={paginaAtual === totalPaginas}
              >
                Próxima <FaChevronRight style={{ fontSize: '10px', marginLeft: '4px' }} />
              </button>
            </div>
          </div>
        )}
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