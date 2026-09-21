import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function CadastrarProduto() {
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [preco, setPreco] = useState('');
  const [estoque, setEstoque] = useState(''); 
  const [imagemUrl, setImagemUrl] = useState(''); 
  const [mensagem, setMensagem] = useState('');

  const salvarProduto = async (e) => {
    e.preventDefault();
    setMensagem('Salvando...');

    try {
      // Aponta para a rota da sua API na porta 3000
      await axios.post('http://localhost:3000/products', {
        nome: nome,
        descricao: descricao,
        preco: parseFloat(preco.replace(',', '.')), // Converte vírgula para ponto
        estoque: parseInt(estoque), // Garante que seja número inteiro
        imagemUrl: imagemUrl,
        categoriaId: 1 // Usando ID 1 fixo temporariamente para testes
      });
      
      setMensagem('✅ Produto cadastrado com sucesso!');
      // Limpa os campos após o sucesso
      setNome(''); setDescricao(''); setPreco(''); setEstoque(''); setImagemUrl(''); 
    } catch (erro) {
      console.error("Erro ao salvar:", erro);
      setMensagem('❌ Erro ao cadastrar. Verifique se o backend está ligado e se a categoria 1 existe no banco.');
    }
  };

  return (
    <div style={{ backgroundColor: '#f9fafb', minHeight: '100vh', fontFamily: 'Segoe UI, sans-serif' }}>
      
      {/* Cabeçalho Administrativo */}
      <header style={{ display: 'flex', justifyContent: 'space-between', padding: '20px 40px', backgroundColor: '#fff', borderBottom: '1px solid #eaeaea' }}>
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '900' }}>SOBMDIDA</h1>
        <span style={{ fontWeight: 'bold', color: '#555' }}>👕 Área Administrativa</span>
      </header>

      <main style={{ padding: '40px', maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ backgroundColor: '#fff', padding: '40px', borderRadius: '12px', border: '1px solid #eaeaea', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
          <h2 style={{ marginBottom: '20px', color: '#111' }}>Cadastrar Novo Produto</h2>
          
          <form onSubmit={salvarProduto} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '5px' }}>Nome do Produto</label>
              <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} required style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }} placeholder="Ex: Caneca Personalizada" />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '5px' }}>Descrição</label>
              <textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} rows="3" style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }} placeholder="Detalhes do material, tamanho, etc." />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '5px' }}>Preço Base (R$)</label>
                <input type="text" value={preco} onChange={(e) => setPreco(e.target.value)} required style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }} placeholder="Ex: 45,90" />
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '5px' }}>Estoque Inicial</label>
                <input type="number" value={estoque} onChange={(e) => setEstoque(e.target.value)} required style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }} placeholder="Ex: 50" />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '5px' }}>Link da Imagem (URL)</label>
              <input type="text" value={imagemUrl} onChange={(e) => setImagemUrl(e.target.value)} required style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }} placeholder="https://..." />
            </div>

            <button type="submit" style={{ marginTop: '15px', backgroundColor: '#000', color: '#fff', padding: '12px', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
              Salvar Produto
            </button>
            
            {mensagem && <p style={{ textAlign: 'center', marginTop: '10px', fontWeight: 'bold', color: mensagem.includes('❌') ? 'red' : 'green' }}>{mensagem}</p>}
          </form>

          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <Link to="/" style={{ color: '#0284c7', textDecoration: 'none', fontSize: '14px', fontWeight: 'bold' }}>
              ⬅ Voltar para a Vitrine (Ver produtos)
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export default CadastrarProduto;