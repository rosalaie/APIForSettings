import { useEffect, useState } from 'react';
import {
  FaWhatsapp,
  FaSearch,
  FaBoxOpen,
  FaShoppingCart,
  FaUser,
  FaClipboardList,
  FaSignOutAlt,
  FaGift,
  FaStore,
  FaAward,
  FaShieldAlt,
  FaPencilAlt,
  FaHeadset,
  FaTimes,
  FaShoppingBag
} from 'react-icons/fa';

import { Link, useNavigate } from 'react-router-dom';
import API_URL from '../services/api';

export default function Loja() {
  const navigate = useNavigate();

  const [produtos, setProdutos] = useState([]);
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const [busca, setBusca] = useState('');
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [loading, setLoading] = useState(true);
  const [usuario, setUsuario] = useState(null);

  const TELEFONE_WHATSAPP = '5542988381309';

  const COR_PRINCIPAL = '#b51f36';
  const COR_TEXTO = '#202020';

  // Recupera o usuário autenticado
  useEffect(() => {
    try {
      const usuarioStorage = localStorage.getItem('user');
      const token = localStorage.getItem('token');

      if (usuarioStorage && token) {
        setUsuario(JSON.parse(usuarioStorage));
      }
    } catch (error) {
      console.error('Erro ao recuperar usuário:', error);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      setUsuario(null);
    }
  }, []);

  // Encerra a sessão
  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    setUsuario(null);

    alert('Você saiu da sua conta.');
    navigate('/login');
  }

  // Trata URLs de imagens locais e externas
  const obterUrlImagem = (url) => {
    if (!url) return null;

    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }

    return `${API_URL}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  // Carrega produtos da API
  async function carregarProdutos() {
    try {
      setLoading(true);

      const res = await fetch(`${API_URL}/products`);

      if (!res.ok) {
        throw new Error('Não foi possível carregar os produtos.');
      }

      const data = await res.json();

      setProdutos(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Erro ao buscar produtos da loja:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarProdutos();
  }, []);

  // Pesquisa de produtos
  const produtosFiltrados = produtos.filter(prod => {
    const nome = (prod.nome || '').toLowerCase();
    const descricao = (prod.descricao || '').toLowerCase();
    const termo = busca.toLowerCase();

    return nome.includes(termo) || descricao.includes(termo);
  });

  // Paginação: exibe no máximo 6 produtos por página
  const ITENS_POR_PAGINA = 6;
  const totalPaginas = Math.ceil(produtosFiltrados.length / ITENS_POR_PAGINA);
  const indiceInicial = (paginaAtual - 1) * ITENS_POR_PAGINA;
  const produtosPaginados = produtosFiltrados.slice(
    indiceInicial,
    indiceInicial + ITENS_POR_PAGINA
  );

  // Adiciona o produto ao carrinho usando a estrutura esperada por Carrinho.jsx
  function adicionarAoCarrinho(produto) {
    if (usuario?.role !== 'CLIENT') {
      alert('Entre na sua conta de cliente para adicionar produtos ao carrinho.');
      navigate('/login');
      return;
    }

    try {
      const carrinhoSalvo = JSON.parse(localStorage.getItem('carrinho') || '[]');
      const carrinho = Array.isArray(carrinhoSalvo) ? carrinhoSalvo : [];
      const itemExistente = carrinho.find(
        item => Number(item.id) === Number(produto.id)
      );

      if (itemExistente) {
        itemExistente.quantidade = Number(itemExistente.quantidade || 1) + 1;
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

      localStorage.setItem('carrinho', JSON.stringify(carrinho));
      alert(`${produto.nome} foi adicionado ao carrinho.`);
    } catch (error) {
      console.error('Erro ao adicionar produto ao carrinho:', error);
      alert('Não foi possível adicionar o produto ao carrinho. Tente novamente.');
    }
  }

  // Adiciona o produto e encaminha o cliente para revisar o pedido
  function comprarAgora(produto) {
    adicionarAoCarrinho(produto);

    if (usuario?.role === 'CLIENT') {
      setProdutoSelecionado(null);
      navigate('/carrinho');
    }
  }

  // Link para WhatsApp
  const gerarLinkWhatsapp = (produto) => {
    const preco = Number(produto.preco || 0).toFixed(2);

    const mensagem = encodeURIComponent(
      `Olá! Vi o produto "${produto.nome}" no catálogo SOBMDIDA, no valor de R$ ${preco}, e gostaria de tirar dúvidas!`
    );

    return `https://wa.me/${TELEFONE_WHATSAPP}?text=${mensagem}`;
  };

  const formatarPreco = (preco) => {
    return Number(preco || 0).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  return (
    <div className="loja-container">

      <style>{`

        * {
          box-sizing: border-box;
        }

        .loja-container {
          min-height: 100vh;
          background: #ffffff;
          font-family: Arial, Helvetica, sans-serif;
          color: ${COR_TEXTO};
        }

        .loja-header {
          background: #ffffff;
          border-bottom: 1px solid #eeeeee;
          padding: 18px 3%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          position: sticky;
          top: 0;
          z-index: 100;
          flex-wrap: wrap;
        }

        .loja-logo {
          font-size: 32px;
          font-weight: 900;
          color: #111111;
          letter-spacing: -1.5px;
          margin: 0;
        }

        .loja-nav {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 30px;
          flex-wrap: wrap;
        }

        .loja-nav a {
          color: #222222;
          text-decoration: none;
          font-size: 14px;
          font-weight: 600;
          transition: color 0.2s;
        }

        .loja-nav a:hover {
          color: ${COR_PRINCIPAL};
        }

        .loja-nav button {
          border: none;
          background: none;
          color: ${COR_PRINCIPAL};
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
        }

        .loja-conteudo {
          max-width: 1500px;
          margin: 0 auto;
          padding: 30px 3%;
        }

        .loja-titulo {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 5px;
        }

        .loja-titulo-icone {
          font-size: 32px;
          color: ${COR_PRINCIPAL};
        }

        .loja-titulo h2 {
          font-size: 30px;
          font-weight: 800;
          margin: 0;
          color: #171717;
        }

        .loja-subtitulo {
          color: #666666;
          font-size: 15px;
          margin: 8px 0 25px;
        }

        .loja-pesquisa {
          width: 100%;
          max-width: 380px;
          position: relative;
          margin-bottom: 25px;
        }

        .loja-pesquisa svg {
          position: absolute;
          left: 14px;
          top: 14px;
          color: #999999;
        }

        .loja-pesquisa input {
          width: 100%;
          padding: 12px 15px 12px 42px;
          border: 1px solid #dddddd;
          border-radius: 8px;
          outline: none;
          font-size: 14px;
        }

        .loja-pesquisa input:focus {
          border-color: ${COR_PRINCIPAL};
        }

        .produtos-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 22px;
        }

        .paginacao {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;
          gap: 8px;
          margin: 28px 0 10px;
        }

        .paginacao button {
          min-width: 38px;
          height: 38px;
          padding: 0 12px;
          border: 1px solid #e2e2e2;
          border-radius: 7px;
          background: #ffffff;
          color: #333333;
          font-weight: 700;
          cursor: pointer;
        }

        .paginacao button.ativa {
          background: ${COR_PRINCIPAL};
          border-color: ${COR_PRINCIPAL};
          color: #ffffff;
        }

        .paginacao button:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .paginacao-info {
          width: 100%;
          text-align: center;
          color: #777777;
          font-size: 12px;
          margin-top: 5px;
        }

        .modal-acoes-cliente {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-top: 12px;
        }

        .modal-botao-carrinho,
        .modal-botao-comprar {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          border: none;
          border-radius: 8px;
          padding: 13px 10px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
        }

        .modal-botao-carrinho {
          background: #fcebed;
          color: ${COR_PRINCIPAL};
        }

        .modal-botao-comprar {
          background: ${COR_PRINCIPAL};
          color: #ffffff;
        }

        .modal-botao-carrinho:hover {
          background: #f7d9de;
        }

        .modal-botao-comprar:hover {
          background: #94172b;
        }

        .modal-login-link {
          display: block;
          text-align: center;
          margin-top: 12px;
          color: ${COR_PRINCIPAL};
          font-weight: 700;
          font-size: 13px;
          text-decoration: none;
        }

        .produto-card {
          background: #ffffff;
          border: 1px solid #e7e7e7;
          border-radius: 12px;
          overflow: hidden;
          transition: transform 0.2s, box-shadow 0.2s;
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .produto-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 7px 22px rgba(0,0,0,0.08);
        }

        .produto-imagem {
          width: 100%;
          height: 230px;
          background: #f5f5f5;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .produto-imagem img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .produto-imagem-placeholder {
          font-size: 48px;
          color: #cccccc;
        }

        .produto-informacoes {
          padding: 16px;
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        .produto-titulo {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 10px;
        }

        .produto-icone {
          min-width: 45px;
          width: 45px;
          height: 45px;
          background: #fde9ed;
          color: ${COR_PRINCIPAL};
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 19px;
        }

        .produto-titulo h3 {
          font-size: 16px;
          color: #202020;
          margin: 0;
          font-weight: 700;
        }

        .produto-descricao {
          color: #666666;
          font-size: 13px;
          line-height: 1.6;
          margin: 0 0 18px;
          min-height: 65px;
          flex: 1;
        }

        .produto-rodape {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          margin-top: auto;
        }

        .produto-preco-label {
          display: block;
          color: #777777;
          font-size: 12px;
          margin-bottom: 4px;
        }

        .produto-preco {
          color: ${COR_PRINCIPAL};
          font-size: 22px;
          font-weight: 800;
          white-space: nowrap;
        }

        .produto-acoes {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .botao-ver-produto {
          background: ${COR_PRINCIPAL};
          color: #ffffff;
          border: none;
          border-radius: 7px;
          padding: 11px 14px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: background 0.2s;
          white-space: nowrap;
        }

        .botao-ver-produto:hover {
          background: #94172b;
        }

        .botao-whatsapp {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #eaf8ef;
          color: #25a85a;
          font-size: 17px;
          text-decoration: none;
          transition: transform 0.2s;
        }

        .botao-whatsapp:hover {
          transform: scale(1.1);
        }

        .loja-sem-produtos {
          text-align: center;
          padding: 60px 20px;
          color: #777777;
          background: #fafafa;
          border-radius: 12px;
        }

        .loja-sem-produtos svg {
          font-size: 45px;
          color: #cccccc;
          margin-bottom: 12px;
        }

        .loja-institucional {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 22px;
          margin-top: 22px;
        }

        .institucional-card {
          display: flex;
          align-items: center;
          gap: 25px;
          border: 1px solid #eeeeee;
          border-radius: 12px;
          padding: 22px;
          background: #ffffff;
        }

        .institucional-icone {
          min-width: 115px;
          width: 115px;
          height: 115px;
          border-radius: 50%;
          background: #fde9ed;
          color: ${COR_PRINCIPAL};
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 48px;
        }

        .institucional-card h3 {
          font-size: 17px;
          margin: 0 0 8px;
          color: #202020;
        }

        .institucional-card p {
          font-size: 13px;
          line-height: 1.55;
          color: #666666;
          margin: 0;
        }

        .loja-diferenciais {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          background: #fdf4f5;
          border-radius: 12px;
          padding: 20px;
          margin-top: 22px;
          margin-bottom: 20px;
        }

        .diferencial-item {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 20px;
          padding: 5px 15px;
          border-right: 1px solid #eedadd;
        }

        .diferencial-item:last-child {
          border-right: none;
        }

        .diferencial-icone {
          font-size: 48px;
          color: ${COR_PRINCIPAL};
          min-width: 50px;
        }

        .diferencial-item h3 {
          margin: 0 0 5px;
          font-size: 15px;
          color: #222222;
        }

        .diferencial-item p {
          margin: 0;
          color: #666666;
          font-size: 13px;
          line-height: 1.5;
        }

        .modal-fundo {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.65);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .modal-produto {
          background: #ffffff;
          width: 100%;
          max-width: 850px;
          max-height: 90vh;
          overflow-y: auto;
          border-radius: 14px;
          position: relative;
          display: grid;
          grid-template-columns: 1fr 1fr;
        }

        .modal-fechar {
          position: absolute;
          right: 15px;
          top: 15px;
          width: 35px;
          height: 35px;
          border: none;
          border-radius: 50%;
          background: #f1f1f1;
          color: #333333;
          font-size: 16px;
          cursor: pointer;
          z-index: 2;
        }

        .modal-imagem {
          background: #f5f5f5;
          min-height: 400px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          border-radius: 14px 0 0 14px;
        }

        .modal-imagem img {
          width: 100%;
          height: 100%;
          max-height: 500px;
          object-fit: cover;
        }

        .modal-informacoes {
          padding: 45px 30px 30px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .modal-informacoes h2 {
          font-size: 25px;
          color: #202020;
          margin: 0 0 15px;
        }

        .modal-preco {
          color: ${COR_PRINCIPAL};
          font-size: 28px;
          font-weight: 800;
          margin: 0 0 20px;
        }

        .modal-descricao {
          color: #666666;
          font-size: 14px;
          line-height: 1.7;
          margin-bottom: 22px;
        }

        .modal-aviso {
          background: #fdf4f5;
          border: 1px solid #f2dadd;
          padding: 15px;
          border-radius: 8px;
          font-size: 13px;
          color: #78303b;
          line-height: 1.6;
          margin-bottom: 20px;
        }

        .modal-whatsapp {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          background: #25a85a;
          color: #ffffff;
          text-decoration: none;
          padding: 14px;
          border-radius: 8px;
          font-weight: 700;
          font-size: 14px;
        }

        .modal-whatsapp:hover {
          background: #188746;
        }

        .loja-footer {
          text-align: center;
          padding: 25px;
          border-top: 1px solid #eeeeee;
          color: #888888;
          font-size: 12px;
        }

        @media (max-width: 1100px) {
          .produtos-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }

        @media (max-width: 800px) {
          .produtos-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .loja-institucional {
            grid-template-columns: 1fr;
          }

          .loja-diferenciais {
            grid-template-columns: 1fr;
            gap: 18px;
          }

          .diferencial-item {
            border-right: none;
            border-bottom: 1px solid #eedadd;
            padding-bottom: 18px;
            justify-content: flex-start;
          }

          .diferencial-item:last-child {
            border-bottom: none;
            padding-bottom: 0;
          }
        }

        @media (max-width: 600px) {
          .loja-header {
            padding: 15px 18px;
          }

          .loja-logo {
            font-size: 26px;
          }

          .loja-nav {
            gap: 14px;
            justify-content: flex-start;
          }

          .loja-nav a,
          .loja-nav button {
            font-size: 12px;
          }

          .loja-conteudo {
            padding: 25px 15px;
          }

          .loja-titulo h2 {
            font-size: 23px;
          }

          .produtos-grid {
            grid-template-columns: 1fr;
          }

          .produto-imagem {
            height: 250px;
          }

          .institucional-card {
            flex-direction: column;
            text-align: center;
          }

          .modal-produto {
            grid-template-columns: 1fr;
          }

          .modal-imagem {
            min-height: 250px;
            max-height: 280px;
            border-radius: 14px 14px 0 0;
          }

          .modal-informacoes {
            padding: 25px 20px;
          }

          .modal-acoes-cliente {
            grid-template-columns: 1fr;
          }

          .modal-informacoes h2 {
            font-size: 21px;
          }
        }

      `}</style>

      {/* CABEÇALHO */}
      <header className="loja-header">

        <h1 className="loja-logo">
          SOBMDIDA
        </h1>

        <nav className="loja-nav">

          <a href="#catalogo">
            Catálogo de Itens
          </a>

          {usuario?.role === 'CLIENT' && (
            <>
              <Link to="/carrinho">
                <FaShoppingCart /> Seu Pedido
              </Link>

              <Link to="/meus-pedidos">
                Meus Pedidos
              </Link>

              <Link to="/minha-conta">
                <FaUser /> Sua Conta
              </Link>

              <button onClick={handleLogout}>
                <FaSignOutAlt /> Sair
              </button>
            </>
          )}

          {!usuario && (
            <>
              <a href="#contato">
                Nosso Contato
              </a>

              <Link to="/login">
                Entrar
              </Link>

              <Link to="/register">
                Criar Conta
              </Link>
            </>
          )}

          {usuario?.role === 'ADMIN' && (
            <>
              <a href="#contato">
                Nosso Contato
              </a>

              <Link to="/admin">
                Voltar ao Painel
              </Link>
            </>
          )}

        </nav>
      </header>

      {/* CONTEÚDO */}
      <main className="loja-conteudo">

        {/* TÍTULO */}
        <section id="catalogo">

          <div className="loja-titulo">
            <FaGift className="loja-titulo-icone" />

            <h2>
              Produtos em Destaque
            </h2>
          </div>

          <p className="loja-subtitulo">
            Produtos personalizados com qualidade e carinho para momentos únicos!
          </p>

          {/* PESQUISA */}
          <div className="loja-pesquisa">
            <FaSearch />

            <input
              type="text"
              placeholder="Buscar produto..."
              value={busca}
              onChange={e => {
                setBusca(e.target.value);
                setPaginaAtual(1);
              }}
            />
          </div>

          {/* PRODUTOS */}
          {loading ? (

            <p style={{
              textAlign: 'center',
              padding: '50px',
              color: '#777'
            }}>
              Carregando catálogo de produtos...
            </p>

          ) : produtosFiltrados.length === 0 ? (

            <div className="loja-sem-produtos">
              <FaBoxOpen />

              <p>
                Nenhum produto encontrado no catálogo.
              </p>
            </div>

          ) : (

            <div className="produtos-grid">

              {produtosPaginados.map(prod => {

                const imgUrl = obterUrlImagem(prod.imagemUrl);

                return (
                  <article
                    key={prod.id}
                    className="produto-card"
                  >

                    {/* IMAGEM */}
                    <div className="produto-imagem">

                      {imgUrl ? (
                        <img
                          src={imgUrl}
                          alt={prod.nome}
                        />
                      ) : (
                        <FaBoxOpen className="produto-imagem-placeholder" />
                      )}

                    </div>

                    {/* INFORMAÇÕES */}
                    <div className="produto-informacoes">

                      <div className="produto-titulo">

                        <div className="produto-icone">
                          <FaBoxOpen />
                        </div>

                        <h3>
                          {prod.nome}
                        </h3>

                      </div>

                      <p className="produto-descricao">
                        {prod.descricao || 'Produto personalizado SOBMDIDA. Entre em contato para conhecer todos os detalhes.'}
                      </p>

                      <div className="produto-rodape">

                        <div>
                          <span className="produto-preco-label">
                            A partir de
                          </span>

                          <span className="produto-preco">
                            R$ {formatarPreco(prod.preco)}
                          </span>
                        </div>

                        <div className="produto-acoes">

                          <button
                            className="botao-ver-produto"
                            onClick={() => setProdutoSelecionado(prod)}
                          >
                            Ver Produto
                            <FaShoppingBag />
                          </button>

                          <a
                            className="botao-whatsapp"
                            href={gerarLinkWhatsapp(prod)}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Consultar pelo WhatsApp"
                          >
                            <FaWhatsapp />
                          </a>

                        </div>

                      </div>

                    </div>

                  </article>
                );
              })}

            </div>
          )}

          {!loading && totalPaginas > 1 && (
            <div className="paginacao">
              <button
                type="button"
                onClick={() => setPaginaAtual(pagina => Math.max(1, pagina - 1))}
                disabled={paginaAtual === 1}
                aria-label="Página anterior"
              >
                Anterior
              </button>

              {Array.from({ length: totalPaginas }, (_, indice) => indice + 1).map(numero => (
                <button
                  key={numero}
                  type="button"
                  className={paginaAtual === numero ? 'ativa' : ''}
                  onClick={() => setPaginaAtual(numero)}
                  aria-current={paginaAtual === numero ? 'page' : undefined}
                >
                  {numero}
                </button>
              ))}

              <button
                type="button"
                onClick={() => setPaginaAtual(pagina => Math.min(totalPaginas, pagina + 1))}
                disabled={paginaAtual === totalPaginas}
                aria-label="Próxima página"
              >
                Próxima
              </button>

              <div className="paginacao-info">
                Mostrando {produtosPaginados.length} de {produtosFiltrados.length} produto(s)
              </div>
            </div>
          )}

        </section>

        {/* SOBRE A EMPRESA E OS PRODUTOS */}
        <section className="loja-institucional">

          <div className="institucional-card">

            <div className="institucional-icone">
              <FaStore />
            </div>

            <div>
              <h3>
                Sobre a SOBMDIDA
              </h3>

              <p>
                A SOBMDIDA é especializada em produtos personalizados
                para presentes, eventos e empresas. Trabalhamos com
                canecas, garrafas, porta-copos, carteiras e diversos
                itens exclusivos produzidos com qualidade e atenção
                aos detalhes. Nosso objetivo é transformar ideias
                em produtos únicos que marcam momentos especiais.
              </p>
            </div>

          </div>

          <div className="institucional-card">

            <div className="institucional-icone">
              <FaAward />
            </div>

            <div>
              <h3>
                Sobre nossos produtos
              </h3>

              <p>
                Nossos produtos são desenvolvidos com materiais de
                qualidade e personalização sob medida para cada
                cliente. Atendemos encomendas individuais, brindes
                corporativos, datas comemorativas e eventos especiais.
                Escolha seu produto, envie sua arte ou ideia e nós
                cuidamos do restante.
              </p>
            </div>

          </div>

        </section>

        {/* DIFERENCIAIS */}
        <section className="loja-diferenciais">

          <div className="diferencial-item">

            <FaShieldAlt className="diferencial-icone" />

            <div>
              <h3>
                Qualidade Garantida
              </h3>

              <p>
                Trabalhamos com materiais
                de alta qualidade.
              </p>
            </div>

          </div>

          <div className="diferencial-item">

            <FaPencilAlt className="diferencial-icone" />

            <div>
              <h3>
                Personalização Exclusiva
              </h3>

              <p>
                Sua ideia do seu jeito,
                com identidade única.
              </p>
            </div>

          </div>

          <div className="diferencial-item">

            <FaHeadset className="diferencial-icone" />

            <div>
              <h3>
                Atendimento Especializado
              </h3>

              <p>
                Estamos prontos para te ajudar
                em cada detalhe.
              </p>
            </div>

          </div>

        </section>

      </main>

      {/* RODAPÉ */}
      <footer id="contato" className="loja-footer">
        SOBMDIDA © {new Date().getFullYear()} — Produtos personalizados com carinho.
      </footer>

      {/* MODAL DE DETALHES DO PRODUTO */}
      {produtoSelecionado && (

        <div
          className="modal-fundo"
          onClick={() => setProdutoSelecionado(null)}
        >

          <div
            className="modal-produto"
            onClick={e => e.stopPropagation()}
          >

            <button
              className="modal-fechar"
              onClick={() => setProdutoSelecionado(null)}
              aria-label="Fechar detalhes"
            >
              <FaTimes />
            </button>

            {/* IMAGEM DO PRODUTO */}
            <div className="modal-imagem">

              {obterUrlImagem(produtoSelecionado.imagemUrl) ? (
                <img
                  src={obterUrlImagem(produtoSelecionado.imagemUrl)}
                  alt={produtoSelecionado.nome}
                />
              ) : (
                <FaBoxOpen
                  style={{
                    fontSize: '65px',
                    color: '#cccccc'
                  }}
                />
              )}

            </div>

            {/* INFORMAÇÕES */}
            <div className="modal-informacoes">

              <h2>
                {produtoSelecionado.nome}
              </h2>

              <p className="modal-preco">
                R$ {formatarPreco(produtoSelecionado.preco)}
              </p>

              <div className="modal-descricao">
                <strong>Descrição do produto</strong>

                <p>
                  {produtoSelecionado.descricao ||
                    'Produto personalizado SOBMDIDA. Entre em contato para conhecer todos os detalhes e possibilidades de personalização.'}
                </p>
              </div>

              <div className="modal-aviso">
                <strong>Personalize do seu jeito!</strong>
                <br />

                Chame nossa equipe no WhatsApp para acertar os
                detalhes do produto, enviar sua arte e combinar
                a personalização.
              </div>

              <a
                href={gerarLinkWhatsapp(produtoSelecionado)}
                target="_blank"
                rel="noopener noreferrer"
                className="modal-whatsapp"
              >
                <FaWhatsapp size={20} />
                Consultar pelo WhatsApp
              </a>

              {usuario?.role === 'CLIENT' && (
                <div className="modal-acoes-cliente">
                  <button
                    type="button"
                    className="modal-botao-carrinho"
                    onClick={() => adicionarAoCarrinho(produtoSelecionado)}
                  >
                    <FaShoppingCart />
                    Adicionar ao carrinho
                  </button>

                  <button
                    type="button"
                    className="modal-botao-comprar"
                    onClick={() => comprarAgora(produtoSelecionado)}
                  >
                    <FaShoppingBag />
                    Comprar agora
                  </button>
                </div>
              )}

              {!usuario && (
                <Link
                  to="/login"
                  className="modal-login-link"
                  onClick={() => setProdutoSelecionado(null)}
                >
                  Entre na sua conta para fazer um pedido
                </Link>
              )}

            </div>

          </div>

        </div>

      )}

    </div>
  );
}