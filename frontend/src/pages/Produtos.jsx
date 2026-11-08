import React, { useState, useEffect } from 'react';
import { FaPlus, FaSearch, FaTrash, FaEdit, FaTimes, FaCloudUploadAlt, FaSpinner, FaChevronLeft, FaChevronRight, FaQuestionCircle, FaKeyboard } from 'react-icons/fa';

export default function Produtos() {
  const [produtos, setProdutos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [busca, setBusca] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [produtoEditando, setProdutoEditando] = useState(null);

  // ESTADO DO MODAL DE AJUDA (HELPER TECLA H)
  const [modalAjudaAberto, setModalAjudaAberto] = useState(false);

  // ESTADOS DA PAGINAÇÃO
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 20;

  // Estados do Formulário de Produto
  const [nome, setNome] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [preco, setPreco] = useState('');
  const [descricao, setDescricao] = useState('');
  const [imagemArquivo, setImagemArquivo] = useState(null);
  const [imagemUrl, setImagemUrl] = useState('');
  const [previewLocal, setPreviewLocal] = useState('');
  const [uploadingImg, setUploadingImg] = useState(false);

  // Estados do Modal de Categoria
  const [modalCategoriaAberto, setModalCategoriaAberto] = useState(false);
  const [novaCategoriaNome, setNovaCategoriaNome] = useState('');

  const IMGBB_API_KEY = '7977dacd0664e5cededa23464cff6599';

  // OUVINTE DE TECLADO PARA O HELPER (TECLA H)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignora a tecla 'h' caso o usuário esteja digitando em um input/textarea
      const tag = e.target.tagName.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return;

      if (e.key === 'h' || e.key === 'H') {
        e.preventDefault();
        setModalAjudaAberto(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const fazerUploadImagemImgBB = async () => {
    if (!imagemArquivo) {
      return imagemUrl || (previewLocal.startsWith('blob:') ? '' : previewLocal);
    }

    const formData = new FormData();
    formData.append('image', imagemArquivo);

    const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
      method: 'POST',
      body: formData
    });

    const data = await res.json();
    if (data.success && data.data && data.data.url) {
      return data.data.url;
    } else {
      throw new Error('Falha ao enviar imagem para o serviço externo ImgBB.');
    }
  };

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

  useEffect(() => {
    setPaginaAtual(1);
  }, [busca]);

  const limparFormulario = () => {
    setNome('');
    setCategoriaId('');
    setPreco('');
    setDescricao('');
    setImagemArquivo(null);
    setImagemUrl('');
    setPreviewLocal('');
    setProdutoEditando(null);
    setUploadingImg(false);
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
    
    const urlExistente = prod.imagemUrl || prod.imagem || prod.foto || '';
    setImagemUrl(urlExistente);
    setPreviewLocal(urlExistente);
    setImagemArquivo(null);
    setModalAberto(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagemArquivo(file);
      setPreviewLocal(URL.createObjectURL(file));
    }
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

    const nomeFormatado = nome.trim();

    if (!nomeFormatado || !categoriaId) {
      alert('Preencha o Nome e selecione uma Categoria.');
      return;
    }

    const valorPreco = parseFloat(preco);
    if (isNaN(valorPreco) || valorPreco <= 0) {
      alert('O preço precisa ser um valor maior que zero!');
      return;
    }

    // VERIFICAÇÃO DE PRODUTOS DUPLICADOS
    const isEdicao = !!produtoEditando;
    const jaExiste = produtos.some(p => {
      const mesmoNome = p.nome?.trim().toLowerCase() === nomeFormatado.toLowerCase();
      // Se for edição, ignora o próprio produto atual
      if (isEdicao) {
        return mesmoNome && String(p.id) !== String(produtoEditando.id);
      }
      return mesmoNome;
    });

    if (jaExiste) {
      alert(`Não é permitido salvar! Já existe um produto cadastrado com o mesmo nome ("${nomeFormatado}").`);
      return;
    }

    try {
      setUploadingImg(true);

      let urlImagemFinal = '';
      try {
        urlImagemFinal = await fazerUploadImagemImgBB();
      } catch (imgErr) {
        console.error(imgErr);
        alert('Erro ao realizar upload da imagem. O cadastro continuará sem alterar a imagem.');
        urlImagemFinal = imagemUrl || '';
      }

      const url = isEdicao 
        ? `http://localhost:3000/products/${produtoEditando.id}` 
        : 'http://localhost:3000/products';
      const method = isEdicao ? 'PUT' : 'POST';

      const payload = {
        nome: nomeFormatado,
        descricao: descricao.trim(),
        preco: valorPreco,
        categoriaId: parseInt(categoriaId, 10),
        estoque: 0,
        imagemUrl: urlImagemFinal || undefined
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        alert(isEdicao ? 'Produto atualizado com sucesso!' : 'Produto cadastrado com sucesso!');
        setModalAberto(false);
        limparFormulario();
        carregarDados();
      } else {
        const errData = await response.json().catch(() => null);
        alert(`Erro (${response.status}): ${errData?.error || errData?.message || 'Erro ao salvar produto.'}`);
      }
    } catch (err) {
      console.error(err);
      alert('Erro de conexão com o servidor.');
    } finally {
      setUploadingImg(false);
    }
  };

  const excluirProduto = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este produto?')) return;
    try {
      const res = await fetch(`http://localhost:3000/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setProdutos(produtos.filter(p => p.id !== id));
      } else {
        alert('Erro ao excluir produto. O produto pode estar associado a pedidos existentes.');
      }
    } catch (err) {
      alert('Erro de conexão ao excluir produto.');
    }
  };

  // 1. FILTRAGEM
  const produtosFiltrados = produtos.filter(p => {
    const termo = busca.toLowerCase();
    const nomeP = String(p.nome || '').toLowerCase();
    const catP = String(p.categoria?.nome || '').toLowerCase();
    return nomeP.includes(termo) || catP.includes(termo);
  });

  // 2. CÁLCULO DA PAGINAÇÃO (20 por página)
  const totalPaginas = Math.ceil(produtosFiltrados.length / itensPorPagina) || 1;
  const indiceInicial = (paginaAtual - 1) * itensPorPagina;
  const produtosPaginados = produtosFiltrados.slice(indiceInicial, indiceInicial + itensPorPagina);

  return (
    <div style={{ padding: '10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Catálogo de Produtos</h2>
          <p style={{ color: '#64748b', fontSize: '14px', margin: '4px 0 0 0' }}>
            Gerencie as peças e produtos disponíveis na loja ({produtosFiltrados.length} itens cadastrados).
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {/* BOTÃO HELPER DE ATALHO */}
          <button
            onClick={() => setModalAjudaAberto(true)}
            title="Pressione a tecla H para abrir o Guia de Ajuda"
            style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', padding: '10px 14px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
          >
            <FaQuestionCircle style={{ color: '#2563eb' }} /> Ajuda [H]
          </button>

          <button 
            onClick={abrirModalNovo}
            style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <FaPlus style={{ fontSize: '12px' }} /> Novo Produto
          </button>
        </div>
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
          <>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #f1f5f9', textAlign: 'left' }}>
                  <th style={{ padding: '12px 16px', fontSize: '12px', color: '#64748b' }}>NOME / CATEGORIA</th>
                  <th style={{ padding: '12px 16px', fontSize: '12px', color: '#64748b' }}>PREÇO</th>
                  <th style={{ padding: '12px 16px', fontSize: '12px', color: '#64748b', textAlign: 'right' }}>AÇÕES</th>
                </tr>
              </thead>
              <tbody>
                {produtosPaginados.length === 0 ? (
                  <tr>
                    <td colSpan="3" style={{ textAlign: 'center', color: '#94a3b8', padding: '30px' }}>
                      Nenhum produto encontrado.
                    </td>
                  </tr>
                ) : (
                  produtosPaginados.map(p => (
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

            {/* CONTROLES DE PAGINAÇÃO */}
            {produtosFiltrados.length > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', paddingTop: '15px', borderTop: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: '13px', color: '#64748b' }}>
                  Mostrando <b>{indiceInicial + 1}</b> a <b>{Math.min(indiceInicial + itensPorPagina, produtosFiltrados.length)}</b> de <b>{produtosFiltrados.length}</b> produtos
                </span>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button
                    onClick={() => setPaginaAtual(prev => Math.max(prev - 1, 1))}
                    disabled={paginaAtual === 1}
                    style={{
                      background: '#f8fafc',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      padding: '6px 12px',
                      cursor: paginaAtual === 1 ? 'not-allowed' : 'pointer',
                      opacity: paginaAtual === 1 ? 0.5 : 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '13px',
                      color: '#334155'
                    }}
                  >
                    <FaChevronLeft style={{ fontSize: '10px' }} /> Anterior
                  </button>

                  {Array.from({ length: totalPaginas }, (_, index) => index + 1).map(num => (
                    <button
                      key={num}
                      onClick={() => setPaginaAtual(num)}
                      style={{
                        background: paginaAtual === num ? '#2563eb' : '#fff',
                        color: paginaAtual === num ? '#fff' : '#334155',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        padding: '6px 11px',
                        fontWeight: paginaAtual === num ? '700' : '400',
                        cursor: 'pointer',
                        fontSize: '13px'
                      }}
                    >
                      {num}
                    </button>
                  ))}

                  <button
                    onClick={() => setPaginaAtual(prev => Math.min(prev + 1, totalPaginas))}
                    disabled={paginaAtual === totalPaginas}
                    style={{
                      background: '#f8fafc',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      padding: '6px 12px',
                      cursor: paginaAtual === totalPaginas ? 'not-allowed' : 'pointer',
                      opacity: paginaAtual === totalPaginas ? 0.5 : 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '13px',
                      color: '#334155'
                    }}
                  >
                    Próximo <FaChevronRight style={{ fontSize: '10px' }} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* MODAL PRODUTO */}
      {modalAberto && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: '12px', width: '100%', maxWidth: '520px', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
              <h3 style={{ margin: 0, color: '#0f172a', fontSize: '18px', fontWeight: '700' }}>
                {produtoEditando ? `Editar Peça: ${produtoEditando.nome}` : 'Cadastrar Produto'}
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

              {/* CARREGAMENTO DE IMAGEM */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>Imagem do Produto</label>
                
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
                  <label style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px', background: '#f1f5f9', border: '1px dashed #cbd5e1', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', color: '#475569', fontWeight: '600' }}>
                    <FaCloudUploadAlt style={{ fontSize: '18px', color: '#2563eb' }} />
                    {imagemArquivo ? imagemArquivo.name : 'Escolher Imagem do Computador'}
                    <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                  </label>
                </div>

                <input 
                  type="text" 
                  value={imagemUrl} 
                  onChange={e => {
                    setImagemUrl(e.target.value);
                    setPreviewLocal(e.target.value);
                    setImagemArquivo(null);
                  }} 
                  placeholder="Ou cole o link direto da imagem (http://...)"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box', fontSize: '13px' }}
                />

                {/* PREVIEW DA IMAGEM SELECIONADA */}
                {previewLocal && (
                  <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '12px', background: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <img 
                      src={previewLocal} 
                      alt="Pré-visualização" 
                      style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #cbd5e1' }} 
                    />
                    <div>
                      <span style={{ fontSize: '12px', fontWeight: '700', color: '#334155', display: 'block' }}>Imagem Selecionada</span>
                      <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: '600' }}>
                        {imagemArquivo ? 'Será enviada para o ImgBB ao salvar' : 'Link de imagem inserido'}
                      </span>
                    </div>
                  </div>
                )}
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
                  disabled={uploadingImg}
                  style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: '700', cursor: 'pointer', opacity: uploadingImg ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  {uploadingImg && <FaSpinner style={{ animation: 'spin 1s linear infinite' }} />}
                  {produtoEditando ? 'Salvar' : 'Confirmar'}
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

      {/* MODAL HELPER DE ATALHO TECLA H */}
      {modalAjudaAberto && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200 }}>
          <div style={{ background: '#fff', borderRadius: '14px', width: '100%', maxWidth: '440px', padding: '24px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FaKeyboard style={{ color: '#2563eb', fontSize: '20px' }} />
                <h3 style={{ margin: 0, color: '#0f172a', fontSize: '18px', fontWeight: '700' }}>Guia & Atalhos do Sistema</h3>
              </div>
              <FaTimes style={{ cursor: 'pointer', color: '#64748b' }} onClick={() => setModalAjudaAberto(false)} />
            </div>

            <div style={{ fontSize: '13px', color: '#334155', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '10px 12px' }}>
                <strong style={{ color: '#1e40af' }}>Atalhos Rápidos:</strong>
                <ul style={{ margin: '6px 0 0 0', paddingLeft: '20px', lineHeight: '1.6' }}>
                  <li><b>Tecla H:</b> Abre/fecha este menu de ajuda a qualquer momento.</li>
                  <li><b>Esc:</b> Fecha os modais abertos.</li>
                </ul>
              </div>

              <div style={{ lineHeight: '1.6' }}>
                <strong style={{ color: '#0f172a', display: 'block', marginBottom: '4px' }}>Regras do Catálogo de Produtos:</strong>
                <ul style={{ margin: 0, paddingLeft: '20px' }}>
                  <li><b>Duplicidade:</b> Não é permitido cadastrar dois produtos com o mesmo nome.</li>
                  <li><b>Imagens:</b> Você pode fazer upload de um arquivo direto do computador (via ImgBB) ou colar o link de uma imagem online.</li>
                  <li><b>Exclusão:</b> Não é possível excluir um produto se ele estiver sendo utilizado em um pedido realizado.</li>
                </ul>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px', borderTop: '1px solid #f1f5f9', paddingTop: '14px' }}>
              <button
                onClick={() => setModalAjudaAberto(false)}
                style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: '6px', fontWeight: '700', cursor: 'pointer' }}
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}