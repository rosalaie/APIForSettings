import { Link } from 'react-router-dom';

// Dados fictícios baseados no protótipo oficial
const mockPedidos = [
  { id: '#0001', cliente: 'Maria Silva', produto: 'Caneca Personalizada Preta', data: '20/05/2025', prazo: '05/06/2025', status: 'Novo', valor: '45,00' },
  { id: '#0002', cliente: 'João Santos', produto: 'Camiseta Profissional Malha PV', data: '21/05/2025', prazo: '07/06/2025', status: 'Em Produção', valor: '65,00' },
  { id: '#0003', cliente: 'Ana Costa', produto: 'Garrafa de Alumínio 600ml', data: '22/05/2025', prazo: '08/06/2025', status: 'Produzido', valor: '55,00' },
  { id: '#0004', cliente: 'Carlos Lima', produto: 'Kit Caneca + Camiseta', data: '22/05/2025', prazo: '10/06/2025', status: 'Aguardando Pagamento', valor: '110,00' },
  { id: '#0005', cliente: 'Juliana Alves', produto: 'Caneca Personalizada Branca', data: '23/05/2025', prazo: '03/06/2025', status: 'Em Produção', valor: '45,00' },
  { id: '#0006', cliente: 'Pedro Oliveira', produto: 'Camiseta Malha PV', data: '24/05/2025', prazo: '04/06/2025', status: 'Novo', valor: '65,00' },
];

// Função para definir a cor da "etiqueta" de status
const getStatusStyle = (status) => {
  switch(status) {
    case 'Novo': return { bg: '#e0f2fe', text: '#0284c7' };
    case 'Em Produção': return { bg: '#fef3c7', text: '#d97706' };
    case 'Produzido': return { bg: '#dcfce7', text: '#16a34a' };
    case 'Aguardando Pagamento': return { bg: '#ffedd5', text: '#c2410c' };
    default: return { bg: '#f3f4f6', text: '#4b5563' };
  }
};

function Dashboard() {
  return (
    <div style={{ backgroundColor: '#f9fafb', minHeight: '100vh', fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif' }}>
      
      {/* Menu Superior do Admin */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 40px', backgroundColor: '#fff', borderBottom: '1px solid #eaeaea' }}>
        <h1 style={{ color: '#000', margin: 0, fontSize: '24px', fontWeight: '900', letterSpacing: '-1px' }}>SOBMDIDA</h1>
        <nav style={{ display: 'flex', gap: '25px', fontWeight: '500', color: '#555', fontSize: '14px', alignItems: 'center' }}>
          <span style={{ color: '#000', fontWeight: 'bold', borderBottom: '2px solid #000', paddingBottom: '5px', cursor: 'pointer' }}>📋 Pedidos</span>
          <span style={{ cursor: 'pointer' }}>🛍️ Produtos</span>
          <span style={{ cursor: 'pointer' }}>👥 Clientes</span>
          <span style={{ cursor: 'pointer' }}>📊 Relatórios</span>
          <Link to="/admin" style={{ color: '#555', textDecoration: 'none', marginLeft: '10px', display: 'flex', alignItems: 'center', gap: '5px' }}>
            🚪 Sair
          </Link>
        </nav>
      </header>

      {/* Conteúdo Principal */}
      <main style={{ padding: '30px 40px', maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Título e Botão */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
          <div>
            <h2 style={{ margin: '0 0 5px 0', fontSize: '24px', color: '#111' }}>Gerenciar Pedidos</h2>
            <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>Acompanhe e gerencie todos os pedidos realizados.</p>
          </div>
          <button style={{ backgroundColor: '#000', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer' }}>
            + Novo Pedido
          </button>
        </div>

        {/* Área da Tabela (Fundo Branco) */}
        <div style={{ backgroundColor: '#fff', borderRadius: '10px', padding: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', border: '1px solid #eaeaea' }}>
          
          {/* Filtros */}
          <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
            <input type="text" placeholder="🔍 Buscar pedido, cliente ou produto..." style={{ flex: 1, padding: '10px 15px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px' }} />
            <select style={{ padding: '10px 15px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px', color: '#555', outline: 'none' }}>
              <option>Status: Todos</option>
              <option>Novo</option>
              <option>Em Produção</option>
            </select>
            <input type="text" defaultValue="01/05/2025 - 31/05/2025" style={{ padding: '10px 15px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px', color: '#555', width: '200px' }} />
          </div>

          {/* Tabela de Pedidos */}
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ color: '#777', borderBottom: '1px solid #eee' }}>
                <th style={{ padding: '12px 10px', fontWeight: '600' }}>Nº Pedido</th>
                <th style={{ padding: '12px 10px', fontWeight: '600' }}>Cliente</th>
                <th style={{ padding: '12px 10px', fontWeight: '600' }}>Produto</th>
                <th style={{ padding: '12px 10px', fontWeight: '600' }}>Data do Pedido</th>
                <th style={{ padding: '12px 10px', fontWeight: '600' }}>Prazo</th>
                <th style={{ padding: '12px 10px', fontWeight: '600' }}>Status</th>
                <th style={{ padding: '12px 10px', fontWeight: '600' }}>Valor Total</th>
                <th style={{ padding: '12px 10px', fontWeight: '600' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {mockPedidos.map((pedido, index) => {
                const statusColor = getStatusStyle(pedido.status);
                return (
                  <tr key={index} style={{ borderBottom: '1px solid #f5f5f5' }}>
                    <td style={{ padding: '15px 10px', color: '#555' }}>{pedido.id}</td>
                    <td style={{ padding: '15px 10px', color: '#111', fontWeight: '500' }}>{pedido.cliente}</td>
                    <td style={{ padding: '15px 10px', color: '#555' }}>{pedido.produto}</td>
                    <td style={{ padding: '15px 10px', color: '#555' }}>{pedido.data}</td>
                    <td style={{ padding: '15px 10px', color: '#555' }}>{pedido.prazo}</td>
                    <td style={{ padding: '15px 10px' }}>
                      <span style={{ backgroundColor: statusColor.bg, color: statusColor.text, padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>
                        {pedido.status}
                      </span>
                    </td>
                    <td style={{ padding: '15px 10px', color: '#111', fontWeight: '500' }}>R$ {pedido.valor}</td>
                    <td style={{ padding: '15px 10px' }}>
                      <button style={{ border: '1px solid #ddd', backgroundColor: '#fff', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        👁️ Ver
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Alertas de Prazos */}
        <div style={{ marginTop: '30px' }}>
          <h3 style={{ fontSize: '15px', color: '#333', marginBottom: '15px' }}>Pedidos Próximos do Prazo</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', fontSize: '13px' }}>
              <span>⚠️</span>
              <div>
                <strong style={{ display: 'block', color: '#111' }}>Pedido #0005 - Juliana Alves</strong>
                <span style={{ color: '#666' }}>Prazo: 03/06/2025 <span style={{ color: '#d32f2f' }}>(vence em 1 dia)</span></span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', fontSize: '13px' }}>
              <span>⚠️</span>
              <div>
                <strong style={{ display: 'block', color: '#111' }}>Pedido #0001 - Maria Silva</strong>
                <span style={{ color: '#666' }}>Prazo: 05/06/2025 <span style={{ color: '#d32f2f' }}>(vence em 3 dias)</span></span>
              </div>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}

export default Dashboard;