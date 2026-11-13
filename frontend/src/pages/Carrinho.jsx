import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaShoppingCart,
  FaTrash,
  FaPlus,
  FaMinus,
  FaArrowLeft,
  FaArrowRight
} from 'react-icons/fa';

import API_URL from '../services/api';

const CHAVE_CARRINHO = 'carrinho';

export default function Carrinho() {
  const navigate = useNavigate();

  const [itens, setItens] = useState(() => {
    try {
      const carrinhoSalvo = localStorage.getItem(CHAVE_CARRINHO);
      return carrinhoSalvo ? JSON.parse(carrinhoSalvo) : [];
    } catch (erro) {
      console.error('Erro ao carregar carrinho:', erro);
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(CHAVE_CARRINHO, JSON.stringify(itens));
  }, [itens]);

  function formatarPreco(valor) {
    return Number(valor || 0).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  }

  function obterImagem(url) {
    if (!url) return null;

    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }

    return `${API_URL}${url.startsWith('/') ? '' : '/'}${url}`;
  }

  function alterarQuantidade(id, operacao) {
    setItens((atual) =>
      atual.map((item) => {
        if (item.id !== id) return item;

        const quantidadeAtual = Number(item.quantidade || 1);

        if (operacao === 'aumentar') {
          return {
            ...item,
            quantidade: quantidadeAtual + 1
          };
        }

        if (operacao === 'diminuir') {
          return {
            ...item,
            quantidade: Math.max(1, quantidadeAtual - 1)
          };
        }

        return item;
      })
    );
  }

  function removerItem(id) {
    setItens((atual) => atual.filter((item) => item.id !== id));
  }

  function limparCarrinho() {
    setItens([]);
  }

  const quantidadeTotal = itens.reduce(
    (total, item) => total + Number(item.quantidade || 1),
    0
  );

  const subtotal = itens.reduce(
    (total, item) =>
      total + Number(item.preco || 0) * Number(item.quantidade || 1),
    0
  );

  function continuarCheckout() {
    navigate('/checkout');
  }

  return (
    <div className="carrinho-container">
      <style>{`
        .carrinho-container {
          min-height: 100vh;
          padding: 35px 6%;
          background: #f7f7f7;
          color: #333;
        }

        .carrinho-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 15px;
          margin-bottom: 30px;
        }

        .carrinho-header h1 {
          font-size: 28px;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .carrinho-voltar {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: #333;
          text-decoration: none;
          font-weight: 600;
        }

        .carrinho-voltar:hover {
          color: #777;
        }

        .carrinho-conteudo {
          display: grid;
          grid-template-columns: minmax(0, 2fr) minmax(260px, 1fr);
          gap: 25px;
          align-items: start;
        }

        .carrinho-lista,
        .carrinho-resumo {
          background: #fff;
          border-radius: 12px;
          padding: 25px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        }

        .carrinho-item {
          display: grid;
          grid-template-columns: 110px 1fr auto;
          gap: 20px;
          align-items: center;
          padding: 20px 0;
          border-bottom: 1px solid #eee;
        }

        .carrinho-item:first-child {
          padding-top: 0;
        }

        .carrinho-item:last-child {
          border-bottom: none;
        }

        .carrinho-imagem {
          width: 110px;
          height: 110px;
          object-fit: cover;
          border-radius: 8px;
          background: #f2f2f2;
        }

        .carrinho-sem-imagem {
          width: 110px;
          height: 110px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f2f2f2;
          color: #999;
          border-radius: 8px;
        }

        .carrinho-item-info h3 {
          margin: 0 0 8px;
          font-size: 17px;
        }

        .carrinho-item-info p {
          margin: 0 0 12px;
          color: #777;
          font-size: 14px;
        }

        .carrinho-preco {
          font-weight: 700;
          color: #333;
        }

        .carrinho-acoes {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 12px;
        }

        .carrinho-quantidade {
          display: flex;
          align-items: center;
          gap: 12px;
          border: 1px solid #ddd;
          border-radius: 6px;
          padding: 5px 10px;
        }

        .carrinho-quantidade button {
          border: none;
          background: transparent;
          cursor: pointer;
          padding: 3px;
          color: #333;
        }

        .carrinho-quantidade button:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .carrinho-remover {
          border: none;
          background: transparent;
          color: #c0392b;
          cursor: pointer;
          padding: 8px;
          font-size: 15px;
        }

        .carrinho-resumo h2 {
          margin-top: 0;
          font-size: 21px;
          padding-bottom: 15px;
          border-bottom: 1px solid #eee;
        }

        .carrinho-resumo-linha {
          display: flex;
          justify-content: space-between;
          margin: 18px 0;
          color: #555;
        }

        .carrinho-total {
          display: flex;
          justify-content: space-between;
          font-size: 20px;
          font-weight: 700;
          padding-top: 18px;
          border-top: 1px solid #eee;
        }

        .carrinho-finalizar {
          width: 100%;
          padding: 14px;
          margin-top: 22px;
          border: none;
          border-radius: 7px;
          background: #222;
          color: white;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        .carrinho-finalizar:hover {
          background: #444;
        }

        .carrinho-limpar {
          width: 100%;
          padding: 11px;
          margin-top: 10px;
          background: transparent;
          border: 1px solid #ddd;
          border-radius: 7px;
          cursor: pointer;
          color: #777;
        }

        .carrinho-vazio {
          background: #fff;
          border-radius: 12px;
          padding: 65px 20px;
          text-align: center;
          box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        }

        .carrinho-vazio svg {
          font-size: 48px;
          color: #aaa;
          margin-bottom: 15px;
        }

        .carrinho-vazio h2 {
          margin-bottom: 10px;
        }

        .carrinho-vazio p {
          color: #777;
          margin-bottom: 25px;
        }

        .carrinho-botao-loja {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 22px;
          background: #222;
          color: white;
          text-decoration: none;
          border-radius: 7px;
          font-weight: 600;
        }

        @media (max-width: 800px) {
          .carrinho-conteudo {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 500px) {
          .carrinho-container {
            padding: 25px 4%;
          }

          .carrinho-item {
            grid-template-columns: 80px 1fr;
            gap: 12px;
          }

          .carrinho-imagem,
          .carrinho-sem-imagem {
            width: 80px;
            height: 80px;
          }

          .carrinho-item-total {
            grid-column: 2;
          }

          .carrinho-lista,
          .carrinho-resumo {
            padding: 18px;
          }
        }
      `}</style>

      <div className="carrinho-header">
        <h1>
          <FaShoppingCart />
          Meu carrinho
        </h1>

        <Link to="/loja" className="carrinho-voltar">
          <FaArrowLeft />
          Continuar comprando
        </Link>
      </div>

      {itens.length === 0 ? (
        <div className="carrinho-vazio">
          <FaShoppingCart />

          <h2>Seu carrinho está vazio</h2>

          <p>
            Você ainda não adicionou nenhum produto ao carrinho.
          </p>

          <Link to="/loja" className="carrinho-botao-loja">
            Ir para a loja
            <FaArrowRight />
          </Link>
        </div>
      ) : (
        <div className="carrinho-conteudo">
          <div className="carrinho-lista">
            {itens.map((item) => (
              <div className="carrinho-item" key={item.id}>
                <div>
                  {item.imagemUrl ? (
                    <img
                      src={obterImagem(item.imagemUrl)}
                      alt={item.nome}
                      className="carrinho-imagem"
                    />
                  ) : (
                    <div className="carrinho-sem-imagem">
                      <FaShoppingCart />
                    </div>
                  )}
                </div>

                <div className="carrinho-item-info">
                  <h3>{item.nome}</h3>

                  {item.descricao && (
                    <p>{item.descricao}</p>
                  )}

                  <div className="carrinho-preco">
                    {formatarPreco(item.preco)}
                  </div>

                  <div className="carrinho-acoes">
                    <div className="carrinho-quantidade">
                      <button
                        type="button"
                        onClick={() =>
                          alterarQuantidade(item.id, 'diminuir')
                        }
                        disabled={Number(item.quantidade || 1) <= 1}
                        aria-label="Diminuir quantidade"
                      >
                        <FaMinus />
                      </button>

                      <span>{Number(item.quantidade || 1)}</span>

                      <button
                        type="button"
                        onClick={() =>
                          alterarQuantidade(item.id, 'aumentar')
                        }
                        aria-label="Aumentar quantidade"
                      >
                        <FaPlus />
                      </button>
                    </div>

                    <button
                      type="button"
                      className="carrinho-remover"
                      onClick={() => removerItem(item.id)}
                      title="Remover produto"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>

                <div className="carrinho-item-total">
                  <strong>
                    {formatarPreco(
                      Number(item.preco || 0) *
                      Number(item.quantidade || 1)
                    )}
                  </strong>
                </div>
              </div>
            ))}
          </div>

          <aside className="carrinho-resumo">
            <h2>Resumo do pedido</h2>

            <div className="carrinho-resumo-linha">
              <span>Produtos ({quantidadeTotal} unidades)</span>
              <span>{formatarPreco(subtotal)}</span>
            </div>

            <div className="carrinho-resumo-linha">
              <span>Frete</span>
              <span>A calcular</span>
            </div>

            <div className="carrinho-total">
              <span>Subtotal</span>
              <span>{formatarPreco(subtotal)}</span>
            </div>

            <button
              type="button"
              className="carrinho-finalizar"
              onClick={continuarCheckout}
            >
              Continuar
              <FaArrowRight />
            </button>

            <button
              type="button"
              className="carrinho-limpar"
              onClick={limparCarrinho}
            >
              Limpar carrinho
            </button>
          </aside>
        </div>
      )}
    </div>
  );
}