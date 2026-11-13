import { useEffect, useState } from 'react';
import { FaShoppingBag, FaSpinner, FaBoxOpen } from 'react-icons/fa';
import API_URL from '../services/api';

export default function MeusPedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  function obterHeaders() {
    const token = localStorage.getItem('token');

    return {
      Authorization: `Bearer ${token}`
    };
  }

  function formatarMoeda(valor) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(Number(valor) || 0);
  }

  function formatarData(data) {
    if (!data) return '-';

    return new Date(data).toLocaleDateString('pt-BR');
  }

  function obterCorStatus(status) {
    const cores = {
      PENDENTE: { fundo: '#fef3c7', texto: '#92400e' },
      PAGO: { fundo: '#dcfce7', texto: '#166534' },
      EM_PREPARACAO: { fundo: '#dbeafe', texto: '#1e40af' },
      ENVIADO: { fundo: '#ede9fe', texto: '#5b21b6' },
      ENTREGUE: { fundo: '#dcfce7', texto: '#166534' },
      CANCELADO: { fundo: '#fee2e2', texto: '#991b1b' }
    };

    return cores[status] || {
      fundo: '#f1f5f9',
      texto: '#475569'
    };
  }

  function formatarStatus(status) {
    const nomes = {
      PENDENTE: 'Pendente',
      PAGO: 'Pago',
      EM_PREPARACAO: 'Em preparação',
      ENVIADO: 'Enviado',
      ENTREGUE: 'Entregue',
      CANCELADO: 'Cancelado'
    };

    return nomes[status] || status || 'Não informado';
  }

  useEffect(() => {
    async function carregarPedidos() {
      try {
        setLoading(true);
        setErro('');

        const token = localStorage.getItem('token');

        if (!token) {
          throw new Error('Você precisa fazer login para consultar seus pedidos.');
        }

        const resposta = await fetch(`${API_URL}/me/orders`, {
          method: 'GET',
          headers: obterHeaders()
        });

        if (!resposta.ok) {
          throw new Error(
            resposta.status === 401 || resposta.status === 403
              ? 'Sua sessão expirou. Faça login novamente.'
              : 'Não foi possível carregar seus pedidos.'
          );
        }

        const dados = await resposta.json();

        const lista = Array.isArray(dados)
          ? dados
          : dados.orders || dados.pedidos || [];

        setPedidos(Array.isArray(lista) ? lista : []);

      } catch (error) {
        console.error('Erro ao carregar pedidos:', error);
        setErro(error.message || 'Ocorreu um erro ao consultar seus pedidos.');
      } finally {
        setLoading(false);
      }
    }

    carregarPedidos();
  }, []);

  return (
    <>
      <div className="page-header">
        <div>
          <h2 className="page-title">Meus Pedidos</h2>
          <p className="page-subtitle">
            Acompanhe suas compras e consulte os detalhes dos pedidos.
          </p>
        </div>
      </div>

      <div
        className="user-list-card"
        style={{
          padding: '25px',
          maxWidth: '1100px',
          margin: '0 auto'
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '25px',
            borderBottom: '1px solid #e2e8f0',
            paddingBottom: '18px'
          }}
        >
          <div
            style={{
              background: '#eff6ff',
              color: '#2563eb',
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px'
            }}
          >
            <FaShoppingBag />
          </div>

          <div>
            <h3 style={{ margin: 0, color: '#1e293b' }}>
              Histórico de compras
            </h3>

            <p style={{ margin: '5px 0 0', color: '#64748b', fontSize: '13px' }}>
              {pedidos.length} pedido(s) encontrado(s)
            </p>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <FaSpinner
              style={{
                fontSize: '25px',
                color: '#2563eb',
                animation: 'spin 1s linear infinite'
              }}
            />
            <p style={{ color: '#64748b' }}>Carregando seus pedidos...</p>
          </div>
        ) : erro ? (
          <div
            style={{
              textAlign: 'center',
              padding: '30px',
              color: '#dc2626',
              background: '#fef2f2',
              borderRadius: '8px'
            }}
          >
            {erro}
          </div>
        ) : pedidos.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '45px 20px',
              color: '#64748b'
            }}
          >
            <FaBoxOpen
              style={{
                fontSize: '45px',
                color: '#cbd5e1',
                marginBottom: '15px'
              }}
            />

            <h3 style={{ color: '#334155' }}>
              Você ainda não realizou pedidos.
            </h3>

            <p>Quando fizer uma compra, ela aparecerá aqui.</p>

            <a
              href="/loja"
              style={{
                display: 'inline-block',
                marginTop: '12px',
                background: '#b51f36',
                color: '#fff',
                padding: '10px 20px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: 'bold'
              }}
            >
              Ir para a loja
            </a>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="user-table">
              <thead>
                <tr>
                  <th>Pedido</th>
                  <th>Data</th>
                  <th>Itens</th>
                  <th>Pagamento</th>
                  <th>Status</th>
                  <th>Total</th>
                </tr>
              </thead>

              <tbody>
                {pedidos.map(pedido => {
                  const cor = obterCorStatus(pedido.status);

                  const quantidadeItens = Array.isArray(pedido.itens)
                    ? pedido.itens.reduce(
                        (total, item) => total + (Number(item.quantidade) || 0),
                        0
                      )
                    : 0;

                  return (
                    <tr key={pedido.id}>
                      <td style={{ fontWeight: 'bold' }}>
                        #{pedido.id}
                      </td>

                      <td style={{ fontSize: '13px', color: '#64748b' }}>
                        {formatarData(pedido.criadoEm)}
                      </td>

                      <td>
                        {quantidadeItens} unidade(s)
                      </td>

                      <td>
                        {pedido.formaPagamento || 'Não informado'}
                      </td>

                      <td>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '5px 10px',
                            borderRadius: '20px',
                            fontSize: '11px',
                            fontWeight: 'bold',
                            background: cor.fundo,
                            color: cor.texto
                          }}
                        >
                          {formatarStatus(pedido.status)}
                        </span>
                      </td>

                      <td
                        style={{
                          fontWeight: 'bold',
                          color: '#10b981'
                        }}
                      >
                        {formatarMoeda(pedido.total)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}