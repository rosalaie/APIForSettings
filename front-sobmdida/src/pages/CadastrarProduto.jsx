import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaInfoCircle } from 'react-icons/fa';

function CadastrarProduto() {
  const [nome, setNome] = useState('');
  const [categoria, setCategoria] = useState('');
  const [preco, setPreco] = useState('');
  const [imagem, setImagem] = useState(null);
  const navigate = useNavigate();

  const handleSalvarProduto = (e) => {
    e.preventDefault();
    // Aqui entrará a lógica do Firebase e o fetch para o backend Node.js
    console.log("Dados prontos para envio:", { nome, categoria, preco, imagem });
    alert("Formulário pronto para conectar ao banco!");
  };

  return (
    <div style={{ backgroundColor: '#f9fafb', minHeight: '100vh', fontFamily: 'Segoe UI, sans-serif' }}>
      
      {/* Cabeçalho com o Logo Corrigido */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 40px', backgroundColor: '#fff', borderBottom: '1px solid #eaeaea' }}>
        <Link to="/" style={{ textDecoration: 'none', color: '#000' }}>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '900' }}>SOBMDIDA</h1>
        </Link>
        <nav style={{ display: 'flex', gap: '20px', fontWeight: 'bold', color: '#555' }}>
          <Link to="/admin/dashboard" style={{ color: '#555', textDecoration: 'none' }}>Pedidos</Link>
          <span style={{ color: '#000' }}>Novo Produto</span>
          <Link to="/" style={{ color: '#e11d48', textDecoration: 'none' }}>Sair</Link>
        </nav>
      </header>

      {/* Formulário de Cadastro */}
      <main style={{ padding: '40px', maxWidth: '600px', margin: '40px auto', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #eaeaea', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
        <h2 style={{ fontSize: '24px', color: '#111', marginBottom: '20px' }}>Cadastrar Novo Produto</h2>
        
        <form onSubmit={handleSalvarProduto} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '5px', display: 'flex', alignItems: 'center', gap: '5px' }}>
              Nome do Produto
              <FaInfoCircle style={{ color: '#64748b', cursor: 'help' }} title="Insira um nome claro e objetivo para o catálogo." />
            </label>
            <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} required style={{ padding: '12px', borderRadius: '6px', border: '1px solid #ddd' }} placeholder="Ex: Caneca Personalizada" />
          </div>

          <div style={{ display: 'flex', gap: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              <label style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '5px' }}>Categoria</label>
              <select value={categoria} onChange={(e) => setCategoria(e.target.value)} required style={{ padding: '12px', borderRadius: '6px', border: '1px solid #ddd', backgroundColor: '#fff' }}>
                <option value="">Selecione...</option>
                <option value="Canecas">Canecas</option>
                <option value="Camisetas">Camisetas</option>
                <option value="Garrafas">Garrafas</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              <label style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '5px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                Preço Base (R$)
                <FaInfoCircle style={{ color: '#64748b', cursor: 'help' }} title="Utilize ponto para separar os cêntimos. Ex: 49.90" />
              </label>
              <input type="number" step="0.01" value={preco} onChange={(e) => setPreco(e.target.value)} required style={{ padding: '12px', borderRadius: '6px', border: '1px solid #ddd' }} placeholder="0.00" />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '5px', display: 'flex', alignItems: 'center', gap: '5px' }}>
              Imagem do Produto
              <FaInfoCircle style={{ color: '#64748b', cursor: 'help' }} title="Selecione um ficheiro de imagem com boa resolução (JPG ou PNG)." />
            </label>
            <input type="file" accept="image/*" onChange={(e) => setImagem(e.target.files[0])} required style={{ padding: '10px', border: '1px dashed #bbb', borderRadius: '6px', cursor: 'pointer' }} />
          </div>

          <button type="submit" style={{ backgroundColor: '#16a34a', color: '#fff', padding: '15px', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px', marginTop: '10px' }}>
            Salvar Produto
          </button>
        </form>
      </main>
    </div>
  );
}

export default CadastrarProduto;