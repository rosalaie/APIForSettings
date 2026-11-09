import { Link } from 'react-router-dom';
import { FaInstagram, FaWhatsapp, FaMapMarkerAlt, FaEnvelope } from 'react-icons/fa';

function Contato() {
  return (
    <div style={{ backgroundColor: '#f9fafb', minHeight: '100vh', fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif' }}>
      
      {/* Cabeçalho Padronizado */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 40px', backgroundColor: '#0f172a', borderBottom: '4px solid #e11d48' }}>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <h1 style={{ color: '#e11d48', margin: 0, fontSize: '26px', fontWeight: '900', letterSpacing: '-1px' }}>SOBMDIDA</h1>
        </Link>
        <nav style={{ display: 'flex', gap: '25px', fontWeight: '600', fontSize: '15px' }}>
          <Link to="/" style={{ color: '#fff', textDecoration: 'none' }}>Catálogo De Itens</Link>
          <Link to="/carrinho" style={{ color: '#fff', textDecoration: 'none' }}>Seu Pedido</Link>
          <span style={{ color: '#e11d48', fontWeight: 'bold' }}>Nosso Contato</span>
          <Link to="/login" style={{ color: '#fff', textDecoration: 'none' }}>Sua Conta</Link>
        </nav>
      </header>

      {/* Conteúdo da Página de Contato */}
      <main style={{ padding: '60px 20px', maxWidth: '800px', margin: '0 auto' }}>
        
        <div style={{ backgroundColor: '#fff', padding: '50px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #eaeaea', textAlign: 'center' }}>
          
          <h2 style={{ fontSize: '32px', color: '#0f172a', margin: '0 0 10px 0', fontWeight: '900' }}>MJ ESTAMPARIA</h2>
          <p style={{ fontSize: '16px', color: '#64748b', marginBottom: '40px' }}>Produtos personalizados sob medida para você.</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '25px', alignItems: 'flex-start', maxWidth: '400px', margin: '0 auto', textAlign: 'left' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <FaMapMarkerAlt style={{ fontSize: '24px', color: '#e11d48' }} />
              <div>
                <strong style={{ display: 'block', color: '#0f172a', fontSize: '15px' }}>Responsável</strong>
                <span style={{ color: '#64748b', fontSize: '15px' }}>Michely de Lara Rodrigues</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <FaInstagram style={{ fontSize: '24px', color: '#e11d48' }} />
              <div>
                <strong style={{ display: 'block', color: '#0f172a', fontSize: '15px' }}>Instagram</strong>
                <a href="https://www.instagram.com/m_j.estamparia" target="_blank" rel="noreferrer" style={{ color: '#0ea5e9', textDecoration: 'none', fontSize: '15px' }}>
                  @m_j.estamparia
                </a>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <FaWhatsapp style={{ fontSize: '24px', color: '#25D366' }} />
              <div>
                <strong style={{ display: 'block', color: '#0f172a', fontSize: '15px' }}>WhatsApp (Orçamentos)</strong>
                <a href="#" style={{ color: '#64748b', textDecoration: 'none', fontSize: '15px' }}>
                  Clique aqui para iniciar a conversa
                </a>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <FaEnvelope style={{ fontSize: '24px', color: '#e11d48' }} />
              <div>
                <strong style={{ display: 'block', color: '#0f172a', fontSize: '15px' }}>E-mail</strong>
                <a href="mailto:contato@mjestamparia.com.br" style={{ color: '#64748b', textDecoration: 'none', fontSize: '15px' }}>
                  contato@mjestamparia.com.br
                </a>
              </div>
            </div>

          </div>

          <div style={{ marginTop: '50px', paddingTop: '30px', borderTop: '1px solid #f1f5f9', fontSize: '13px', color: '#94a3b8' }}>
            &copy; {new Date().getFullYear()} SOBMDIDA & MJ Estamparia. Todos os direitos reservados.
          </div>

        </div>
      </main>
    </div>
  );
}

export default Contato;