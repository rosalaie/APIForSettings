// frontend/src/pages/Register.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

export default function Register() {
  const navigate = useNavigate();

  // Estados dos novos campos padronizados para e-commerce
  const [nome, setNome] = useState('');
  const [sobrenome, setSobrenome] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [telefone, setTelefone] = useState('');
  const [endereco, setEndereco] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  async function handleRegister(e) {
    e.preventDefault();
    setErro('');
    setSucesso('');

    // Validação da confirmação de senha idêntica ao protótipo
    if (senha !== confirmarSenha) {
      setErro('As senhas não coincidem!');
      return;
    }

    try {
      await api.post('/register', {
        nome,
        sobrenome,
        email,
        cpf,
        telefone,
        endereco,
        senha
      });

      setSucesso('Conta criada com sucesso! Redirecionando...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (error) {
      const message = error.response?.data?.error || 'Erro ao realizar cadastro.';
      setErro(message);
    }
  }

  return (
    <div className="login-container">
      {/* Reutilizando a estrutura de cards do login, mas permitindo uma largura maior para as duas colunas */}
      <div className="login-card" style={{ maxWidth: '650px' }}>
        <h1 className="login-logo-title">SOBMEDIDA</h1>
        <h2 className="login-header-title">Criar minha conta</h2>
        <p className="login-subtitle">Preencha os dados abaixo para se cadastrar na plataforma</p>

        {erro && <p className="error-message">{erro}</p>}
        {sucesso && <p style={{ color: '#10b981', fontSize: '14px', marginBottom: '15px', textAlign: 'center' }}>{sucesso}</p>}

        <form onSubmit={handleRegister}>
          {/* Grid Layout em Linhas Duplas simétricas ao protótipo */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            
            <div className="login-form-group">
              <label className="login-label">Nome *</label>
              <input type="text" className="login-input" style={{ paddingLeft: '15px' }} value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Seu nome" required />
            </div>

            <div className="login-form-group">
              <label className="login-label">Sobrenome</label>
              <input type="text" className="login-input" style={{ paddingLeft: '15px' }} value={sobrenome} onChange={(e) => setSobrenome(e.target.value)} placeholder="Seu sobrenome" />
            </div>

            <div className="login-form-group">
              <label className="login-label">E-mail *</label>
              <input type="email" className="login-input" style={{ paddingLeft: '15px' }} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="exemplo@email.com" required />
            </div>

            <div className="login-form-group">
              <label className="login-label">CPF *</label>
              <input type="text" className="login-input" style={{ paddingLeft: '15px' }} value={cpf} onChange={(e) => setCpf(e.target.value)} placeholder="000.000.000-00" required />
            </div>

            <div className="login-form-group">
              <label className="login-label">Telefone / WhatsApp</label>
              <input type="tel" className="login-input" style={{ paddingLeft: '15px' }} value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder="(00) 00000-0000" />
            </div>

            <div className="login-form-group">
              <label className="login-label">Endereço de Entrega</label>
              <input type="text" className="login-input" style={{ paddingLeft: '15px' }} value={endereco} onChange={(e) => setEndereco(e.target.value)} placeholder="Rua, número, bairro..." />
            </div>

            <div className="login-form-group">
              <label className="login-label">Senha *</label>
              <input type="password" className="login-input" style={{ paddingLeft: '15px' }} value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="Crie uma senha forte" required />
            </div>

            <div className="login-form-group">
              <label className="login-label">Confirmar Senha *</label>
              <input type="password" className="login-input" style={{ paddingLeft: '15px' }} value={confirmarSenha} onChange={(e) => setConfirmarSenha(e.target.value)} placeholder="Repita a senha" required />
            </div>

          </div>

          <button type="submit" className="login-btn-submit" style={{ marginTop: '20px' }}>
            Criar minha conta
          </button>
        </form>

        <div className="login-divider">ou</div>

        <div className="login-footer-links">
          <p style={{ fontSize: '13px', margin: 0 }}>
            Já tem uma conta? <Link to="/login" className="login-link">Faça Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}