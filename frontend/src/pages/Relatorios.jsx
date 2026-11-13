import { useEffect, useState } from 'react';
import {
  FaDollarSign,
  FaShoppingBag,
  FaUsers,
  FaFilter,
  FaPrint
} from 'react-icons/fa';
import API_URL from '../services/api';

// Recupera o token JWT salvo durante o login.
const obterToken = () => localStorage.getItem('token');

// Monta os cabeçalhos das requisições administrativas.
const obterHeadersAutenticados = () => {
  const token = obterToken();

  return {
    Authorization: `Bearer ${token}`
  };
};

// Extrai uma lista mesmo quando a API retorna um objeto.
const extrairLista = (data, propriedades = []) => {
  if (Array.isArray(data)) {
    return data;
  }

  for (const propriedade of propriedades) {
    if (Array.isArray(data?.[propriedade])) {
      return data[propriedade];
    }
  }

  return [];
};

// Gera uma data no formato YYYY-MM-DD usando o horário local.
const formatarDataLocal = (data) => {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');

  return `${ano}-${mes}-${dia}`;
};

// Formata valores monetários.
const formatarMoeda = (valor) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(Number(valor) || 0);
};

// Obtém mensagens de erro do backend.
const obterMensagemErro = async (res) => {
  try {
    const data = await res.json();
    return data.error || data.message || `Erro HTTP ${res.status}`;
  } catch {
    return `Erro HTTP ${res.status}`;
  }
};

