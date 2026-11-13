import { useEffect, useState } from 'react';
import { FaUser, FaSave, FaSpinner } from 'react-icons/fa';
import API_URL from '../services/api';

export default function MinhaConta() {
  const [formulario, setFormulario] = useState({
    nome: '',
    sobrenome: '',
    email: '',
    telefone: '',
    endereco: ''
  });

  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');
  const [mensagem, setMensagem] = useState('');

  function obterHeaders() {
    const token = localStorage.getItem('token');

    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    };
  }

  useEffect(() => {
    async function carregarConta() {
      try {
        setLoading(true);
        setErro('');

        const token = localStorage.getItem('token');

        if (!token) {
          throw new Error('Você precisa estar autenticado para acessar sua conta.');
        }

        const resposta = await fetch(`${API_URL}/me`, {
          method: 'GET',
          headers: obterHeaders()
        });

        if (!resposta.ok) {
          throw new Error(
            resposta.status === 401 || resposta.status === 403
              ? 'Sua sessão expirou. Faça login novamente.'
              : 'Não foi possível carregar seus dados.'
          );
        }

        const dados = await resposta.json();

        const usuario = dados.user || dados.usuario || dados;

        setFormulario({
          nome: usuario.nome || '',
          sobrenome: usuario.sobrenome || '',
          email: usuario.email || '',
          telefone: usuario.telefone || '',
          endereco: usuario.endereco || ''
        });

      } catch (error) {
        console.error('Erro ao carregar conta:', error);
        setErro(error.message || 'Erro ao carregar seus dados.');
      } finally {
        setLoading(false);
      }
    }

    carregarConta();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormulario(prev => ({
      ...prev,
      [name]: value
    }));

    setMensagem('');
  }

  async function salvarAlteracoes(event) {
    event.preventDefault();

    try {
      setSalvando(true);
      setErro('');
      setMensagem('');

      const resposta = await fetch(`${API_URL}/me`, {
        method: 'PUT',
        headers: obterHeaders(),
        body: JSON.stringify({
          nome: formulario.nome,
          sobrenome: formulario.sobrenome,
          email: formulario.email,
          telefone: formulario.telefone,
          endereco: formulario.endereco
        })
      });

      const dados = await resposta.json().catch(() => ({}));

      if (!resposta.ok) {
        throw new Error(
          dados.message ||
          dados.error ||
          'Não foi possível salvar suas alterações.'
        );
      }

      const usuarioAtualizado =
        dados.user || dados.usuario || dados;

      setFormulario({
        nome: usuarioAtualizado.nome ?? formulario.nome,
        sobrenome: usuarioAtualizado.sobrenome ?? formulario.sobrenome,
        email: usuarioAtualizado.email ?? formulario.email,
        telefone: usuarioAtualizado.telefone ?? formulario.telefone,
        endereco: usuarioAtualizado.endereco ?? formulario.endereco
      });

      const usuarioLocal = localStorage.getItem('user');

      if (usuarioLocal) {
        try {
          const usuarioAnterior = JSON.parse(usuarioLocal);

          localStorage.setItem(
            'user',
            JSON.stringify({
              ...usuarioAnterior,
              ...usuarioAtualizado
            })
          );
        } catch (error) {
          console.error('Erro ao atualizar usuário local:', error);
        }
      }

      setMensagem('Seus dados foram atualizados com sucesso!');

    } catch (error) {
      console.error('Erro ao salvar conta:', error);
      setErro(error.message || 'Erro ao salvar suas alterações.');
    } finally {
      setSalvando(false);
    }
  }

  if (loading) {
    return (
      <div className="user-list-card" style={{ padding: '40px', textAlign: 'center' }}>
        <FaSpinner
          style={{
            animation: 'spin 1s linear infinite',
            fontSize: '24px',
            color: '#2563eb'
          }}
        />
        <p>Carregando seus dados...</p>
      </div>
    );
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h2 className="page-title">Minha Conta</h2>
          <p className="page-subtitle">
            Consulte e atualize suas informações pessoais.
          </p>
        </div>
      </div>

      <div
        className="user-list-card"
        style={{
          padding: '25px',
          maxWidth: '850px',
          margin: '0 auto'
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '25px',
            borderBottom: '1px solid #e2e8f0',
            paddingBottom: '18px'
          }}
        >
          <div
            style={{
              background: '#eff6ff',
              color: '#2563eb',
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px'
            }}
          >
            <FaUser />
          </div>

          <div>
            <h3 style={{ margin: 0, color: '#1e293b' }}>
              Dados pessoais
            </h3>
            <p style={{ margin: '5px 0 0', color: '#64748b', fontSize: '13px' }}>
              Mantenha suas informações atualizadas.
            </p>
          </div>
        </div>

        {erro && (
          <div
            style={{
              background: '#fef2f2',
              color: '#b91c1c',
              padding: '12px 15px',
              borderRadius: '8px',
              marginBottom: '20px',
              fontSize: '14px'
            }}
          >
            {erro}
          </div>
        )}

        {mensagem && (
          <div
            style={{
              background: '#f0fdf4',
              color: '#15803d',
              padding: '12px 15px',
              borderRadius: '8px',
              marginBottom: '20px',
              fontSize: '14px'
            }}
          >
            {mensagem}
          </div>
        )}

        <form onSubmit={salvarAlteracoes}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '18px'
            }}
          >
            <div>
              <label className="form-label">Nome</label>
              <input
                type="text"
                name="nome"
                className="form-input"
                value={formulario.nome}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="form-label">Sobrenome</label>
              <input
                type="text"
                name="sobrenome"
                className="form-input"
                value={formulario.sobrenome}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="form-label">E-mail</label>
              <input
                type="email"
                name="email"
                className="form-input"
                value={formulario.email}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="form-label">Telefone</label>
              <input
                type="tel"
                name="telefone"
                className="form-input"
                value={formulario.telefone}
                onChange={handleChange}
              />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Endereço</label>
              <input
                type="text"
                name="endereco"
                className="form-input"
                value={formulario.endereco}
                onChange={handleChange}
              />
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              marginTop: '25px'
            }}
          >
            <button
              type="submit"
              className="novo-btn"
              disabled={salvando}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                opacity: salvando ? 0.7 : 1,
                cursor: salvando ? 'not-allowed' : 'pointer'
              }}
            >
              {salvando ? (
                <>
                  <FaSpinner />
                  Salvando...
                </>
              ) : (
                <>
                  <FaSave />
                  Salvar alterações
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}