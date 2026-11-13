import React, { useState, useEffect } from 'react';
import {
  FaPlus,
  FaSearch,
  FaTrash,
  FaEdit,
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
  FaQuestionCircle,
  FaKeyboard
} from 'react-icons/fa';

// URL da API: local durante o desenvolvimento e Render em produção.
const API_URL = import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV
    ? 'http://localhost:3000'
    : 'https://sobmdidaadmin.onrender.com');

// Recupera o token da sessão.
const obterToken = () => localStorage.getItem('token');

// Monta os cabeçalhos das requisições autenticadas.
const obterHeaders = (comJson = false) => {
  const token = obterToken();

  if (!token) {
    throw new Error('Sua sessão não foi encontrada. Faça login novamente.');
  }

  return {
    ...(comJson ? { 'Content-Type': 'application/json' } : {}),
    Authorization: `Bearer ${token}`
  };
};

// Extrai uma mensagem de erro da resposta do backend.
const obterMensagemErro = async (res) => {
  try {
    const data = await res.json();
    return data?.error || data?.message || `Erro HTTP ${res.status}`;
  } catch {
    return `Erro HTTP ${res.status}`;
  }
};

// Verifica erros de autenticação e autorização.
const verificarResposta = async (res) => {
  if (res.status === 401 || res.status === 403) {
    throw new Error(
      'Sua sessão expirou ou você não tem autorização. Faça login novamente.'
    );
  }

  if (!res.ok) {
    throw new Error(await obterMensagemErro(res));
  }

  return res;
};

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [busca, setBusca] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [clienteEditandoId, setClienteEditandoId] = useState(null);

  // ESTADO DO MODAL DE AJUDA (HELPER TECLA H)
  const [modalAjudaAberto, setModalAjudaAberto] = useState(false);

  // ESTADOS DA PAGINAÇÃO
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 20;

  // IBGE Estados & Cidades
  const [estados, setEstados] = useState([]);
  const [cidades, setCidades] = useState([]);
  const [loadingCidades, setLoadingCidades] = useState(false);

  // Campos do formulário
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [cep, setCep] = useState('');
  const [rua, setRua] = useState('');
  const [numero, setNumero] = useState('');
  const [complemento, setComplemento] = useState('');
  const [bairro, setBairro] = useState('');
  const [uf, setUf] = useState('');
  const [cidade, setCidade] = useState('');

  // OUVINTE DE TECLADO PARA O HELPER (TECLA H)
  useEffect(() => {
    const handleKeyDown = (e) => {
      const tag = e.target.tagName.toLowerCase();

      if (tag === 'input' || tag === 'textarea' || tag === 'select') {
        return;
      }

      if (e.key === 'h' || e.key === 'H') {
        e.preventDefault();
        setModalAjudaAberto(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // CARREGAR ESTADOS PELO IBGE
  useEffect(() => {
    fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome')
      .then(res => {
        if (!res.ok) {
          throw new Error(`Erro HTTP ${res.status}`);
        }
        return res.json();
      })
      .then(data => setEstados(Array.isArray(data) ? data : []))
      .catch(err => console.error('Erro IBGE UF:', err));
  }, []);

  // CARREGAR CIDADES PELO IBGE
  useEffect(() => {
    if (!uf) {
      setCidades([]);
      return;
    }

    setLoadingCidades(true);

    fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`)
      .then(res => {
        if (!res.ok) {
          throw new Error(`Erro HTTP ${res.status}`);
        }
        return res.json();
      })
      .then(data => setCidades(Array.isArray(data) ? data : []))
      .catch(err => console.error('Erro IBGE Cidades:', err))
      .finally(() => setLoadingCidades(false));
  }, [uf]);

  useEffect(() => {
    setPaginaAtual(1);
  }, [busca]);

  // BUSCAR CEP PELO VIACEP
  const buscarCep = async (valorCep) => {
    const cepLimpo = valorCep.replace(/\D/g, '');

    setCep(valorCep);

    if (cepLimpo.length === 8) {
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);

        if (!res.ok) {
          throw new Error(`Erro HTTP ${res.status}`);
        }

        const data = await res.json();

        if (!data.erro) {
          setRua(data.logradouro || '');
          setBairro(data.bairro || '');
          setUf(data.uf || '');
          setCidade(data.localidade || '');
        }
      } catch (err) {
        console.error('Erro ao buscar CEP:', err);
      }
    }
  };

  // CARREGAR CLIENTES DO BACKEND
  const carregarClientes = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${API_URL}/clients`, {
        headers: obterHeaders()
      });

      await verificarResposta(res);

      const data = await res.json();

      // Aceita diferentes formatos de resposta da API.
      const lista = Array.isArray(data)
        ? data
        : data.clients || data.users || [];

      if (!Array.isArray(lista)) {
        throw new Error('O backend retornou um formato inválido de clientes.');
      }

      const listaClientes = lista.filter(c =>
        c.origem === 'BALCAO' ||
        c.role === 'CLIENT' ||
        c.email?.includes('balcao_')
      );

      setClientes(listaClientes);

    } catch (err) {
      console.error('Erro ao carregar clientes:', err);

      alert(
        `Não foi possível carregar os clientes: ${err.message}`
      );

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarClientes();
  }, []);

  // LIMPAR FORMULÁRIO
  const limparFormulario = () => {
    setClienteEditandoId(null);
    setNome('');
    setCpf('');
    setEmail('');
    setTelefone('');
    setCep('');
    setRua('');
    setNumero('');
    setComplemento('');
    setBairro('');
    setUf('');
    setCidade('');
  };

  // ABRIR MODAL DE NOVO CLIENTE
  const abrirModalNovo = () => {
    limparFormulario();
    setModalAberto(true);
  };

  // ABRIR MODAL DE EDIÇÃO
  const abrirModalEdicao = (c) => {
    setClienteEditandoId(c.id);
    setNome(c.nome || '');
    setCpf(c.cpf || '');
    setEmail(c.email || '');
    setTelefone(c.telefone || '');
    setCep(c.cep || '');
    setRua(c.rua || '');
    setNumero(c.numero || '');
    setComplemento(c.complemento || '');
    setBairro(c.bairro || '');
    setUf(c.uf || '');
    setCidade(c.cidade || '');

    setModalAberto(true);
  };

  // CADASTRAR OU EDITAR CLIENTE
  const salvarCliente = async (e) => {
    e.preventDefault();

    if (!nome.trim()) {
      alert('Por favor, informe o nome do cliente.');
      return;
    }

    if (!cpf.trim()) {
      alert('Por favor, informe o CPF do cliente.');
      return;
    }

    if (!telefone.trim()) {
      alert('Por favor, informe o telefone/WhatsApp do cliente.');
      return;
    }

    if (
      !cep.trim() ||
      !rua.trim() ||
      !numero.trim() ||
      !bairro.trim() ||
      !uf.trim() ||
      !cidade.trim()
    ) {
      alert(
        'Por favor, preencha todos os campos obrigatórios do endereço (CEP, Rua, Número, Bairro, UF e Cidade).'
      );
      return;
    }

    const partesEndereco = [];

    if (rua) partesEndereco.push(rua);
    if (numero) partesEndereco.push(`Nº ${numero}`);
    if (complemento) partesEndereco.push(`(${complemento})`);
    if (bairro) partesEndereco.push(`Bairro: ${bairro}`);
    if (cidade || uf) partesEndereco.push(`${cidade}/${uf}`);
    if (cep) partesEndereco.push(`CEP: ${cep}`);

    const enderecoFormatado = partesEndereco.join(', ');

    const payload = {
      nome: nome.trim(),
      cpf: cpf.trim(),
      email: email.trim() || undefined,
      telefone: telefone.trim(),
      endereco: enderecoFormatado,
      cep: cep.trim(),
      rua: rua.trim(),
      numero: numero.trim(),
      complemento: complemento.trim() || undefined,
      bairro: bairro.trim(),
      cidade: cidade.trim(),
      uf: uf.trim(),
      origem: 'BALCAO'
    };

    try {
      const isEdicao = Boolean(clienteEditandoId);

      let res;

      if (isEdicao) {
        // EDITAR CLIENTE
        res = await fetch(`${API_URL}/clients/${clienteEditandoId}`, {
          method: 'PUT',
          headers: obterHeaders(true),
          body: JSON.stringify(payload)
        });

      } else {
        // CADASTRAR NOVO CLIENTE PELO PAINEL ADMINISTRATIVO
        res = await fetch(`${API_URL}/clients`, {
          method: 'POST',
          headers: obterHeaders(true),
          body: JSON.stringify(payload)
        });
      }

      // VERIFICAR SE O BACKEND CONFIRMOU A OPERAÇÃO
      await verificarResposta(res);

      alert(
        isEdicao
          ? 'Cliente atualizado com sucesso!'
          : 'Cliente cadastrado com sucesso!'
      );

      setModalAberto(false);
      limparFormulario();

      // RECARREGAR A LISTA APÓS A OPERAÇÃO
      await carregarClientes();

    } catch (err) {
      console.error('Erro ao salvar cliente:', err);

      alert(`Erro ao salvar cliente: ${err.message}`);
    }
  };

  // EXCLUIR CLIENTE
  const excluirCliente = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este cliente?')) {
      return;
    }

    try {
      const res = await fetch(`${API_URL}/clients/${id}`, {
        method: 'DELETE',
        headers: obterHeaders()
      });

      await verificarResposta(res);

      alert('Cliente excluído com sucesso!');

      await carregarClientes();

    } catch (err) {
      console.error('Erro ao excluir cliente:', err);

      alert(`Erro ao excluir cliente: ${err.message}`);
    }
  };

  // FILTRAR CLIENTES
  const clientesFiltrados = clientes.filter(c => {
    const termo = busca.toLowerCase();

    const nomeC = String(c.nome || '').toLowerCase();
    const emailC = String(c.email || '').toLowerCase();
    const cpfC = String(c.cpf || '').toLowerCase();

    return (
      nomeC.includes(termo) ||
      emailC.includes(termo) ||
      cpfC.includes(termo)
    );
  });

  // PAGINAÇÃO
  const totalPaginas = Math.ceil(
    clientesFiltrados.length / itensPorPagina
  ) || 1;

  const indiceInicial = (paginaAtual - 1) * itensPorPagina;

  const clientesPaginados = clientesFiltrados.slice(
    indiceInicial,
    indiceInicial + itensPorPagina
  );

  return (
    <div style={{ padding: '10px' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <div>
          <h2 style={{
            fontSize: '22px',
            fontWeight: '800',
            color: '#0f172a',
            margin: 0
          }}>
            Gestão de Clientes
          </h2>

          <p style={{
            color: '#64748b',
            fontSize: '14px',
            margin: '4px 0 0 0'
          }}>
            Gerencie os clientes cadastrados no sistema ({clientesFiltrados.length} cadastrados).
          </p>
        </div>

        <div style={{
          display: 'flex',
          gap: '10px',
          alignItems: 'center'
        }}>
          {/* BOTÃO HELPER DE ATALHO */}
          <button
            onClick={() => setModalAjudaAberto(true)}
            title="Pressione a tecla H para abrir o Guia de Ajuda"
            style={{
              background: '#f1f5f9',
              color: '#475569',
              border: '1px solid #cbd5e1',
              padding: '10px 14px',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px'
            }}
          >
            <FaQuestionCircle style={{ color: '#2563eb' }} />
            Ajuda [H]
          </button>

          <button
            onClick={abrirModalNovo}
            style={{
              background: '#2563eb',
              color: '#fff',
              border: 'none',
              padding: '10px 18px',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <FaPlus style={{ fontSize: '12px' }} />
            Novo Cliente
          </button>
        </div>
      </div>

      <div style={{
        background: '#fff',
        padding: '24px',
        borderRadius: '14px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          background: '#f8fafc',
          border: '1px solid #cbd5e1',
          padding: '10px 14px',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <FaSearch style={{
            color: '#94a3b8',
            marginRight: '10px'
          }} />

          <input
            type="text"
            placeholder="Buscar por nome, CPF ou e-mail..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            style={{
              border: 'none',
              background: 'transparent',
              outline: 'none',
              width: '100%',
              fontSize: '14px'
            }}
          />
        </div>

        {loading ? (
          <p style={{
            textAlign: 'center',
            color: '#64748b',
            padding: '20px'
          }}>
            Carregando clientes...
          </p>
        ) : (
          <>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse'
            }}>
              <thead>
                <tr style={{
                  borderBottom: '2px solid #f1f5f9',
                  textAlign: 'left'
                }}>
                  <th style={{
                    padding: '12px 16px',
                    fontSize: '12px',
                    color: '#64748b'
                  }}>
                    NOME / CONTATO
                  </th>

                  <th style={{
                    padding: '12px 16px',
                    fontSize: '12px',
                    color: '#64748b'
                  }}>
                    CPF
                  </th>

                  <th style={{
                    padding: '12px 16px',
                    fontSize: '12px',
                    color: '#64748b'
                  }}>
                    ENDEREÇO
                  </th>

                  <th style={{
                    padding: '12px 16px',
                    fontSize: '12px',
                    color: '#64748b',
                    textAlign: 'right'
                  }}>
                    AÇÕES
                  </th>
                </tr>
              </thead>

              <tbody>
                {clientesPaginados.length === 0 ? (
                  <tr>
                    <td
                      colSpan="4"
                      style={{
                        textAlign: 'center',
                        color: '#94a3b8',
                        padding: '30px'
                      }}
                    >
                      Nenhum cliente encontrado.
                    </td>
                  </tr>
                ) : (
                  clientesPaginados.map(c => (
                    <tr
                      key={c.id}
                      style={{
                        borderBottom: '1px solid #f1f5f9'
                      }}
                    >
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{
                          fontWeight: '600',
                          color: '#0f172a',
                          fontSize: '14px'
                        }}>
                          {c.nome}
                        </div>

                        <div style={{
                          color: '#64748b',
                          fontSize: '12px',
                          marginTop: '2px'
                        }}>
                          {c.email || 'Sem e-mail'} | {c.telefone || 'Sem telefone'}
                        </div>
                      </td>

                      <td style={{
                        padding: '14px 16px',
                        color: '#475569',
                        fontSize: '13px',
                        fontWeight: '500'
                      }}>
                        {c.cpf || 'Não informado'}
                      </td>

                      <td style={{
                        padding: '14px 16px',
                        color: '#475569',
                        fontSize: '13px'
                      }}>
                        {c.endereco || 'Não informado'}
                      </td>

                      <td style={{
                        padding: '14px 16px',
                        textAlign: 'right'
                      }}>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'flex-end',
                          gap: '8px'
                        }}>
                          <button
                            onClick={() => abrirModalEdicao(c)}
                            title="Editar Cliente"
                            style={{
                              background: '#2563eb',
                              color: '#fff',
                              border: 'none',
                              padding: '8px 10px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <FaEdit />
                          </button>

                          <button
                            onClick={() => excluirCliente(c.id)}
                            title="Excluir Cliente"
                            style={{
                              background: '#ef4444',
                              color: '#fff',
                              border: 'none',
                              padding: '8px 10px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
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

            {/* CONTROLES DE PAGINAÇÃO */}
            {clientesFiltrados.length > 0 && (
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '20px',
                paddingTop: '15px',
                borderTop: '1px solid #f1f5f9'
              }}>
                <span style={{
                  fontSize: '13px',
                  color: '#64748b'
                }}>
                  Mostrando <b>{indiceInicial + 1}</b> a{' '}
                  <b>{Math.min(
                    indiceInicial + itensPorPagina,
                    clientesFiltrados.length
                  )}</b>{' '}
                  de <b>{clientesFiltrados.length}</b> clientes
                </span>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <button
                    onClick={() => setPaginaAtual(prev => Math.max(prev - 1, 1))}
                    disabled={paginaAtual === 1}
                    style={{
                      background: '#f8fafc',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      padding: '6px 12px',
                      cursor: paginaAtual === 1 ? 'not-allowed' : 'pointer',
                      opacity: paginaAtual === 1 ? 0.5 : 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '13px',
                      color: '#334155'
                    }}
                  >
                    <FaChevronLeft style={{ fontSize: '10px' }} />
                    Anterior
                  </button>

                  {Array.from(
                    { length: totalPaginas },
                    (_, index) => index + 1
                  ).map(num => (
                    <button
                      key={num}
                      onClick={() => setPaginaAtual(num)}
                      style={{
                        background: paginaAtual === num ? '#2563eb' : '#fff',
                        color: paginaAtual === num ? '#fff' : '#334155',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        padding: '6px 11px',
                        fontWeight: paginaAtual === num ? '700' : '400',
                        cursor: 'pointer',
                        fontSize: '13px'
                      }}
                    >
                      {num}
                    </button>
                  ))}

                  <button
                    onClick={() => setPaginaAtual(prev => Math.min(prev + 1, totalPaginas))}
                    disabled={paginaAtual === totalPaginas}
                    style={{
                      background: '#f8fafc',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      padding: '6px 12px',
                      cursor: paginaAtual === totalPaginas ? 'not-allowed' : 'pointer',
                      opacity: paginaAtual === totalPaginas ? 0.5 : 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '13px',
                      color: '#334155'
                    }}
                  >
                    Próximo
                    <FaChevronRight style={{ fontSize: '10px' }} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* MODAL DE CADASTRO E EDIÇÃO */}
      {modalAberto && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '600px',
            padding: '24px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
              borderBottom: '1px solid #f1f5f9',
              paddingBottom: '12px'
            }}>
              <h3 style={{
                margin: 0,
                color: '#0f172a',
                fontSize: '18px'
              }}>
                {clienteEditandoId
                  ? 'Editar Cliente'
                  : 'Cadastrar Novo Cliente'}
              </h3>

              <FaTimes
                style={{
                  cursor: 'pointer',
                  color: '#64748b'
                }}
                onClick={() => setModalAberto(false)}
              />
            </div>

            <form
              onSubmit={salvarCliente}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '14px'
              }}
            >
              <div style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr',
                gap: '10px'
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: '600',
                    color: '#334155',
                    marginBottom: '4px'
                  }}>
                    Nome Completo *
                  </label>

                  <input
                    type="text"
                    value={nome}
                    onChange={e => setNome(e.target.value)}
                    placeholder="Ex: Maria Silva"
                    required
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: '600',
                    color: '#334155',
                    marginBottom: '4px'
                  }}>
                    CPF *
                  </label>

                  <input
                    type="text"
                    value={cpf}
                    onChange={e => setCpf(e.target.value)}
                    placeholder="000.000.000-00"
                    required
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '10px'
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: '600',
                    color: '#334155',
                    marginBottom: '4px'
                  }}>
                    E-mail (Opcional)
                  </label>

                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="maria@email.com"
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: '600',
                    color: '#334155',
                    marginBottom: '4px'
                  }}>
                    Telefone / WhatsApp *
                  </label>

                  <input
                    type="text"
                    value={telefone}
                    onChange={e => setTelefone(e.target.value)}
                    placeholder="(00) 00000-0000"
                    required
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              {/* SEÇÃO ENDEREÇO E-COMMERCE */}
              <div style={{
                borderTop: '1px dashed #e2e8f0',
                paddingTop: '10px',
                marginTop: '6px'
              }}>
                <span style={{
                  fontSize: '13px',
                  fontWeight: '700',
                  color: '#2563eb',
                  display: 'block',
                  marginBottom: '10px'
                }}>
                  ENDEREÇO DE ENTREGA (OBRIGATÓRIO)
                </span>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 2fr',
                  gap: '10px',
                  marginBottom: '10px'
                }}>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '13px',
                      fontWeight: '600',
                      color: '#334155',
                      marginBottom: '4px'
                    }}>
                      CEP *
                    </label>

                    <input
                      type="text"
                      value={cep}
                      onChange={e => buscarCep(e.target.value)}
                      placeholder="00000-000"
                      maxLength={9}
                      required
                      style={{
                        width: '100%',
                        padding: '10px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '13px',
                      fontWeight: '600',
                      color: '#334155',
                      marginBottom: '4px'
                    }}>
                      Rua / Logradouro *
                    </label>

                    <input
                      type="text"
                      value={rua}
                      onChange={e => setRua(e.target.value)}
                      placeholder="Ex: Av. Brasil"
                      required
                      style={{
                        width: '100%',
                        padding: '10px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 2fr 1fr',
                  gap: '10px',
                  marginBottom: '10px'
                }}>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '13px',
                      fontWeight: '600',
                      color: '#334155',
                      marginBottom: '4px'
                    }}>
                      Número *
                    </label>

                    <input
                      type="text"
                      value={numero}
                      onChange={e => setNumero(e.target.value)}
                      placeholder="123"
                      required
                      style={{
                        width: '100%',
                        padding: '10px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '13px',
                      fontWeight: '600',
                      color: '#334155',
                      marginBottom: '4px'
                    }}>
                      Complemento (Opcional)
                    </label>

                    <input
                      type="text"
                      value={complemento}
                      onChange={e => setComplemento(e.target.value)}
                      placeholder="Apto 101, Bloco B"
                      style={{
                        width: '100%',
                        padding: '10px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '13px',
                      fontWeight: '600',
                      color: '#334155',
                      marginBottom: '4px'
                    }}>
                      Bairro *
                    </label>

                    <input
                      type="text"
                      value={bairro}
                      onChange={e => setBairro(e.target.value)}
                      placeholder="Centro"
                      required
                      style={{
                        width: '100%',
                        padding: '10px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 2fr',
                  gap: '10px'
                }}>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '13px',
                      fontWeight: '600',
                      color: '#334155',
                      marginBottom: '4px'
                    }}>
                      Estado (UF) *
                    </label>

                    <select
                      value={uf}
                      onChange={e => {
                        setUf(e.target.value);
                        setCidade('');
                      }}
                      required
                      style={{
                        width: '100%',
                        padding: '10px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        background: '#fff',
                        boxSizing: 'border-box'
                      }}
                    >
                      <option value="">UF...</option>

                      {estados.map(e => (
                        <option key={e.id} value={e.sigla}>
                          {e.sigla} - {e.nome}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '13px',
                      fontWeight: '600',
                      color: '#334155',
                      marginBottom: '4px'
                    }}>
                      Município / Cidade *
                    </label>

                    <select
                      value={cidade}
                      onChange={e => setCidade(e.target.value)}
                      disabled={!uf || loadingCidades}
                      required
                      style={{
                        width: '100%',
                        padding: '10px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        background: '#fff',
                        boxSizing: 'border-box'
                      }}
                    >
                      <option value="">
                        {loadingCidades
                          ? 'Carregando cidades...'
                          : 'Selecione a cidade...'}
                      </option>

                      {cidades.map(c => (
                        <option key={c.id} value={c.nome}>
                          {c.nome}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '10px',
                marginTop: '10px',
                borderTop: '1px solid #f1f5f9',
                paddingTop: '14px'
              }}>
                <button
                  type="button"
                  onClick={() => setModalAberto(false)}
                  style={{
                    background: '#e2e8f0',
                    color: '#475569',
                    border: 'none',
                    padding: '10px 18px',
                    borderRadius: '6px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  style={{
                    background: '#2563eb',
                    color: '#fff',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '6px',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  {clienteEditandoId
                    ? 'Salvar Alterações'
                    : 'Salvar Cliente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL HELPER DE ATALHO TECLA H */}
      {modalAjudaAberto && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.75)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1200
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '14px',
            width: '100%',
            maxWidth: '440px',
            padding: '24px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px',
              borderBottom: '1px solid #f1f5f9',
              paddingBottom: '12px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <FaKeyboard style={{
                  color: '#2563eb',
                  fontSize: '20px'
                }} />

                <h3 style={{
                  margin: 0,
                  color: '#0f172a',
                  fontSize: '18px',
                  fontWeight: '700'
                }}>
                  Guia de Clientes
                </h3>
              </div>

              <FaTimes
                style={{
                  cursor: 'pointer',
                  color: '#64748b'
                }}
                onClick={() => setModalAjudaAberto(false)}
              />
            </div>

            <div style={{
              fontSize: '13px',
              color: '#334155',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <div style={{
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: '8px',
                padding: '10px 12px'
              }}>
                <strong style={{ color: '#1e40af' }}>
                  Atalhos Rápidos:
                </strong>

                <ul style={{
                  margin: '6px 0 0 0',
                  paddingLeft: '20px',
                  lineHeight: '1.6'
                }}>
                  <li>
                    <b>Tecla H:</b> Abre/fecha este menu de ajuda a qualquer momento.
                  </li>
                </ul>
              </div>

              <div style={{ lineHeight: '1.6' }}>
                <strong style={{
                  color: '#0f172a',
                  display: 'block',
                  marginBottom: '4px'
                }}>
                  Regras de Cadastro de Clientes:
                </strong>

                <ul style={{
                  margin: 0,
                  paddingLeft: '20px'
                }}>
                  <li>
                    <b>Obrigatórios:</b> Nome Completo, CPF, Telefone e Endereço Completo (CEP, Rua, Nº, Bairro, UF, Cidade).
                  </li>

                  <li>
                    <b>Opcionais:</b> E-mail e Complemento do endereço.
                  </li>

                  <li>
                    <b>Consulta CEP:</b> Digite o CEP (8 dígitos) para preenchimento automático da rua, bairro, UF e cidade via ViaCEP.
                  </li>
                </ul>
              </div>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              marginTop: '20px',
              borderTop: '1px solid #f1f5f9',
              paddingTop: '14px'
            }}>
              <button
                onClick={() => setModalAjudaAberto(false)}
                style={{
                  background: '#2563eb',
                  color: '#fff',
                  border: 'none',
                  padding: '8px 20px',
                  borderRadius: '6px',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}