export default function Relatorios() {
  const [pedidos, setPedidos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);

  const hoje = formatarDataLocal(new Date());

  const primeiroDiaMes = formatarDataLocal(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  );

  const [dataInicio, setDataInicio] = useState(primeiroDiaMes);
  const [dataFim, setDataFim] = useState(hoje);
  const [tipoRelatorio, setTipoRelatorio] = useState('vendas');

  // Carrega os dados necessários para os relatórios.
  async function carregarDados() {
    const token = obterToken();

    if (!token) {
      alert('Sua sessão não foi encontrada. Faça login novamente.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const [resPed, resCli, resProd] = await Promise.all([
        fetch(`${API_URL}/orders`, {
          headers: obterHeadersAutenticados()
        }),

        fetch(`${API_URL}/clients`, {
          headers: obterHeadersAutenticados()
        }),

        // Produtos continuam públicos no backend.
        fetch(`${API_URL}/products`)
      ]);

      if (!resPed.ok) {
        const mensagem = await obterMensagemErro(resPed);

        if (resPed.status === 401 || resPed.status === 403) {
          throw new Error(
            'Sua sessão expirou ou você não tem permissão para consultar os pedidos. Faça login novamente.'
          );
        }

        throw new Error(`Erro ao carregar pedidos: ${mensagem}`);
      }

      if (!resCli.ok) {
        const mensagem = await obterMensagemErro(resCli);

        if (resCli.status === 401 || resCli.status === 403) {
          throw new Error(
            'Sua sessão expirou ou você não tem permissão para consultar os clientes. Faça login novamente.'
          );
        }

        throw new Error(`Erro ao carregar clientes: ${mensagem}`);
      }

      if (!resProd.ok) {
        const mensagem = await obterMensagemErro(resProd);
        throw new Error(`Erro ao carregar produtos: ${mensagem}`);
      }

      const [dadosPedidos, dadosClientes, dadosProdutos] =
        await Promise.all([
          resPed.json(),
          resCli.json(),
          resProd.json()
        ]);

      setPedidos(
        extrairLista(dadosPedidos, ['orders', 'pedidos'])
      );

      setClientes(
        extrairLista(dadosClientes, ['clients', 'clientes', 'users'])
      );

      setProdutos(
        extrairLista(dadosProdutos, ['products', 'produtos'])
      );

    } catch (err) {
      console.error('Erro ao buscar dados para relatórios:', err);

      alert(
        err.message ||
        'Não foi possível carregar os dados dos relatórios.'
      );

      setPedidos([]);
      setClientes([]);
      setProdutos([]);

    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarDados();
  }, []);

  // Filtra os pedidos pelo intervalo de datas.
  const pedidosFiltrados = pedidos.filter(p => {
    if (!p.criadoEm) return true;

    const dataPedido = p.criadoEm.split('T')[0];

    return dataPedido >= dataInicio && dataPedido <= dataFim;
  });

  // Calcula o faturamento do período.
  const totalFaturado = pedidosFiltrados.reduce(
    (acc, p) => acc + (Number(p.total) || 0),
    0
  );

  // Calcula as vendas realizadas no balcão.
  const vendasBalcao = pedidosFiltrados
    .filter(p => p.origem === 'BALCAO')
    .reduce((acc, p) => acc + (Number(p.total) || 0), 0);

  // Calcula as vendas realizadas pelo site.
  const vendasSite = pedidosFiltrados
    .filter(p => p.origem === 'SITE')
    .reduce((acc, p) => acc + (Number(p.total) || 0), 0);

  // Quantidade de pedidos por origem.
  const quantidadeBalcao = pedidosFiltrados.filter(
    p => p.origem === 'BALCAO'
  ).length;

  const quantidadeSite = pedidosFiltrados.filter(
    p => p.origem === 'SITE'
  ).length;

  return (
    <>
      <div className="page-header">
        <div>
          <h2 className="page-title">
            Relatórios e Métricas
          </h2>

          <p className="page-subtitle">
            Analise o desempenho financeiro e comercial do seu negócio.
          </p>
        </div>

        <button
          className="novo-btn"
          onClick={() => window.print()}
          style={{ background: '#475569' }}
        >
          <FaPrint style={{ marginRight: '8px' }} />
          Imprimir Relatório
        </button>
      </div>

      <div
        className="user-list-card"
        style={{
          marginBottom: '20px',
          padding: '15px 20px'
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: '15px',
            alignItems: 'center',
            flexWrap: 'wrap'
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#1e293b',
              fontWeight: 'bold'
            }}
          >
            <FaFilter style={{ color: '#2563eb' }} />
            Filtros:
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <label
              style={{
                fontSize: '13px',
                color: '#64748b'
              }}
            >
              De:
            </label>

            <input
              type="date"
              className="form-input"
              value={dataInicio}
              max={dataFim}
              onChange={e => setDataInicio(e.target.value)}
              style={{
                padding: '6px 10px',
                fontSize: '13px'
              }}
            />
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <label
              style={{
                fontSize: '13px',
                color: '#64748b'
              }}
            >
              Até:
            </label>

            <input
              type="date"
              className="form-input"
              value={dataFim}
              min={dataInicio}
              onChange={e => setDataFim(e.target.value)}
              style={{
                padding: '6px 10px',
                fontSize: '13px'
              }}
            />
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginLeft: 'auto'
            }}
          >
            <label
              style={{
                fontSize: '13px',
                color: '#64748b'
              }}
            >
              Visão:
            </label>

            <select
              className="form-input"
              value={tipoRelatorio}
              onChange={e => setTipoRelatorio(e.target.value)}
              style={{
                padding: '6px 10px',
                fontSize: '13px',
                width: '200px'
              }}
            >
              <option value="vendas">
                Listagem de Vendas
              </option>

              <option value="origem">
                Comparativo (Balcão vs Site)
              </option>
            </select>
          </div>
        </div>
      </div>

      <div
        className="dashboard-cards"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '20px',
          marginBottom: '20px'
        }}
      >
        <div
          className="card-stat"
          style={{
            background: '#fff',
            padding: '20px',
            borderRadius: '12px',
            border: '1px solid #e2e8f0'
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              color: '#64748b',
              fontSize: '13px',
              fontWeight: 'bold'
            }}
          >
            Faturamento Período

            <FaDollarSign
              style={{
                color: '#10b981',
                fontSize: '18px'
              }}
            />
          </div>

          <h3
            style={{
              fontSize: '24px',
              margin: '8px 0',
              color: '#0f172a'
            }}
          >
            {formatarMoeda(totalFaturado)}
          </h3>

          <p
            style={{
              fontSize: '12px',
              color: '#94a3b8',
              margin: 0
            }}
          >
            {pedidosFiltrados.length} pedido(s) realizados
          </p>
        </div>

        <div
          className="card-stat"
          style={{
            background: '#fff',
            padding: '20px',
            borderRadius: '12px',
            border: '1px solid #e2e8f0'
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              color: '#64748b',
              fontSize: '13px',
              fontWeight: 'bold'
            }}
          >
            Vendas no Balcão

            <FaShoppingBag
              style={{
                color: '#0284c7',
                fontSize: '18px'
              }}
            />
          </div>

          <h3
            style={{
              fontSize: '24px',
              margin: '8px 0',
              color: '#0f172a'
            }}
          >
            {formatarMoeda(vendasBalcao)}
          </h3>

          <p
            style={{
              fontSize: '12px',
              color: '#94a3b8',
              margin: 0
            }}
          >
            Lançamentos presenciais
          </p>
        </div>

        <div
          className="card-stat"
          style={{
            background: '#fff',
            padding: '20px',
            borderRadius: '12px',
            border: '1px solid #e2e8f0'
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              color: '#64748b',
              fontSize: '13px',
              fontWeight: 'bold'
            }}
          >
            Vendas do Site

            <FaShoppingBag
              style={{
                color: '#8b5cf6',
                fontSize: '18px'
              }}
            />
          </div>

          <h3
            style={{
              fontSize: '24px',
              margin: '8px 0',
              color: '#0f172a'
            }}
          >
            {formatarMoeda(vendasSite)}
          </h3>

          <p
            style={{
              fontSize: '12px',
              color: '#94a3b8',
              margin: 0
            }}
          >
            E-commerce
          </p>
        </div>

        <div
          className="card-stat"
          style={{
            background: '#fff',
            padding: '20px',
            borderRadius: '12px',
            border: '1px solid #e2e8f0'
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              color: '#64748b',
              fontSize: '13px',
              fontWeight: 'bold'
            }}
          >
            Base de Clientes

            <FaUsers
              style={{
                color: '#ec4899',
                fontSize: '18px'
              }}
            />
          </div>

          <h3
            style={{
              fontSize: '24px',
              margin: '8px 0',
              color: '#0f172a'
            }}
          >
            {clientes.length}
          </h3>

          <p
            style={{
              fontSize: '12px',
              color: '#94a3b8',
              margin: 0
            }}
          >
            Cadastrados no total
          </p>
        </div>
      </div>

      <div className="user-list-card">
        <h3
          style={{
            margin: '0 0 15px 0',
            color: '#1e293b',
            fontSize: '16px'
          }}
        >
          {tipoRelatorio === 'vendas'
            ? 'Detalhamento de Pedidos no Período'
            : 'Análise de Canal de Vendas'}
        </h3>

        {loading ? (
          <p
            style={{
              textAlign: 'center',
              padding: '20px',
              color: '#666'
            }}
          >
            Gerando relatório...
          </p>
        ) : pedidosFiltrados.length === 0 ? (
          <p
            style={{
              textAlign: 'center',
              padding: '30px',
              color: '#94a3b8'
            }}
          >
            Nenhum registro encontrado para o intervalo de{' '}
            {dataInicio} até {dataFim}.
          </p>
        ) : tipoRelatorio === 'origem' ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '20px'
            }}
          >
            <div
              style={{
                padding: '20px',
                background: '#f0f9ff',
                borderRadius: '10px',
                border: '1px solid #bae6fd'
              }}
            >
              <h4
                style={{
                  margin: '0 0 10px',
                  color: '#0369a1'
                }}
              >
                Vendas no Balcão
              </h4>

              <h2
                style={{
                  margin: '0 0 8px',
                  color: '#0f172a'
                }}
              >
                {formatarMoeda(vendasBalcao)}
              </h2>

              <p
                style={{
                  margin: 0,
                  fontSize: '13px',
                  color: '#64748b'
                }}
              >
                {quantidadeBalcao} pedido(s)
              </p>
            </div>

            <div
              style={{
                padding: '20px',
                background: '#f5f3ff',
                borderRadius: '10px',
                border: '1px solid #ddd6fe'
              }}
            >
              <h4
                style={{
                  margin: '0 0 10px',
                  color: '#7c3aed'
                }}
              >
                Vendas pelo Site
              </h4>

              <h2
                style={{
                  margin: '0 0 8px',
                  color: '#0f172a'
                }}
              >
                {formatarMoeda(vendasSite)}
              </h2>

              <p
                style={{
                  margin: 0,
                  fontSize: '13px',
                  color: '#64748b'
                }}
              >
                {quantidadeSite} pedido(s)
              </p>
            </div>
          </div>
        ) : (
          <table className="user-table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Cliente</th>
                <th>Origem</th>
                <th>Pagamento</th>
                <th>Status</th>
                <th>Total</th>
              </tr>
            </thead>

            <tbody>
              {pedidosFiltrados.map(p => (
                <tr key={p.id}>
                  <td
                    style={{
                      fontSize: '13px',
                      color: '#64748b'
                    }}
                  >
                    {p.criadoEm
                      ? new Date(p.criadoEm).toLocaleDateString('pt-BR')
                      : '-'}
                  </td>

                  <td
                    className="user-name"
                    style={{ fontWeight: '600' }}
                  >
                    {p.cliente?.nome || 'Cliente Balcão'}
                  </td>

                  <td>
                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: '10px',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        background: p.origem === 'SITE'
                          ? '#e0f2fe'
                          : '#f1f5f9',
                        color: p.origem === 'SITE'
                          ? '#0284c7'
                          : '#475569'
                      }}
                    >
                      {p.origem || 'BALCAO'}
                    </span>
                  </td>

                  <td style={{ fontSize: '13px' }}>
                    {p.formaPagamento || 'Dinheiro'}
                  </td>

                  <td>
                    <span
                      style={{
                        fontSize: '12px',
                        fontWeight: 'bold',
                        color: p.status === 'PAGO'
                          ? '#10b981'
                          : '#f59e0b'
                      }}
                    >
                      {p.status || 'PENDENTE'}
                    </span>
                  </td>

                  <td
                    style={{
                      fontWeight: 'bold',
                      color: '#10b981'
                    }}
                  >
                    {formatarMoeda(p.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}gi