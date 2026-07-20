// frontend/src/pages/Produtos.jsx
import { useEffect, useState } from 'react';
import { FaBoxOpen, FaPlus, FaTrash, FaEdit } from 'react-icons/fa';

export default function Produtos() {
  const [produtos, setProdutos] = useState([]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(true);

  // Estados do formulário de produto
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [preco, setPreco] = useState('');
  const [estoque, setEstoque] = useState('');
  const [imagemUrl, setImagemUrl] = useState('');

  // Estados de categorias para a caixa de seleção (Select)
  const [categorias, setCategorias] = useState([]);
  const [categoriaId, setCategoriaId] = useState('');

  // 1. LISTAR PRODUTOS DO BACKEND
  async function listarProdutos() {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:3000/products');
      if (!res.ok) throw new Error('Erro ao buscar produtos');
      const data = await res.json();
      setProdutos(data);
    } catch (err) {
      console.error(err);
      setErro('Não foi possível carregar o catálogo de produtos.');
    } finally {
      setLoading(false);
    }
  }

  // 2. CARREGAR CATEGORIAS PARA O SELECT
  async function carregarCategoriasParaOSelect() {
    try {
      const res = await fetch('http://localhost:3000/categories');
      if (!res.ok) throw new Error();
      const data = await res.json();
      setCategorias(data);
    } catch (err) {
      console.error("Erro ao carregar categorias no select");
    }
  }

  // 3. CADASTRAR NOVO PRODUTO
  async function criarProduto(e) {
    e.preventDefault();
    setErro('');

    try {
      const res = await fetch('http://localhost:3000/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome,
          descricao,
          preco: parseFloat(preco),
          estoque: parseInt(estoque),
          imagemUrl,
          categoriaId: parseInt(categoriaId) // Envia o ID numérico da categoria
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setErro(data.error || 'Erro ao cadastrar produto');
        return;
      }

      // Limpa os campos e fecha o modal
      setNome('');
      setDescricao('');
      setPreco('');
      setEstoque('');
      setImagemUrl('');
      setCategoriaId('');
      setMostrarForm(false);
      
      // Atualiza a tabela de produtos
      listarProdutos();
    } catch (err) {
      setErro('Erro de conexão com o servidor.');
    }
  }

  // 4. EXCLUIR PRODUTO
  async function excluirProduto(id, nomeProduto) {
    if (window.confirm(`Tem certeza que deseja remover o produto "${nomeProduto}" do catálogo?`)) {
      try {
        const res = await fetch(`http://localhost:3000/products/${id}`, {
          method: 'DELETE'
        });
        if (res.ok) {
          listarProdutos();
        }
      } catch (err) {
        alert('Erro ao tentar excluir o produto.');
      }
    }
  }

  // Ciclo de vida para carregar os dados assim que a tela abre
  useEffect(() => {
    listarProdutos();
    carregarCategoriasParaOSelect();
  }, []);

  return (
    <>
      {/* CABEÇALHO DA PÁGINA */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Catálogo de Produtos</h2>
          <p className="page-subtitle">Gerencie as peças, estoque e preços do e-commerce.</p>
        </div>
        <button className="novo-btn" onClick={() => setMostrarForm(true)}>
          <FaPlus style={{ marginRight: '8px', fontSize: '12px' }} /> Novo Produto
        </button>
      </div>

      {erro && <p className="error-message">{erro}</p>}

      {/* LISTAGEM EM TABELA/CARD */}
      <div className="user-list-card">
        <div className="search-container">
          <span className="search-icon-placeholder">🔍</span>
          <input type="text" className="search-input" placeholder="Buscar produto por nome..." />
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', color: '#666', padding: '20px' }}>Buscando produtos no banco...</p>
        ) : produtos.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
            <FaBoxOpen style={{ fontSize: '48px', marginBottom: '10px' }} />
            <p>Nenhum produto cadastrado no momento.</p>
          </div>
        ) : (
          <table className="user-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Imagem</th>
                <th>Nome</th>
                <th>Preço</th>
                <th>Estoque</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {produtos.map(produto => (
                <tr key={produto.id}>
                  <td className="user-id">{produto.id}</td>
                  <td>
                    {produto.imagemUrl ? (
                      <img src={produto.imagemUrl} alt={produto.nome} style={{ width: '45px', height: '45px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #e2e8f0' }} />
                    ) : (
                      <div style={{ width: '45px', height: '45px', borderRadius: '8px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '12px' }}>Sem foto</div>
                    )}
                  </td>
                  <td className="user-name" style={{ fontWeight: '600' }}>
                    {produto.nome} 
                    <small style={{ display: 'block', color: '#64748b', fontWeight: 'normal', fontSize: '11px', marginTop: '2px' }}>
                      Categoria: {produto.categoria?.nome || 'Nenhuma'}
                    </small>
                  </td>
                  <td style={{ color: '#10b981', fontWeight: '600' }}>
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(produto.preco)}
                  </td>
                  <td>
                    <span style={{ 
                      padding: '4px 10px', 
                      borderRadius: '12px', 
                      fontSize: '12px', 
                      fontWeight: 'bold',
                      background: produto.estoque > 0 ? '#e0f2fe' : '#fee2e2', 
                      color: produto.estoque > 0 ? '#0369a1' : '#b91c1c' 
                    }}>
                      {produto.estoque} un
                    </span>
                  </td>
                  <td className="table-actions">
                    <button className="action-btn edit" title="Editar"><FaEdit /></button>
                    <button className="action-btn delete" title="Excluir" onClick={() => excluirProduto(produto.id, produto.nome)}><FaTrash /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL DE CADASTRO */}
      {mostrarForm && (
        <div className="modal-overlay">
          <form className="modal-content" style={{ width: '500px' }} onSubmit={criarProduto}>
            <button type="button" className="modal-close-btn" onClick={() => setMostrarForm(false)}>×</button>
            <h3 className="modal-title">Adicionar Peça ao Catálogo</h3>
            
            <div className="form-group">
              <label className="form-label">Nome do Produto *</label>
              <input type="text" className="form-input" placeholder="Ex: Vestido Sob Medida Elegance" value={nome} onChange={(e) => setNome(e.target.value)} required />
            </div>

            {/* CAIXA DE SELEÇÃO DE CATEGORIAS */}
            <div className="form-group">
              <label className="form-label">Categoria do Produto *</label>
              <select 
                className="form-input" 
                value={categoriaId} 
                onChange={(e) => setCategoriaId(e.target.value)} 
                required
                style={{ background: '#fff', cursor: 'pointer' }}
              >
                <option value="">Selecione uma categoria...</option>
                {categorias.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nome}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div className="form-group">
                <label className="form-label">Preço (R$) *</label>
                <input type="number" step="0.01" className="form-input" placeholder="0.00" value={preco} onChange={(e) => setPreco(e.target.value)} required />
              </div>

              <div className="form-group">
                <label className="form-label">Estoque Inicial *</label>
                <input type="number" className="form-input" placeholder="0" value={estoque} onChange={(e) => setEstoque(e.target.value)} required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">URL da Imagem</label>
              <input 
                type="url" 
                className="form-input" 
                placeholder="https://linkdafoto.com/imagem.jpg" 
                value={imagemUrl} 
                onChange={(e) => setImagemUrl(e.target.value)} 
              />
            </div>

            <div className="form-group">
              <label className="form-label">Descrição da Peça</label>
              <textarea className="form-input" style={{ height: '80px', resize: 'none', fontFamily: 'inherit' }} placeholder="Detalhes sobre tecido, corte ou caimento..." value={descricao} onChange={(e) => setDescricao(e.target.value)} />
            </div>

            <div className="modal-actions">
              <button type="button" className="modal-btn cancelar" onClick={() => setMostrarForm(false)}>Cancelar</button>
              <button type="submit" className="modal-btn salvar">Salvar Produto</button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}