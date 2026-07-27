import { useEffect, useState } from 'react';
import { FaBoxOpen, FaPlus, FaTrash, FaEdit } from 'react-icons/fa';

export default function Produtos() {
  const [produtos, setProdutos] = useState([]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(true);
  const [enviandoImagem, setEnviandoImagem] = useState(false);
  const [busca, setBusca] = useState('');

  // Estado para controlar se estamos EDITANDO um produto ou CRIANDO um novo
  const [produtoEditandoId, setProdutoEditandoId] = useState(null);

  // Estados do formulário
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [preco, setPreco] = useState('');
  const [estoque, setEstoque] = useState('');
  const [imagemArquivo, setImagemArquivo] = useState(null);
  const [previewImagem, setPreviewImagem] = useState('');
  const [categorias, setCategorias] = useState([]);
  const [categoriaId, setCategoriaId] = useState('');

  const IMGBB_API_KEY = '7977dacd0664e5cededa23464cff6599';

  // 1. LISTAR PRODUTOS
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

  // 2. CARREGAR CATEGORIAS
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

  // 3. ABRIR MODAL PARA NOVO PRODUTO
  function abrirModalNovoProduto() {
    setProdutoEditandoId(null);
    setNome('');
    setDescricao('');
    setPreco('');
    setEstoque('');
    setImagemArquivo(null);
    setPreviewImagem('');
    setCategoriaId('');
    setMostrarForm(true);
  }

  // 4. ABRIR MODAL PREENCHIDO PARA EDITAR
  function prepararEdicao(produto) {
    setProdutoEditandoId(produto.id);
    setNome(produto.nome || '');
    setDescricao(produto.descricao || '');
    setPreco(produto.preco ? produto.preco.toString() : '');
    setEstoque(produto.estoque ? produto.estoque.toString() : '');
    setCategoriaId(produto.categoriaId ? produto.categoriaId.toString() : '');
    setPreviewImagem(produto.imagemUrl || '');
    setImagemArquivo(null);
    setMostrarForm(true);
  }

  function handleSelecionarImagem(e) {
    const arquivo = e.target.files[0];
    if (arquivo) {
      setImagemArquivo(arquivo);
      setPreviewImagem(URL.createObjectURL(arquivo));
    }
  }

  // UPLOAD IMGBB
  async function fazerUploadImagemImgBB() {
    if (!imagemArquivo) return '';

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
      throw new Error('Falha ao enviar imagem para o ImgBB.');
    }
  }

  // 5. CADASTRAR OU ATUALIZAR PRODUTO
  async function salvarProduto(e) {
    e.preventDefault();
    setErro('');
    setEnviandoImagem(true);

    try {
      let finalImagemUrl = previewImagem;

      // Se selecionou um arquivo novo, faz upload no ImgBB
      if (imagemArquivo) {
        finalImagemUrl = await fazerUploadImagemImgBB();
      }

      const ehEdicao = !!produtoEditandoId;
      const url = ehEdicao 
        ? `http://localhost:3000/products/${produtoEditandoId}`
        : 'http://localhost:3000/products';

      const method = ehEdicao ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome,
          descricao,
          preco: parseFloat(preco),
          estoque: parseInt(estoque),
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
      setErro(err.message || 'Erro de conexão com o servidor.');
    } finally {
      setEnviandoImagem(false);
    }
  }

  // 6. EXCLUIR PRODUTO
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

  const produtosFiltrados = produtos.filter(p =>
    p.nome.toLowerCase().includes(busca.toLowerCase())
  );

  useEffect(() => {
    listarProdutos();
    carregarCategoriasParaOSelect();
  }, []);

  return (
    <>
      <div className="page-header">
        <div>
          <h2 className="page-title">Catálogo de Produtos</h2>
          <p className="page-subtitle">Gerencie as peças, estoque e preços do e-commerce.</p>
        </div>
        <button className="novo-btn" onClick={abrirModalNovoProduto}>
          <FaPlus style={{ marginRight: '8px', fontSize: '12px' }} /> Novo Produto
        </button>
      </div>

      {erro && <p className="error-message" style={{ color: '#ef4444', marginBottom: '15px' }}>{erro}</p>}

      <div className="user-list-card">
        <div className="search-container">
          <span className="search-icon-placeholder">🔍</span>
          <input 
            type="text" 
            className="search-input" 
            placeholder="Buscar produto por nome..." 
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', color: '#666', padding: '20px' }}>Buscando produtos no banco...</p>
        ) : produtosFiltrados.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
            <FaBoxOpen style={{ fontSize: '48px', marginBottom: '10px' }} />
            <p>Nenhum produto encontrado.</p>
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
              {produtosFiltrados.map(produto => (
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
                    {/* BOTÃO EDITAR AGORA CHAMA O PREPARAR EDIÇÃO */}
                    <button className="action-btn edit" title="Editar" onClick={() => prepararEdicao(produto)}><FaEdit /></button>
                    <button className="action-btn delete" title="Excluir" onClick={() => excluirProduto(produto.id, produto.nome)}><FaTrash /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {mostrarForm && (
        <div className="modal-overlay">
          <form className="modal-content" style={{ width: '500px' }} onSubmit={salvarProduto}>
            <button type="button" className="modal-close-btn" onClick={() => setMostrarForm(false)}>×</button>
            <h3 className="modal-title">{produtoEditandoId ? 'Editar Peça do Catálogo' : 'Adicionar Peça ao Catálogo'}</h3>
            
            <div className="form-group">
              <label className="form-label">Nome do Produto *</label>
              <input type="text" className="form-input" placeholder="Ex: Vestido Sob Medida Elegance" value={nome} onChange={(e) => setNome(e.target.value)} required />
            </div>

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
              <label className="form-label">Foto do Produto</label>
              <input 
                type="file" 
                accept="image/*" 
                className="form-input" 
                onChange={handleSelecionarImagem}
                style={{ padding: '8px' }}
              />
              
              {previewImagem && (
                <div style={{ marginTop: '10px', textAlign: 'center' }}>
                  <img 
                    src={previewImagem} 
                    alt="Preview" 
                    style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #cbd5e1' }} 
                  />
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Descrição da Peça</label>
              <textarea className="form-input" style={{ height: '70px', resize: 'none', fontFamily: 'inherit' }} placeholder="Detalhes sobre tecido, corte ou caimento..." value={descricao} onChange={(e) => setDescricao(e.target.value)} />
            </div>

            <div className="modal-actions">
              <button type="button" className="modal-btn cancelar" onClick={() => setMostrarForm(false)} disabled={enviandoImagem}>Cancelar</button>
              <button 
                type="submit" 
                className="modal-btn salvar" 
                disabled={enviandoImagem}
                style={{ opacity: enviandoImagem ? 0.7 : 1, cursor: enviandoImagem ? 'not-allowed' : 'pointer' }}
              >
                {enviandoImagem ? 'Salvando...' : (produtoEditandoId ? 'Atualizar Produto' : 'Salvar Produto')}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}