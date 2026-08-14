import React, { useState, useEffect } from 'react';
import { FaPlus, FaSearch, FaTrash, FaEdit, FaTimes } from 'react-icons/fa';

export default function Pedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [busca, setBusca] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [pedidoEditando, setPedidoEditando] = useState(null);

  const [clienteNome, setClienteNome] = useState('');
  const [status, setStatus] = useState('Pendente');
  const [total, setTotal] = useState('');
  const [origem, setOrigem] = useState('BALCAO');

  const carregarPedidos = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:3000/orders');
      if (res.ok) {
        const data = await res.json();
        setPedidos(data);
      }
    } catch (err) {
      console.error("Erro ao carregar pedidos", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarPedidos();
  }, []);

  const abrirModalEditar = (pedido) => {
    setPedidoEditando(pedido);
    setClienteNome(pedido.clienteNome || pedido.cliente || '');
    setStatus(pedido.status || 'Pendente');
    setTotal(pedido.total || '');
    setOrigem(pedido.origem || 'BALCAO');
    setModalAberto(true);
  };

  const atualizarStatusDireto = async (pedido, novoStatus) => {
    try {
      const res = await fetch(`http://localhost:3000/orders/${pedido.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...pedido, status: novoStatus })
      });
      if (res.ok) {
        setPedidos(pedidos.map(p => p.id === pedido.id ? { ...p, status: novoStatus } : p));
      }
    } catch (err) {
      alert('Erro ao atualizar status.');
    }
  };

  const salvarPedido = async (e) => {
    e.preventDefault();
    const payload = {
      clienteNome,
      status,
      total: Number(total),
      origem
    };

    try {
      if (pedidoEditando) {
        const res = await fetch(`http://localhost:3000/orders/${pedidoEditando.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) alert('Pedido atualizado com sucesso!');
      }
      setModalAberto(false);
      carregarPedidos();
    } catch (err) {
      alert('Erro ao salvar pedido.');
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

  const pedidosFiltrados = pedidos.filter(p =>
    (p.clienteNome || p.cliente || '').toLowerCase().includes(busca.toLowerCase()) ||
    (p.origem || '').toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Gestão de Pedidos</h2>
          <p style={{ color: '#64748b', fontSize: '14px', margin: '4px 0 0 0' }}>Acompanhe vendas presenciais do balcão e pedidos do e-commerce.</p>
        </div>
      </div>

      <div style={{ background: '#fff', padding: '24px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', border: '1px solid #cbd5e1', padding: '10px 14px', borderRadius: '8px', marginBottom: '20px' }}>
          <FaSearch style={{ color: '#94a3b8', marginRight: '10px' }} />
          <input
            type="text"
            placeholder="Buscar por cliente, forma de pagamento ou origem..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '14px' }}
          />
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', color: '#64748b', padding: '20px' }}>Carregando...</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #f1f5f9', textAlign: 'left' }}>
                <th style={{ padding: '12px 16px', fontSize: '12px', color: '#64748b' }}>CLIENTE</th>
                <th style={{ padding: '12px 16px', fontSize: '12px', color: '#64748b' }}>ORIGEM</th>
                <th style={{ padding: '12px 16px', fontSize: '12px', color: '#64748b' }}>TOTAL</th>
                <th style={{ padding: '12px 16px', fontSize: '12px', color: '#64748b' }}>STATUS</th>
                <th style={{ padding: '12px 16px', fontSize: '12px', color: '#64748b', textAlign: 'right' }}>AÇÕES</th>
              </tr>
            </thead>
            <tbody>
              {pedidosFiltrados.map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '14px 16px', fontWeight: '600', color: '#0f172a' }}>
                    {p.clienteNome || p.cliente || 'Cliente Balcão'}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ background: '#f1f5f9', color: '#475569', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '700' }}>
                      {p.origem || 'BALCAO'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', fontWeight: '700', color: '#16a34a' }}>
                    R$ {Number(p.total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <select
                      value={p.status || 'Pendente'}
                      onChange={(e) => atualizarStatusDireto(p, e.target.value)}
                      style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#fff' }}
                    >
                      <option value="Pendente">Pendente</option>
                      <option value="Pago">Pago</option>
                      <option value="Cancelado">Cancelado</option>
                      <option value="Entregue">Entregue</option>
                    </select>
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                      <button
                        onClick={() => abrirModalEditar(p)}
                        title="Editar Detalhes"
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
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modalAberto && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', width: '100%', maxWidth: '450px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: '#0f172a' }}>Editar Pedido #{pedidoEditando?.id}</h3>
              <FaTimes style={{ cursor: 'pointer', color: '#64748b' }} onClick={() => setModalAberto(false)} />
            </div>
            <form onSubmit={salvarPedido} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>Nome do Cliente</label>
                <input type="text" value={clienteNome} onChange={e => setClienteNome(e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>Valor Total (R$)</label>
                <input type="number" step="0.01" value={total} onChange={e => setTotal(e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>Status</label>
                <select value={status} onChange={e => setStatus(e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                  <option value="Pendente">Pendente</option>
                  <option value="Pago">Pago</option>
                  <option value="Cancelado">Cancelado</option>
                  <option value="Entregue">Entregue</option>
                </select>
              </div>
              <button type="submit" style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '10px', borderRadius: '6px', fontWeight: '700', cursor: 'pointer', marginTop: '10px' }}>
                Salvar Alterações
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}