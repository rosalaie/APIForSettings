import { useEffect, useState } from 'react';
import { FaBoxOpen, FaPlus, FaTrash, FaEdit, FaCheckCircle, FaSearch, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

export default function Produtos() {
  const navigate = useNavigate();
  const [produtos, setProdutos] = useState([]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(true);
  const [enviandoImagem, setEnviandoImagem] = useState(false);
  const [busca, setBusca] = useState('');

  // Estados do formulário
  const [produtoEditandoId, setProdutoEditandoId] = useState(null);
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [preco, setPreco] = useState('');
  const [imagemArquivo, setImagemArquivo] = useState(null);
  const [previewImagem, setPreviewImagem] = useState('');
  const [categorias, setCategorias] = useState([]);
  const [categoriaId, setCategoriaId] = useState('');
  const [buscaCategoria, setBuscaCategoria] = useState('');

  // ESTADOS DE PAGINAÇÃO (10 por página)
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 10;

  const IMGBB_API_KEY = '7977dacd0664e5cededa23464cff6599';

  async function listarProdutos() {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:3000/products');
      if (!res.ok) throw new Error('Erro ao buscar produtos');
      const data = await res.json();
      setProdutos(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setErro('Não foi possível carregar o catálogo de produtos.');
      setProdutos([]);
    } finally {
      setLoading(false);
    }
  }

  async function carregarCategoriasParaOSelect() {
    try {
      const res = await fetch('http://localhost:3000/categories');
      if (!res.ok) throw new Error();
      const data = await res.json();
      // Garantia para EVITAR o erro "map is not a function"
      if (Array.isArray(data)) {
        setCategorias(data);
      } else if (data && Array.isArray(data.categories)) {
        setCategorias(data.categories);
      } else {
        setCategorias([]);
      }
    } catch (err) {
      console.error("Erro ao carregar categorias:", err);
      setCategorias([]);
    }
  }

  function abrirModalNovoProduto() {
    setProdutoEditandoId(null);
    setNome('');
    setDescricao('');
    setPreco('');
    setImagemArquivo(null);
    setPreviewImagem('');
    setCategoriaId('');
    setBuscaCategoria('');
    setErro('');
    setMostrarForm(true);
  }

  function prepararEdicao(produto) {
    setProdutoEditandoId(produto.id);
    setNome(produto.nome || '');
    setDescricao(produto.descricao || '');
    setPreco(produto.preco ? produto.preco.toString() : '');
    setCategoriaId(produto.categoriaId ? produto.categoriaId.toString() : '');
    setPreviewImagem(produto.imagemUrl || '');
    setImagemArquivo(null);
    setErro('');
    setMostrarForm(true);
  }

  function handleSelecionarImagem(e) {
    const arquivo = e.target.files[0];
    if (arquivo) {
      setImagemArquivo(arquivo);
      setPreviewImagem(URL.createObjectURL(arquivo));
    }
  }

  async function fazerUploadImagemImgBB() {
    if (!imagemArquivo) return previewImagem;

    const formData = new FormData();
    formData.append('image', imagemArquivo);

    const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
      method: 'POST',
      body: formData
    });

    const data = await res.json();
    if (data.success) {
      return data.data.url;
    } else {
      throw new Error('Falha ao enviar imagem para o serviço externo.');
    }
  }

  async function salvarProduto(e) {
    e.preventDefault();
    setErro('');

    if (parseFloat(preco) <= 0 || isNaN(parseFloat(preco))) {
      setErro('O preço deve ser um valor positivo maior que zero (Ex: R$ 0.01).');
      return;
    }

    if (!previewImagem && !imagemArquivo) {
      setErro('A foto do produto é obrigatória (*).');
      return;
    }

    if (!descricao.trim()) {
      setErro('A descrição da peça é obrigatória (*).');
      return;
    }

    setEnviandoImagem(true);

    try {
      let finalImagemUrl = previewImagem;

      if (imagemArquivo) {
        finalImagemUrl = await fazerUploadImagemImgBB();
      }

      const ehEdicao = !!produtoEditandoId;
      const url = ehEdicao 
        ? `http://localhost:3000/products/${produtoEditandoId}`
        : 'http://localhost:3000/products';

      const res = await fetch(url, {
        method: ehEdicao ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome,
          descricao,
          preco: parseFloat(preco),
          imagemUrl: finalImagemUrl,
          categoriaId: parseInt(categoriaId)
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erro ao salvar produto');
      }

      setMostrarForm(false);
      listarProdutos();
    } catch (err) {
      console.error(err);
      setErro(err.message || 'Erro ao comunicar com o servidor.');
    } finally {
      setEnviandoImagem(false);
    }
  }

  async function excluirProduto(id, nomeProduto) {
    if (window.confirm(`Tem certeza que deseja remover o produto "${nomeProduto}"?`)) {
      try {
        const res = await fetch(`http://localhost:3000/products/${id}`, { method: 'DELETE' });
        if (res.ok) listarProdutos();
      } catch (err) {
        alert('Erro ao excluir o produto.');
      }
    }
  }

  // --- FILTROS E LÓGICA DE PAGINAÇÃO ---
  const produtosFiltrados = (Array.isArray(produtos) ? produtos : []).filter(p =>
    p.nome.toLowerCase().includes(busca.toLowerCase())
  );

  const totalPaginas = Math.ceil(produtosFiltrados.length / itensPorPagina) || 1;
  const indiceInicial = (paginaAtual - 1) * itensPorPagina;
  const produtosPaginados = produtosFiltrados.slice(indiceInicial, indiceInicial + itensPorPagina);

  const categoriasFiltradas = (Array.isArray(categorias) ? categorias : []).filter(c =>
    c.nome.toLowerCase().includes(buscaCategoria.toLowerCase())
  );

  useEffect(() => {
    setPaginaAtual(1);
  }, [busca]);

  useEffect(() => {
    listarProdutos();
    carregarCategoriasParaOSelect();
  }, []);

  return (
    <>
      <div className="page-header">
        <div>
          <h2 className="page-title">Catálogo de Produtos</h2>
          <p className="page-subtitle">Gerencie as peças e valores do e-commerce/balcão.</p>
        </div>
        <button className="novo-btn" onClick={abrirModalNovoProduto}>
          <FaPlus style={{ marginRight: '8px', fontSize: '12px' }} /> Novo Produto
        </button>
      </div>

      <div className="user-list-card">
        <div className="search-container destacado">
          <FaSearch className="search-icon-placeholder" style={{ color: '#2563eb' }} />
          <input 
            type="text" 
            className="search-input" 
            placeholder="🔍 Digite aqui para buscar peças por nome..." 
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', color: '#666', padding: '20px' }}>Carregando catálogo...</p>
        ) : produtosFiltrados.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
            <FaBoxOpen style={{ fontSize: '48px', marginBottom: '10px' }} />
            <p>Nenhuma peça encontrada.</p>
          </div>
        ) : (
          <>
            <table className="user-table">
  <thead>
    <tr>
      <th>Nome / Categoria</th>
      <th>Preço</th>
      <th>Ações</th>
    </tr>
  </thead>
  <tbody>
    {produtosPaginados.map(produto => (
      <tr key={produto.id}>
        <td className="user-name" style={{ fontWeight: '600' }}>
          {produto.nome} 
          <small style={{ display: 'block', color: '#64748b', fontWeight: 'normal', fontSize: '11px' }}>
            Categoria: {produto.categoria?.nome || 'Nenhuma'}
          </small>
        </td>
        <td style={{ color: '#10b981', fontWeight: '600' }}>
          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(produto.preco)}
        </td>
        <td className="table-actions">
          <button className="action-btn edit" title="Editar" onClick={() => prepararEdicao(produto)}><FaEdit /></button>
          <button className="action-btn delete" title="Excluir" onClick={() => excluirProduto(produto.id, produto.nome)}><FaTrash /></button>
        </td>
      </tr>
    ))}
  </tbody>
</table>

            {/* BARRA DE PAGINAÇÃO (MAX 10 ITENS POR PÁGINA) */}
            <div className="pagination-container">
              <span className="pagination-info">
                Exibindo {indiceInicial + 1} a {Math.min(indiceInicial + itensPorPagina, produtosFiltrados.length)} de {produtosFiltrados.length} produtos
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
          </>
        )}
      </div>

      {mostrarForm && (
        <div className="modal-overlay">
          <form className="modal-content" style={{ width: '500px' }} onSubmit={salvarProduto}>
            <button type="button" className="modal-close-btn" onClick={() => setMostrarForm(false)}>×</button>
            <h3 className="modal-title">{produtoEditandoId ? 'Editar Peça' : 'Cadastrar Nova Peça'}</h3>

            {erro && <p style={{ color: '#ef4444', fontSize: '13px', background: '#fef2f2', padding: '8px', borderRadius: '6px', marginBottom: '15px' }}>{erro}</p>}
            
            <div className="form-group">
              <label className="form-label">Nome do Produto *</label>
              <input type="text" className="form-input" placeholder="Ex: Vestido Sob Medida Elegance" value={nome} onChange={(e) => setNome(e.target.value)} required />
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label className="form-label" style={{ margin: 0 }}>Categoria do Produto *</label>
                <button 
                  type="button" 
                  onClick={() => navigate('/categorias')}
                  style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
                >
                  + Nova Categoria
                </button>
              </div>

              <input 
                type="text" 
                className="form-input" 
                placeholder="Filtrar categorias na lista..." 
                value={buscaCategoria}
                onChange={(e) => setBuscaCategoria(e.target.value)}
                style={{ marginBottom: '6px', padding: '6px 10px', fontSize: '12px' }}
              />

              <select 
                className="form-input" 
                value={categoriaId} 
                onChange={(e) => setCategoriaId(e.target.value)} 
                required
              >
                <option value="">Selecione uma categoria...</option>
                {categoriasFiltradas.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.nome}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Preço (R$) *</label>
              <input 
                type="number" 
                step="0.01" 
                min="0.01"
                className="form-input" 
                placeholder="Ex: 150.00 (Deve ser maior que 0)" 
                value={preco} 
                onChange={(e) => setPreco(e.target.value)} 
                required 
              />
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label">Foto do Produto *</label>
                {(previewImagem || imagemArquivo) && (
                  <span className="badge-check"><FaCheckCircle /> Imagem Selecionada</span>
                )}
              </div>

              <div className={`upload-container ${previewImagem ? 'com-sucesso' : ''}`}>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleSelecionarImagem}
                  style={{ fontSize: '12px' }}
                />
                
                {previewImagem && (
                  <img 
                    src={previewImagem} 
                    alt="Preview" 
                    style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '6px', marginTop: '8px' }} 
                  />
                )}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Descrição da Peça *</label>
              <textarea 
                className="form-input" 
                style={{ height: '70px', resize: 'none' }} 
                placeholder="Detalhes sobre tecido, corte ou caimento sob medida..." 
                value={descricao} 
                onChange={(e) => setDescricao(e.target.value)} 
                required
              />
            </div>

            <div className="modal-actions">
              <button type="button" className="modal-btn cancelar" onClick={() => setMostrarForm(false)} disabled={enviandoImagem}>Cancelar</button>
              <button type="submit" className="modal-btn salvar" disabled={enviandoImagem}>
                {enviandoImagem ? 'Enviando...' : (produtoEditandoId ? 'Atualizar Peça' : 'Salvar Peça')}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}