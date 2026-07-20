// frontend/src/App.js
import './App.css';
import { useEffect, useState } from 'react';
import { FaStore, FaUsers, FaBoxOpen, FaTags, FaCog, FaDollarSign, FaShoppingBag } from "react-icons/fa";
import { Link, Outlet, useLocation } from 'react-router-dom';

function App() {
  const [clientes, setClientes] = useState([]);
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(true);
  
  const location = useLocation();

  // Função para definir o título correto da Topbar dinamicamente
  const obterTituloPagina = () => {
    if (location.pathname === '/clientes') return 'Clientes';
    if (location.pathname === '/produtos') return 'Catálogo de Produtos';
    if (location.pathname === '/categorias') return 'Categorias'; // Adicionado para a nova aba!
    return 'Painel de Controle';
  };

  // Carrega os clientes do backend para alimentar a tabela do dashboard e o contador
  async function listarClientes() {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:3000/users');

      if (!res.ok) {
        throw new Error('Erro ao buscar clientes');
      }

      const data = await res.json();
      setClientes(data);
    } catch (err) {
      console.error(err);
      setErro('Não foi possível carregar os clientes.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    listarClientes();
  }, []);

  return (
    <div className="app-layout">
      {/* 1. BARRA LATERAL (SIDEBAR) */}
      <aside className="sidebar">
        <div className="sidebar-title">
          <span className="search-icon-placeholder"></span>
          SobMedida
        </div>
        
        <nav className="sidebar-menu">
          {/* Aba Dashboard */}
          <Link to="/" className={`menu-item ${location.pathname === '/' ? 'active' : ''}`}>
            <div className='logo'>     
              <FaStore /> 
              <span> Dashboard </span>
            </div>
          </Link>

          {/* Aba Clientes */}
          <Link to="/clientes" className={`menu-item ${location.pathname === '/clientes' ? 'active' : ''}`}>
            <div className='logo'>     
              <FaUsers /> 
              <span> Clientes </span>
            </div>
          </Link>

          {/* Aba Produtos */}
          <Link to="/produtos" className={`menu-item ${location.pathname === '/produtos' ? 'active' : ''}`}>
            <div className='logo'>     
              <FaBoxOpen /> 
              <span> Produtos </span>
            </div>
          </Link>

          {/* NOVA ABA: Categorias */}
          <Link to="/categorias" className={`menu-item ${location.pathname === '/categorias' ? 'active' : ''}`}>
            <div className='logo'>     
              <FaTags /> 
              <span> Categorias </span>
            </div>
          </Link>

          <a href="#" className="menu-item">
            <div className='logo'>     
              <FaCog /> 
              <span> Configurações </span>
            </div>
          </a>
        </nav>

        <div className="sidebar-user">
          <div className="avatar-circle">AD</div>
          <div className="user-info">
            <div className="user-name">Administrador</div>
            <div className="user-status">admin@admin.com</div>
          </div>
        </div>
      </aside>

      {/* 2. ÁREA PRINCIPAL */}
      <main className="main-content">
        {/* TOPO (TOPBAR) */}
        <header className="topbar">
          <div className="topbar-left">
            <button className="icon-btn" title="Menu">☰</button>
            <button className="icon-btn" title="Voltar">⬅</button>
            <div className="sidebar-title" style={{color: '#333', fontSize: '18px', margin: 0}}>
              {obterTituloPagina()}
            </div>
          </div>

          <div className="topbar-right">
            <button className="icon-btn">⚙️</button>
            <button className="icon-btn" title="Sair">⏻</button>
          </div>
        </header>

        {/* CONTEÚDO DINÂMICO (CONTENT AREA) */}
        <div className="content-area">
          {/* Validação: Se não estiver na rota raiz "/", renderiza a sub-rota correspondente */}
          {location.pathname !== '/' ? (
            <Outlet />
          ) : (
            <>
              {/* TÍTULO DA PÁGINA */}
              <div className="page-header">
                <div>
                  <h2 className="page-title">Olá, Administrador 👋</h2>
                  <p className="page-subtitle">Acompanhe as métricas e clientes do seu e-commerce.</p>
                </div>
              </div>

              {/* 📊 SEÇÃO DE CARDS DE ESTATÍSTICAS */}
              <div className="dashboard-cards" style={styles.cardsContainer}>
                <div className="card-stat" style={styles.card}>
                  <div style={styles.cardHeader}>
                    <span style={styles.cardTitle}>Total de Vendas</span>
                    <FaDollarSign style={{ color: '#10b981', fontSize: '20px' }} />
                  </div>
                  <h3 style={styles.cardValue}>R$ 0,00</h3>
                  <p style={styles.cardSubtitle}>Nenhuma venda registrada</p>
                </div>

                <div className="card-stat" style={styles.card}>
                  <div style={styles.cardHeader}>
                    <span style={styles.cardTitle}>Pedidos Pendentes</span>
                    <FaShoppingBag style={{ color: '#f59e0b', fontSize: '20px' }} />
                  </div>
                  <h3 style={styles.cardValue}>0</h3>
                  <p style={styles.cardSubtitle}>Aguardando confirmação</p>
                </div>

                <div className="card-stat" style={styles.card}>
                  <div style={styles.cardHeader}>
                    <span style={styles.cardTitle}>Clientes Ativos</span>
                    <FaUsers style={{ color: '#3a86c8', fontSize: '20px' }} />
                  </div>
                  <h3 style={styles.cardValue}>{clientes.length}</h3>
                  <p style={styles.cardSubtitle}>Cadastrados no sistema</p>
                </div>
              </div>

              {erro && <p className="error-message">{erro}</p>}

              <div className="user-list-card" style={{ marginTop: '25px' }}>
                <h3 style={{ margin: '0 0 15px 0', color: '#1b263b', fontSize: '18px' }}>Últimos Clientes Cadastrados</h3>
                <div className="search-container">
                  <span className="search-icon-placeholder">🔍</span>
                  <input type="text" className="search-input" placeholder="Buscar clientes..." />
                </div>

                {loading ? (
                  <p style={{ textAlign: 'center', color: '#666', padding: '20px' }}>Buscando dados no banco...</p>
                ) : clientes.length === 0 ? (
                  <p style={{ textAlign: 'center', color: '#666', padding: '20px' }}>Nenhum cliente cadastrado até o momento.</p>
                ) : (
                  <table className="user-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Nome</th>
                        <th>Email</th>
                        <th>Perfil</th>
                      </tr>
                    </thead>
                    <tbody>
                      {clientes.map(cliente => (
                        <tr key={cliente.id}>
                          <td className="user-id">{cliente.id}</td>
                          <td className="user-name" style={{ fontWeight: '600' }}>{cliente.nome}</td>
                          <td className="user-email">{cliente.email}</td>
                          <td>
                            <span style={styles.roleBadge}>{cliente.role}</span>
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

// Estilos adicionais Inline rápidos para manter o design limpo e responsivo
const styles = {
  cardsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '20px',
    marginBottom: '10px'
  },
  card: {
    background: '#fff',
    padding: '20px',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
    border: '1px solid #e2e8f0'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px'
  },
  cardTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#64748b'
  },
  cardValue: {
    fontSize: '28px',
    fontWeight: 'bold',
    margin: '5px 0',
    color: '#1e293b'
  },
  cardSubtitle: {
    fontSize: '12px',
    color: '#94a3b8',
    margin: 0
  },
  roleBadge: {
    background: '#e0f2fe',
    color: '#0369a1',
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: 'bold',
    textTransform: 'uppercase'
  }
};

export default App;