// frontend/src/pages/Pedidos.jsx
import { useEffect, useState } from 'react';
import { FaPlus, FaSearch, FaShoppingBag, FaTrash, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

export default function Pedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [erro, setErro] = useState('');
  const [busca, setBusca] = useState('');

  // Formulário de Novo Pedido
  const [clienteId, setClienteId] = useState('');
  const [formaPagamento, setFormaPagamento] = useState('PIX');
  const [observacoes, setObservacoes] = useState('');
  const [itensPedido, setItensPedido] = useState([{ produtoId: '', quantidade: 1 }]);

  // Paginação
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 10;

  async function carregarDados() {
    try {
      setLoading(true);
      const [resPed, resCli, resProd] = await Promise.all([
        fetch('http://localhost:3000/orders'),
        fetch('http://localhost:3000/clients'),
        fetch('http://localhost:3000/products')
      ]);

      setPedidos(await resPed.json());
      setClientes(await resCli.json());
      setProdutos(await resProd.json());
    } catch (err) {
      setErro('Erro ao carregar os dados de pedidos.');
    } finally {
      setLoading(false);
    }
  }

  function adicionarItem() {
    setItensPedido([...itensPedido, { produtoId: '', quantidade: 1 }]);
  }

  function removerItem(index) {
    setItensPedido(itensPedido.filter((_, i) => i !== index));
  }

  function atualizarItem(index, campo, valor) {
    const novosItens = [...itensPedido];
    novosItens[index][campo] = valor;
    setItensPedido(novosItens);
  }

  async function handleSalvarPedido(e) {
    e.preventDefault();
    setErro('');

    if (!clienteId) return setErro('Selecione um cliente.');
    if (itensPedido.some(i => !i.produtoId || i.quantidade < 1)) {
      return setErro('Preencha os produtos e quantidades corretamente.');
    }

    try {
      const res = await fetch('http://localhost:3000/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clienteId,
          formaPagamento,
          observacoes,
          origem: 'BALCAO',
          itens: itensPedido
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao salvar pedido.');

      setMostrarForm(false);
      setItensPedido([{ produtoId: '', quantidade: 1 }]);
      carregarDados();
    } catch (err) {
      setErro(err.message);
    }
  }

  async function alterarStatus(id, novoStatus) {
    try {
      await fetch(`http://localhost:3000/orders/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: novoStatus })
      });
      carregarDados();
    } catch (err) {
      alert('Erro ao alterar status.');
    }
  }

  async function handleDeletar(id) {
    if (window.confirm('Deseja cancelar/excluir este pedido?')) {
      await fetch(`http://localhost:3000/orders/${id}`, { method: 'DELETE' });
      carregarDados();
    }
  }

  const listaPedidos = Array.isArray(pedidos) ? pedidos : [];
  const pedidosFiltrados = listaPedidos.filter(p =>
    (p.cliente?.nome && p.cliente.nome.toLowerCase().includes(busca.toLowerCase())) ||
    (p.formaPagamento && p.formaPagamento.toLowerCase().includes(busca.toLowerCase())) ||
    (p.origem && p.origem.toLowerCase().includes(busca.toLowerCase()))
  );

  const totalPaginas = Math.ceil(pedidosFiltrados.length / itensPorPagina) || 1;
  const indiceInicial = (paginaAtual - 1) * itensPorPagina;
  const pedidosPaginados = pedidosFiltrados.slice(indiceInicial, indiceInicial + itensPorPagina);

  useEffect(() => { carregarDados(); }, []);

  return (
    <>
      <div className="page-header">
        <div>
          <h2 className="page-title">Gestão de Pedidos</h2>
          <p className="page-subtitle">Acompanhe vendas presenciais do balcão e pedidos do e-commerce.</p>
        </div>
        <button className="novo-btn" onClick={() => setMostrarForm(true)}>
          <FaPlus style={{ marginRight: '8px', fontSize: '12px' }} /> Novo Pedido
        </button>
      </div>

      <div className="user-list-card">
        <div className="search-container destacado">
          <FaSearch className="search-icon-placeholder" style={{ color: '#2563eb' }} />
          <input 
            type="text" 
            className="search-input" 
            placeholder="🔍 Buscar por cliente, forma de pagamento ou origem (BALCÃO/SITE)..." 
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', padding: '20px', color: '#666' }}>Carregando pedidos...</p>
        ) : pedidosFiltrados.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
            <FaShoppingBag style={{ fontSize: '48px', marginBottom: '10px' }} />
            <p>Nenhum pedido encontrado.</p>
          </div>
        ) : (
          <>
            <table className="user-table">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Itens</th>
                  <th>Origem</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {pedidosPaginados.map(p => (
                  <tr key={p.id}>
                    <td className="user-name" style={{ fontWeight: '600' }}>
                      {p.cliente?.nome || 'Cliente não identificado'}
                      <small style={{ display: 'block', color: '#64748b', fontSize: '11px' }}>{p.formaPagamento}</small>
                    </td>
                    <td style={{ fontSize: '13px' }}>
                      {p.itens?.map(i => `${i.quantidade}x ${i.produto?.nome || 'Item'}`).join(', ')}
                    </td>
                    <td>
                      <span style={{
                        padding: '4px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold',
                        background: p.origem === 'SITE' ? '#e0f2fe' : '#f1f5f9',
                        color: p.origem === 'SITE' ? '#0284c7' : '#475569'
                      }}>
                        {p.origem || 'BALCÃO'}
                      </span>
                    </td>
                    <td style={{ color: '#10b981', fontWeight: '600' }}>
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.total)}
                    </td>
                    <td>
                      <select 
                        value={p.status} 
                        onChange={(e) => alterarStatus(p.id, e.target.value)}
                        style={{ padding: '4px 8px', borderRadius: '6px', fontSize: '12px', border: '1px solid #cbd5e1' }}
                      >
                        <option value="PENDENTE">Pendente</option>
                        <option value="PAGO">Pago</option>
                        <option value="EM_PREPARACAO">Em Preparação</option>
                        <option value="ENVIADO">Enviado</option>
                        <option value="ENTREGUE">Entregue</option>
                        <option value="CANCELADO">Cancelado</option>
                      </select>
                    </td>
                    <td className="table-actions">
                      <button className="action-btn delete" title="Excluir Pedido" onClick={() => handleDeletar(p.id)}>
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="pagination-container">
              <span className="pagination-info">
                Exibindo {indiceInicial + 1} a {Math.min(indiceInicial + itensPorPagina, pedidosFiltrados.length)} de {pedidosFiltrados.length} pedidos
              </span>
              <div className="pagination-buttons">
                <button className="page-btn" onClick={() => setPaginaAtual(prev => Math.max(prev - 1, 1))} disabled={paginaAtual === 1}>
                  <FaChevronLeft style={{ fontSize: '10px' }} />
                </button>
                <button className="page-btn" onClick={() => setPaginaAtual(prev => Math.min(prev + 1, totalPaginas))} disabled={paginaAtual === totalPaginas}>
                  <FaChevronRight style={{ fontSize: '10px' }} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* MODAL NOVO PEDIDO MANUAL */}
      {mostrarForm && (
        <div className="modal-overlay">
          <form className="modal-content" style={{ width: '600px' }} onSubmit={handleSalvarPedido}>
            <button type="button" className="modal-close-btn" onClick={() => setMostrarForm(false)}>×</button>
            <h3 className="modal-title">Lançar Novo Pedido (Balcão)</h3>

            {erro && <p style={{ color: '#ef4444', background: '#fef2f2', padding: '8px', borderRadius: '6px', fontSize: '13px' }}>{erro}</p>}

            <div className="form-group">
              <label className="form-label">Cliente *</label>
              <select className="form-input" value={clienteId} onChange={e => setClienteId(e.target.value)} required>
                <option value="">-- Selecione o Cliente --</option>
                {clientes.map(c => (
                  <option key={c.id} value={c.id}>{c.nome} ({c.telefone || c.email})</option>
                ))}
              </select>
            </div>

            <label className="form-label">Itens do Pedido *</label>
            {itensPedido.map((item, idx) => (
              <div key={idx} style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 40px', gap: '8px', marginBottom: '8px' }}>
                <select 
                  className="form-input" 
                  value={item.produtoId} 
                  onChange={e => atualizarItem(idx, 'produtoId', e.target.value)}
                  required
                >
                  <option value="">-- Produto --</option>
                  {produtos.map(prod => (
                    <option key={prod.id} value={prod.id}>{prod.nome} - R$ {prod.preco}</option>
                  ))}
                </select>

                <input 
                  type="number" 
                  min="1" 
                  className="form-input" 
                  value={item.quantidade} 
                  onChange={e => atualizarItem(idx, 'quantidade', e.target.value)}
                  required 
                />

                {itensPedido.length > 1 && (
                  <button type="button" onClick={() => removerItem(idx)} style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px' }}>×</button>
                )}
              </div>
            ))}

            <button type="button" onClick={adicionarItem} style={{ marginBottom: '15px', background: '#f1f5f9', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}>
              + Adicionar Outro Produto
            </button>

            <div className="form-group">
              <label className="form-label">Forma de Pagamento</label>
              <select className="form-input" value={formaPagamento} onChange={e => setFormaPagamento(e.target.value)}>
                <option value="PIX">PIX</option>
                <option value="Cartão de Crédito">Cartão de Crédito</option>
                <option value="Cartão de Débito">Cartão de Débito</option>
                <option value="Dinheiro">Dinheiro</option>
              </select>
            </div>

            <div className="modal-actions">
              <button type="button" className="modal-btn cancelar" onClick={() => setMostrarForm(false)}>Cancelar</button>
              <button type="submit" className="modal-btn salvar">Finalizar Pedido</button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}