import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaShoppingBag,
  FaArrowLeft,
  FaLock,
  FaSpinner,
  FaCreditCard,
  FaQrcode
} from 'react-icons/fa';

import API_URL from '../services/api';

const CHAVE_CARRINHO = 'carrinho';
const CHAVE_PEDIDO_PENDENTE = 'pedidoCheckoutPendente';

export default function Checkout() {
  const navigate = useNavigate();

  const [itens, setItens] = useState([]);
  const [cliente, setCliente] = useState(null);
  const [loading, setLoading] = useState(true);
  const [finalizando, setFinalizando] = useState(false);
  const [erro, setErro] = useState('');

  function obterHeaders() {
    const token = localStorage.getItem('token');

    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    };
  }

  function formatarPreco(valor) {
    return Number(valor || 0).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  }

  useEffect(() => {
    async function carregarCheckout() {
      try {
        setLoading(true);
        setErro('');

        const token = localStorage.getItem('token');

        if (!token) {
          navigate('/login');
          return;
        }

        const carrinhoSalvo = localStorage.getItem(CHAVE_CARRINHO);
        const carrinho = carrinhoSalvo
          ? JSON.parse(carrinhoSalvo)
          : [];

        if (!Array.isArray(carrinho) || carrinho.length === 0) {
          setItens([]);
          return;
        }

        setItens(carrinho);

        const resposta = await fetch(`${API_URL}/me`, {
          method: 'GET',
          headers: obterHeaders()
        });

        if (!resposta.ok) {
          throw new Error(
            resposta.status === 401
              ? 'Sua sessão expirou. Faça login novamente.'
              : 'Não foi possível carregar seus dados.'
          );
        }

        const dados = await resposta.json();

        setCliente(dados.user || dados.cliente || dados);

      } catch (error) {
        console.error('Erro ao carregar checkout:', error);
        setErro(error.message || 'Erro ao carregar o checkout.');
      } finally {
        setLoading(false);
      }
    }

    carregarCheckout();
  }, [navigate]);

  const quantidadeTotal = itens.reduce(
    (total, item) => total + Number(item.quantidade || 1),
    0
  );

  const subtotal = itens.reduce(
    (total, item) =>
      total +
      Number(item.preco || 0) *
      Number(item.quantidade || 1),
    0
  );

  async function finalizarCompra() {
    try {
      setFinalizando(true);
      setErro('');

      const token = localStorage.getItem('token');

      if (!token) {
        navigate('/login');
        return;
      }

      if (!cliente) {
        throw new Error('Não foi possível identificar o cliente.');
      }

      if (itens.length === 0) {
        throw new Error('Seu carrinho está vazio.');
      }

      let pedidoId = sessionStorage.getItem(CHAVE_PEDIDO_PENDENTE);

      if (!pedidoId) {
        const respostaPedido = await fetch(`${API_URL}/orders`, {
          method: 'POST',
          headers: obterHeaders(),
          body: JSON.stringify({
            origem: 'SITE',
            formaPagamento: 'PagBank',
            itens: itens.map((item) => ({
              produtoId: Number(item.id),
              quantidade: Number(item.quantidade || 1)
            }))
          })
        });

        const dadosPedido = await respostaPedido.json();

        if (!respostaPedido.ok) {
          throw new Error(
            dadosPedido.erro ||
            dadosPedido.message ||
            'Não foi possível criar seu pedido.'
          );
        }

        const pedido = dadosPedido.pedido ||
          dadosPedido.order ||
          dadosPedido;

        pedidoId = pedido.id;

        if (!pedidoId) {
          throw new Error('O pedido foi criado, mas não recebemos seu identificador.');
        }

        sessionStorage.setItem(CHAVE_PEDIDO_PENDENTE, String(pedidoId));
      }

      const respostaPagamento = await fetch(`${API_URL}/pagamento`, {
        method: 'POST',
        headers: obterHeaders(),
        body: JSON.stringify({
          pedidoId: Number(pedidoId)
        })
      });

      const dadosPagamento = await respostaPagamento.json();

      if (!respostaPagamento.ok) {
        throw new Error(
          dadosPagamento.erro ||
          dadosPagamento.message ||
          'Não foi possível iniciar o pagamento.'
        );
      }

      const checkoutUrl =
        dadosPagamento.checkoutUrl ||
        dadosPagamento.url ||
        dadosPagamento.linkPagamento;

      if (!checkoutUrl) {
        throw new Error('O PagBank não retornou o link de pagamento.');
      }

      window.location.href = checkoutUrl;

    } catch (error) {
      console.error('Erro ao finalizar compra:', error);
      setErro(error.message || 'Ocorreu um erro ao finalizar sua compra.');
      setFinalizando(false);
    }
  }

  if (loading) {
    return (
      <div className="checkout-carregando">
        <FaSpinner className="checkout-spinner" />
        <p>Carregando checkout...</p>

        <style>{`
          .checkout-carregando {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: #555;
          }

          .checkout-spinner {
            font-size: 30px;
            animation: checkout-girar 1s linear infinite;
          }

          @keyframes checkout-girar {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (itens.length === 0) {
    return (
      <div className="checkout-vazio">
        <FaShoppingBag />

        <h2>Seu carrinho está vazio</h2>

        <p>Adicione produtos antes de continuar.</p>

        <Link to="/loja">Voltar para a loja</Link>

        <style>{`
          .checkout-vazio {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 12px;
            color: #444;
          }

          .checkout-vazio svg {
            font-size: 45px;
            color: #999;
          }

          .checkout-vazio a {
            background: #222;
            color: white;
            padding: 12px 22px;
            border-radius: 7px;
            text-decoration: none;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      <style>{`
        .checkout-container {
          min-height: 100vh;
          padding: 35px 6%;
          background: #f7f7f7;
          color: #333;
        }

        .checkout-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 15px;
          margin-bottom: 30px;
        }

        .checkout-header h1 {
          margin: 0;
          font-size: 28px;
        }

        .checkout-voltar {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: #333;
          text-decoration: none;
          font-weight: 600;
        }

        .checkout-conteudo {
          display: grid;
          grid-template-columns: minmax(0, 1.5fr) minmax(280px, 1fr);
          gap: 25px;
          align-items: start;
        }

        .checkout-card {
          background: white;
          padding: 25px;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.05);
          margin-bottom: 20px;
        }

        .checkout-card h2 {
          font-size: 20px;
          margin: 0 0 20px;
          padding-bottom: 15px;
          border-bottom: 1px solid #eee;
        }

        .checkout-dado {
          margin-bottom: 15px;
        }

        .checkout-dado strong {
          display: block;
          font-size: 13px;
          color: #777;
          margin-bottom: 5px;
        }

        .checkout-dado span {
          font-size: 15px;
          color: #333;
        }

        .checkout-item {
          display: flex;
          justify-content: space-between;
          gap: 15px;
          padding: 13px 0;
          border-bottom: 1px solid #eee;
        }

        .checkout-item:last-child {
          border-bottom: none;
        }

        .checkout-item-info strong {
          display: block;
          margin-bottom: 5px;
        }

        .checkout-item-info span {
          font-size: 13px;
          color: #777;
        }

        .checkout-item-preco {
          font-weight: 700;
          white-space: nowrap;
        }

        .checkout-pagamento-opcao {
          display: flex;
          align-items: center;
          gap: 13px;
          padding: 15px;
          border: 1px solid #ddd;
          border-radius: 8px;
          margin-bottom: 12px;
        }

        .checkout-pagamento-opcao svg {
          font-size: 23px;
          color: #333;
        }

        .checkout-pagamento-opcao strong {
          display: block;
          margin-bottom: 4px;
        }

        .checkout-pagamento-opcao span {
          color: #777;
          font-size: 13px;
        }

        .checkout-resumo-linha {
          display: flex;
          justify-content: space-between;
          margin: 17px 0;
          color: #555;
        }

        .checkout-total {
          display: flex;
          justify-content: space-between;
          padding-top: 18px;
          border-top: 1px solid #eee;
          font-size: 21px;
          font-weight: 700;
        }

        .checkout-finalizar {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-top: 22px;
          padding: 15px;
          border: none;
          border-radius: 7px;
          background: #222;
          color: white;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
        }

        .checkout-finalizar:hover {
          background: #444;
        }

        .checkout-finalizar:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .checkout-seguranca {
          display: flex;
          align-items: center;
          gap: 8px;
          justify-content: center;
          margin-top: 18px;
          color: #777;
          font-size: 12px;
        }

        .checkout-erro {
          padding: 13px;
          margin-bottom: 18px;
          border-radius: 7px;
          background: #fee2e2;
          color: #991b1b;
          font-size: 14px;
        }

        @media (max-width: 800px) {
          .checkout-conteudo {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 500px) {
          .checkout-container {
            padding: 25px 4%;
          }

          .checkout-card {
            padding: 18px;
          }
        }
      `}</style>

      <div className="checkout-header">
        <h1>Finalizar compra</h1>

        <Link to="/carrinho" className="checkout-voltar">
          <FaArrowLeft />
          Voltar ao carrinho
        </Link>
      </div>

      <div className="checkout-conteudo">
        <div>
          <section className="checkout-card">
            <h2>Dados do cliente</h2>

            <div className="checkout-dado">
              <strong>Nome</strong>
              <span>
                {cliente?.nome} {cliente?.sobrenome || ''}
              </span>
            </div>

            <div className="checkout-dado">
              <strong>E-mail</strong>
              <span>{cliente?.email || 'Não informado'}</span>
            </div>

            <div className="checkout-dado">
              <strong>Telefone</strong>
              <span>{cliente?.telefone || 'Não informado'}</span>
            </div>

            <div className="checkout-dado">
              <strong>Endereço</strong>
              <span>{cliente?.endereco || 'Não informado'}</span>
            </div>

            <Link
              to="/minha-conta"
              style={{
                display: 'inline-block',
                marginTop: '8px',
                color: '#b51f36',
                fontSize: '13px',
                fontWeight: '600',
                textDecoration: 'none'
              }}
            >
              Atualizar meus dados
            </Link>
          </section>

          <section className="checkout-card">
            <h2>Produtos do pedido</h2>

            {itens.map((item) => (
              <div className="checkout-item" key={item.id}>
                <div className="checkout-item-info">
                  <strong>{item.nome}</strong>

                  <span>
                    Quantidade: {Number(item.quantidade || 1)}
                  </span>
                </div>

                <div className="checkout-item-preco">
                  {formatarPreco(
                    Number(item.preco || 0) *
                    Number(item.quantidade || 1)
                  )}
                </div>
              </div>
            ))}
          </section>

          <section className="checkout-card">
            <h2>Forma de pagamento</h2>

            <div className="checkout-pagamento-opcao">
              <FaQrcode />

              <div>
                <strong>Pix</strong>
                <span>Pagamento pelo PagBank</span>
              </div>
            </div>

            <div className="checkout-pagamento-opcao">
              <FaCreditCard />

              <div>
                <strong>Cartão de crédito</strong>
                <span>Pagamento pelo PagBank</span>
              </div>
            </div>

            <p style={{ fontSize: '13px', color: '#777', marginBottom: 0 }}>
              Você escolherá a forma de pagamento na página segura do PagBank.
            </p>
          </section>
        </div>

        <aside className="checkout-card">
          <h2>Resumo da compra</h2>

          {erro && (
            <div className="checkout-erro">
              {erro}
            </div>
          )}

          <div className="checkout-resumo-linha">
            <span>Produtos ({quantidadeTotal} unidades)</span>
            <span>{formatarPreco(subtotal)}</span>
          </div>

          <div className="checkout-resumo-linha">
            <span>Frete</span>
            <span>A calcular</span>
          </div>

          <div className="checkout-total">
            <span>Total</span>
            <span>{formatarPreco(subtotal)}</span>
          </div>

          <button
            type="button"
            className="checkout-finalizar"
            onClick={finalizarCompra}
            disabled={finalizando}
          >
            {finalizando ? (
              <>
                <FaSpinner className="checkout-spinner" />
                Preparando pagamento...
              </>
            ) : (
              <>
                <FaLock />
                Continuar para pagamento
              </>
            )}
          </button>

          <div className="checkout-seguranca">
            <FaLock />
            Pagamento processado em ambiente seguro
          </div>
        </aside>
      </div>
    </div>
  );
}