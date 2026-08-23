import React, { useState, useEffect } from 'react';
import { FaPlus, FaSearch, FaTrash, FaEdit, FaTimes, FaBox, FaCloudUploadAlt } from 'react-icons/fa';

export default function Produtos() {
  const [produtos, setProdutos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [busca, setBusca] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [produtoEditando, setProdutoEditando] = useState(null);

  // Campos do formulário
  const [nome, setNome] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [preco, setPreco] = useState('');
  const [descricao, setDescricao] = useState('');
  const [imagem, setImagem] = useState(null);
  const [previewImagem, setPreviewImagem] = useState('');

  // Filtro interno de categorias no select
  const [filtroCategoria, setFiltroCategoria] = useState('');

  // 1. CARREGAR PRODUTOS E CATEGORIAS
  const carregarDados = async () => {
    try {
      setLoading(true);
      const [resProd, resCat] = await Promise.all([
        fetch('http://localhost:3000/products'),
        fetch('http://localhost:3000/categories')
      ]);

      if (resProd.ok) {
        const dataP = await resProd.json();
        setProdutos(Array.isArray(dataP) ? dataP : dataP.products || []);
      }

      if (resCat.ok) {
        const dataC = await resCat.json();
        setCategorias(Array.isArray(dataC) ? dataC : dataC.categories || []);
      }
    } catch (err) {
      console.error("Erro ao carregar dados", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const limparFormulario = () => {
    setNome('');
    setCategoriaId('');
    setPreco('');
    setDescricao('');
    setImagem(null);
    setPreviewImagem('');
    setFiltroCategoria('');
    setProdutoEditando(null);
  };

  const abrirModalNovo = () => {
    limparFormulario();
    setModalAberto(true);
  };

  const abrirModalEditar = (prod) => {
    setProdutoEditando(prod);
    setNome(prod.nome || prod.name || '');
    setCategoriaId(prod.categoriaId || prod.categoryId || prod.categoria?.id || '');
    setPreco(prod.preco || prod.price || '');
    setDescricao(prod.descricao || prod.description || '');
    setPreviewImagem(prod.imagemUrl || prod.imageUrl || '');
    setFiltroCategoria('');
    setModalAberto(true);
  };

  const handleImagemChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagem(file);
      setPreviewImagem(URL.createObjectURL(file));
    }
  };

  // 2. SALVAR PRODUTO
  const salvarProduto = async (e) => {
    e.preventDefault();

    if (!nome || !preco || !categoriaId) {
      alert('Por favor, preencha os campos obrigatórios (Nome, Categoria e Preço).');
      return;
    }

    const formData = new FormData();
    formData.append('nome', nome);
    formData.append('categoriaId', categoriaId);
    formData.append('preco', preco);
    formData.append('descricao', descricao);
    if (imagem) {
      formData.append('imagem', imagem);
    }

    try {
      const isEdicao = !!produtoEditando;
      const url = isEdicao 
        ? `http://localhost:3000/products/${produtoEditando.id}` 
        : 'http://localhost:3000/products';
      const method = isEdicao ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        body: formData // Envia Multipart FormData para suportar upload de fotos
      });

      if (res.ok) {
        alert(isEdicao ? 'Peça/Produto atualizado com sucesso!' : 'Peça/Produto cadastrado com sucesso!');
        setModalAberto(false);
        limparFormulario();
        carregarDados();
      } else {
        alert('Erro ao salvar produto.');
      }
    } catch (err) {
      alert('Erro de conexão ao salvar produto.');
    }
  };

  // 3. EXCLUIR PRODUTO
  const excluirProduto = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este produto?')) return;
    try {
      const res = await fetch(`http://localhost:3000/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setProdutos(produtos.filter(p => p.id !== id));
      }
    } catch (err) {
      alert('Erro ao excluir produto.');
    }
  };

  // CATEGORIAS FILTRADAS PARA O SELECT
  const categoriasFiltradas = categorias.filter(c => 
    (c.nome || c.name || '').toLowerCase().includes(filtroCategoria.toLowerCase())
  );

  // LISTA DE PRODUTOS FILTRADA PARA A TABELA
  const listaProdutos = Array.isArray(produtos) ? produtos : [];
  const produtosFiltrados = listaProdutos.filter(p => {
    const nomeProd = String(p.nome || p.name || '').toLowerCase();
    const catNome = String(p.categoria?.nome || p.categoriaNome || '').toLowerCase();
    const termoBusca = busca.toLowerCase();

    return nomeProd.includes(termoBusca) || catNome.includes(termoBusca);
  });

  return (
    <div style={{ padding: '10px' }}>
      {/* CABEÇALHO */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Catálogo de Produtos</h2>
          <p style={{ color: '#64748b', fontSize: '14px', margin: '4px 0 0 0' }}>Gerencie as peças e produtos disponíveis na loja.</p>
        </div>
        <button 
          onClick={abrirModalNovo}
          style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <FaPlus style={{ fontSize: '12px' }} /> Novo Produto
        </button>
      </div>

      {/* CARD PRINCIPAL */}
      <div style={{ background: '#fff', padding: '24px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', border: '1px solid #cbd5e1', padding: '10px 14px', borderRadius: '8px', marginBottom: '20px' }}>
          <FaSearch style={{ color: '#94a3b8', marginRight: '10px' }} />
          <input
            type="text"
            placeholder="Buscar por peça ou categoria..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '14px' }}
          />
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', color: '#64748b', padding: '20px' }}>Carregando catálogo...</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #f1f5f9', textAlign: 'left' }}>
                <th style={{ padding: '12px 16px', fontSize: '12px', color: '#64748b' }}>NOME / CATEGORIA</th>
                <th style={{ padding: '12px 16px', fontSize: '12px', color: '#64748b' }}>PREÇO</th>
                <th style={{ padding: '12px 16px', fontSize: '12px', color: '#64748b', textAlign: 'right' }}>AÇÕES</th>
              </tr>
            </thead>
            <tbody>
              {produtosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="3" style={{ textAlign: 'center', color: '#94a3b8', padding: '30px' }}>
                    Nenhuma peça/produto encontrada.
                  </td>
                </tr>
              ) : (
                produtosFiltrados.map(p => (
                  <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: '600', color: '#0f172a', fontSize: '14px' }}>
                        {p.nome || p.name}
                      </div>
                      <div style={{ color: '#64748b', fontSize: '12px', marginTop: '2px' }}>
                        Categoria: {p.categoria?.nome || p.categoriaNome || 'Geral'}
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: '700', color: '#16a34a' }}>
                      R$ {Number(p.preco || p.price || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        <button
                          onClick={() => abrirModalEditar(p)}
                          title="Editar Produto"
                          style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '8px 10px', borderRadius: '6px', cursor: 'pointer' }}
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => excluirProduto(p.id)}
                          title="Excluir Produto"
                          style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '8px 10px', borderRadius: '6px', cursor: 'pointer' }}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL CADASTRAR / EDITAR PRODUTO */}
      {modalAberto && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: '12px', width: '100%', maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            
            {/* CABEÇALHO DO MODAL */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
              <h3 style={{ margin: 0, color: '#0f172a', fontSize: '18px', fontWeight: '700' }}>
                {produtoEditando ? `Editar Peça: ${produtoEditando.nome || ''}` : 'Cadastrar Nova Peça'}
              </h3>
              <FaTimes style={{ cursor: 'pointer', color: '#64748b', fontSize: '16px' }} onClick={() => setModalAberto(false)} />
            </div>

            <form onSubmit={salvarProduto} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* NOME DO PRODUTO */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>Nome do Produto *</label>
                <input 
                  type="text" 
                  value={nome} 
                  onChange={e => setNome(e.target.value)} 
                  placeholder="Ex: Vestido Sob Medida Elegance"
                  required
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box', fontSize: '14px' }} 
                />
              </div>

              {/* CATEGORIA E PREÇO EM 2 COLUNAS */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                
                {/* CATEGORIA COM BUSCA EMBUTIDA DENTRO DO MESMO BLOCO */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label style={{ fontSize: '13px', fontWeight: '600', color: '#334155' }}>Categoria *</label>
                    <a href="/categorias" style={{ fontSize: '11px', color: '#2563eb', textDecoration: 'none', fontWeight: '600' }}>+ Nova Categoria</a>
                  </div>
                  
                  {/* Campo de filtro rápido caso tenha muitas categorias */}
                  {categorias.length > 5 && (
                    <input 
                      type="text"
                      placeholder="Filtrar categoria..."
                      value={filtroCategoria}
                      onChange={e => setFiltroCategoria(e.target.value)}
                      style={{ width: '100%', padding: '6px 8px', borderRadius: '4px', border: '1px solid #e2e8f0', fontSize: '11px', marginBottom: '4px', boxSizing: 'border-box' }}
                    />
                  )}

                  <select 
                    value={categoriaId} 
                    onChange={e => setCategoriaId(e.target.value)}
                    required
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', background: '#fff', boxSizing: 'border-box' }}
                  >
                    <option value="">Selecione...</option>
                    {categoriasFiltradas.map(c => (
                      <option key={c.id} value={c.id}>{c.nome || c.name}</option>
                    ))}
                  </select>
                </div>

                {/* PREÇO */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>Preço (R$) *</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={preco} 
                    onChange={e => setPreco(e.target.value)} 
                    placeholder="0.00"
                    required
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box', fontSize: '14px' }} 
                  />
                </div>

              </div>

              {/* FOTO DO PRODUTO (UPLOAD/PREVIEW) */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>Foto do Produto</label>
                <div style={{ border: '2px dashed #cbd5e1', borderRadius: '8px', padding: '16px', textAlign: 'center', background: '#f8fafc', cursor: 'pointer', position: 'relative' }}>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImagemChange}
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                  />
                  {previewImagem ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                      <img src={previewImagem} alt="Preview" style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '6px' }} />
                      <span style={{ fontSize: '13px', color: '#16a34a', fontWeight: '600' }}>Imagem selecionada! Clique para alterar</span>
                    </div>
                  ) : (
                    <div>
                      <FaCloudUploadAlt style={{ fontSize: '28px', color: '#94a3b8', marginBottom: '4px' }} />
                      <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>Clique para selecionar uma imagem</p>
                    </div>
                  )}
                </div>
              </div>

              {/* DESCRIÇÃO DA PEÇA */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>Descrição da Peça</label>
                <textarea 
                  rows="3" 
                  value={descricao} 
                  onChange={e => setDescricao(e.target.value)} 
                  placeholder="Detalhes sobre tecido, corte ou caimento sob medida..."
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box', fontSize: '14px', resize: 'vertical' }}
                />
              </div>

              {/* BOTÕES DE AÇÃO */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                <button 
                  type="button" 
                  onClick={() => setModalAberto(false)}
                  style={{ background: '#e2e8f0', color: '#475569', border: 'none', padding: '10px 18px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: '700', cursor: 'pointer' }}
                >
                  {produtoEditando ? 'Atualizar Peça' : 'Salvar Peça'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}