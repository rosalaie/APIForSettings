import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaLock, FaEnvelope, FaSignInAlt } from 'react-icons/fa';
import API_URL from '../services/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email.trim() || !senha.trim()) {
      alert('Por favor, preencha o e-mail e a senha.');
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email.trim(),
          senha
        })
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || 'Credenciais inválidas. Verifique o e-mail e a senha.');
        return;
      }

      if (!data.user || !data.token) {
        alert('Não foi possível concluir o login. Tente novamente.');
        return;
      }

      if (data.user.role !== 'ADMIN' && data.user.role !== 'CLIENT') {
        alert('Perfil de usuário não autorizado.');
        return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      if (data.user.role === 'ADMIN') {
        alert(`Bem-vinda de volta, ${data.user.nome || 'Administradora'}!`);
        navigate('/admin', { replace: true });
      } else {
        alert(`Bem-vindo(a), ${data.user.nome || 'Cliente'}!`);
        navigate('/loja', { replace: true });
      }

    } catch (err) {
      console.error('Erro ao realizar login:', err);
      alert('Erro de conexão ao tentar fazer login. Verifique se o backend está disponível.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0f172a',
      padding: '20px'
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        padding: '40px',
        width: '100%',
        maxWidth: '400px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h2 style={{
            fontSize: '26px',
            fontWeight: '800',
            color: '#0f172a',
            margin: 0
          }}>
            SOBMDIDA
          </h2>

          <p style={{
            color: '#64748b',
            fontSize: '14px',
            marginTop: '6px'
          }}>
            Acesse sua conta
          </p>
        </div>

        <form
          onSubmit={handleLogin}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '18px'
          }}
        >
          <div>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: '600',
              color: '#334155',
              marginBottom: '6px'
            }}>
              E-mail
            </label>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              padding: '10px 14px'
            }}>
              <FaEnvelope style={{
                color: '#94a3b8',
                marginRight: '10px'
              }} />

              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="seuemail@exemplo.com"
                style={{
                  border: 'none',
                  background: 'transparent',
                  outline: 'none',
                  width: '100%',
                  fontSize: '14px'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: '600',
              color: '#334155',
              marginBottom: '6px'
            }}>
              Senha
            </label>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              padding: '10px 14px'
            }}>
              <FaLock style={{
                color: '#94a3b8',
                marginRight: '10px'
              }} />

              <input
                type="password"
                required
                value={senha}
                onChange={e => setSenha(e.target.value)}
                placeholder="••••••••"
                style={{
                  border: 'none',
                  background: 'transparent',
                  outline: 'none',
                  width: '100%',
                  fontSize: '14px'
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              background: '#2563eb',
              color: '#fff',
              border: 'none',
              padding: '12px',
              borderRadius: '8px',
              fontWeight: '700',
              fontSize: '15px',
              cursor: loading ? 'wait' : 'pointer',
              marginTop: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <FaSignInAlt />
            {loading ? 'Entrando...' : 'Acessar Sistema'}
          </button>
        </form>
      </div>
    </div>
  );
}