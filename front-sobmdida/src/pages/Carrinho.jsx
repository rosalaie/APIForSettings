import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaInfoCircle, FaTrash, FaShoppingCart } from 'react-icons/fa';

function Carrinho() {
  // Inicializa o carrinho vazio de forma padrão
  const [itens, setItens] = useState([]);
  const navigate = useNavigate();

  const atualizarQuantidade = (id, delta) => {
    setItens(itens.map(item => {
      if (item.id === id) {
        const novaQuantidade = item.quantidade + delta;
        return { ...item, quantidade: novaQuantidade > 0 ? novaQuantidade : 1 };
      }
      return item;
    }));
  };

  const removerItem = (id) => {
    setItens(itens.filter(item => item.id !== id));
  };

  const subtotal = itens.reduce((acc, item) => acc + (item.preco * item.quantidade), 0);
  const frete = 15.00;
  const total = subtotal > 0 ? subtotal + frete : 0;

  return (
    <div style={{ backgroundColor: '#f9fafb', minHeight: '100vh', fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif' }}>
      
      {/* Cabeçalho Padronizado */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 40px', backgroundColor: '#0f172a', borderBottom: '4px solid #e11d48' }}>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <h1 style={{ color: '#e11d48', margin: 0, fontSize: '26px', fontWeight: '900', letterSpacing: '-1px' }}>SOBMDIDA</h1>
        </Link>
        <nav style={{ display: 'flex', gap: '25px', fontWeight: '600', fontSize: '15px' }}>
          <Link to="/" style={{ color: '#fff', textDecoration: 'none' }}>Catálogo De Itens</Link>
          <span style={{ color: '#e11d48', fontWeight: 'bold' }}>Seu Pedido</span>
          <Link to="/contato" style={{ color: '#fff', textDecoration: 'none' }}>Nosso Contato</Link>
          <Link to="/login" style={{ color: '#fff', textDecoration: 'none' }}>Sua Conta</Link>
        </nav>
      </header>

      <main style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto', display: 'flex', gap: '30px', alignItems: 'flex-start' }}>
        
        {/* Lista de Itens */}
        <div style={{ flex: 2, backgroundColor: '#fff', borderRadius: '10px', padding: '25px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border: '1px solid #eaeaea' }}>
          
          <h2 style={{ margin: '0 0 20px 0', fontSize: '20px', color: '#0f172a', borderBottom: '1px solid #eee', paddingBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaShoppingCart style={{ color: '#e11d48' }} /> Itens Selecionados
            <FaInfoCircle style={{ color: '#64748b', cursor: 'help', fontSize: '16px' }} title="Utilize os botões de + e - para alterar a quantidade ou clique na lixeira para remover o item." />
          </h2>
          
          {itens.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <p style={{ color: '#64748b', fontSize: '16px', marginBottom: '20px' }}>O seu carrinho está vazio.</p>
              <Link to="/" style={{ backgroundColor: '#e11d48', color: '#fff', padding: '12px 25px', borderRadius: '6px', fontSize: '14px', fontWeight: 'bold', textDecoration: 'none' }}>
                Voltar ao Catálogo
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {itens.map((item) => (
                <div key={item.id} style={{ display: 'flex', gap: '15px', alignItems: 'center', borderBottom: '1px solid #f5f5f5', paddingBottom: '15px' }}>
                  <img src={item.imagem} alt={item.nome} style={{ borderRadius: '6px', width: '80px', height: '80px', objectFit: 'cover' }} />
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: '0 0 5px 0', fontSize: '16px', color: '#0f172a' }}>{item.nome}</h3>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '13px' }}>{item.descricao}</p>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button onClick={() => atualizarQuantidade(item.id, -1)} style={{ width: '28px', height: '28px', border: '1px solid #ddd', backgroundColor: '#fff', borderRadius: '4px', cursor: 'pointer', color: '#0f172a', fontWeight: 'bold' }}>-</button>
                    <span style={{ fontSize: '15px', fontWeight: '600', color: '#0f172a', width: '20px', textAlign: 'center' }}>{item.quantidade}</span>
                    <button onClick={() => atualizarQuantidade(item.id, 1)} style={{ width: '28px', height: '28px', border: '1px solid #ddd', backgroundColor: '#fff', borderRadius: '4px', cursor: 'pointer', color: '#0f172a', fontWeight: 'bold' }}>+</button>
                  </div>
                  
                  <div style={{ width: '100px', textAlign: 'right', fontWeight: 'bold', color: '#e11d48', fontSize: '16px' }}>
                    R$ {(item.preco * item.quantidade).toFixed(2).replace('.', ',')}
                  </div>
                  
                  <button onClick={() => removerItem(item.id)} style={{ border: 'none', backgroundColor: 'transparent', color: '#64748b', cursor: 'pointer', fontSize: '18px' }} title="Remover item">
                    <FaTrash />
                  </button>
                </div>
              ))}
            </div>
          )}
          
          {itens.length > 0 && (
            <Link to="/" style={{ display: 'inline-block', marginTop: '20px', color: '#0f172a', textDecoration: 'none', fontSize: '14px', fontWeight: '600' }}>
              ← Continuar Comprando
            </Link>
          )}
        </div>

        {/* Resumo do Pedido */}
        <div style={{ flex: 1, backgroundColor: '#fff', borderRadius: '10px', padding: '25px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border: '1px solid #eaeaea' }}>
          
          <h2 style={{ margin: '0 0 20px 0', fontSize: '18px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
            Resumo do Pedido
            <FaInfoCircle style={{ color: '#64748b', cursor: 'help', fontSize: '15px' }} title="O custo do frete é fixo para todas as entregas na região." />
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', color: '#64748b', borderBottom: '1px solid #eee', paddingBottom: '15px', marginBottom: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Subtotal ({itens.length} itens)</span>
              <span style={{ color: '#0f172a', fontWeight: '600' }}>R$ {subtotal.toFixed(2).replace('.', ',')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Frete (Fixo)</span>
              <span style={{ color: '#0f172a', fontWeight: '600' }}>R$ {frete.toFixed(2).replace('.', ',')}</span>
            </div>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
            <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#0f172a' }}>Total</span>
            <span style={{ fontSize: '22px', fontWeight: '900', color: '#e11d48' }}>R$ {total.toFixed(2).replace('.', ',')}</span>
          </div>

          <button 
            onClick={() => navigate('/checkout')} 
            style={{ 
              backgroundColor: itens.length > 0 ? '#e11d48' : '#cbd5e1', 
              color: '#fff', padding: '15px 40px', border: 'none', borderRadius: '8px', 
              fontSize: '16px', fontWeight: 'bold', cursor: itens.length > 0 ? 'pointer' : 'not-allowed', 
              width: '100%' 
            }}
            disabled={itens.length === 0}
          >
            Finalizar Pedido
          </button>
        </div>

      </main>
    </div>
  );
}

export default Carrinho;