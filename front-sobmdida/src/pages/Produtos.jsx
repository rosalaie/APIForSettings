import React, { useState, useEffect } from 'react';
import { FaPlus, FaSearch, FaTrash, FaEdit, FaTimes, FaCloudUploadAlt } from 'react-icons/fa';

export default function Produtos() {
  const [produtos, setProdutos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [busca, setBusca] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [produtoEditando, setProdutoEditando] = useState(null);

  const [nome, setNome] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [preco, setPreco] = useState('');
  const [descricao, setDescricao] = useState('');
  const [imagemUrl, setImagemUrl] = useState('');

  const [modalCategoriaAberto, setModalCategoriaAberto] = useState(false);
  const [novaCategoriaNome, setNovaCategoriaNome] = useState('');

  const carregarDados = async () => {
    try {
      setLoading(true);
      const [resProd, resCat] = await Promise.all([
        fetch('http://localhost:3000/products'),
        fetch('http://localhost:3000/categories')
      ]);

      if (resProd.ok) {
        const dataP = await resProd.json();
        setProdutos(Array.isArray(dataP) ? dataP : []);
      }

      if (resCat.ok) {
        const dataC = await resCat.json();
        setCategorias(Array.isArray(dataC) ? dataC : []);
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
    setImagemUrl('');
    setProdutoEditando(null);
  };

  const abrirModalNovo = () => {
    limparFormulario();
    setModalAberto(true);
  };

  const abrirModalEditar = (prod) => {
    setProdutoEditando(prod);
    setNome(prod.nome || '');
    setCategoriaId(prod.categoriaId || prod.categoria?.id || '');
    setPreco(prod.preco || '');
    setDescricao(prod.descricao || '');
    setImagemUrl(prod.imagemUrl || '');
    setModalAberto(true);
  };

  const salvarNovaCategoria = async (e) => {
    e.preventDefault();
    if (!novaCategoriaNome.trim()) return;

    try {
      const res = await fetch('http://localhost:3000/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: novaCategoriaNome })
      });

      if (res.ok) {
        const catCriada = await res.json();
        alert('Categoria cadastrada com sucesso!');
        setNovaCategoriaNome('');
        setModalCategoriaAberto(false);
        await carregarDados();
        if (catCriada && catCriada.id) {
          setCategoriaId(catCriada.id);
        }
      } else {
        const err = await res.json();
        alert(err.error || 'Erro ao cadastrar categoria.');
      }
    } catch (err) {
      alert('Erro de conexão ao salvar categoria.');
    }
  };

  const salvarProduto = async (e) => {
    e.preventDefault();

    const valorPreco = parseFloat(preco);
    if (isNaN(valorPreco) || valorPreco <= 0) {
      alert('Informe um valor de preço válido!');
      return;
    }

    if (!nome.trim() || !categoriaId) {
      alert('Preencha o Nome e selecione uma Categoria.');
      return;
    }

    const isEdicao = !!produtoEditando;
    const url = isEdicao 
      ? `http://localhost:3000/products/${produtoEditando.id}` 
      : 'http://localhost:3000/products';
    const method = isEdicao ? 'PUT' : 'POST';

    // Payload exato esperado pelo backend
    const payload = {
      nome: nome.trim(),
      descricao: descricao.trim(),
      preco: valorPreco,
      categoriaId: parseInt(categoriaId, 10),
      imagemUrl: imagemUrl.trim() || null,
      estoque: 0
    };

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        alert(isEdicao ? 'Produto atualizado com sucesso!' : 'Produto cadastrado com sucesso!');
        setModalAberto(false);
        limparFormulario();
        carregarDados();
      } else {
        const errData = await response.json().catch(() => null);
        alert(`Erro (${response.status}): ${errData?.error || 'Erro ao salvar produto.'}`);
      }
    } catch (err) {
      console.error(err);
      alert('Erro de conexão com o servidor.');
    }
  };

  const excluirProduto = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este produto?')) return;
    try {
      const res = await fetch(`http://localhost:3000/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setProdutos(produtos.filter(p => p.id !== id));
      } else {
        alert('Erro ao excluir produto.');
      }
    } catch (err) {
      alert('Erro de conexão ao excluir produto.');
    }
  };

  const produtosFiltrados = produtos.filter(p => {
    const termo = busca.toLowerCase();
    const nomeP = String(p.nome || '').toLowerCase();
    const catP = String(p.categoria?.nome || '').toLowerCase();
    return nomeP.includes(termo) || catP.includes(termo);
  });

  return (
    <div style={{ padding: '10px' }}>
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
                    Nenhum produto cadastrado.
                  </td>
                </tr>
              ) : (
                produtosFiltrados.map(p => (
                  <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: '600', color: '#0f172a', fontSize: '14px' }}>
                        {p.nome}
                      </div>
                      <div style={{ color: '#64748b', fontSize: '12px', marginTop: '2px' }}>
                        Categoria: {p.categoria?.nome || 'Geral'}
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: '700', color: '#16a34a' }}>
                      R$ {Number(p.preco || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        <button
                          onClick={() => abrirModalEditar(p)}
                          style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '8px 10px', borderRadius: '6px', cursor: 'pointer' }}
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => excluirProduto(p.id)}
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

      {/* MODAL PRODUTO */}
      {modalAberto && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: '12px', width: '100%', maxWidth: '520px', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
              <h3 style={{ margin: 0, color: '#0f172a', fontSize: '18px', fontWeight: '700' }}>
                {produtoEditando ? `Editar Peça: ${produtoEditando.nome}` : 'Cadastrar Nova Peça'}
              </h3>
              <FaTimes style={{ cursor: 'pointer', color: '#64748b', fontSize: '16px' }} onClick={() => setModalAberto(false)} />
            </div>

            <form onSubmit={salvarProduto} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>Nome do Produto *</label>
                <input 
                  type="text" 
                  value={nome} 
                  onChange={e => setNome(e.target.value)} 
                  placeholder="Ex: Camiseta Algodão Sob Medida"
                  required
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box', fontSize: '14px' }} 
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label style={{ fontSize: '13px', fontWeight: '600', color: '#334155' }}>Categoria *</label>
                    <button 
                      type="button" 
                      onClick={() => setModalCategoriaAberto(true)}
                      style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '11px', fontWeight: '700', cursor: 'pointer', padding: 0 }}
                    >
                      + Nova Categoria
                    </button>
                  </div>

                  <select 
                    value={categoriaId} 
                    onChange={e => setCategoriaId(e.target.value)}
                    required
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', background: '#fff', boxSizing: 'border-box' }}
                  >
                    <option value="">Selecione...</option>
                    {categorias.map(c => (
                      <option key={c.id} value={c.id}>{c.nome}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>Preço (R$) *</label>
                  <input 
                    type="number" 
                    step="0.01"
                    min="0.01"
                    value={preco} 
                    onChange={e => setPreco(e.target.value)} 
                    placeholder="0.00"
                    required
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box', fontSize: '14px' }} 
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>URL da Foto do Produto</label>
                <input 
                  type="text" 
                  value={imagemUrl} 
                  onChange={e => setImagemUrl(e.target.value)} 
                  placeholder="http://..."
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box', fontSize: '14px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>Descrição da Peça</label>
                <textarea 
                  rows="3" 
                  value={descricao} 
                  onChange={e => setDescricao(e.target.value)} 
                  placeholder="Detalhes sobre tecido, corte..."
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box', fontSize: '14px', resize: 'vertical' }}
                />
              </div>

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

      {/* MODAL NOVA CATEGORIA */}
      {modalCategoriaAberto && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
          <div style={{ background: '#fff', borderRadius: '12px', width: '100%', maxWidth: '380px', padding: '20px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h4 style={{ margin: 0, color: '#0f172a', fontSize: '16px' }}>Nova Categoria</h4>
              <FaTimes style={{ cursor: 'pointer', color: '#64748b' }} onClick={() => setModalCategoriaAberto(false)} />
            </div>

            <form onSubmit={salvarNovaCategoria}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>Nome da Categoria *</label>
                <input 
                  type="text" 
                  value={novaCategoriaNome} 
                  onChange={e => setNovaCategoriaNome(e.target.value)} 
                  placeholder="Ex: Camisas, Calças..." 
                  required
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button 
                  type="button" 
                  onClick={() => setModalCategoriaAberto(false)}
                  style={{ background: '#e2e8f0', color: '#475569', border: 'none', padding: '8px 14px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '6px', fontWeight: '700', cursor: 'pointer' }}
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}