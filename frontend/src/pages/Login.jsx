// frontend/src/pages/Login.jsx
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [verSenha, setVerSenha] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setErro('');

    const result = await login(email, senha);

    if (!result.success) {
      setErro(result.error);
    } else {
      // Como a rota no banco é a mesma, ele loga com sucesso e redireciona para a Home/Dashboard
      navigate('/');
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        {/* Identidade visual unificada do projeto */}
        <h1 className="login-logo-title">SOBMEDIDA</h1>
        
        {/* Alterado para ser a tela geral de acesso do banco de dados */}
        <h2 className="login-header-title">Acessar Conta</h2>
        <p className="login-subtitle">Entre com suas credenciais para acessar o sistema</p>

        {erro && <p className="error-message">{erro}</p>}

        <form onSubmit={handleLogin}>
          {/* Campo de E-mail */}
          <div className="login-form-group">
            <label className="login-label">E-mail</label>
            <div className="login-input-wrapper">
              <FaEnvelope className="login-input-icon" />
              <input 
                type="email" 
                className="login-input"
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="exemplo@email.com"
                required 
              />
            </div>
          </div>

          {/* Campo de Senha */}
          <div className="login-form-group">
            <label className="login-label">Senha</label>
            <div className="login-input-wrapper">
              <FaLock className="login-input-icon" />
              <input 
                type={verSenha ? "text" : "password"} 
                className="login-input"
                value={senha} 
                onChange={(e) => setSenha(e.target.value)} 
                placeholder="Digite sua senha"
                required 
              />
              <button 
                type="button"
                onClick={() => setVerSenha(!verSenha)}
                style={{
                  position: 'absolute',
                  right: '14px',
                  background: 'none',
                  border: 'none',
                  color: '#9ca3af',
                  cursor: 'pointer'
                }}
              >
                {verSenha ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <button type="submit" className="login-btn-submit">Entrar</button>
        </form>

        <div className="login-divider">ou</div>

        <div className="login-footer-links">
          <a href="#" className="login-link" onClick={(e) => e.preventDefault()}>
            🔒 Esqueceu sua senha?
          </a>
          <p style={{ marginTop: '15px', fontSize: '13px' }}>
            Não tem uma conta? <Link to="/register" className="login-link">Cadastre-se</Link>
          </p>
          <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '25px' }}>
            © {new Date().getFullYear()} SOBMEDIDA. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  );
}