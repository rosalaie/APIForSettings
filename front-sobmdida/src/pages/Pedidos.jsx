import React, { useState, useEffect } from 'react';
import { FaPlus, FaSearch, FaTrash, FaEdit, FaTimes, FaShoppingCart, FaUser } from 'react-icons/fa';

export default function Pedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [busca, setBusca] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [modalClienteAberto, setModalClienteAberto] = useState(false);
  const [pedidoEditando, setPedidoEditando] = useState(null);

  // Form State - Pedido
  const [clienteId, setClienteId] = useState('');
  const [clienteNome, setClienteNome] = useState('');
  const [origem, setOrigem] = useState('BALCÃO');
  const [status, setStatus] = useState('Pendente');
  const [itensPedido, setItensPedido] = useState([]);

  // Form State - Seleção temporária de produto
  const [produtoSelecionadoId, setProdutoSelecionadoId] = useState('');
  const [quantidadeTemp, setQuantidadeTemp] = useState(1);

  // Form State - Cadastro Rápido de Cliente
  const [novoClienteNome, setNovoClienteNome] = useState('');
  const [novoClienteTelefone, setNovoClienteTelefone] = useState('');

  // Função auxiliar para extrair texto/nome do cliente com segurança
  const formatarNomeCliente = (clienteData) => {
    if (!clienteData) return 'Cliente não informado';
    if (typeof clienteData === 'string') return clienteData;
    if (typeof clienteData === 'object') {
      return clienteData.nome || clienteData.name || clienteData.email || 'Cliente não informado';
    }
    return String(clienteData);
  };

  const carregarDados = async () => {
    try {
      setLoading(true);

      const resPedidos = await fetch('http://localhost:3000/orders').catch(() => null);
      if (resPedidos && resPedidos.ok) {
        const dataPedidos = await resPedidos.json();
        setPedidos(Array.isArray(dataPedidos) ? dataPedidos : []);
      }

      const resClientes = await fetch('http://localhost:3000/users').catch(() => null);
      if (resClientes && resClientes.ok) {
        const dataClientes = await resClientes.json();
        setClientes(Array.isArray(dataClientes) ? dataClientes : dataClientes.users || []);
      }

      const resProdutos = await fetch('http://localhost:3000/products').catch(() => null);
      if (resProdutos && resProdutos.ok) {
        const dataProdutos = await resProdutos.json();
        setProdutos(Array.isArray(dataProdutos) ? dataProdutos : dataProdutos.products || []);
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

  const limparFormulario = () => {
    setClienteId('');
    setClienteNome('');
    setOrigem('BALCÃO');
    setStatus('Pendente');
    setItensPedido([]);
    setProdutoSelecionadoId('');
    setQuantidadeTemp(1);
    setPedidoEditando(null);
  };

  const abrirModalNovo = () => {
    limparFormulario();
    setModalAberto(true);
  };

  const abrirModalEditar = (pedido) => {
    setPedidoEditando(pedido);
    
    if (pedido.clienteId) {
      setClienteId(pedido.clienteId);
    } else if (typeof pedido.cliente === 'object' && pedido.cliente?.id) {
      setClienteId(pedido.cliente.id);
    } else {
      setClienteId('');
    }

    setClienteNome(formatarNomeCliente(pedido.cliente || pedido.clienteNome));
    setOrigem(pedido.origem || 'BALCÃO');
    setStatus(pedido.status || 'Pendente');
    setItensPedido(pedido.itens || pedido.products || []);
    setModalAberto(true);
  };

  const handleClienteSelect = (e) => {
    const id = e.target.value;
    setClienteId(id);
    const clienteEncontrado = clientes.find(c => String(c.id) === String(id));
    if (clienteEncontrado) {
      setClienteNome(clienteEncontrado.nome || clienteEncontrado.name || '');
    } else {
      setClienteNome('');
    }
  };

  const salvarNovoClienteRapido = async (e) => {
    e.preventDefault();
    if (!novoClienteNome || !novoClienteTelefone) {
      alert('Preencha Nome e Telefone do cliente.');
      return;
    }

    try {
      const res = await fetch('http://localhost:3000/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: novoClienteNome, telefone: novoClienteTelefone })
      });

      if (res.ok) {
        const clienteCriado = await res.json();
        alert('Cliente cadastrado com sucesso!');
        setNovoClienteNome('');
        setNovoClienteTelefone('');
        setModalClienteAberto(false);
        await carregarDados();
        
        if (clienteCriado && clienteCriado.id) {
          setClienteId(clienteCriado.id);
          setClienteNome(clienteCriado.nome || novoClienteNome);
        }
      } else {
        alert('Erro ao cadastrar cliente.');
      }
    } catch (err) {
      alert('Erro de conexão com o servidor.');
    }
  };

  const adicionarProdutoAoPedido = () => {
    if (!produtoSelecionadoId) {
      alert('Selecione um produto da lista.');
      return;
    }

    const prod = produtos.find(p => String(p.id) === String(produtoSelecionadoId));
    if (!prod) return;

    const qtd = parseInt(quantidadeTemp, 10) || 1;
    const precoUnitario = parseFloat(prod.preco || prod.price || 0);

    const itemExistenteIndex = itensPedido.findIndex(i => String(i.produtoId) === String(prod.id));

    if (itemExistenteIndex >= 0) {
      const novosItens = [...itensPedido];
      novosItens[itemExistenteIndex].quantidade += qtd;
      novosItens[itemExistenteIndex].subtotal = novosItens[itemExistenteIndex].quantidade * precoUnitario;
      setItensPedido(novosItens);
    } else {
      setItensPedido([
        ...itensPedido,
        {
          produtoId: prod.id,
          nome: prod.nome || prod.name,
          preco: precoUnitario,
          quantidade: qtd,
          subtotal: precoUnitario * qtd
        }
      ]);
    }

    setProdutoSelecionadoId('');
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

    if (!clienteNome) {
      alert('Por favor, selecione um cliente cadastrado.');
      return;
    }

    if (itensPedido.length === 0) {
      alert('Adicione pelo menos um produto ao pedido.');
      return;
    }

    const payload = {
      clienteId,
      cliente: clienteNome,
      clienteNome,
      origem,
      status,
      itens: itensPedido,
      total: calcularTotal(),
      data: new Date().toISOString()
    };

    try {
      const isEdicao = !!pedidoEditando;
      const url = isEdicao 
        ? `http://localhost:3000/orders/${pedidoEditando.id}` 
        : 'http://localhost:3000/orders';
      const method = isEdicao ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert(isEdicao ? 'Pedido atualizado com sucesso!' : 'Pedido realizado com sucesso!');
        setModalAberto(false);
        limparFormulario();
        carregarDados();
      } else {
        alert('Erro ao salvar o pedido.');
      }
    } catch (err) {
      alert('Erro de conexão ao salvar pedido.');
    }
  };

  const excluirPedido = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este pedido?')) return;
    try {
      const res = await fetch(`http://localhost:3000/orders/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setPedidos(pedidos.filter(p => p.id !== id));
      }
    } catch (err) {
      alert('Erro ao excluir pedido.');
    }
  };

  const pedidosFiltrados = pedidos.filter(p => {
    const nomeCli = formatarNomeCliente(p.cliente || p.clienteNome).toLowerCase();
    const termo = busca.toLowerCase();
    return nomeCli.includes(termo) || String(p.id).includes(termo);
  });

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
          <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Gestão de Pedidos</h2>
          <p style={{ color: '#64748b', fontSize: '14px', margin: '4px 0 0 0' }}>Acompanhe e gerencie as vendas realizadas.</p>
        </div>
        <button
          onClick={abrirModalNovo}
          style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <FaPlus style={{ fontSize: '12px' }} /> Novo Pedido
        </button>
      </div>

      {/* CARD PRINCIPAL */}
      <div style={{ background: '#fff', padding: '24px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', border: '1px solid #cbd5e1', padding: '10px 14px', borderRadius: '8px', marginBottom: '20px' }}>
          <FaSearch style={{ color: '#94a3b8', marginRight: '10px' }} />
          <input
            type="text"
            placeholder="Buscar pedido por cliente ou número..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '14px' }}
          />
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', color: '#64748b', padding: '20px' }}>Carregando pedidos...</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #f1f5f9', textAlign: 'left' }}>
                <th style={{ padding: '12px 16px', fontSize: '12px', color: '#64748b' }}>CLIENTE</th>
                <th style={{ padding: '12px 16px', fontSize: '12px', color: '#64748b' }}>ORIGEM</th>
                <th style={{ padding: '12px 16px', fontSize: '12px', color: '#64748b' }}>STATUS</th>
                <th style={{ padding: '12px 16px', fontSize: '12px', color: '#64748b' }}>TOTAL</th>
                <th style={{ padding: '12px 16px', fontSize: '12px', color: '#64748b', textAlign: 'right' }}>AÇÕES</th>
              </tr>
            </thead>
            <tbody>
              {pedidosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', color: '#94a3b8', padding: '30px' }}>
                    Nenhum pedido encontrado.
                  </td>
                </tr>
              ) : (
                pedidosFiltrados.map(p => (
                  <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 16px', fontWeight: '600', color: '#0f172a' }}>
                      {formatarNomeCliente(p.cliente || p.clienteNome)}
                    </td>
                    <td style={{ padding: '14px 16px', color: '#475569', fontSize: '13px' }}>
                      <span style={{ padding: '4px 8px', borderRadius: '6px', background: '#f1f5f9', fontSize: '12px', fontWeight: '600' }}>
                        {p.origem || 'BALCÃO'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '13px' }}>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '600',
                        background: p.status === 'Concluído' ? '#dcfce7' : '#fef3c7',
                        color: p.status === 'Concluído' ? '#166534' : '#92400e'
                      }}>
                        {p.status || 'Pendente'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: '700', color: '#0f172a' }}>
                      R$ {parseFloat(p.total || 0).toFixed(2)}
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        <button
                          onClick={() => abrirModalEditar(p)}
                          title="Editar Pedido"
                          style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '8px 10px', borderRadius: '6px', cursor: 'pointer' }}
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => excluirPedido(p.id)}
                          title="Excluir Pedido"
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

      {/* MODAL CADASTRAR / EDITAR PEDIDO */}
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
            
            {/* CABEÇALHO DO MODAL */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '14px' }}>
              <h3 style={{ margin: 0, color: '#0f172a', fontSize: '18px', fontWeight: '700' }}>
                {pedidoEditando ? `Editar Pedido #${pedidoEditando.id}` : 'Novo Pedido'}
              </h3>
              <FaTimes style={{ cursor: 'pointer', color: '#64748b', fontSize: '18px' }} onClick={() => setModalAberto(false)} />
            </div>

            <form onSubmit={salvarPedido} style={{ display: 'flex', flexDirection: 'column', gap: '16px', boxSizing: 'border-box' }}>
              
              {/* DROPDOWN DE SELEÇÃO DE CLIENTE COM BOTÃO "+ NOVO" */}
              <div style={{ width: '100%', boxSizing: 'border-box' }}>
                <label style={labelStyle}>
                  Nome do Cliente <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                  <select
                    value={clienteId}
                    onChange={handleClienteSelect}
                    required
                    style={{ ...inputStyle, flex: 1, minWidth: 0, cursor: 'pointer' }}
                  >
                    <option value="">-- Selecione o cliente cadastrado --</option>
                    {clientes.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.nome || c.name} {c.telefone ? `(${c.telefone})` : ''}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setModalClienteAberto(true)}
                    style={{
                      background: '#e2e8f0',
                      color: '#0f172a',
                      border: '1px solid #cbd5e1',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <FaUser style={{ fontSize: '12px' }} /> + Novo
                  </button>
                </div>
              </div>

              {/* ORIGEM E STATUS */}
              <div style={{ display: 'flex', gap: '12px', width: '100%', boxSizing: 'border-box' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <label style={labelStyle}>Origem</label>
                  <select
                    value={origem}
                    onChange={e => setOrigem(e.target.value)}
                    style={{ ...inputStyle, cursor: 'pointer' }}
                  >
                    <option value="BALCÃO">BALCÃO</option>
                    <option value="WHATSAPP">WHATSAPP</option>
                    <option value="LOJA VIRTUAL">LOJA VIRTUAL</option>
                  </select>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <label style={labelStyle}>Status</label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value)}
                    style={{ ...inputStyle, cursor: 'pointer' }}
                  >
                    <option value="Pendente">Pendente</option>
                    <option value="Em Produção">Em Produção</option>
                    <option value="Concluído">Concluído</option>
                    <option value="Cancelado">Cancelado</option>
                  </select>
                </div>
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '4px 0' }} />

              {/* SEÇÃO DE ADICIONAR PRODUTOS */}
              <div style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FaShoppingCart style={{ color: '#2563eb' }} /> Adicionar Produtos ao Pedido
              </div>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', width: '100%', boxSizing: 'border-box' }}>
                <select
                  value={produtoSelecionadoId}
                  onChange={e => setProdutoSelecionadoId(e.target.value)}
                  style={{ ...inputStyle, flex: 1, minWidth: 0, cursor: 'pointer' }}
                >
                  <option value="">-- Selecione um produto --</option>
                  {produtos.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.nome || p.name} - R$ {parseFloat(p.preco || p.price || 0).toFixed(2)}
                    </option>
                  ))}
                </select>

                <input
                  type="number"
                  min="1"
                  value={quantidadeTemp}
                  onChange={e => setQuantidadeTemp(e.target.value)}
                  style={{ ...inputStyle, width: '70px', textAlign: 'center', flexShrink: 0 }}
                />

                <button
                  type="button"
                  onClick={adicionarProdutoAoPedido}
                  style={{
                    background: '#16a34a',
                    color: '#fff',
                    border: 'none',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    flexShrink: 0
                  }}
                >
                  + Adicionar
                </button>
              </div>

              {/* TABELA DE ITENS ADICIONADOS */}
              <div style={{ background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '12px', marginTop: '6px' }}>
                {itensPedido.length === 0 ? (
                  <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '13px', margin: '8px 0' }}>
                    Nenhum produto adicionado ainda.
                  </p>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #cbd5e1', textAlign: 'left', color: '#64748b' }}>
                        <th style={{ paddingBottom: '6px' }}>Produto</th>
                        <th style={{ paddingBottom: '6px', textAlign: 'center' }}>Qtd</th>
                        <th style={{ paddingBottom: '6px', textAlign: 'right' }}>Subtotal</th>
                        <th style={{ paddingBottom: '6px', width: '30px' }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {itensPedido.map((item, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '8px 0', fontWeight: '600', color: '#0f172a' }}>{item.nome}</td>
                          <td style={{ padding: '8px 0', textAlign: 'center', color: '#475569' }}>{item.quantidade}</td>
                          <td style={{ padding: '8px 0', textAlign: 'right', fontWeight: '600', color: '#0f172a' }}>
                            R$ {item.subtotal.toFixed(2)}
                          </td>
                          <td style={{ padding: '8px 0', textAlign: 'right' }}>
                            <FaTimes
                              style={{ color: '#ef4444', cursor: 'pointer' }}
                              onClick={() => removerItemPedido(idx)}
                              title="Remover produto"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', paddingTop: '10px', borderTop: '2px solid #cbd5e1' }}>
                  <span style={{ fontWeight: '700', color: '#0f172a', fontSize: '15px' }}>Total do Pedido:</span>
                  <span style={{ fontWeight: '800', color: '#16a34a', fontSize: '18px' }}>
                    R$ {calcularTotal().toFixed(2)}
                  </span>
                </div>
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
                  {pedidoEditando ? 'Atualizar Pedido' : 'Finalizar Pedido'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL CADASTRAR CLIENTE RÁPIDO */}
      {modalClienteAberto && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(15, 23, 42, 0.75)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: '20px',
          boxSizing: 'border-box'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '420px',
            padding: '24px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            boxSizing: 'border-box'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h4 style={{ margin: 0, color: '#0f172a', fontSize: '16px', fontWeight: '700' }}>Cadastrar Novo Cliente</h4>
              <FaTimes style={{ cursor: 'pointer', color: '#64748b' }} onClick={() => setModalClienteAberto(false)} />
            </div>

            <form onSubmit={salvarNovoClienteRapido} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={labelStyle}>Nome do Cliente *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Maria Silva"
                  value={novoClienteNome}
                  onChange={e => setNovoClienteNome(e.target.value)}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Telefone / WhatsApp *</label>
                <input
                  type="text"
                  required
                  placeholder="(42) 99999-9999"
                  value={novoClienteTelefone}
                  onChange={e => setNovoClienteTelefone(e.target.value)}
                  style={inputStyle}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setModalClienteAberto(false)}
                  style={{ background: '#e2e8f0', color: '#475569', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}
                >
                  Cadastrar e Selecionar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}