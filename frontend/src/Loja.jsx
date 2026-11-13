import { useEffect, useState } from 'react';
import {
  FaWhatsapp,
  FaSearch,
  FaBoxOpen,
  FaShoppingCart,
  FaChevronLeft,
  FaChevronRight,
  FaEye
} from 'react-icons/fa';

import { Link, useNavigate } from 'react-router-dom';
import API_URL from '../services/api';

const PRODUTOS_POR_PAGINA = 6;
const CHAVE_CARRINHO = 'carrinho';

export default function Loja() {
  const navigate = useNavigate();

  const [produtos, setProdutos] = useState([]);
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const [busca, setBusca] = useState('');
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [loading, setLoading] = useState(true);
  const [mensagemCarrinho, setMensagemCarrinho] = useState('');

  const TELEFONE_WHATSAPP = '5542988381309';

  async function carregarProdutos() {
    try {
      setLoading(true);

      const res = await fetch(`${API_URL}/products`);

      if (!res.ok) {
        throw new Error('Não foi possível carregar os produtos.');
      }

      const data = await res.json();

      const lista = Array.isArray(data) ? data : [];

      setProdutos(lista);

      if (lista.length > 0) {
        setProdutoSelecionado(lista[0]);
      } else {
        setProdutoSelecionado(null);
      }
    } catch (err) {
      console.error('Erro ao buscar produtos da loja:', err);
      setProdutos([]);
      setProdutoSelecionado(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarProdutos();
  }, []);

  // Filtra os produtos pela busca
  const produtosFiltrados = produtos.filter((produto) => {
    const termo = busca.toLowerCase();

    return (
      produto.nome?.toLowerCase().includes(termo) ||
      produto.descricao?.toLowerCase().includes(termo)
    );
  });

  // Paginação
  const totalPaginas = Math.ceil(
    produtosFiltrados.length / PRODUTOS_POR_PAGINA
  );

  const indiceInicial = (paginaAtual - 1) * PRODUTOS_POR_PAGINA;

  const produtosPaginados = produtosFiltrados.slice(
    indiceInicial,
    indiceInicial + PRODUTOS_POR_PAGINA
  );

  // Atualiza a página quando a busca muda
  function atualizarBusca(valor) {
    setBusca(valor);
    setPaginaAtual(1);
  }

  // Seleciona um produto para exibir os detalhes
  function selecionarProduto(produto) {
    setProdutoSelecionado(produto);
  }

  function irParaPagina(numero) {
    if (numero < 1 || numero > totalPaginas) return;

    setPaginaAtual(numero);

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  // Formatação de preço
  function formatarPreco(valor) {
    return Number(valor || 0).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  }

  // Normalização das imagens
  function obterImagem(url) {
    if (!url) return null;

    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }

    return `${API_URL}${url.startsWith('/') ? '' : '/'}${url}`;
  }

  // Link para atendimento pelo WhatsApp
  function gerarLinkWhatsapp(produto) {
    const mensagem = encodeURIComponent(
      `Olá! Vi o produto "${produto.nome}" no catálogo SOBMDIDA, no valor de ${formatarPreco(produto.preco)}, e gostaria de tirar dúvidas sobre ele!`
    );

    return `https://wa.me/${TELEFONE_WHATSAPP}?text=${mensagem}`;
  }

  // Adiciona produto ao carrinho
  function adicionarAoCarrinho(produto, redirecionar = false) {
    try {
      const carrinhoSalvo = localStorage.getItem(CHAVE_CARRINHO);

      let carrinho = carrinhoSalvo
        ? JSON.parse(carrinhoSalvo)
        : [];

      if (!Array.isArray(carrinho)) {
        carrinho = [];
      }

      const produtoExistente = carrinho.find(
        (item) => item.id === produto.id
      );

      if (produtoExistente) {
        carrinho = carrinho.map((item) =>
          item.id === produto.id
            ? {
                ...item,
                quantidade: Number(item.quantidade || 1) + 1
              }
            : item
        );
      } else {
        carrinho.push({
          id: produto.id,
          nome: produto.nome,
          preco: Number(produto.preco || 0),
          descricao: produto.descricao || '',
          imagemUrl: produto.imagemUrl || '',
          quantidade: 1
        });
      }

      localStorage.setItem(
        CHAVE_CARRINHO,
        JSON.stringify(carrinho)
      );

      if (redirecionar) {
        navigate('/carrinho');
        return;
      }

      setMensagemCarrinho(`${produto.nome} foi adicionado ao carrinho!`);

      setTimeout(() => {
        setMensagemCarrinho('');
      }, 3000);
    } catch (erro) {
      console.error('Erro ao adicionar produto ao carrinho:', erro);
      setMensagemCarrinho('Não foi possível adicionar o produto ao carrinho.');
    }
  }

  // Seleção automática de produto quando a busca ou página muda
  useEffect(() => {
    if (produtosPaginados.length === 0) {
      setProdutoSelecionado(null);
      return;
    }

    const produtoAindaVisivel = produtosPaginados.some(
      (produto) => produto.id === produtoSelecionado?.id
    );

    if (!produtoAindaVisivel) {
      setProdutoSelecionado(produtosPaginados[0]);
    }
  }, [paginaAtual, busca, produtos.length]);

  return (
    <div
      style={{
        backgroundColor: '#f8fafc',
        minHeight: '100vh',
        fontFamily: 'sans-serif'
      }}
    >
      <style>{`
        .loja-grade {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 20px;
        }

        .loja-card {
          background: #fff;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          padding: 15px;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 2px 8px rgba(0,0,0,0.03);
        }

        .loja-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 5px 15px rgba(0,0,0,0.08);
        }

        .loja-card.selecionado {
          border: 2px solid #d97706;
        }

        .loja-card-imagem {
          height: 160px;
          background: #f1f5f9;
          border-radius: 8px;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .loja-card-imagem img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .loja-ver-produto {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          background: #1e293b;
          color: #fff;
          border: none;
          padding: 9px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 13px;
          font-weight: bold;
          margin-top: 10px;
        }

        .loja-ver-produto:hover {
          background: #334155;
        }

        .loja-whatsapp-card {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          background: #25D366;
          color: #fff;
          padding: 9px;
          border-radius: 6px;
          text-decoration: none;
          font-size: 13px;
          font-weight: bold;
          margin-top: 8px;
        }

        .loja-paginacao {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 8px;
          margin-top: 30px;
          flex-wrap: wrap;
        }

        .loja-paginacao button {
          min-width: 38px;
          height: 38px;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          background: #fff;
          color: #334155;
          cursor: pointer;
          font-weight: 600;
        }

        .loja-paginacao button.ativa {
          background: #d97706;
          color: #fff;
          border-color: #d97706;
        }

        .loja-paginacao button:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .loja-botao-acao {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px;
          border: none;
          border-radius: 7px;
          cursor: pointer;
          font-size: 14px;
          font-weight: bold;
          margin-top: 10px;
        }

        .loja-adicionar {
          background: #d97706;
          color: #fff;
        }

        .loja-adicionar:hover {
          background: #b45309;
        }

        .loja-comprar {
          background: #1e293b;
          color: #fff;
        }

        .loja-comprar:hover {
          background: #334155;
        }

        .loja-notificacao {
          position: fixed;
          bottom: 25px;
          right: 25px;
          background: #166534;
          color: #fff;
          padding: 14px 20px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          z-index: 200;
          max-width: calc(100% - 50px);
        }

        @media (max-width: 1050px) {
          .loja-layout {
            grid-template-columns: 1fr !important;
          }

          .loja-detalhes {
            position: static !important;
          }
        }

        @media (max-width: 700px) {
          .loja-grade {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .loja-header {
            padding: 15px 20px !important;
            flex-wrap: wrap;
            gap: 15px;
          }
        }

        @media (max-width: 480px) {
          .loja-grade {
            grid-template-columns: 1fr;
          }

          .loja-busca {
            width: 100% !important;
          }
        }
      `}</style>

      {/* CABEÇALHO */}
      <header
        className="loja-header"
        style={{
          background: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          padding: '15px 40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 100
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '30px'
          }}
        >
          <h1
            style={{
              color: '#d97706',
              fontSize: '26px',
              fontWeight: '800',
              margin: 0,
              letterSpacing: '0.5px'
            }}
          >
            SOB<span style={{ color: '#1e293b' }}>MDIDA</span>
          </h1>

          <nav
            style={{
              display: 'flex',
              gap: '20px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#475569'
            }}
          >
            <span
              style={{
                color: '#d97706',
                borderBottom: '2px solid #d97706',
                paddingBottom: '4px'
              }}
            >
              Nosso Catálogo
            </span>
          </nav>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <Link
            to="/carrinho"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              color: '#1e293b',
              textDecoration: 'none',
              fontWeight: '600',
              fontSize: '14px'
            }}
          >
            <FaShoppingCart />
            Meu carrinho
          </Link>

          <Link
            to="/login"
            style={{
              fontSize: '13px',
              color: '#3b82f6',
              textDecoration: 'none',
              fontWeight: '600'
            }}
          >
            Minha conta
          </Link>
        </div>
      </header>

      {/* CONTEÚDO */}
      <div
        style={{
          maxWidth: '1280px',
          margin: '30px auto',
          padding: '0 20px'
        }}
      >
        {/* BUSCA */}
        <div
          style={{
            marginBottom: '25px',
            display: 'flex',
            gap: '15px',
            alignItems: 'center',
            flexWrap: 'wrap'
          }}
        >
          <div
            className="loja-busca"
            style={{
              position: 'relative',
              width: '320px',
              background: '#fff',
              borderRadius: '8px',
              border: '1px solid #cbd5e1'
            }}
          >
            <FaSearch
              style={{
                position: 'absolute',
                left: '12px',
                top: '12px',
                color: '#94a3b8'
              }}
            />

            <input
              type="text"
              placeholder="Buscar produto..."
              value={busca}
              onChange={(e) => atualizarBusca(e.target.value)}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '10px 10px 10px 38px',
                border: 'none',
                borderRadius: '8px',
                outline: 'none',
                fontSize: '14px'
              }}
            />
          </div>

          <span style={{ color: '#64748b', fontSize: '13px' }}>
            {produtosFiltrados.length} produto(s) encontrado(s)
          </span>
        </div>

        {/* NOTIFICAÇÃO */}
        {mensagemCarrinho && (
          <div className="loja-notificacao">
            {mensagemCarrinho}
          </div>
        )}

        {/* LAYOUT PRINCIPAL */}
        <div
          className="loja-layout"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 340px',
            gap: '25px',
            alignItems: 'start'
          }}
        >
          {/* CATÁLOGO */}
          <div>
            {loading ? (
              <p
                style={{
                  textAlign: 'center',
                  padding: '40px',
                  color: '#64748b'
                }}
              >
                Carregando catálogo de produtos...
              </p>
            ) : produtosFiltrados.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '60px',
                  background: '#fff',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0'
                }}
              >
                <FaBoxOpen
                  style={{
                    fontSize: '40px',
                    color: '#cbd5e1',
                    marginBottom: '10px'
                  }}
                />

                <p style={{ color: '#64748b', margin: 0 }}>
                  Nenhum produto encontrado no catálogo.
                </p>
              </div>
            ) : (
              <>
                <div className="loja-grade">
                  {produtosPaginados.map((produto) => (
                    <div
                      key={produto.id}
                      className={`loja-card ${
                        produtoSelecionado?.id === produto.id
                          ? 'selecionado'
                          : ''
                      }`}
                      onClick={() => selecionarProduto(produto)}
                    >
                      <div className="loja-card-imagem">
                        {produto.imagemUrl ? (
                          <img
                            src={obterImagem(produto.imagemUrl)}
                            alt={produto.nome}
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        ) : (
                          <FaBoxOpen
                            style={{
                              fontSize: '32px',
                              color: '#cbd5e1'
                            }}
                          />
                        )}
                      </div>

                      <h3
                        style={{
                          fontSize: '15px',
                          fontWeight: '700',
                          color: '#1e293b',
                          margin: '0 0 6px',
                          textTransform: 'capitalize'
                        }}
                      >
                        {produto.nome}
                      </h3>

                      <p
                        style={{
                          fontSize: '16px',
                          fontWeight: '800',
                          color: '#b91c1c',
                          margin: '0 0 12px'
                        }}
                      >
                        {formatarPreco(produto.preco)}
                      </p>

                      <button
                        type="button"
                        className="loja-ver-produto"
                        onClick={(e) => {
                          e.stopPropagation();
                          selecionarProduto(produto);
                        }}
                      >
                        <FaEye />
                        Ver produto
                      </button>

                      <a
                        href={gerarLinkWhatsapp(produto)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="loja-whatsapp-card"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <FaWhatsapp />
                        Chamar no WhatsApp
                      </a>
                    </div>
                  ))}
                </div>

                {/* PAGINAÇÃO */}
                {totalPaginas > 1 && (
                  <div className="loja-paginacao">
                    <button
                      type="button"
                      onClick={() => irParaPagina(paginaAtual - 1)}
                      disabled={paginaAtual === 1}
                      aria-label="Página anterior"
                    >
                      <FaChevronLeft />
                    </button>

                    {Array.from(
                      { length: totalPaginas },
                      (_, indice) => indice + 1
                    ).map((pagina) => (
                      <button
                        key={pagina}
                        type="button"
                        className={
                          paginaAtual === pagina ? 'ativa' : ''
                        }
                        onClick={() => irParaPagina(pagina)}
                      >
                        {pagina}
                      </button>
                    ))}

                    <button
                      type="button"
                      onClick={() => irParaPagina(paginaAtual + 1)}
                      disabled={paginaAtual === totalPaginas}
                      aria-label="Próxima página"
                    >
                      <FaChevronRight />
                    </button>
                  </div>
                )}

                <p
                  style={{
                    textAlign: 'center',
                    color: '#94a3b8',
                    fontSize: '12px',
                    marginTop: '12px'
                  }}
                >
                  Exibindo {produtosPaginados.length} de{' '}
                  {produtosFiltrados.length} produto(s)
                </p>
              </>
            )}
          </div>

          {/* DETALHES DO PRODUTO */}
          {produtoSelecionado ? (
            <div
              className="loja-detalhes"
              style={{
                background: '#fff',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                padding: '20px',
                position: 'sticky',
                top: '90px'
              }}
            >
              <h3
                style={{
                  fontSize: '16px',
                  fontWeight: '700',
                  color: '#1e293b',
                  marginBottom: '15px',
                  borderBottom: '1px solid #f1f5f9',
                  paddingBottom: '10px'
                }}
              >
                Detalhes do Produto
              </h3>

              <div
                style={{
                  height: '200px',
                  background: '#f8fafc',
                  borderRadius: '8px',
                  marginBottom: '15px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden'
                }}
              >
                {produtoSelecionado.imagemUrl ? (
                  <img
                    src={obterImagem(produtoSelecionado.imagemUrl)}
                    alt={produtoSelecionado.nome}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                ) : (
                  <FaBoxOpen
                    style={{
                      fontSize: '48px',
                      color: '#cbd5e1'
                    }}
                  />
                )}
              </div>

              <h2
                style={{
                  fontSize: '18px',
                  color: '#0f172a',
                  margin: '0 0 8px'
                }}
              >
                {produtoSelecionado.nome}
              </h2>

              <p
                style={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  color: '#b91c1c',
                  margin: '0 0 15px'
                }}
              >
                {formatarPreco(produtoSelecionado.preco)}
              </p>

              {produtoSelecionado.descricao && (
                <div
                  style={{
                    marginBottom: '15px',
                    background: '#f8fafc',
                    padding: '10px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    color: '#475569'
                  }}
                >
                  <strong>Descrição:</strong>
                  <br />
                  {produtoSelecionado.descricao}
                </div>
              )}

              <div
                style={{
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  padding: '12px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: '#991b1b',
                  marginBottom: '15px'
                }}
              >
                ℹ️ <strong>Personalize do seu jeito!</strong>
                <br />
                Entre em contato pelo WhatsApp para combinar os detalhes
                do produto e o envio da sua arte.
              </div>

              <button
                type="button"
                className="loja-botao-acao loja-adicionar"
                onClick={() =>
                  adicionarAoCarrinho(produtoSelecionado)
                }
              >
                <FaShoppingCart />
                Adicionar ao carrinho
              </button>

              <button
                type="button"
                className="loja-botao-acao loja-comprar"
                onClick={() =>
                  adicionarAoCarrinho(produtoSelecionado, true)
                }
              >
                Comprar agora
              </button>

              <a
                href={gerarLinkWhatsapp(produtoSelecionado)}
                target="_blank"
                rel="noopener noreferrer"
                className="loja-whatsapp-card"
                style={{
                  padding: '12px',
                  marginTop: '10px'
                }}
              >
                <FaWhatsapp style={{ fontSize: '18px' }} />
                Pedir pelo WhatsApp
              </a>
            </div>
          ) : (
            !loading && (
              <div
                style={{
                  background: '#fff',
                  padding: '20px',
                  borderRadius: '12px',
                  textAlign: 'center',
                  color: '#94a3b8'
                }}
              >
                Selecione um produto para ver os detalhes.
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}