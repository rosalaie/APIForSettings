// src/pages/Clientes.jsx
import { useEffect, useState } from 'react';
import { FaPlus, FaSearch, FaChevronLeft, FaChevronRight, FaUsers, FaTrash } from 'react-icons/fa';

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [erro, setErro] = useState('');
  const [busca, setBusca] = useState('');

  // ESTADOS DO FORMULÁRIO MANUAL (SEM SENHA)
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [cpf, setCpf] = useState('');
  const [rua, setRua] = useState('');
  const [numero, setNumero] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [cep, setCep] = useState('');

  // PAGINAÇÃO (10 por página)
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 10;

  async function listarClientes() {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:3000/clients'); // ou /users conforme seu backend
      const data = await res.json();
      
      if (Array.isArray(data)) {
        setClientes(data);
      } else if (data && Array.isArray(data.clients)) {
        setClientes(data.clients);
      } else {
        setClientes([]);
      }
    } catch (err) {
      console.error(err);
      setErro('Erro ao carregar lista de clientes.');
      setClientes([]);
    } finally {
      setLoading(false);
    }
  }

  function abrirModalNovoCliente() {
    setNome('');
    setEmail('');
    setTelefone('');
    setCpf('');
    setRua('');
    setNumero('');
    setBairro('');
    setCidade('');
    setCep('');
    setErro('');
    setMostrarForm(true);
  }

  async function handleSalvarCliente(e) {
  e.preventDefault();
  setErro('');

  try {
    const res = await fetch('http://localhost:3000/clients', { // Garanta que a rota no backend seja /clients
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome,
        email: email || null,
        telefone,
        cpf: cpf || null,
        rua: rua || null,
        numero: numero || null,
        bairro: bairro || null,
        cidade: cidade || null,
        cep: cep || null,
        origem: 'BALCAO'
      })
    });

    // Trata retornos que não sejam JSON (evita a tela vermelha/erro do JSON.parse)
    const contentType = res.headers.get('content-type');
    let data;
    if (contentType && contentType.includes('application/json')) {
      data = await res.json();
    } else {
      const text = await res.text();
      throw new Error(`Erro ${res.status}: Servidor não retornou JSON.`);
    }

    if (!res.ok) {
      throw new Error(data.error || 'Erro ao cadastrar cliente.');
    }

    setMostrarForm(false);
    listarClientes();
  } catch (err) {
    setErro(err.message || 'Erro de conexão com o servidor.');
  }
}

  async function handleDeletar(id, nomeCliente) {
    if (window.confirm(`Tem certeza que deseja remover o cliente "${nomeCliente}"?`)) {
      try {
        const res = await fetch(`http://localhost:3000/clients/${id}`, { method: 'DELETE' });
        if (res.ok) listarClientes();
      } catch (err) {
        alert('Erro ao excluir cliente.');
      }
    }
  }

  // Lógica de Filtro e Paginação
  const listaClientes = Array.isArray(clientes) ? clientes : [];
  const clientesFiltrados = listaClientes.filter(c =>
    (c.nome && c.nome.toLowerCase().includes(busca.toLowerCase())) ||
    (c.email && c.email.toLowerCase().includes(busca.toLowerCase())) ||
    (c.telefone && c.telefone.includes(busca))
  );

  const totalPaginas = Math.ceil(clientesFiltrados.length / itensPorPagina) || 1;
  const indiceInicial = (paginaAtual - 1) * itensPorPagina;
  const clientesPaginados = clientesFiltrados.slice(indiceInicial, indiceInicial + itensPorPagina);

  useEffect(() => {
    setPaginaAtual(1);
  }, [busca]);

  useEffect(() => {
    listarClientes();
  }, []);

  return (
    <>
      {/* CABEÇALHO PADRONIZADO */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Gestão de Clientes</h2>
          <p className="page-subtitle">Base de clientes cadastrados via e-commerce e vendas de balcão.</p>
        </div>
        <button className="novo-btn" onClick={abrirModalNovoCliente}>
          <FaPlus style={{ marginRight: '8px', fontSize: '12px' }} /> Novo Cliente
        </button>
      </div>

      <div className="user-list-card">
        {/* CAIXA DE BUSCA */}
        <div className="search-container destacado">
          <FaSearch className="search-icon-placeholder" style={{ color: '#2563eb' }} />
          <input 
            type="text" 
            className="search-input" 
            placeholder="🔍 Buscar cliente por nome, e-mail ou telefone..." 
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', color: '#666', padding: '20px' }}>Carregando clientes...</p>
        ) : clientesFiltrados.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
            <FaUsers style={{ fontSize: '48px', marginBottom: '10px' }} />
            <p>Nenhum cliente encontrado.</p>
          </div>
        ) : (
          <>
            {/* TABELA SEM COLUNA DE ID */}
            <table className="user-table">
              <thead>
                <tr>
                  <th>Nome do Cliente</th>
                  <th>Contato (E-mail / Telefone)</th>
                  <th>Cidade</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {clientesPaginados.map(cliente => (
                  <tr key={cliente.id}>
                    <td className="user-name" style={{ fontWeight: '600' }}>
                      {cliente.nome}
                      {cliente.cpf && <small style={{ display: 'block', color: '#64748b', fontWeight: 'normal', fontSize: '11px' }}>CPF: {cliente.cpf}</small>}
                    </td>
                    <td>
                      <span className="user-email">{cliente.email || 'Sem e-mail'}</span>
                      {cliente.telefone && <small style={{ display: 'block', color: '#64748b', fontSize: '11px' }}>{cliente.telefone}</small>}
                    </td>
                    <td style={{ color: '#475569', fontSize: '14px' }}>
                      {cliente.cidade ? `${cliente.cidade}` : 'Não informada'}
                    </td>
                    <td className="table-actions">
                      <button className="action-btn delete" title="Excluir" onClick={() => handleDeletar(cliente.id, cliente.nome)}>
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* PAGINAÇÃO PADRONIZADA */}
            <div className="pagination-container">
              <span className="pagination-info">
                Exibindo {indiceInicial + 1} a {Math.min(indiceInicial + itensPorPagina, clientesFiltrados.length)} de {clientesFiltrados.length} clientes
              </span>

              <div className="pagination-buttons">
                <button 
                  className="page-btn" 
                  onClick={() => setPaginaAtual(prev => Math.max(prev - 1, 1))}
                  disabled={paginaAtual === 1}
                >
                  <FaChevronLeft style={{ fontSize: '10px', marginRight: '4px' }} /> Anterior
                </button>

                {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(num => (
                  <button
                    key={num}
                    className={`page-btn ${paginaAtual === num ? 'active' : ''}`}
                    onClick={() => setPaginaAtual(num)}
                  >
                    {num}
                  </button>
                ))}

                <button 
                  className="page-btn" 
                  onClick={() => setPaginaAtual(prev => Math.min(prev + 1, totalPaginas))}
                  disabled={paginaAtual === totalPaginas}
                >
                  Próxima <FaChevronRight style={{ fontSize: '10px', marginLeft: '4px' }} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* MODAL DE CADASTRO MANUAL DE CLIENTE */}
      {mostrarForm && (
        <div className="modal-overlay">
          <form className="modal-content" style={{ width: '550px' }} onSubmit={handleSalvarCliente}>
            <button type="button" className="modal-close-btn" onClick={() => setMostrarForm(false)}>×</button>
            <h3 className="modal-title">Cadastrar Novo Cliente (Balcão)</h3>

            {erro && <p style={{ color: '#ef4444', fontSize: '13px', background: '#fef2f2', padding: '8px', borderRadius: '6px', marginBottom: '15px' }}>{erro}</p>}
            
            <div className="form-group">
              <label className="form-label">Nome Completo *</label>
              <input type="text" className="form-input" placeholder="Ex: Maria Oliveira" value={nome} onChange={e => setNome(e.target.value)} required />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">E-mail</label>
                <input type="email" className="form-input" placeholder="cliente@email.com" value={email} onChange={e => setEmail(e.target.value)} />
              </div>

              <div className="form-group">
                <label className="form-label">Telefone / WhatsApp *</label>
                <input type="text" className="form-input" placeholder="(42) 99999-9999" value={telefone} onChange={e => setTelefone(e.target.value)} required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">CPF</label>
              <input type="text" className="form-input" placeholder="000.000.000-00" value={cpf} onChange={e => setCpf(e.target.value)} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Rua / Endereço</label>
                <input type="text" className="form-input" placeholder="Rua XV de Novembro" value={rua} onChange={e => setRua(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Número</label>
                <input type="text" className="form-input" placeholder="123" value={numero} onChange={e => setNumero(e.target.value)} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
              <div className="form-group">
                <label className="form-label">Bairro</label>
                <input type="text" className="form-input" placeholder="Centro" value={bairro} onChange={e => setBairro(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Cidade</label>
                <input type="text" className="form-input" placeholder="Ponta Grossa" value={cidade} onChange={e => setCidade(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">CEP</label>
                <input type="text" className="form-input" placeholder="84000-000" value={cep} onChange={e => setCep(e.target.value)} />
              </div>
            </div>

            <div className="modal-actions">
              <button type="button" className="modal-btn cancelar" onClick={() => setMostrarForm(false)}>Cancelar</button>
              <button type="submit" className="modal-btn salvar">Salvar Cliente</button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}