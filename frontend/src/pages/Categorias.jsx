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
      // Tenta as rotas possíveis de listagem
      let res = await fetch('http://localhost:3000/categories').catch(() => null);
      if (!res || !res.ok) {
        res = await fetch('http://localhost:3000/category').catch(() => null);
      }
      if (!res || !res.ok) {
        res = await fetch('http://localhost:3000/categorias').catch(() => null);
      }

      if (res && res.ok) {
        const data = await res.json();
        setCategorias(Array.isArray(data) ? data : []);
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

    if (!nome.trim()) {
      alert('Por favor, informe o nome da categoria.');
      return;
    }

    const payload = { 
      nome: nome.trim(), 
      name: nome.trim(),
      descricao: descricao.trim() || undefined,
      description: descricao.trim() || undefined
    };

    try {
      let res = null;
      const catId = categoriaEditando?.id;

      if (categoriaEditando) {
        // Tenta rotas comuns de edição (singular, plural, português)
        const rotasParaTestar = [
          { url: `http://localhost:3000/categories/${catId}`, method: 'PUT' },
          { url: `http://localhost:3000/category/${catId}`, method: 'PUT' },
          { url: `http://localhost:3000/categorias/${catId}`, method: 'PUT' },
          { url: `http://localhost:3000/categories/${catId}`, method: 'PATCH' },
          { url: `http://localhost:3000/category/${catId}`, method: 'PATCH' }
        ];

        for (const rota of rotasParaTestar) {
          const tentativa = await fetch(rota.url, {
            method: rota.method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          }).catch(() => null);

          if (tentativa && tentativa.ok) {
            res = tentativa;
            break;
          }
        }
      } else {
        // Tenta rotas de criação
        const rotasCriacao = [
          'http://localhost:3000/categories',
          'http://localhost:3000/category',
          'http://localhost:3000/categorias'
        ];

        for (const url of rotasCriacao) {
          const tentativa = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          }).catch(() => null);

          if (tentativa && tentativa.ok) {
            res = tentativa;
            break;
          }
        }
      }

      if (res && res.ok) {
        alert(categoriaEditando ? 'Categoria atualizada com sucesso!' : 'Categoria cadastrada com sucesso!');
        setModalAberto(false);
        carregarCategorias();
      } else {
        alert('Erro ao salvar categoria: Rota de atualização não encontrada no backend.');
      }
    } catch (err) {
      console.error(err);
      alert('Erro de conexão ao salvar categoria.');
    }
  };

  const excluirCategoria = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir esta categoria?')) return;
    try {
      let res = await fetch(`http://localhost:3000/categories/${id}`, { method: 'DELETE' }).catch(() => null);
      if (!res || !res.ok) {
        res = await fetch(`http://localhost:3000/category/${id}`, { method: 'DELETE' }).catch(() => null);
      }
      
      if (res && res.ok) {
        setCategorias(categorias.filter(c => c.id !== id));
        alert('Categoria excluída com sucesso!');
      } else {
        alert('Erro ao excluir: A categoria pode estar vinculada a produtos.');
      }
    } catch (err) {
      alert('Erro de conexão ao excluir categoria.');
    }
  };

  return (
    <div style={{ padding: '10px' }}>
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
              {categorias.length === 0 ? (
                <tr>
                  <td colSpan="3" style={{ textAlign: 'center', color: '#94a3b8', padding: '30px' }}>
                    Nenhuma categoria cadastrada.
                  </td>
                </tr>
              ) : (
                categorias.map(cat => (
                  <tr key={cat.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 16px', fontWeight: '600', color: '#0f172a' }}>{cat.nome || cat.name}</td>
                    <td style={{ padding: '14px 16px', color: '#64748b' }}>{cat.descricao || cat.description || 'Sem descrição'}</td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        <button
                          onClick={() => abrirModalEditar(cat)}
                          title="Editar Categoria"
                          style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '8px 10px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => excluirCategoria(cat.id)}
                          title="Excluir Categoria"
                          style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '8px 10px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
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

      {modalAberto && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', width: '100%', maxWidth: '450px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
              <h3 style={{ margin: 0, color: '#0f172a', fontSize: '18px' }}>{categoriaEditando ? 'Editar Categoria' : 'Nova Categoria'}</h3>
              <FaTimes style={{ cursor: 'pointer', color: '#64748b' }} onClick={() => setModalAberto(false)} />
            </div>
            <form onSubmit={salvarCategoria} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>Nome da Categoria *</label>
                <input type="text" required value={nome} onChange={e => setNome(e.target.value)} placeholder="Ex: Canecas, Camisetas..." style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>Descrição</label>
                <textarea value={descricao} onChange={e => setDescricao(e.target.value)} rows="3" placeholder="Descrição opcional..." style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box', fontFamily: 'sans-serif' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px', borderTop: '1px solid #f1f5f9', paddingTop: '14px' }}>
                <button type="button" onClick={() => setModalAberto(false)} style={{ background: '#e2e8f0', color: '#475569', border: 'none', padding: '10px 18px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}>
                  Cancelar
                </button>
                <button type="submit" style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: '700', cursor: 'pointer' }}>
                  {categoriaEditando ? 'Salvar' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}