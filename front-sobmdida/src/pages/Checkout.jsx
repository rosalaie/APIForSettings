import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaInfoCircle } from 'react-icons/fa';

function Checkout() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [carregando, setCarregando] = useState(false);
  const navigate = useNavigate();

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
        cpf: cpf.replace(/\D/g, '')
      }
    };

    try {
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
    <div style={{ backgroundColor: '#f9fafb', minHeight: '100vh', fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif' }}>
      
      {/* Cabeçalho Padronizado - Azul Escuro e Vermelho */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 40px', backgroundColor: '#0f172a', borderBottom: '4px solid #e11d48' }}>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <h1 style={{ color: '#e11d48', margin: 0, fontSize: '26px', fontWeight: '900', letterSpacing: '-1px' }}>SOBMDIDA</h1>
        </Link>
        <nav style={{ display: 'flex', gap: '25px', fontWeight: '600', fontSize: '15px' }}>
          <Link to="/" style={{ color: '#fff', textDecoration: 'none' }}>Catálogo De Itens</Link>
          <Link to="/carrinho" style={{ color: '#fff', textDecoration: 'none' }}>Seu Pedido</Link>
          <Link to="/contato" style={{ color: '#fff', textDecoration: 'none' }}>Nosso Contato</Link>
          <Link to="/login" style={{ color: '#fff', textDecoration: 'none' }}>Sua Conta</Link>
        </nav>
      </header>

      <main style={{ padding: '40px', maxWidth: '500px', margin: '40px auto', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #eaeaea', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
        <h2 style={{ fontSize: '24px', color: '#0f172a', marginBottom: '20px' }}>Finalizar Pedido</h2>
        
        <div style={{ backgroundColor: '#f8fafc', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #e2e8f0' }}>
          <p style={{ margin: '0 0 5px 0', color: '#64748b', fontSize: '14px', fontWeight: '600' }}>Total a pagar:</p>
          <h3 style={{ margin: 0, fontSize: '24px', color: '#e11d48', fontWeight: '900' }}>R$ {valorTotal.toFixed(2).replace('.', ',')}</h3>
        </div>

        <form onSubmit={handlePagamento} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          <div>
            <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '5px' }}>
              Nome Completo
              <FaInfoCircle style={{ color: '#64748b', cursor: 'help' }} title="Insira o seu nome completo conforme consta no seu documento de identificação." />
            </label>
            <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} required style={{ width: '95%', padding: '12px', marginTop: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }} />
          </div>
          
          <div>
            <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '5px' }}>
              E-mail
              <FaInfoCircle style={{ color: '#64748b', cursor: 'help' }} title="Utilize o e-mail onde deseja receber as notificações sobre o estado do seu pedido." />
            </label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '95%', padding: '12px', marginTop: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }} />
          </div>
          
          <div>
            <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '5px' }}>
              CPF
              <FaInfoCircle style={{ color: '#64748b', cursor: 'help' }} title="Introduza apenas os números do seu CPF, sem pontos ou traços." />
            </label>
            <input type="text" value={cpf} onChange={(e) => setCpf(e.target.value)} required placeholder="Ex: 12345678900" style={{ width: '95%', padding: '12px', marginTop: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }} />
          </div>
          
          {/* Botão mantido verde para indicar sucesso/confirmação financeira */}
          <button type="submit" disabled={carregando} style={{ backgroundColor: carregando ? '#94a3b8' : '#16a34a', color: '#fff', padding: '16px', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: carregando ? 'not-allowed' : 'pointer', marginTop: '10px', fontSize: '16px', transition: '0.2s' }}>
            {carregando ? 'A processar...' : 'Confirmar Pagamento'}
          </button>
        </form>
      </main>
    </div>
  );
}

export default Checkout;