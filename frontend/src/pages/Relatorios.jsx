// frontend/src/pages/Relatorios.jsx
import { useEffect, useState } from 'react';
import { FaCalendarAlt, FaDollarSign, FaShoppingBag, FaUsers, FaBoxOpen, FaFilter, FaPrint } from 'react-icons/fa';

export default function Relatorios() {
  const [pedidos, setPedidos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filtros de Data (Inicia com o mês atual)
  const hoje = new Date().toISOString().split('T')[0];
  const primeiroDiaMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

  const [dataInicio, setDataInicio] = useState(primeiroDiaMes);
  const [dataFim, setDataFim] = useState(hoje);
  const [tipoRelatorio, setTipoRelatorio] = useState('vendas'); // 'vendas' | 'produtos' | 'origem'

  async function carregarDados() {
    try {
      setLoading(true);
      const [resPed, resCli, resProd] = await Promise.all([
        fetch('http://localhost:3000/orders'),
        fetch('http://localhost:3000/clients'),
        fetch('http://localhost:3000/products')
      ]);

      setPedidos(await resPed.json());
      setClientes(await resCli.json());
      setProdutos(await resProd.json());
    } catch (err) {
      console.error('Erro ao buscar dados para relatórios', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { carregarDados(); }, []);

  // Filtragem dos pedidos com base no período de datas selecionado
  const pedidosFiltrados = (Array.isArray(pedidos) ? pedidos : []).filter(p => {
    if (!p.criadoEm) return true;
    const dataPedido = p.criadoEm.split('T')[0];
    return dataPedido >= dataInicio && dataPedido <= dataFim;
  });

  // Métricas Calculadas
  const totalFaturado = pedidosFiltrados.reduce((acc, p) => acc + (p.total || 0), 0);
  const vendasBalcao = pedidosFiltrados.filter(p => p.origem === 'BALCAO').reduce((acc, p) => acc + p.total, 0);
  const vendasSite = pedidosFiltrados.filter(p => p.origem === 'SITE').reduce((acc, p) => acc + p.total, 0);

  return (
    <>
      <div className="page-header">
        <div>
          <h2 className="page-title">Relatórios e Métricas</h2>
          <p className="page-subtitle">Analise o desempenho financeiro e comercial do seu negócio.</p>
        </div>
        <button className="novo-btn" onClick={() => window.print()} style={{ background: '#475569' }}>
          <FaPrint style={{ marginRight: '8px' }} /> Imprimir Relatório
        </button>
      </div>

      {/* PAINEL DE FILTROS POR DATA */}
      <div className="user-list-card" style={{ marginBottom: '20px', padding: '15px 20px' }}>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1e293b', fontWeight: 'bold' }}>
            <FaFilter style={{ color: '#2563eb' }} /> Filtros:
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <label style={{ fontSize: '13px', color: '#64748b' }}>De:</label>
            <input 
              type="date" 
              className="form-input" 
              value={dataInicio} 
              onChange={e => setDataInicio(e.target.value)}
              style={{ padding: '6px 10px', fontSize: '13px' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <label style={{ fontSize: '13px', color: '#64748b' }}>Até:</label>
            <input 
              type="date" 
              className="form-input" 
              value={dataFim} 
              onChange={e => setDataFim(e.target.value)}
              style={{ padding: '6px 10px', fontSize: '13px' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: 'auto' }}>
            <label style={{ fontSize: '13px', color: '#64748b' }}>Visão:</label>
            <select 
              className="form-input" 
              value={tipoRelatorio} 
              onChange={e => setTipoRelatorio(e.target.value)}
              style={{ padding: '6px 10px', fontSize: '13px', width: '200px' }}
            >
              <option value="vendas">Listagem de Vendas</option>
              <option value="origem">Comparativo (Balcão vs Site)</option>
            </select>
          </div>
        </div>
      </div>

      {/* CARDS RESUMO DO PERÍODO */}
      <div className="dashboard-cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '20px' }}>
        <div className="card-stat" style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '13px', fontWeight: 'bold' }}>
            Faturamento Período
            <FaDollarSign style={{ color: '#10b981', fontSize: '18px' }} />
          </div>
          <h3 style={{ fontSize: '24px', margin: '8px 0', color: '#0f172a' }}>
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalFaturado)}
          </h3>
          <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>{pedidosFiltrados.length} pedido(s) realizados</p>
        </div>

        <div className="card-stat" style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '13px', fontWeight: 'bold' }}>
            Vendas no Balcão
            <FaShoppingBag style={{ color: '#0284c7', fontSize: '18px' }} />
          </div>
          <h3 style={{ fontSize: '24px', margin: '8px 0', color: '#0f172a' }}>
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(vendasBalcao)}
          </h3>
          <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>Lançamentos presenciais</p>
        </div>

        <div className="card-stat" style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '13px', fontWeight: 'bold' }}>
            Vendas do Site
            <FaShoppingBag style={{ color: '#8b5cf6', fontSize: '18px' }} />
          </div>
          <h3 style={{ fontSize: '24px', margin: '8px 0', color: '#0f172a' }}>
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(vendasSite)}
          </h3>
          <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>E-commerce</p>
        </div>

        <div className="card-stat" style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '13px', fontWeight: 'bold' }}>
            Base de Clientes
            <FaUsers style={{ color: '#ec4899', fontSize: '18px' }} />
          </div>
          <h3 style={{ fontSize: '24px', margin: '8px 0', color: '#0f172a' }}>{clientes.length}</h3>
          <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>Cadastrados no total</p>
        </div>
      </div>

      {/* TABELA DO RELATÓRIO SELECIONADO */}
      <div className="user-list-card">
        <h3 style={{ margin: '0 0 15px 0', color: '#1e293b', fontSize: '16px' }}>
          {tipoRelatorio === 'vendas' && 'Detalhamento de Pedidos no Período'}
          {tipoRelatorio === 'origem' && 'Análise de Canal de Vendas'}
        </h3>

        {loading ? (
          <p style={{ textAlign: 'center', padding: '20px', color: '#666' }}>Gerando relatório...</p>
        ) : pedidosFiltrados.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
            Nenhum registro encontrado para o intervalo de {dataInicio} até {dataFim}.
          </p>
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
                  <td style={{ fontSize: '13px', color: '#64748b' }}>
                    {p.criadoEm ? new Date(p.criadoEm).toLocaleDateString('pt-BR') : '-'}
                  </td>
                  <td className="user-name" style={{ fontWeight: '600' }}>
                    {p.cliente?.nome || 'Cliente Balcão'}
                  </td>
                  <td>
                    <span style={{
                      padding: '3px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 'bold',
                      background: p.origem === 'SITE' ? '#e0f2fe' : '#f1f5f9',
                      color: p.origem === 'SITE' ? '#0284c7' : '#475569'
                    }}>
                      {p.origem || 'BALCÃO'}
                    </span>
                  </td>
                  <td style={{ fontSize: '13px' }}>{p.formaPagamento || 'Dinheiro'}</td>
                  <td>
                    <span style={{ fontSize: '12px', fontWeight: 'bold', color: p.status === 'PAGO' ? '#10b981' : '#f59e0b' }}>
                      {p.status}
                    </span>
                  </td>
                  <td style={{ fontWeight: 'bold', color: '#10b981' }}>
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}