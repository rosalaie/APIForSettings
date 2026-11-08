import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function LoginCliente() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const navigate = useNavigate();

  const fazerLogin = (e) => {
    e.preventDefault();
    if (email && senha) {
      // Simula o login e volta para a página inicial (ou checkout futuramente)
      navigate('/');
    }
  };

  return (
    <div style={{ backgroundColor: '#f9fafb', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', fontFamily: 'Segoe UI, sans-serif' }}>
      
      {/* Cabeçalho */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '20px 40px', backgroundColor: '#fff', borderBottom: '1px solid #eaeaea' }}>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '900', color: '#000' }}>SOBMDIDA</h1>
        </Link>
        <span style={{ fontWeight: 'bold', color: '#555' }}>👤 Acesso do Cliente</span>
      </header>

      <main style={{ marginTop: '60px', backgroundColor: '#fff', padding: '50px', borderRadius: '12px', border: '1px solid #eaeaea', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', width: '90%', maxWidth: '400px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '5px', color: '#111' }}>Acesse sua Conta</h2>
        <p style={{ textAlign: 'center', color: '#666', fontSize: '14px', marginBottom: '30px' }}>Acompanhe seus pedidos e finalize compras</p>
        
        <form onSubmit={fazerLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '5px' }}>E-mail</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ padding: '12px', borderRadius: '6px', border: '1px solid #ddd' }} placeholder="Seu e-mail cadastrado" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '5px' }}>Senha</label>
            <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} required style={{ padding: '12px', borderRadius: '6px', border: '1px solid #ddd' }} placeholder="Sua senha" />
          </div>

          <button type="submit" style={{ backgroundColor: '#16a34a', color: '#fff', padding: '14px', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '15px' }}>
            Entrar
          </button>
        </form>

        <div style={{ marginTop: '25px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <span style={{ color: '#0284c7', fontSize: '13px', cursor: 'pointer', fontWeight: '600' }}>Esqueceu sua senha?</span>
          <div style={{ borderTop: '1px solid #eee', paddingTop: '15px', marginTop: '5px' }}>
            <span style={{ fontSize: '13px', color: '#666' }}>Ainda não tem conta? </span>
            <Link to="/cadastro" style={{ color: '#000', fontSize: '13px', fontWeight: 'bold', textDecoration: 'none' }}>
              Cadastre-se aqui
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export default LoginCliente;