import React, { useState, useEffect } from 'react';
import { FaPlus, FaTrash, FaEdit, FaTimes } from 'react-icons/fa';

export default function Categorias() {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [categoriaEditando, setCategoriaEditando] = useState(null);

  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');

  const carregarCategorias = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:3000/categories');
      if (res.ok) {
        const data = await res.json();
        setCategorias(data);
      }
    } catch (err) {
      console.error("Erro ao carregar categorias", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarCategorias();
  }, []);

  const abrirModalNova = () => {
    setCategoriaEditando(null);
    setNome('');
    setDescricao('');
    setModalAberto(true);
  };

  const abrirModalEditar = (cat) => {
    setCategoriaEditando(cat);
    setNome(cat.nome || cat.name || '');
    setDescricao(cat.descricao || cat.description || '');
    setModalAberto(true);
  };

  const salvarCategoria = async (e) => {
    e.preventDefault();
    const payload = { nome, descricao };

    try {
      if (categoriaEditando) {
        const res = await fetch(`http://localhost:3000/categories/${categoriaEditando.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) alert('Categoria atualizada com sucesso!');
      } else {
        const res = await fetch('http://localhost:3000/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) alert('Categoria cadastrada com sucesso!');
      }
      setModalAberto(false);
      carregarCategorias();
    } catch (err) {
      alert('Erro ao salvar categoria.');
    }
  };

  const excluirCategoria = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir esta categoria?')) return;
    try {
      const res = await fetch(`http://localhost:3000/categories/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setCategorias(categorias.filter(c => c.id !== id));
      }
    } catch (err) {
      alert('Erro ao excluir categoria.');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Categorias do Catálogo</h2>
          <p style={{ color: '#64748b', fontSize: '14px', margin: '4px 0 0 0' }}>Organize seus produtos por seções e tipos.</p>
        </div>
        <button
          onClick={abrirModalNova}
          style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <FaPlus /> Nova Categoria
        </button>
      </div>

      <div style={{ background: '#fff', padding: '24px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
        {loading ? (
          <p style={{ textAlign: 'center', color: '#64748b', padding: '20px' }}>Carregando...</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #f1f5f9', textAlign: 'left' }}>
                <th style={{ padding: '12px 16px', fontSize: '12px', color: '#64748b' }}>NOME DA CATEGORIA</th>
                <th style={{ padding: '12px 16px', fontSize: '12px', color: '#64748b' }}>DESCRIÇÃO</th>
                <th style={{ padding: '12px 16px', fontSize: '12px', color: '#64748b', textAlign: 'right' }}>AÇÕES</th>
              </tr>
            </thead>
            <tbody>
              {categorias.map(cat => (
                <tr key={cat.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '14px 16px', fontWeight: '600', color: '#0f172a' }}>{cat.nome || cat.name}</td>
                  <td style={{ padding: '14px 16px', color: '#64748b' }}>{cat.descricao || cat.description || 'Sem descrição'}</td>
                  <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                      <button
                        onClick={() => abrirModalEditar(cat)}
                        title="Editar Categoria"
                        style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '8px 10px', borderRadius: '6px', cursor: 'pointer' }}
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => excluirCategoria(cat.id)}
                        title="Excluir Categoria"
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
              <h3 style={{ margin: 0, color: '#0f172a' }}>{categoriaEditando ? 'Editar Categoria' : 'Nova Categoria'}</h3>
              <FaTimes style={{ cursor: 'pointer', color: '#64748b' }} onClick={() => setModalAberto(false)} />
            </div>
            <form onSubmit={salvarCategoria} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>Nome da Categoria</label>
                <input type="text" required value={nome} onChange={e => setNome(e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>Descrição</label>
                <textarea value={descricao} onChange={e => setDescricao(e.target.value)} rows="3" style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box', fontFamily: 'sans-serif' }} />
              </div>
              <button type="submit" style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '10px', borderRadius: '6px', fontWeight: '700', cursor: 'pointer', marginTop: '10px' }}>
                Salvar Categoria
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}