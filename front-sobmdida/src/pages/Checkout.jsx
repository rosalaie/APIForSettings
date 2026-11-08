import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function Checkout() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [carregando, setCarregando] = useState(false);
  const navigate = useNavigate();

  // Dados simulados do carrinho para teste rápido de integração
  const valorTotal = 59.90;
  const descricaoPedido = "Pedido SobMdida - Caneca e Camiseta";

  const handlePagamento = async (e) => {
    e.preventDefault();
    setCarregando(true);

    const dadosPagamento = {
      valor: valorTotal,
      descricao: descricaoPedido,
      cliente: { 
        nome: nome, 
        email: email, 
        cpf: cpf.replace(/\D/g, '') // Envia apenas os números do CPF para o PagBank
      }
    };

    try {
      // Dispara a requisição para o seu backend Node.js
      const resposta = await fetch('http://localhost:3000/pagamento', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dadosPagamento)
      });

      const resultado = await resposta.json();

      if (resposta.ok) {
        alert('Sucesso! O pedido foi enviado para o PagBank.');
        navigate('/');
      } else {
        alert('Erro do PagBank: ' + JSON.stringify(resultado));
      }
    } catch (erro) {
      console.error("Erro na requisição:", erro);
      alert('Erro de conexão. Verifique se o Node.js está a correr na porta 3000.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#f9fafb', minHeight: '100vh', fontFamily: 'Segoe UI, sans-serif' }}>
      <header style={{ padding: '20px 40px', backgroundColor: '#fff', borderBottom: '1px solid #eaeaea', display: 'flex', justifyContent: 'space-between' }}>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '900', color: '#000' }}>SOBMDIDA</h1>
        </Link>
        <span style={{ fontWeight: 'bold', color: '#16a34a' }}>🔒 Checkout Seguro</span>
      </header>

      <main style={{ padding: '40px', maxWidth: '500px', margin: '40px auto', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #eaeaea' }}>
        <h2 style={{ fontSize: '24px', color: '#111', marginBottom: '20px' }}>Finalizar Pedido</h2>
        
        <div style={{ backgroundColor: '#f3f4f6', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
          <p style={{ margin: '0 0 5px 0', color: '#555', fontSize: '14px' }}>Total a pagar:</p>
          <h3 style={{ margin: 0, fontSize: '22px', color: '#e11d48' }}>R$ {valorTotal.toFixed(2).replace('.', ',')}</h3>
        </div>

        <form onSubmit={handlePagamento} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Nome Completo</label>
            <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} required style={{ width: '95%', padding: '10px', marginTop: '5px', borderRadius: '6px', border: '1px solid #ddd' }} />
          </div>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 'bold' }}>E-mail</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '95%', padding: '10px', marginTop: '5px', borderRadius: '6px', border: '1px solid #ddd' }} />
          </div>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 'bold' }}>CPF</label>
            <input type="text" value={cpf} onChange={(e) => setCpf(e.target.value)} required placeholder="Apenas números" style={{ width: '95%', padding: '10px', marginTop: '5px', borderRadius: '6px', border: '1px solid #ddd' }} />
          </div>
          
          <button type="submit" disabled={carregando} style={{ backgroundColor: '#16a34a', color: '#fff', padding: '15px', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px', fontSize: '16px' }}>
            {carregando ? 'A processar...' : 'Confirmar Pagamento'}
          </button>
        </form>
      </main>
    </div>
  );
}

export default Checkout;