import React, { useState, useEffect } from 'react';
import { FaPlus, FaSearch, FaTrash, FaEdit, FaTimes, FaMapMarkerAlt } from 'react-icons/fa';

// Mapeamento de estados e cidades do Brasil
const ESTADOS_E_CIDADES = {
  SP: ['São Paulo', 'Campinas', 'Santos', 'Ribeirão Preto', 'Sorocaba', 'Guarulhos', 'Osasco'],
  RJ: ['Rio de Janeiro', 'Niterói', 'Petrópolis', 'Volta Redonda', 'Nova Iguaçu', 'Duque de Caxias'],
  PR: ['Curitiba', 'Ponta Grossa', 'Londrina', 'Maringá', 'Cascavel', 'Foz do Iguaçu'],
  MG: ['Belo Horizonte', 'Uberlândia', 'Juiz de Fora', 'Montes Claros', 'Contagem'],
  RS: ['Porto Alegre', 'Caxias do Sul', 'Pelotas', 'Canoas', 'Santa Maria'],
  SC: ['Florianópolis', 'Joinville', 'Blumenau', 'Chapecó', 'Itajaí'],
  BA: ['Salvador', 'Feira de Santana', 'Vitória da Conquista', 'Camaçari'],
  PE: ['Recife', 'Olinda', 'Caruaru', 'Petrolina'],
  DF: ['Brasília'],
  GO: ['Goiânia', 'Aparecida de Goiânia', 'Anápolis'],
  ES: ['Vitória', 'Vila Velha', 'Serra'],
  CE: ['Fortaleza', 'Caucaia', 'Juazeiro do Norte'],
  PA: ['Belém', 'Ananindeua', 'Santarém'],
  MA: ['São Luís', 'Imperatriz'],
  MT: ['Cuiabá', 'Várzea Grande'],
  MS: ['Campo Grande', 'Dourados'],
  PB: ['João Pessoa', 'Campina Grande'],
  RN: ['Natal', 'Mossoró'],
  AL: ['Maceió', 'Arapiraca'],
  PI: ['Teresina', 'Parnaíba'],
  SE: ['Aracaju'],
  AM: ['Manaus'],
  RO: ['Porto Velho'],
  AC: ['Rio Branco'],
  AP: ['Macapá'],
  RR: ['Boa Vista'],
  TO: ['Palmas']
};

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [busca, setBusca] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [clienteEditando, setClienteEditando] = useState(null);

  // Form State
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');

  // Endereço Detalhado
  const [logradouro, setLogradouro] = useState('');
  const [numero, setNumero] = useState('');
  const [bairro, setBairro] = useState('');
  const [complemento, setComplemento] = useState('');
  const [estado, setEstado] = useState('');
  const [cidade, setCidade] = useState('');

  const carregarClientes = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:3000/users');
      if (res.ok) {
        const data = await res.json();
        setClientes(Array.isArray(data) ? data : data.users || []);
      }
    } catch (err) {
      console.error("Erro ao carregar clientes", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarClientes();
  }, []);

  const limparFormulario = () => {
    setNome('');
    setEmail('');
    setTelefone('');
    setLogradouro('');
    setNumero('');
    setBairro('');
    setComplemento('');
    setEstado('');
    setCidade('');
    setClienteEditando(null);
  };

  const abrirModalNovo = () => {
    limparFormulario();
    setModalAberto(true);
  };

  const abrirModalEditar = (cliente) => {
    setClienteEditando(cliente);
    setNome(cliente.nome || cliente.name || '');
    setEmail(cliente.email || '');
    setTelefone(cliente.telefone || cliente.phone || '');

    const end = cliente.endereco || {};
    setLogradouro(end.logradouro || cliente.logradouro || cliente.rua || '');
    setNumero(end.numero || cliente.numero || '');
    setBairro(end.bairro || cliente.bairro || '');
    setComplemento(end.complemento || cliente.complemento || '');
    setEstado(end.estado || cliente.estado || cliente.uf || '');
    setCidade(end.cidade || cliente.cidade || '');

    setModalAberto(true);
  };

  const handleEstadoChange = (e) => {
    const novoUF = e.target.value;
    setEstado(novoUF);
    setCidade('');
  };

  const salvarCliente = async (e) => {
    e.preventDefault();

    if (!nome || !telefone) {
      alert('Por favor, preencha os campos obrigatórios (Nome e Telefone).');
      return;
    }

    const enderecoFormatado = `${logradouro}${numero ? ', ' + numero : ''}${bairro ? ' - ' + bairro : ''}${cidade ? ' (' + cidade + '/' + estado + ')' : ''}`;

    const payload = {
      nome,
      email,
      telefone,
      cidade: cidade ? `${cidade} - ${estado}` : '',
      endereco: {
        logradouro,
        numero,
        bairro,
        complemento,
        cidade,
        estado,
        textoCompleto: enderecoFormatado
      }
    };

    try {
      const isEdicao = !!clienteEditando;
      const url = isEdicao 
        ? `http://localhost:3000/users/${clienteEditando.id}` 
        : 'http://localhost:3000/users';
      const method = isEdicao ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert(isEdicao ? 'Cliente atualizado com sucesso!' : 'Cliente cadastrado com sucesso!');
        setModalAberto(false);
        limparFormulario();
        carregarClientes();
      } else {
        alert('Erro ao salvar cliente no banco de dados.');
      }
    } catch (err) {
      alert('Erro de conexão ao salvar cliente.');
    }
  };

  const excluirCliente = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este cliente?')) return;
    try {
      const res = await fetch(`http://localhost:3000/users/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setClientes(clientes.filter(c => c.id !== id));
      }
    } catch (err) {
      alert('Erro ao excluir cliente.');
    }
  };

  const listaClientes = Array.isArray(clientes) ? clientes : [];
  const clientesFiltrados = listaClientes.filter(c => {
    const nomeCliente = String(c.nome || c.name || '').toLowerCase();
    const emailCliente = String(c.email || '').toLowerCase();
    const telCliente = String(c.telefone || c.phone || '').toLowerCase();
    const termo = busca.toLowerCase();

    return (
      nomeCliente.includes(termo) ||
      emailCliente.includes(termo) ||
      telCliente.includes(termo)
    );
  });

  // Estilo padronizado dos campos de formulário
  const inputStyle = {
    width: '100%',
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    outline: 'none',
    fontSize: '14px',
    color: '#0f172a',
    backgroundColor: '#fff',
    boxSizing: 'border-box'
  };

  const labelStyle = {
    display: 'block',
    fontSize: '13px',
    fontWeight: '600',
    color: '#334155',
    marginBottom: '6px'
  };

  return (
    <div style={{ padding: '10px' }}>
      {/* CABEÇALHO */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Gestão de Clientes</h2>
          <p style={{ color: '#64748b', fontSize: '14px', margin: '4px 0 0 0' }}>Base de clientes presenciais do balcão e cadastros gerais.</p>
        </div>
        <button
          onClick={abrirModalNovo}
          style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <FaPlus style={{ fontSize: '12px' }} /> Novo Cliente
        </button>
      </div>

      {/* CARD PRINCIPAL */}
      <div style={{ background: '#fff', padding: '24px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', border: '1px solid #cbd5e1', padding: '10px 14px', borderRadius: '8px', marginBottom: '20px' }}>
          <FaSearch style={{ color: '#94a3b8', marginRight: '10px' }} />
          <input
            type="text"
            placeholder="Buscar cliente por nome, e-mail ou telefone..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '14px' }}
          />
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', color: '#64748b', padding: '20px' }}>Carregando clientes...</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #f1f5f9', textAlign: 'left' }}>
                <th style={{ padding: '12px 16px', fontSize: '12px', color: '#64748b' }}>NOME DO CLIENTE</th>
                <th style={{ padding: '12px 16px', fontSize: '12px', color: '#64748b' }}>CONTATO</th>
                <th style={{ padding: '12px 16px', fontSize: '12px', color: '#64748b' }}>CIDADE/UF</th>
                <th style={{ padding: '12px 16px', fontSize: '12px', color: '#64748b', textAlign: 'right' }}>AÇÕES</th>
              </tr>
            </thead>
            <tbody>
              {clientesFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', color: '#94a3b8', padding: '30px' }}>
                    Nenhum cliente encontrado.
                  </td>
                </tr>
              ) : (
                clientesFiltrados.map(c => (
                  <tr key={c.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 16px', fontWeight: '600', color: '#0f172a' }}>
                      {c.nome || c.name}
                    </td>
                    <td style={{ padding: '14px 16px', color: '#475569', fontSize: '13px' }}>
                      <div>{c.telefone || c.phone || 'Sem telefone'}</div>
                      <div style={{ color: '#94a3b8', fontSize: '12px' }}>{c.email || 'Sem e-mail'}</div>
                    </td>
                    <td style={{ padding: '14px 16px', color: '#64748b', fontSize: '13px' }}>
                      {c.cidade || c.endereco?.cidade || 'Não informada'}
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        <button
                          onClick={() => abrirModalEditar(c)}
                          title="Editar Cliente"
                          style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '8px 10px', borderRadius: '6px', cursor: 'pointer' }}
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => excluirCliente(c.id)}
                          title="Excluir Cliente"
                          style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '8px 10px', borderRadius: '6px', cursor: 'pointer' }}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL CADASTRAR / EDITAR CLIENTE */}
      {modalAberto && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px',
          boxSizing: 'border-box'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '560px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '28px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            boxSizing: 'border-box',
            margin: 'auto'
          }}>
            
            {/* CABEÇALHO DO MODAL */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '14px' }}>
              <h3 style={{ margin: 0, color: '#0f172a', fontSize: '18px', fontWeight: '700' }}>
                {clienteEditando ? `Editar Cliente: ${clienteEditando.nome || ''}` : 'Novo Cliente Balcão'}
              </h3>
              <FaTimes style={{ cursor: 'pointer', color: '#64748b', fontSize: '18px' }} onClick={() => setModalAberto(false)} />
            </div>

            <form onSubmit={salvarCliente} style={{ display: 'flex', flexDirection: 'column', gap: '16px', boxSizing: 'border-box' }}>
              
              {/* NOME COMPLETO */}
              <div style={{ width: '100%', boxSizing: 'border-box' }}>
                <label style={labelStyle}>
                  Nome Completo <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input 
                  type="text" 
                  value={nome} 
                  onChange={e => setNome(e.target.value)} 
                  placeholder="Ex: Maria Silva"
                  required
                  style={inputStyle} 
                />
              </div>

              {/* TELEFONE E EMAIL */}
              <div style={{ display: 'flex', gap: '12px', width: '100%', boxSizing: 'border-box' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <label style={labelStyle}>
                    Telefone / WhatsApp <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input 
                    type="text" 
                    value={telefone} 
                    onChange={e => setTelefone(e.target.value)} 
                    placeholder="(42) 99999-9999"
                    required
                    style={inputStyle} 
                  />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <label style={labelStyle}>E-mail</label>
                  <input 
                    type="email" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    placeholder="maria@email.com"
                    style={inputStyle} 
                  />
                </div>
              </div>

              {/* DIVISOR */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '6px 0 0 0' }}>
                <FaMapMarkerAlt style={{ color: '#2563eb' }} />
                <span style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>Endereço do Cliente</span>
              </div>

              {/* LOGRADOURO */}
              <div style={{ width: '100%', boxSizing: 'border-box' }}>
                <label style={labelStyle}>Logradouro / Rua</label>
                <input 
                  type="text" 
                  value={logradouro} 
                  onChange={e => setLogradouro(e.target.value)} 
                  placeholder="Ex: Av. Brasil, Rua XV de Novembro..."
                  style={inputStyle} 
                />
              </div>

              {/* NÚMERO E BAIRRO */}
              <div style={{ display: 'flex', gap: '12px', width: '100%', boxSizing: 'border-box' }}>
                <div style={{ width: '130px', flexShrink: 0 }}>
                  <label style={labelStyle}>Número</label>
                  <input 
                    type="text" 
                    value={numero} 
                    onChange={e => setNumero(e.target.value)} 
                    placeholder="123"
                    style={inputStyle} 
                  />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <label style={labelStyle}>Bairro</label>
                  <input 
                    type="text" 
                    value={bairro} 
                    onChange={e => setBairro(e.target.value)} 
                    placeholder="Ex: Centro"
                    style={inputStyle} 
                  />
                </div>
              </div>

              {/* ESTADO E CIDADE */}
              <div style={{ display: 'flex', gap: '12px', width: '100%', boxSizing: 'border-box' }}>
                <div style={{ width: '130px', flexShrink: 0 }}>
                  <label style={labelStyle}>Estado (UF)</label>
                  <select 
                    value={estado} 
                    onChange={handleEstadoChange}
                    style={{ ...inputStyle, cursor: 'pointer' }}
                  >
                    <option value="">UF...</option>
                    {Object.keys(ESTADOS_E_CIDADES).map(uf => (
                      <option key={uf} value={uf}>{uf}</option>
                    ))}
                  </select>
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <label style={labelStyle}>Cidade</label>
                  {estado && ESTADOS_E_CIDADES[estado] ? (
                    <select 
                      value={cidade} 
                      onChange={e => setCidade(e.target.value)}
                      style={{ ...inputStyle, cursor: 'pointer' }}
                    >
                      <option value="">Selecione a cidade...</option>
                      {ESTADOS_E_CIDADES[estado].map(cid => (
                        <option key={cid} value={cid}>{cid}</option>
                      ))}
                    </select>
                  ) : (
                    <input 
                      type="text" 
                      value={cidade} 
                      onChange={e => setCidade(e.target.value)} 
                      placeholder={estado ? "Digite a cidade..." : "Selecione a UF primeiro"}
                      disabled={!estado}
                      style={{
                        ...inputStyle,
                        backgroundColor: !estado ? '#f8fafc' : '#fff',
                        cursor: !estado ? 'not-allowed' : 'text'
                      }} 
                    />
                  )}
                </div>
              </div>

              {/* COMPLEMENTO */}
              <div style={{ width: '100%', boxSizing: 'border-box' }}>
                <label style={labelStyle}>Complemento / Ponto de Referência</label>
                <input 
                  type="text" 
                  value={complemento} 
                  onChange={e => setComplemento(e.target.value)} 
                  placeholder="Ex: Apto 102, Próximo ao mercado..."
                  style={inputStyle} 
                />
              </div>

              {/* BOTÕES DE AÇÃO */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                <button 
                  type="button" 
                  onClick={() => setModalAberto(false)}
                  style={{ background: '#e2e8f0', color: '#475569', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '14px' }}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', fontSize: '14px' }}
                >
                  {clienteEditando ? 'Atualizar Cliente' : 'Salvar Cliente'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}