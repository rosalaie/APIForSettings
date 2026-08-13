// frontend/src/App.js
import './App.css';
import { useEffect, useState } from 'react';
import { FaStore, FaUsers, FaBoxOpen, FaTags, FaChartBar, FaDollarSign, FaShoppingBag, FaSearch } from "react-icons/fa";
import { Link, Outlet, useLocation } from 'react-router-dom';

function App() {
  const [clientes, setClientes] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [busca, setBusca] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(true);
  
  const location = useLocation();

  const obterTituloPagina = () => {
    if (location.pathname === '/clientes') return 'Clientes';
    if (location.pathname === '/produtos') return 'Catálogo de Produtos';
    if (location.pathname === '/categorias') return 'Categorias';
    if (location.pathname === '/pedidos') return 'Gestão de Pedidos';
    if (location.pathname === '/relatorios') return 'Relatórios e Análises';
    return 'Painel de Controle';
  };

  async function carregarDadosDashboard() {
    try {
      setLoading(true);
      // Busca Clientes, Pedidos e Produtos simultaneamente para o Dashboard
      const [resUsers, resPedidos, resProdutos] = await Promise.all([
        fetch('http://localhost:3000/users').catch(() => null),
        fetch('http://localhost:3000/orders').catch(() => null),
        fetch('http://localhost:3000/products').catch(() => null)
      ]);

      if (resUsers && resUsers.ok) {
        const usersData = await resUsers.json();
        setClientes(Array.isArray(usersData) ? usersData : []);
      }
      
      if (resPedidos && resPedidos.ok) {
        const pedidosData = await resPedidos.json();
        setPedidos(Array.isArray(pedidosData) ? pedidosData : []);
      }

      if (resProdutos && resProdutos.ok) {
        const prodData = await resProdutos.json();
        setProdutos(Array.isArray(prodData) ? prodData : []);
      }

    } catch (err) {
      console.error(err);
      setErro('Não foi possível carregar alguns dados do painel.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarDadosDashboard();
  }, []);

  // Cálculo dinâmico das métricas reais do banco de dados
  const totalVendas = pedidos.reduce((acc, p) => acc + (Number(p.total) || 0), 0);

  const pedidosPendentes = pedidos.filter(p => 
    !p.status || p.status.toLowerCase().includes('pendente')
  ).length;

  const clientesFiltrados = clientes.filter(c => 
    c.nome?.toLowerCase().includes(busca.toLowerCase()) ||
    c.email?.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="app-layout">
      {/* 1. SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-title">
          SOBMDIDA
        </div>
        
        <nav className="sidebar-menu">
          <Link to="/" className={`menu-item ${location.pathname === '/' ? 'active' : ''}`}>
            <div className='logo'>     
              <FaChartBar /> 
              <span> Dashboard </span>
            </div>
          </Link>

          <Link to="/clientes" className={`menu-item ${location.pathname === '/clientes' ? 'active' : ''}`}>
            <div className='logo'>     
              <FaUsers /> 
              <span> Clientes </span>
            </div>
          </Link>

          <Link to="/produtos" className={`menu-item ${location.pathname === '/produtos' ? 'active' : ''}`}>
            <div className='logo'>     
              <FaBoxOpen /> 
              <span> Produtos </span>
            </div>
          </Link>

          <Link to="/pedidos" className={`menu-item ${location.pathname === '/pedidos' ? 'active' : ''}`}>
            <div className='logo'>     
              <FaShoppingBag /> 
              <span> Pedidos </span>
            </div>
          </Link>

          <Link to="/categorias" className={`menu-item ${location.pathname === '/categorias' ? 'active' : ''}`}>
            <div className='logo'>     
              <FaTags /> 
              <span> Categorias </span>
            </div>
          </Link>

          <Link to="/relatorios" className={`menu-item ${location.pathname === '/relatorios' ? 'active' : ''}`}>
            <div className='logo'>     
              <FaChartBar /> 
              <span> Relatórios </span>
            </div>
          </Link>
        </nav>

        <div className="sidebar-user">
          <div className="avatar-circle">AD</div>
          <div className="user-info">
            <div className="user-name">Administrador</div>
            <div className="user-status">admin@admin.com</div>
          </div>
        </div>
      </aside>

      {/* 2. CONTEÚDO PRINCIPAL */}
      <main className="main-content">
        {/* HEADER / TOPBAR RENOVADO */}
        <header style={styles.topbar}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <h1 style={styles.topbarTitle}>
              {obterTituloPagina()}
            </h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <Link 
              to="/loja" 
              target="_blank" 
              style={styles.storeBtn}
            >
              <FaStore style={{ fontSize: '16px', color: '#2563eb' }} />
              <span>Vitrine da Loja</span>
            </Link>
            <button className="icon-btn" title="Sair" style={styles.logoutBtn}>⏻</button>
          </div>
        </header>

        <div className="content-area">
          {location.pathname !== '/' ? (
            <Outlet />
          ) : (
            <>
              <div className="page-header" style={{ marginBottom: '20px' }}>
                <div>
                  <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                    Olá, Administrador 👋
                  </h2>
                  <p style={{ color: '#64748b', fontSize: '14px', margin: '4px 0 0 0' }}>
                    Acompanhe em tempo real as métricas e clientes do seu e-commerce.
                  </p>
                </div>
              </div>

              {/* MÉTRICAS (4 CARDS) */}
              <div style={styles.cardsContainer}>
                <div style={styles.card}>
                  <div style={styles.cardHeader}>
                    <span style={styles.cardTitle}>Total de Vendas</span>
                    <div style={{ ...styles.iconBadge, backgroundColor: '#dcfce7' }}>
                      <FaDollarSign style={{ color: '#16a34a', fontSize: '18px' }} />
                    </div>
                  </div>
                  <h3 style={styles.cardValue}>
                    R$ {totalVendas.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </h3>
                  <p style={styles.cardSubtitle}>
                    {pedidos.length > 0 ? `${pedidos.length} pedido(s) registrado(s)` : 'Nenhuma venda registrada'}
                  </p>
                </div>

                <div style={styles.card}>
                  <div style={styles.cardHeader}>
                    <span style={styles.cardTitle}>Pedidos Pendentes</span>
                    <div style={{ ...styles.iconBadge, backgroundColor: '#fef3c7' }}>
                      <FaShoppingBag style={{ color: '#d97706', fontSize: '18px' }} />
                    </div>
                  </div>
                  <h3 style={styles.cardValue}>{pedidosPendentes}</h3>
                  <p style={styles.cardSubtitle}>Aguardando confirmação</p>
                </div>

                <div style={styles.card}>
                  <div style={styles.cardHeader}>
                    <span style={styles.cardTitle}>Clientes Ativos</span>
                    <div style={{ ...styles.iconBadge, backgroundColor: '#dbeafe' }}>
                      <FaUsers style={{ color: '#2563eb', fontSize: '18px' }} />
                    </div>
                  </div>
                  <h3 style={styles.cardValue}>{clientes.length}</h3>
                  <p style={styles.cardSubtitle}>Cadastrados no sistema</p>
                </div>

                <div style={styles.card}>
                  <div style={styles.cardHeader}>
                    <span style={styles.cardTitle}>Catálogo</span>
                    <div style={{ ...styles.iconBadge, backgroundColor: '#f3e8ff' }}>
                      <FaBoxOpen style={{ color: '#9333ea', fontSize: '18px' }} />
                    </div>
                  </div>
                  <h3 style={styles.cardValue}>{produtos.length}</h3>
                  <p style={styles.cardSubtitle}>Produtos cadastrados</p>
                </div>
              </div>

              {erro && <p className="error-message">{erro}</p>}

              {/* TABELA DE CLIENTES (Sem a coluna ID) */}
              <div style={styles.tableCard}>
                <h3 style={{ margin: '0 0 15px 0', color: '#0f172a', fontSize: '18px', fontWeight: '700' }}>
                  Últimos Clientes Cadastrados
                </h3>

                <div style={styles.searchBox}>
                  <FaSearch style={{ color: '#94a3b8', marginRight: '10px' }} />
                  <input 
                    type="text" 
                    placeholder="Buscar cliente por nome ou email..." 
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    style={styles.searchInput}
                  />
                </div>

                {loading ? (
                  <p style={{ textAlign: 'center', color: '#64748b', padding: '20px' }}>Buscando dados no banco...</p>
                ) : clientesFiltrados.length === 0 ? (
                  <p style={{ textAlign: 'center', color: '#64748b', padding: '20px' }}>
                    {busca ? 'Nenhum cliente encontrado com esse termo.' : 'Nenhum cliente cadastrado até o momento.'}
                  </p>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #f1f5f9', textAlign: 'left' }}>
                        <th style={styles.th}>NOME</th>
                        <th style={styles.th}>EMAIL</th>
                        <th style={styles.th}>PERFIL</th>
                      </tr>
                    </thead>
                    <tbody>
                      {clientesFiltrados.map(cliente => (
                        <tr key={cliente.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ ...styles.td, fontWeight: '600', color: '#1e293b' }}>{cliente.nome}</td>
                          <td style={{ ...styles.td, color: '#475569' }}>{cliente.email}</td>
                          <td style={styles.td}>
                            <span style={styles.roleBadge}>{cliente.role || 'CLIENT'}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

const styles = {
  topbar: {
    background: '#ffffff',
    borderBottom: '2px solid #e2e8f0',
    padding: '16px 28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
  },
  topbarTitle: {
    color: '#0f172a',
    fontSize: '20px',
    fontWeight: '800',
    margin: 0,
    letterSpacing: '-0.3px'
  },
  storeBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    background: 'transparent', // Fundo transparente
    padding: '8px 14px',
    borderRadius: '8px',
    textDecoration: 'none',
    border: 'none',            // Remove a borda
    color: '#1e293b',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer'          // Adicionado cursor pointer para parecer botão
  },
  logoutBtn: {
    background: 'transparent', // Fundo transparente
    color: '#ef4444',          // Mantém o vermelho apenas no texto/ícone
    border: 'none',            // Remove a borda
    padding: '8px 12px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px'
  },

 storeBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    background: 'transparent', // Fundo transparente
    padding: '8px 14px',
    borderRadius: '8px',
    textDecoration: 'none',
    border: 'none',            // Remove a borda
    color: '#1e293b',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer'          // Adicionado cursor pointer para parecer botão
  },
  logoutBtn: {
    background: 'transparent', // Fundo transparente
    color: '#ef4444',          // Mantém o vermelho apenas no texto/ícone
    border: 'none',            // Remove a borda
    padding: '8px 12px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px'
  },
  
  cardsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '20px',
    marginBottom: '25px'
  },
  card: {
    background: '#ffffff',
    padding: '20px',
    borderRadius: '14px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
    border: '1px solid #e2e8f0'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px'
  },
  cardTitle: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  iconBadge: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  cardValue: {
    fontSize: '26px',
    fontWeight: '800',
    margin: '4px 0',
    color: '#0f172a'
  },
  cardSubtitle: {
    fontSize: '12px',
    color: '#94a3b8',
    margin: 0
  },
  tableCard: {
    background: '#ffffff',
    padding: '24px',
    borderRadius: '14px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
    border: '1px solid #e2e8f0',
    marginTop: '20px'
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    background: '#f8fafc',
    border: '1px solid #cbd5e1',
    padding: '10px 14px',
    borderRadius: '8px',
    marginBottom: '20px'
  },
  searchInput: {
    border: 'none',
    background: 'transparent',
    outline: 'none',
    width: '100%',
    fontSize: '14px',
    color: '#1e293b'
  },
  th: {
    padding: '12px 16px',
    fontSize: '12px',
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: '0.5px'
  },
  td: {
    padding: '14px 16px',
    fontSize: '14px'
  },
  roleBadge: {
    background: '#dbeafe',
    color: '#1d4ed8',
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: '700',
    textTransform: 'uppercase'
  }
};

export default App;