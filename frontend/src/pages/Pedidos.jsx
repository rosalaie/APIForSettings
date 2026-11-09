import React, { useState, useEffect } from 'react';
import { FaPlus, FaSearch, FaTrash, FaEdit, FaTimes, FaShoppingCart, FaUser, FaChevronLeft, FaChevronRight, FaFilter, FaQuestionCircle, FaKeyboard } from 'react-icons/fa';

// Define a URL base da API (VITE_API_URL ou fallback para o backend do Render)
const API_URL = import.meta.env.VITE_API_URL || 'https://sobmdidaadmin.onrender.com';

export default function Pedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('PENDENTES'); // Padrão: Apenas Pendentes (Pedido Feito)
  const [loading, setLoading] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [modalClienteAberto, setModalClienteAberto] = useState(false);
  const [pedidoEditandoId, setPedidoEditandoId] = useState(null);

  // ESTADO DO MODAL DE AJUDA (HELPER TECLA H)
  const [modalAjudaAberto, setModalAjudaAberto] = useState(false);

  // ESTADOS DA PAGINAÇÃO
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 20;

  // Form State - Pedido
  const [clienteId, setClienteId] = useState('');
  const [buscaClienteTexto, setBuscaClienteTexto] = useState('');
  const [mostrarDropdownCliente, setMostrarDropdownCliente] = useState(false);

  const [origem, setOrigem] = useState('BALCAO');
  const [status, setStatus] = useState('PEDIDO FEITO');
  const [observacoes, setObservacoes] = useState('');
  const [itensPedido, setItensPedido] = useState([]);

  // Form State - Seleção temporária de produto com busca parcial
  const [produtoSelecionadoId, setProdutoSelecionadoId] = useState('');
  const [buscaProdutoTexto, setBuscaProdutoTexto] = useState('');
  const [mostrarDropdownProduto, setMostrarDropdownProduto] = useState(false);
  const [quantidadeTemp, setQuantidadeTemp] = useState(1);

  // Form State - Cadastro Rápido de Cliente
  const [novoClienteNome, setNovoClienteNome] = useState('');
  const [novoClienteTelefone, setNovoClienteTelefone] = useState('');

  // OUVINTE DE TECLADO PARA O HELPER (TECLA H)
  useEffect(() => {
    const handleKeyDown = (e) => {
      const tag = e.target.tagName.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return;

      if (e.key === 'h' || e.key === 'H') {
        e.preventDefault();
        setModalAjudaAberto(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);

      const [resPedidos, resClientes, resProdutos] = await Promise.all([
        fetch(`${API_URL}/orders`).catch(() => null),
        fetch(`${API_URL}/clients`).catch(() => null),
        fetch(`${API_URL}/products`).catch(() => null)
      ]);

      if (resPedidos && resPedidos.ok) {
        const data = await resPedidos.json();
        setPedidos(Array.isArray(data) ? data : []);
      }

      if (resClientes && resClientes.ok) {
        const data = await resClientes.json();
        setClientes(Array.isArray(data) ? data : []);
      }

      if (resProdutos && resProdutos.ok) {
        const data = await resProdutos.json();
        setProdutos(Array.isArray(data) ? data : []);
      }

    } catch (err) {
      console.error("Erro ao carregar dados", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  useEffect(() => {
    setPaginaAtual(1);
  }, [busca, filtroStatus]);

  const limparFormulario = () => {
    setPedidoEditandoId(null);
    setClienteId('');
    setBuscaClienteTexto('');
    setMostrarDropdownCliente(false);
    setOrigem('BALCAO');
    setStatus('PEDIDO FEITO');
    setObservacoes('');
    setItensPedido([]);
    setProdutoSelecionadoId('');
    setBuscaProdutoTexto('');
    setMostrarDropdownProduto(false);
    setQuantidadeTemp(1);
  };

  const abrirModalNovo = () => {
    limparFormulario();
    setModalAberto(true);
  };

  const abrirModalEdicao = (p) => {
    setPedidoEditandoId(p.id);
    const cId = p.clienteId ? String(p.clienteId) : (p.cliente?.id ? String(p.cliente.id) : '');
    setClienteId(cId);

    const clienteEncontrado = clientes.find(c => String(c.id) === String(cId));
    setBuscaClienteTexto(clienteEncontrado ? `${clienteEncontrado.nome} ${clienteEncontrado.telefone ? `(${clienteEncontrado.telefone})` : ''}` : (p.cliente?.nome || ''));

    setOrigem(p.origem || 'BALCAO');
    const statusValido = p.status === 'PAGO' ? 'PEDIDO FEITO' : (p.status || 'PEDIDO FEITO');
    setStatus(statusValido);
    setObservacoes(p.observacoes || '');

    if (Array.isArray(p.itens) && p.itens.length > 0) {
      const itensMapeados = p.itens.map(item => {
        const precoUnit = parseFloat(item.preco || item.produto?.preco || 0);
        const qtd = parseInt(item.quantidade || 1, 10);
        return {
          produtoId: item.produtoId || item.produto?.id,
          nome: item.produto?.nome || item.nome || 'Produto',
          preco: precoUnit,
          quantidade: qtd,
          subtotal: precoUnit * qtd
        };
      });
      setItensPedido(itensMapeados);
    } else {
      setItensPedido([]);
    }

    setModalAberto(true);
  };

  const salvarNovoClienteRapido = async (e) => {
    e.preventDefault();
    if (!novoClienteNome) {
      alert('Informe o nome do cliente.');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          nome: novoClienteNome.trim(), 
          telefone: novoClienteTelefone.trim() || null,
          origem: 'BALCAO'
        })
      });

      const data = await res.json();

      if (res.ok) {
        alert('Cliente cadastrado com sucesso!');
        setNovoClienteNome('');
        setNovoClienteTelefone('');
        setModalClienteAberto(false);
        await carregarDados();
        if (data.id) {
          setClienteId(String(data.id));
          setBuscaClienteTexto(`${data.nome} ${data.telefone ? `(${data.telefone})` : ''}`);
        }
      } else {
        alert(`Erro (${res.status}): ${data.error || 'Erro ao cadastrar cliente.'}`);
      }
    } catch (err) {
      alert('Erro de conexão ao cadastrar cliente.');
    }
  };

  const adicionarProdutoAoPedido = () => {
    if (!produtoSelecionadoId) {
      alert('Selecione um produto.');
      return;
    }

    const prod = produtos.find(p => String(p.id) === String(produtoSelecionadoId));
    if (!prod) return;

    const qtd = parseInt(quantidadeTemp, 10) || 1;
    const precoUnitario = parseFloat(prod.preco || 0);

    const indexExistente = itensPedido.findIndex(i => String(i.produtoId) === String(prod.id));

    if (indexExistente >= 0) {
      const novosItens = [...itensPedido];
      novosItens[indexExistente].quantidade += qtd;
      novosItens[indexExistente].subtotal = novosItens[indexExistente].quantidade * precoUnitario;
      setItensPedido(novosItens);
    } else {
      setItensPedido([
        ...itensPedido,
        {
          produtoId: prod.id,
          nome: prod.nome,
          preco: precoUnitario,
          quantidade: qtd,
          subtotal: precoUnitario * qtd
        }
      ]);
    }

    setProdutoSelecionadoId('');
    setBuscaProdutoTexto('');
    setQuantidadeTemp(1);
  };

  const removerItemPedido = (index) => {
    setItensPedido(itensPedido.filter((_, i) => i !== index));
  };

  const calcularTotal = () => {
    return itensPedido.reduce((acc, item) => acc + (item.subtotal || 0), 0);
  };

  const salvarPedido = async (e) => {
    e.preventDefault();

    if (!clienteId) {
      alert('Selecione um cliente válido da lista.');
      return;
    }

    if (itensPedido.length === 0) {
      alert('Adicione pelo menos um produto ao pedido.');
      return;
    }

    const isEdicao = Boolean(pedidoEditandoId);

    const payload = {
      clienteId: parseInt(clienteId, 10),
      origem: origem,
      status: status,
      observacoes: observacoes || null,
      total: calcularTotal(),
      itens: itensPedido.map(item => ({
        produtoId: parseInt(item.produtoId, 10),
        quantidade: parseInt(item.quantidade, 10)
      }))
    };

    try {
      let res;
      if (isEdicao) {
        res = await fetch(`${API_URL}/orders/${pedidoEditandoId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!res.ok) {
          res = await fetch(`${API_URL}/orders/${pedidoEditandoId}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: status })
          });
        }
      } else {
        res = await fetch(`${API_URL}/orders`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      if (res.ok) {
        alert(isEdicao ? 'Pedido atualizado com sucesso!' : 'Pedido registrado com sucesso!');
        setModalAberto(false);
        limparFormulario();
        carregarDados();
      } else {
        const errData = await res.json().catch(() => null);
        alert(`Erro ao salvar pedido (${res.status}): ${errData?.error || 'Verifique as informações do formulário.'}`);
      }
    } catch (err) {
      console.error(err);
      alert('Erro de conexão ao salvar pedido.');
    }
  };

  const atualizarStatusPedido = async (id, novoStatus) => {
    try {
      const res = await fetch(`${API_URL}/orders/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: novoStatus })
      });

      if (res.ok) {
        setPedidos(pedidos.map(p => p.id === id ? { ...p, status: novoStatus } : p));
      } else {
        alert('Erro ao atualizar o status do pedido.');
      }
    } catch (err) {
      alert('Erro de conexão ao atualizar status.');
    }
  };

  const excluirPedido = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este pedido?')) return;
    try {
      const res = await fetch(`${API_URL}/orders/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setPedidos(pedidos.filter(p => p.id !== id));
      } else {
        alert('Erro ao excluir pedido.');
      }
    } catch (err) {
      alert('Erro de conexão ao excluir.');
    }
  };

  // 1. FILTRAGEM DE PEDIDOS
  const pedidosFiltrados = pedidos.filter(p => {
    const nomeCliente = p.cliente?.nome?.toLowerCase() || '';
    const termo = busca.toLowerCase();
    const passaTexto = nomeCliente.includes(termo) || String(p.id).includes(termo);

    const stAtual = (p.status === 'PAGO' ? 'PEDIDO FEITO' : (p.status || 'PEDIDO FEITO')).toUpperCase();

    let passaStatus = true;
    if (filtroStatus === 'PENDENTES') {
      passaStatus = stAtual === 'PEDIDO FEITO' || stAtual === 'PENDENTE';
    } else if (filtroStatus !== 'TODOS') {
      passaStatus = stAtual === filtroStatus;
    }

    return passaTexto && passaStatus;
  });

  // 2. ORDENAÇÃO E BUSCA PARCIAL DE CLIENTES
  const clientesOrdenados = [...clientes].sort((a, b) => 
    (a.nome || '').localeCompare(b.nome || '', 'pt-BR', { sensitivity: 'base' })
  );

  const clientesFiltradosDropdown = clientesOrdenados.filter(c => {
    const termo = buscaClienteTexto.toLowerCase();
    const nome = (c.nome || '').toLowerCase();
    const telefone = (c.telefone || '').toLowerCase();
    return nome.includes(termo) || telefone.includes(termo);
  });

  // 3. ORDENAÇÃO E BUSCA PARCIAL DE PRODUTOS
  const produtosOrdenados = [...produtos].sort((a, b) => 
    (a.nome || '').localeCompare(b.nome || '', 'pt-BR', { sensitivity: 'base' })
  );

  const produtosFiltradosDropdown = produtosOrdenados.filter(p => {
    const termo = buscaProdutoTexto.toLowerCase();
    const nome = (p.nome || '').toLowerCase();
    return nome.includes(termo);
  });

  // 4. PAGINAÇÃO DE PEDIDOS
  const totalPaginas = Math.ceil(pedidosFiltrados.length / itensPorPagina) || 1;
  const indiceInicial = (paginaAtual - 1) * itensPorPagina;
  const pedidosPaginados = pedidosFiltrados.slice(indiceInicial, indiceInicial + itensPorPagina);

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Gestão de Pedidos</h2>
          <p style={{ color: '#64748b', fontSize: '14px', margin: '4px 0 0 0' }}>
            Acompanhe e gerencie as vendas realizadas ({pedidosFiltrados.length} exibidos).
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {/* BOTÃO HELPER DE ATALHO */}
          <button
            onClick={() => setModalAjudaAberto(true)}
            title="Pressione a tecla H para abrir o Guia de Ajuda"
            style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', padding: '10px 14px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
          >
            <FaQuestionCircle style={{ color: '#2563eb' }} /> Ajuda [H]
          </button>

          <button
            onClick={abrirModalNovo}
            style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <FaPlus style={{ fontSize: '12px' }} /> Novo Pedido
          </button>
        </div>
      </div>

      <div style={{ background: '#fff', padding: '24px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
        
        {/* BARRA DE BUSCA E FILTROS ADICIONAIS */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <div style={{ flex: 2, minWidth: '240px', display: 'flex', alignItems: 'center', background: '#f8fafc', border: '1px solid #cbd5e1', padding: '10px 14px', borderRadius: '8px' }}>
            <FaSearch style={{ color: '#94a3b8', marginRight: '10px' }} />
            <input
              type="text"
              placeholder="Buscar pedido por cliente ou número..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '14px' }}
            />
          </div>

          <div style={{ flex: 1, minWidth: '200px', display: 'flex', alignItems: 'center', background: '#f8fafc', border: '1px solid #cbd5e1', padding: '0 14px', borderRadius: '8px' }}>
            <FaFilter style={{ color: '#94a3b8', marginRight: '8px', fontSize: '12px' }} />
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '13px', fontWeight: '600', color: '#334155', cursor: 'pointer', padding: '10px 0' }}
            >
              <option value="PENDENTES">Apenas Pendentes (Pedido Feito)</option>
              <option value="TODOS">Todos os Status</option>
              <option value="EM_PREPARACAO">Em Preparação</option>
              <option value="ENVIADO">Enviados</option>
              <option value="ENTREGUE">Entregues</option>
              <option value="CANCELADO">Cancelados</option>
            </select>
          </div>
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', color: '#64748b', padding: '20px' }}>Carregando pedidos...</p>
        ) : (
          <>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #f1f5f9', textAlign: 'left' }}>
                  <th style={{ padding: '12px 16px', fontSize: '12px', color: '#64748b' }}>PEDIDO</th>
                  <th style={{ padding: '12px 16px', fontSize: '12px', color: '#64748b' }}>CLIENTE</th>
                  <th style={{ padding: '12px 16px', fontSize: '12px', color: '#64748b' }}>ORIGEM</th>
                  <th style={{ padding: '12px 16px', fontSize: '12px', color: '#64748b' }}>STATUS</th>
                  <th style={{ padding: '12px 16px', fontSize: '12px', color: '#64748b' }}>TOTAL</th>
                  <th style={{ padding: '12px 16px', fontSize: '12px', color: '#64748b', textAlign: 'right' }}>AÇÕES</th>
                </tr>
              </thead>
              <tbody>
                {pedidosPaginados.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', color: '#94a3b8', padding: '30px' }}>
                      Nenhum pedido encontrado com os filtros aplicados.
                    </td>
                  </tr>
                ) : (
                  pedidosPaginados.map(p => {
                    const statusAtual = p.status === 'PAGO' ? 'PEDIDO FEITO' : (p.status || 'PEDIDO FEITO');
                    return (
                      <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '14px 16px', fontWeight: '700', color: '#475569', fontSize: '14px' }}>
                          #{p.id}
                        </td>
                        <td style={{ padding: '14px 16px', fontWeight: '600', color: '#0f172a', fontSize: '14px' }}>
                          {p.cliente?.nome || 'Cliente Não Identificado'}
                        </td>
                        <td style={{ padding: '14px 16px', color: '#475569', fontSize: '13px' }}>
                          <span style={{ padding: '4px 8px', borderRadius: '6px', background: '#f1f5f9', fontSize: '12px', fontWeight: '600' }}>
                            {p.origem || 'BALCAO'}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px', fontSize: '13px' }}>
                          <select
                            value={statusAtual}
                            onChange={(e) => atualizarStatusPedido(p.id, e.target.value)}
                            style={{
                              padding: '4px 8px',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: '600',
                              border: '1px solid #cbd5e1',
                              background: statusAtual === 'ENTREGUE' ? '#dcfce7' : '#fef3c7',
                              color: statusAtual === 'ENTREGUE' ? '#166534' : '#92400e',
                              cursor: 'pointer'
                            }}
                          >
                            <option value="PEDIDO FEITO">PEDIDO FEITO</option>
                            <option value="EM_PREPARACAO">EM_PREPARACAO</option>
                            <option value="ENVIADO">ENVIADO</option>
                            <option value="ENTREGUE">ENTREGUE</option>
                            <option value="CANCELADO">CANCELADO</option>
                          </select>
                        </td>
                        <td style={{ padding: '14px 16px', fontWeight: '700', color: '#0f172a', fontSize: '14px' }}>
                          R$ {parseFloat(p.total || 0).toFixed(2)}
                        </td>
                        <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                            <button
                              onClick={() => abrirModalEdicao(p)}
                              title="Editar Pedido"
                              style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '8px 10px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => excluirPedido(p.id)}
                              title="Excluir Pedido"
                              style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '8px 10px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>

            {/* CONTROLES DE PAGINAÇÃO */}
            {pedidosFiltrados.length > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', paddingTop: '15px', borderTop: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: '13px', color: '#64748b' }}>
                  Mostrando <b>{indiceInicial + 1}</b> a <b>{Math.min(indiceInicial + itensPorPagina, pedidosFiltrados.length)}</b> de <b>{pedidosFiltrados.length}</b> pedidos
                </span>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
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
                    <FaChevronLeft style={{ fontSize: '10px' }} /> Anterior
                  </button>

                  {Array.from({ length: totalPaginas }, (_, index) => index + 1).map(num => (
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
                    Próximo <FaChevronRight style={{ fontSize: '10px' }} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* MODAL CRIAR / EDITAR PEDIDO */}
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
            maxWidth: '600px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '28px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            boxSizing: 'border-box',
            margin: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '14px' }}>
              <h3 style={{ margin: 0, color: '#0f172a', fontSize: '18px', fontWeight: '700' }}>
                {pedidoEditandoId ? `Editar Pedido #${pedidoEditandoId}` : 'Novo Pedido'}
              </h3>
              <FaTimes style={{ cursor: 'pointer', color: '#64748b', fontSize: '18px' }} onClick={() => setModalAberto(false)} />
            </div>

            <form onSubmit={salvarPedido} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* COMPONENTE DE BUSCA DE CLIENTE COM AUTOCOMPLETE */}
              <div>
                <label style={labelStyle}>Nome do Cliente *</label>
                <div style={{ display: 'flex', gap: '8px', position: 'relative' }}>
                  <div style={{ flex: 1, position: 'relative' }}>
                    <input
                      type="text"
                      placeholder="Digite o nome ou telefone do cliente..."
                      value={buscaClienteTexto}
                      onChange={e => {
                        setBuscaClienteTexto(e.target.value);
                        setClienteId('');
                        setMostrarDropdownCliente(true);
                      }}
                      onFocus={() => setMostrarDropdownCliente(true)}
                      required={!clienteId}
                      style={inputStyle}
                    />

                    {mostrarDropdownCliente && (
                      <div style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        maxHeight: '200px',
                        overflowY: 'auto',
                        background: '#fff',
                        border: '1px solid #cbd5e1',
                        borderRadius: '8px',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                        zIndex: 1000,
                        marginTop: '4px'
                      }}>
                        {clientesFiltradosDropdown.length === 0 ? (
                          <div style={{ padding: '10px 14px', color: '#94a3b8', fontSize: '13px' }}>
                            Nenhum cliente encontrado.
                          </div>
                        ) : (
                          clientesFiltradosDropdown.map(c => (
                            <div
                              key={c.id}
                              onClick={() => {
                                setClienteId(String(c.id));
                                setBuscaClienteTexto(`${c.nome} ${c.telefone ? `(${c.telefone})` : ''}`);
                                setMostrarDropdownCliente(false);
                              }}
                              style={{
                                padding: '10px 14px',
                                cursor: 'pointer',
                                fontSize: '13px',
                                color: '#0f172a',
                                borderBottom: '1px solid #f1f5f9',
                                background: String(c.id) === String(clienteId) ? '#eff6ff' : '#fff'
                              }}
                              onMouseDown={e => e.preventDefault()}
                            >
                              <strong>{c.nome}</strong> {c.telefone ? <span style={{ color: '#64748b' }}>({c.telefone})</span> : ''}
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setModalClienteAberto(true)}
                    style={{ background: '#e2e8f0', color: '#0f172a', border: '1px solid #cbd5e1', padding: '10px 14px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <FaUser style={{ fontSize: '12px' }} /> + Novo
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Origem</label>
                  <select
                    value={origem}
                    onChange={e => setOrigem(e.target.value)}
                    style={{ ...inputStyle, cursor: 'pointer' }}
                  >
                    <option value="BALCAO">BALCAO</option>
                    <option value="SITE">SITE</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Status Inicial</label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value)}
                    style={{ ...inputStyle, cursor: 'pointer' }}
                  >
                    <option value="PEDIDO FEITO">PEDIDO FEITO</option>
                    <option value="EM_PREPARACAO">EM_PREPARACAO</option>
                    <option value="ENVIADO">ENVIADO</option>
                    <option value="ENTREGUE">ENTREGUE</option>
                    <option value="CANCELADO">CANCELADO</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={labelStyle}>Observações</label>
                <input
                  type="text"
                  placeholder="Ex: Entregar após as 14h, sem cebola..."
                  value={observacoes}
                  onChange={e => setObservacoes(e.target.value)}
                  style={inputStyle}
                />
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '4px 0' }} />

              <div style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FaShoppingCart style={{ color: '#2563eb' }} /> Adicionar Produtos ao Pedido
              </div>

              {/* COMPONENTE DE BUSCA DE PRODUTO COM AUTOCOMPLETE */}
              <div style={{ display: 'flex', gap: '8px', position: 'relative' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                  <input
                    type="text"
                    placeholder="Buscar produto por nome..."
                    value={buscaProdutoTexto}
                    onChange={e => {
                      setBuscaProdutoTexto(e.target.value);
                      setProdutoSelecionadoId('');
                      setMostrarDropdownProduto(true);
                    }}
                    onFocus={() => setMostrarDropdownProduto(true)}
                    style={inputStyle}
                  />

                  {mostrarDropdownProduto && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      maxHeight: '180px',
                      overflowY: 'auto',
                      background: '#fff',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                      zIndex: 1000,
                      marginTop: '4px'
                    }}>
                      {produtosFiltradosDropdown.length === 0 ? (
                        <div style={{ padding: '10px 14px', color: '#94a3b8', fontSize: '13px' }}>
                          Nenhum produto encontrado.
                        </div>
                      ) : (
                        produtosFiltradosDropdown.map(p => (
                          <div
                            key={p.id}
                            onClick={() => {
                              setProdutoSelecionadoId(String(p.id));
                              setBuscaProdutoTexto(`${p.nome} - R$ ${parseFloat(p.preco || 0).toFixed(2)}`);
                              setMostrarDropdownProduto(false);
                            }}
                            style={{
                              padding: '10px 14px',
                              cursor: 'pointer',
                              fontSize: '13px',
                              color: '#0f172a',
                              borderBottom: '1px solid #f1f5f9',
                              background: String(p.id) === String(produtoSelecionadoId) ? '#eff6ff' : '#fff'
                            }}
                            onMouseDown={e => e.preventDefault()}
                          >
                            <strong>{p.nome}</strong> - <span style={{ color: '#16a34a', fontWeight: '600' }}>R$ {parseFloat(p.preco || 0).toFixed(2)}</span>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>

                <input
                  type="number"
                  min="1"
                  value={quantidadeTemp}
                  onChange={e => setQuantidadeTemp(e.target.value)}
                  style={{ width: '70px', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', textAlign: 'center' }}
                />

                <button
                  type="button"
                  onClick={adicionarProdutoAoPedido}
                  style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '10px 14px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}
                >
                  + Add
                </button>
              </div>

              {/* LISTA DE ITENS ADICIONADOS */}
              {itensPedido.length > 0 && (
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px', background: '#f8fafc' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #cbd5e1', textAlign: 'left', color: '#64748b' }}>
                        <th style={{ padding: '6px' }}>PRODUTO</th>
                        <th style={{ padding: '6px', textAlign: 'center' }}>QTD</th>
                        <th style={{ padding: '6px', textAlign: 'right' }}>SUBTOTAL</th>
                        <th style={{ padding: '6px', textAlign: 'right' }}>AÇÃO</th>
                      </tr>
                    </thead>
                    <tbody>
                      {itensPedido.map((item, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                          <td style={{ padding: '6px', fontWeight: '600', color: '#0f172a' }}>{item.nome}</td>
                          <td style={{ padding: '6px', textAlign: 'center' }}>{item.quantidade}</td>
                          <td style={{ padding: '6px', textAlign: 'right', fontWeight: '600' }}>R$ {item.subtotal.toFixed(2)}</td>
                          <td style={{ padding: '6px', textAlign: 'right' }}>
                            <button
                              type="button"
                              onClick={() => removerItemPedido(idx)}
                              style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                            >
                              <FaTrash />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div style={{ marginTop: '12px', textAlign: 'right', fontSize: '15px', fontWeight: '800', color: '#0f172a' }}>
                    TOTAL: R$ {calcularTotal().toFixed(2)}
                  </div>
                </div>
              )}

              <button
                type="submit"
                style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', marginTop: '10px', fontSize: '15px' }}
              >
                {pedidoEditandoId ? 'Atualizar Pedido' : 'Finalizar Pedido'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CADASTRO RÁPIDO DE CLIENTE */}
      {modalClienteAberto && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 }}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', width: '100%', maxWidth: '400px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, color: '#0f172a' }}>Cadastro Rápido de Cliente</h3>
              <FaTimes style={{ cursor: 'pointer', color: '#64748b' }} onClick={() => setModalClienteAberto(false)} />
            </div>

            <form onSubmit={salvarNovoClienteRapido} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={labelStyle}>Nome Completo *</label>
                <input
                  type="text"
                  required
                  value={novoClienteNome}
                  onChange={e => setNovoClienteNome(e.target.value)}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Telefone / WhatsApp</label>
                <input
                  type="text"
                  placeholder="(00) 00000-0000"
                  value={novoClienteTelefone}
                  onChange={e => setNovoClienteTelefone(e.target.value)}
                  style={inputStyle}
                />
              </div>

              <button
                type="submit"
                style={{ background: '#16a34a', color: '#fff', border: 'none', padding: '10px', borderRadius: '6px', fontWeight: '700', cursor: 'pointer', marginTop: '6px' }}
              >
                Salvar e Selecionar
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL HELPER TECLA H */}
      {modalAjudaAberto && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10001 }}>
          <div style={{ background: '#fff', padding: '28px', borderRadius: '14px', width: '100%', maxWidth: '500px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
              <h3 style={{ margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FaKeyboard style={{ color: '#2563eb' }} /> Atalhos e Dicas de Uso
              </h3>
              <FaTimes style={{ cursor: 'pointer', color: '#64748b' }} onClick={() => setModalAjudaAberto(false)} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', color: '#334155' }}>
              <div><strong>[H]</strong> - Abre / fecha este menu de ajuda rápido em qualquer momento.</div>
              <div><strong>Busca Rápida</strong> - Digite o nome do cliente ou o número do pedido na barra superior para filtrar instantaneamente.</div>
              <div><strong>Autocomplete de Clientes</strong> - Ao criar um pedido, digite parte do nome para buscar ou clique em <em>+ Novo</em> para cadastrar na hora.</div>
              <div><strong>Filtro de Status</strong> - Escolha exibir apenas pendentes para agilizar o atendimento no balcão.</div>
            </div>

            <button
              onClick={() => setModalAjudaAberto(false)}
              style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '10px', borderRadius: '6px', fontWeight: '700', cursor: 'pointer', width: '100%', marginTop: '20px' }}
            >
              Entendi!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}