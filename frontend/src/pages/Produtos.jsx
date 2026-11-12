import React, { useState, useEffect } from 'react';
import {
  FaPlus,
  FaSearch,
  FaTrash,
  FaEdit,
  FaTimes,
  FaCloudUploadAlt,
  FaSpinner,
  FaChevronLeft,
  FaChevronRight,
  FaQuestionCircle,
  FaKeyboard,
  FaFilter
} from 'react-icons/fa';

// URL da API: local durante o desenvolvimento e Render em produção.
const API_URL = import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV
    ? 'http://localhost:3000'
    : 'https://sobmdidaadmin.onrender.com');

export default function Produtos() {
  const [produtos, setProdutos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('TODOS');
  const [loading, setLoading] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [produtoEditando, setProdutoEditando] = useState(null);

  // Modal de ajuda
  const [modalAjudaAberto, setModalAjudaAberto] = useState(false);

  // Paginação
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 20;

  // Formulário de produto
  const [nome, setNome] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [preco, setPreco] = useState('');
  const [status, setStatus] = useState('ATIVO');
  const [descricao, setDescricao] = useState('');
  const [imagemArquivo, setImagemArquivo] = useState(null);
  const [imagemUrl, setImagemUrl] = useState('');
  const [previewLocal, setPreviewLocal] = useState('');
  const [uploadingImg, setUploadingImg] = useState(false);

  // Modal de categoria
  const [modalCategoriaAberto, setModalCategoriaAberto] = useState(false);
  const [novaCategoriaNome, setNovaCategoriaNome] = useState('');

  const IMGBB_API_KEY = '7977dacd0664e5cededa23464cff6599';

  // Obtém mensagem de erro retornada pelo backend
  const obterMensagemErro = async (res) => {
    try {
      const data = await res.json();
      return data.error || data.message || `Erro HTTP ${res.status}`;
    } catch {
      return `Erro HTTP ${res.status}`;
    }
  };

  // Normaliza respostas que podem vir como lista direta ou objeto
  const obterLista = (data, chaves) => {
    if (Array.isArray(data)) {
      return data;
    }

    for (const chave of chaves) {
      if (Array.isArray(data?.[chave])) {
        return data[chave];
      }
    }

    return null;
  };

  // Atalho de teclado H para abrir a ajuda
  useEffect(() => {
    const handleKeyDown = (e) => {
      const tag = e.target?.tagName?.toLowerCase();

      if (
        tag === 'input' ||
        tag === 'textarea' ||
        tag === 'select' ||
        e.target?.isContentEditable
      ) {
        return;
      }

      if (e.key === 'h' || e.key === 'H') {
        e.preventDefault();
        setModalAjudaAberto(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Upload de imagem para o ImgBB
  const fazerUploadImagemImgBB = async () => {
    if (!imagemArquivo) {
      return imagemUrl || (previewLocal.startsWith('blob:') ? '' : previewLocal);
    }

    const formData = new FormData();
    formData.append('image', imagemArquivo);

    const res = await fetch(
      `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
      {
        method: 'POST',
        body: formData
      }
    );

    const data = await res.json().catch(() => null);

    if (!res.ok || !data?.success || !data?.data?.url) {
      throw new Error(
        data?.error?.message || 'Falha ao enviar imagem para o ImgBB.'
      );
    }

    return data.data.url;
  };

  // Carrega produtos e categorias
  const carregarDados = async () => {
    try {
      setLoading(true);

      const [resProd, resCat] = await Promise.all([
        fetch(`${API_URL}/products`),
        fetch(`${API_URL}/categories`)
      ]);

      if (!resProd.ok) {
        throw new Error(
          `Erro ao carregar produtos: ${await obterMensagemErro(resProd)}`
        );
      }

      if (!resCat.ok) {
        throw new Error(
          `Erro ao carregar categorias: ${await obterMensagemErro(resCat)}`
        );
      }

      const dataP = await resProd.json();
      const dataC = await resCat.json();

      const listaProdutos = obterLista(dataP, ['products', 'data']);
      const listaCategorias = obterLista(dataC, ['categories', 'data']);

      if (!listaProdutos || !listaCategorias) {
        throw new Error(
          'O servidor retornou dados em um formato diferente do esperado.'
        );
      }

      setProdutos(listaProdutos);
      setCategorias(listaCategorias);

    } catch (err) {
      console.error('Erro ao carregar dados:', err);

      alert(
        err.message || 'Não foi possível carregar produtos e categorias.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  useEffect(() => {
    setPaginaAtual(1);
  }, [busca, filtroStatus]);

  // Limpa o formulário
  const limparFormulario = () => {
    setNome('');
    setCategoriaId('');
    setPreco('');
    setStatus('ATIVO');
    setDescricao('');
    setImagemArquivo(null);
    setImagemUrl('');
    setPreviewLocal('');
    setProdutoEditando(null);
    setUploadingImg(false);
  };

  // Abre modal para novo produto
  const abrirModalNovo = () => {
    limparFormulario();
    setModalAberto(true);
  };

  // Abre modal para editar produto
  const abrirModalEditar = (prod) => {
    setProdutoEditando(prod);

    setNome(prod.nome || '');

    setCategoriaId(
      String(prod.categoriaId || prod.categoria?.id || '')
    );

    setPreco(prod.preco ?? '');

    const statusVal =
      prod.status || (prod.ativo === false ? 'INATIVO' : 'ATIVO');

    setStatus(statusVal);

    setDescricao(prod.descricao || '');

    const urlExistente =
      prod.imagemUrl || prod.imagem || prod.foto || '';

    setImagemUrl(urlExistente);
    setPreviewLocal(urlExistente);
    setImagemArquivo(null);

    setModalAberto(true);
  };

  // Seleção de imagem
  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      setImagemArquivo(file);
      setPreviewLocal(URL.createObjectURL(file));
      setImagemUrl('');
    }
  };

  // Cadastro de nova categoria
  const salvarNovaCategoria = async (e) => {
    e.preventDefault();

    const nomeFormatado = novaCategoriaNome.trim();

    if (!nomeFormatado) {
      alert('Informe o nome da categoria.');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nome: nomeFormatado
        })
      });

      if (!res.ok) {
        throw new Error(await obterMensagemErro(res));
      }

      const resposta = await res.json().catch(() => null);

      const catCriada =
        resposta?.category ||
        resposta?.data ||
        resposta;

      alert('Categoria cadastrada com sucesso!');

      setNovaCategoriaNome('');
      setModalCategoriaAberto(false);

      await carregarDados();

      if (catCriada?.id) {
        setCategoriaId(String(catCriada.id));
      }

    } catch (err) {
      console.error('Erro ao cadastrar categoria:', err);

      alert(
        err.message || 'Erro de conexão ao salvar categoria.'
      );
    }
  };

  // Cadastro e edição de produtos
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

    // Verifica produtos duplicados
    const isEdicao = !!produtoEditando;

    const jaExiste = produtos.some(p => {
      const mesmoNome =
        p.nome?.trim().toLowerCase() === nomeFormatado.toLowerCase();

      if (isEdicao) {
        return mesmoNome &&
          String(p.id) !== String(produtoEditando.id);
      }

      return mesmoNome;
    });

    if (jaExiste) {
      alert(
        `Não é permitido salvar! Já existe um produto cadastrado com o mesmo nome ("${nomeFormatado}").`
      );
      return;
    }

    try {
      setUploadingImg(true);

      let urlImagemFinal = '';

      try {
        urlImagemFinal = await fazerUploadImagemImgBB();
      } catch (imgErr) {
        console.error('Erro no upload da imagem:', imgErr);

        alert(
          'Erro ao realizar upload da imagem. O cadastro continuará sem alterar a imagem.'
        );

        urlImagemFinal = imagemUrl || '';
      }

      const url = isEdicao
        ? `${API_URL}/products/${produtoEditando.id}`
        : `${API_URL}/products`;

      const method = isEdicao ? 'PUT' : 'POST';

      const payload = {
        nome: nomeFormatado,
        descricao: descricao.trim(),
        preco: valorPreco,
        categoriaId: parseInt(categoriaId, 10),
        estoque: 0,
        status: isEdicao ? status : 'ATIVO',
        ativo: isEdicao ? status === 'ATIVO' : true,
        imagemUrl: urlImagemFinal || undefined
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(await obterMensagemErro(response));
      }

      alert(
        isEdicao
          ? 'Produto atualizado com sucesso!'
          : 'Produto cadastrado com sucesso!'
      );

      setModalAberto(false);
      limparFormulario();

      await carregarDados();

    } catch (err) {
      console.error('Erro ao salvar produto:', err);

      alert(
        err.message || 'Erro de conexão com o servidor ao salvar produto.'
      );

    } finally {
      setUploadingImg(false);
    }
  };

  // Exclusão de produto
  const excluirProduto = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este produto?')) {
      return;
    }

    try {
      const res = await fetch(`${API_URL}/products/${id}`, {
        method: 'DELETE'
      });

      if (!res.ok) {
        const mensagem = await obterMensagemErro(res);

        if (res.status === 400 || res.status === 409) {
          alert(
            'Este produto não pode ser excluído diretamente pois está associado a pedidos já realizados. Altere o status dele para INATIVO na edição!'
          );
        } else {
          alert(`Erro ao excluir produto: ${mensagem}`);
        }

        return;
      }

      alert('Produto excluído com sucesso!');

      await carregarDados();

    } catch (err) {
      console.error('Erro ao excluir produto:', err);
      alert('Erro de conexão ao excluir produto.');
    }
  };

  // Filtragem de produtos
  const produtosFiltrados = produtos.filter(p => {
    const termo = busca.toLowerCase();

    const nomeP = String(p.nome || '').toLowerCase();
    const catP = String(p.categoria?.nome || '').toLowerCase();

    const passaTexto =
      nomeP.includes(termo) || catP.includes(termo);

    const stAtual =
      p.status || (p.ativo === false ? 'INATIVO' : 'ATIVO');

    let passaStatus = true;

    if (filtroStatus !== 'TODOS') {
      passaStatus = stAtual === filtroStatus;
    }

    return passaTexto && passaStatus;
  });

  // Paginação
  const totalPaginas =
    Math.ceil(produtosFiltrados.length / itensPorPagina) || 1;

  const indiceInicial = (paginaAtual - 1) * itensPorPagina;

  const produtosPaginados = produtosFiltrados.slice(
    indiceInicial,
    indiceInicial + itensPorPagina
  );

  return (
    <div style={{ padding: '10px' }}>

      {/* CABEÇALHO */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <div>
          <h2 style={{
            fontSize: '22px',
            fontWeight: '800',
            color: '#0f172a',
            margin: 0
          }}>
            Catálogo de Produtos
          </h2>

          <p style={{
            color: '#64748b',
            fontSize: '14px',
            margin: '4px 0 0 0'
          }}>
            Gerencie as peças e produtos disponíveis na loja ({produtosFiltrados.length} exibidos).
          </p>
        </div>

        <div style={{
          display: 'flex',
          gap: '10px',
          alignItems: 'center'
        }}>
          <button
            onClick={() => setModalAjudaAberto(true)}
            title="Pressione a tecla H para abrir o Guia de Ajuda"
            style={{
              background: '#f1f5f9',
              color: '#475569',
              border: '1px solid #cbd5e1',
              padding: '10px 14px',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px'
            }}
          >
            <FaQuestionCircle style={{ color: '#2563eb' }} />
            Ajuda [H]
          </button>

          <button
            onClick={abrirModalNovo}
            style={{
              background: '#2563eb',
              color: '#fff',
              border: 'none',
              padding: '10px 18px',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <FaPlus style={{ fontSize: '12px' }} />
            Novo Produto
          </button>
        </div>
      </div>

      {/* TABELA E FILTROS */}
      <div style={{
        background: '#fff',
        padding: '24px',
        borderRadius: '14px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
      }}>

        <div style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '20px',
          flexWrap: 'wrap'
        }}>
          <div style={{
            flex: 2,
            minWidth: '240px',
            display: 'flex',
            alignItems: 'center',
            background: '#f8fafc',
            border: '1px solid #cbd5e1',
            padding: '10px 14px',
            borderRadius: '8px'
          }}>
            <FaSearch style={{
              color: '#94a3b8',
              marginRight: '10px'
            }} />

            <input
              type="text"
              placeholder="Buscar por peça ou categoria..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              style={{
                border: 'none',
                background: 'transparent',
                outline: 'none',
                width: '100%',
                fontSize: '14px'
              }}
            />
          </div>

          <div style={{
            flex: 1,
            minWidth: '180px',
            display: 'flex',
            alignItems: 'center',
            background: '#f8fafc',
            border: '1px solid #cbd5e1',
            padding: '0 14px',
            borderRadius: '8px'
          }}>
            <FaFilter style={{
              color: '#94a3b8',
              marginRight: '8px',
              fontSize: '12px'
            }} />

            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              style={{
                border: 'none',
                background: 'transparent',
                outline: 'none',
                width: '100%',
                fontSize: '13px',
                fontWeight: '600',
                color: '#334155',
                cursor: 'pointer',
                padding: '10px 0'
              }}
            >
              <option value="TODOS">Todos os Status</option>
              <option value="ATIVO">Apenas Ativos</option>
              <option value="INATIVO">Apenas Inativos</option>
            </select>
          </div>
        </div>

        {loading ? (
          <p style={{
            textAlign: 'center',
            color: '#64748b',
            padding: '20px'
          }}>
            Carregando catálogo...
          </p>
        ) : (
          <>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse'
            }}>
              <thead>
                <tr style={{
                  borderBottom: '2px solid #f1f5f9',
                  textAlign: 'left'
                }}>
                  <th style={{
                    padding: '12px 16px',
                    fontSize: '12px',
                    color: '#64748b'
                  }}>
                    NOME / CATEGORIA
                  </th>

                  <th style={{
                    padding: '12px 16px',
                    fontSize: '12px',
                    color: '#64748b'
                  }}>
                    STATUS
                  </th>

                  <th style={{
                    padding: '12px 16px',
                    fontSize: '12px',
                    color: '#64748b'
                  }}>
                    PREÇO
                  </th>

                  <th style={{
                    padding: '12px 16px',
                    fontSize: '12px',
                    color: '#64748b',
                    textAlign: 'right'
                  }}>
                    AÇÕES
                  </th>
                </tr>
              </thead>

              <tbody>
                {produtosPaginados.length === 0 ? (
                  <tr>
                    <td
                      colSpan="4"
                      style={{
                        textAlign: 'center',
                        color: '#94a3b8',
                        padding: '30px'
                      }}
                    >
                      Nenhum produto encontrado.
                    </td>
                  </tr>
                ) : (
                  produtosPaginados.map(p => {
                    const st =
                      p.status || (p.ativo === false ? 'INATIVO' : 'ATIVO');

                    const isAtivo = st === 'ATIVO';

                    return (
                      <tr
                        key={p.id}
                        style={{
                          borderBottom: '1px solid #f1f5f9',
                          opacity: isAtivo ? 1 : 0.65
                        }}
                      >
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{
                            fontWeight: '600',
                            color: '#0f172a',
                            fontSize: '14px'
                          }}>
                            {p.nome}
                          </div>

                          <div style={{
                            color: '#64748b',
                            fontSize: '12px',
                            marginTop: '2px'
                          }}>
                            Categoria: {p.categoria?.nome || 'Geral'}
                          </div>
                        </td>

                        <td style={{ padding: '14px 16px' }}>
                          <span style={{
                            padding: '4px 10px',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: '700',
                            background: isAtivo ? '#dcfce7' : '#f1f5f9',
                            color: isAtivo ? '#15803d' : '#64748b',
                            border: `1px solid ${isAtivo ? '#bbf7d0' : '#cbd5e1'}`
                          }}>
                            {isAtivo ? 'ATIVO' : 'INATIVO'}
                          </span>
                        </td>

                        <td style={{
                          padding: '14px 16px',
                          fontWeight: '700',
                          color: '#16a34a'
                        }}>
                          R$ {Number(p.preco || 0).toLocaleString('pt-BR', {
                            minimumFractionDigits: 2
                          })}
                        </td>

                        <td style={{
                          padding: '14px 16px',
                          textAlign: 'right'
                        }}>
                          <div style={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            gap: '8px'
                          }}>
                            <button
                              onClick={() => abrirModalEditar(p)}
                              title="Editar / Alterar Status"
                              style={{
                                background: '#2563eb',
                                color: '#fff',
                                border: 'none',
                                padding: '8px 10px',
                                borderRadius: '6px',
                                cursor: 'pointer'
                              }}
                            >
                              <FaEdit />
                            </button>

                            <button
                              onClick={() => excluirProduto(p.id)}
                              title="Excluir Produto"
                              style={{
                                background: '#ef4444',
                                color: '#fff',
                                border: 'none',
                                padding: '8px 10px',
                                borderRadius: '6px',
                                cursor: 'pointer'
                              }}
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>

            {/* PAGINAÇÃO */}
            {produtosFiltrados.length > 0 && (
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '20px',
                paddingTop: '15px',
                borderTop: '1px solid #f1f5f9'
              }}>
                <span style={{
                  fontSize: '13px',
                  color: '#64748b'
                }}>
                  Mostrando <b>{indiceInicial + 1}</b> a{' '}
                  <b>{Math.min(
                    indiceInicial + itensPorPagina,
                    produtosFiltrados.length
                  )}</b>{' '}
                  de <b>{produtosFiltrados.length}</b> produtos
                </span>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
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
                    <FaChevronLeft style={{ fontSize: '10px' }} />
                    Anterior
                  </button>

                  {Array.from(
                    { length: totalPaginas },
                    (_, index) => index + 1
                  ).map(num => (
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
                    onClick={() => setPaginaAtual(prev =>
                      Math.min(prev + 1, totalPaginas)
                    )}
                    disabled={paginaAtual === totalPaginas}
                    style={{
                      background: '#f8fafc',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      padding: '6px 12px',
                      cursor: paginaAtual === totalPaginas
                        ? 'not-allowed'
                        : 'pointer',
                      opacity: paginaAtual === totalPaginas ? 0.5 : 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '13px',
                      color: '#334155'
                    }}
                  >
                    Próximo
                    <FaChevronRight style={{ fontSize: '10px' }} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* MODAL DE PRODUTO */}
      {modalAberto && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '520px',
            padding: '24px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
              borderBottom: '1px solid #f1f5f9',
              paddingBottom: '12px'
            }}>
              <h3 style={{
                margin: 0,
                color: '#0f172a',
                fontSize: '18px',
                fontWeight: '700'
              }}>
                {produtoEditando
                  ? `Editar Peça: ${produtoEditando.nome}`
                  : 'Cadastrar Produto'}
              </h3>

              <FaTimes
                style={{
                  cursor: 'pointer',
                  color: '#64748b',
                  fontSize: '16px'
                }}
                onClick={() => setModalAberto(false)}
              />
            </div>

            <form
              onSubmit={salvarProduto}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}
            >
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#334155',
                  marginBottom: '6px'
                }}>
                  Nome do Produto *
                </label>

                <input
                  type="text"
                  value={nome}
                  onChange={e => setNome(e.target.value)}
                  placeholder="Ex: Camiseta Algodão Sob Medida"
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    boxSizing: 'border-box',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: produtoEditando
                  ? '1fr 1fr 1fr'
                  : '1fr 1fr',
                gap: '12px'
              }}>
                <div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '6px'
                  }}>
                    <label style={{
                      fontSize: '13px',
                      fontWeight: '600',
                      color: '#334155'
                    }}>
                      Categoria *
                    </label>

                    <button
                      type="button"
                      onClick={() => setModalCategoriaAberto(true)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#2563eb',
                        fontSize: '11px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        padding: 0
                      }}
                    >
                      + Nova
                    </button>
                  </div>

                  <select
                    value={categoriaId}
                    onChange={e => setCategoriaId(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '14px',
                      background: '#fff',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="">Selecione...</option>

                    {categorias.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.nome}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: '600',
                    color: '#334155',
                    marginBottom: '6px'
                  }}>
                    Preço (R$) *
                  </label>

                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={preco}
                    onChange={e => setPreco(e.target.value)}
                    placeholder="0.00"
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      boxSizing: 'border-box',
                      fontSize: '14px'
                    }}
                  />
                </div>

                {produtoEditando && (
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '13px',
                      fontWeight: '600',
                      color: '#334155',
                      marginBottom: '6px'
                    }}>
                      Status *
                    </label>

                    <select
                      value={status}
                      onChange={e => setStatus(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '14px',
                        background: '#fff',
                        boxSizing: 'border-box',
                        fontWeight: '700',
                        color: status === 'ATIVO' ? '#16a34a' : '#64748b'
                      }}
                    >
                      <option value="ATIVO">ATIVO</option>
                      <option value="INATIVO">INATIVO</option>
                    </select>
                  </div>
                )}
              </div>

              {/* IMAGEM DO PRODUTO */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#334155',
                  marginBottom: '6px'
                }}>
                  Imagem do Produto
                </label>

                <div style={{
                  display: 'flex',
                  gap: '10px',
                  alignItems: 'center',
                  marginBottom: '10px'
                }}>
                  <label style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '10px',
                    background: '#f1f5f9',
                    border: '1px dashed #cbd5e1',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    color: '#475569',
                    fontWeight: '600'
                  }}>
                    <FaCloudUploadAlt style={{
                      fontSize: '18px',
                      color: '#2563eb'
                    }} />

                    {imagemArquivo
                      ? imagemArquivo.name
                      : 'Escolher Imagem do Computador'}

                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      style={{ display: 'none' }}
                    />
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
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    boxSizing: 'border-box',
                    fontSize: '13px'
                  }}
                />

                {previewLocal && (
                  <div style={{
                    marginTop: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    background: '#f8fafc',
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <img
                      src={previewLocal}
                      alt="Pré-visualização"
                      style={{
                        width: '60px',
                        height: '60px',
                        objectFit: 'cover',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1'
                      }}
                    />

                    <div>
                      <span style={{
                        fontSize: '12px',
                        fontWeight: '700',
                        color: '#334155',
                        display: 'block'
                      }}>
                        Imagem Selecionada
                      </span>

                      <span style={{
                        fontSize: '11px',
                        color: '#16a34a',
                        fontWeight: '600'
                      }}>
                        {imagemArquivo
                          ? 'Será enviada para o ImgBB ao salvar'
                          : 'Link de imagem inserido'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#334155',
                  marginBottom: '6px'
                }}>
                  Descrição da Peça
                </label>

                <textarea
                  rows="3"
                  value={descricao}
                  onChange={e => setDescricao(e.target.value)}
                  placeholder="Detalhes sobre tecido, corte..."
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    boxSizing: 'border-box',
                    fontSize: '14px',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '10px',
                marginTop: '10px',
                borderTop: '1px solid #f1f5f9',
                paddingTop: '16px'
              }}>
                <button
                  type="button"
                  onClick={() => setModalAberto(false)}
                  style={{
                    background: '#e2e8f0',
                    color: '#475569',
                    border: 'none',
                    padding: '10px 18px',
                    borderRadius: '6px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={uploadingImg}
                  style={{
                    background: '#2563eb',
                    color: '#fff',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '6px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    opacity: uploadingImg ? 0.7 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  {uploadingImg && (
                    <FaSpinner style={{
                      animation: 'spin 1s linear infinite'
                    }} />
                  )}

                  {produtoEditando
                    ? 'Salvar Alterações'
                    : 'Confirmar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL NOVA CATEGORIA */}
      {modalCategoriaAberto && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1100
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '380px',
            padding: '20px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '15px'
            }}>
              <h4 style={{
                margin: 0,
                color: '#0f172a',
                fontSize: '16px'
              }}>
                Nova Categoria
              </h4>

              <FaTimes
                style={{
                  cursor: 'pointer',
                  color: '#64748b'
                }}
                onClick={() => setModalCategoriaAberto(false)}
              />
            </div>

            <form onSubmit={salvarNovaCategoria}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#334155',
                  marginBottom: '4px'
                }}>
                  Nome da Categoria *
                </label>

                <input
                  type="text"
                  value={novaCategoriaNome}
                  onChange={e => setNovaCategoriaNome(e.target.value)}
                  placeholder="Ex: Camisas, Calças..."
                  required
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '8px'
              }}>
                <button
                  type="button"
                  onClick={() => setModalCategoriaAberto(false)}
                  style={{
                    background: '#e2e8f0',
                    color: '#475569',
                    border: 'none',
                    padding: '8px 14px',
                    borderRadius: '6px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  style={{
                    background: '#2563eb',
                    color: '#fff',
                    border: 'none',
                    padding: '8px 14px',
                    borderRadius: '6px',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE AJUDA */}
      {modalAjudaAberto && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.75)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1200
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '14px',
            width: '100%',
            maxWidth: '440px',
            padding: '24px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px',
              borderBottom: '1px solid #f1f5f9',
              paddingBottom: '12px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <FaKeyboard style={{
                  color: '#2563eb',
                  fontSize: '20px'
                }} />

                <h3 style={{
                  margin: 0,
                  color: '#0f172a',
                  fontSize: '18px',
                  fontWeight: '700'
                }}>
                  Guia de Produtos
                </h3>
              </div>

              <FaTimes
                style={{
                  cursor: 'pointer',
                  color: '#64748b'
                }}
                onClick={() => setModalAjudaAberto(false)}
              />
            </div>

            <div style={{
              fontSize: '13px',
              color: '#334155',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <div style={{
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: '8px',
                padding: '10px 12px'
              }}>
                <strong style={{ color: '#1e40af' }}>
                  Atalhos Rápidos:
                </strong>

                <ul style={{
                  margin: '6px 0 0 0',
                  paddingLeft: '20px',
                  lineHeight: '1.6'
                }}>
                  <li>
                    <b>Tecla H:</b> Abre/fecha este menu de ajuda a qualquer momento.
                  </li>
                </ul>
              </div>

              <div style={{ lineHeight: '1.6' }}>
                <strong style={{
                  color: '#0f172a',
                  display: 'block',
                  marginBottom: '4px'
                }}>
                  Regras do Catálogo:
                </strong>

                <ul style={{
                  margin: 0,
                  paddingLeft: '20px'
                }}>
                  <li>
                    <b>Imagens:</b> Faça upload direto do computador (vai para o ImgBB) ou insira uma URL direta.
                  </li>

                  <li>
                    <b>Status:</b> Produtos vinculados a pedidos não podem ser excluídos; altere o status para INATIVO na edição.
                  </li>

                  <li>
                    <b>Nomes Únicos:</b> O sistema bloqueia nomes duplicados para evitar erros no catálogo.
                  </li>
                </ul>
              </div>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              marginTop: '20px',
              borderTop: '1px solid #f1f5f9',
              paddingTop: '14px'
            }}>
              <button
                onClick={() => setModalAjudaAberto(false)}
                style={{
                  background: '#2563eb',
                  color: '#fff',
                  border: 'none',
                  padding: '8px 20px',
                  borderRadius: '6px',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
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