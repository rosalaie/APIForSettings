import { Link } from 'react-router-dom';

function LoginAdmin() {
  return (
    <div style={{ backgroundColor: '#f9fafb', minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 40px', backgroundColor: '#fff', borderBottom: '1px solid #eaeaea' }}>
        <h1 style={{ color: '#000', margin: 0, fontSize: '24px', fontWeight: '900', letterSpacing: '-1px' }}>SOBMDIDA</h1>
        <span style={{ color: '#555', fontWeight: '500', fontSize: '15px' }}>👕 Área Administrativa</span>
      </header>
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
        <div style={{ backgroundColor: '#fff', padding: '50px 40px', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', width: '100%', maxWidth: '420px', textAlign: 'center' }}>
          <h2 style={{ margin: '0 0 10px 0', fontSize: '22px', color: '#111' }}>Login do Administrador</h2>
          <p style={{ color: '#666', fontSize: '14px', marginBottom: '35px' }}>Acesse o painel administrativo do SOBMDIDA</p>
          <form style={{ display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'left' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#333', marginBottom: '8px' }}>E-mail</label>
              <input type="email" placeholder="exemplo@sobmdida.com.br" style={{ width: '100%', padding: '12px 15px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', boxSizing: 'border-box', outline: 'none' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#333', marginBottom: '8px' }}>Senha</label>
              <input type="password" placeholder="Digite sua senha" style={{ width: '100%', padding: '12px 15px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', boxSizing: 'border-box', outline: 'none' }} />
            </div>
            <button type="button" style={{ backgroundColor: '#000', color: '#fff', border: 'none', padding: '14px', borderRadius: '8px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}>
              Entrar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LoginAdmin;