import { Link } from 'react-router-dom';

function LoginCliente() {
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
          <Link to="/contato" style={{ color: '#fff', textDecoration: 'none' }}>Nosso Contato</Link>
          <span style={{ color: '#e11d48', fontWeight: 'bold' }}>Sua Conta</span>
        </nav>
      </header>

      <main style={{ padding: '60px 20px', maxWidth: '450px', margin: '0 auto' }}>
        <div style={{ backgroundColor: '#fff', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border: '1px solid #eaeaea' }}>
          
          <h2 style={{ fontSize: '24px', color: '#0f172a', marginBottom: '20px', textAlign: 'center' }}>Acessar Sua Conta</h2>
          
          <form style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#0f172a', marginBottom: '8px' }}>E-mail</label>
              <input type="email" placeholder="seu@email.com" style={{ width: '92%', padding: '12px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px', outline: 'none' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#0f172a', marginBottom: '8px' }}>Senha</label>
              <input type="password" placeholder="********" style={{ width: '92%', padding: '12px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px', outline: 'none' }} />
            </div>

            <button type="submit" style={{ backgroundColor: '#e11d48', color: '#fff', border: 'none', padding: '14px', borderRadius: '6px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}>
              Entrar
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#64748b' }}>
            Ainda não tem conta? <Link to="/cadastro" style={{ color: '#0f172a', fontWeight: 'bold', textDecoration: 'none' }}>Cadastre-se</Link>
          </p>

        </div>
      </main>
    </div>
  );
}

export default LoginCliente;