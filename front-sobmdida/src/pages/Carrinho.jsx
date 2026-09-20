import { Link } from 'react-router-dom';

// Dados fictícios do carrinho
const mockCarrinho = [
  { id: 1, nome: "Canecas Personalizadas", descricao: "Arte: Logo da Empresa", preco: 24.90, quantidade: 2, imagem: "https://via.placeholder.com/80/eaeaea/555555?text=Caneca" },
  { id: 2, nome: "Garrafa Personalizada", descricao: "Cor: Branca | Nome: João", preco: 39.90, quantidade: 1, imagem: "https://via.placeholder.com/80/eaeaea/555555?text=Garrafa" }
];

function Carrinho() {
  const subtotal = mockCarrinho.reduce((acc, item) => acc + (item.preco * item.quantidade), 0);
  const frete = 15.00;
  const total = subtotal + frete;

  return (
    <div style={{ backgroundColor: '#f9fafb', minHeight: '100vh', fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif' }}>
      
      {/* Cabeçalho do Cliente */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 40px', backgroundColor: '#fff', borderBottom: '1px solid #eaeaea' }}>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <h1 style={{ color: '#000', margin: 0, fontSize: '24px', fontWeight: '900', letterSpacing: '-1px' }}>SOBMDIDA</h1>
        </Link>
        <span style={{ color: '#555', fontWeight: '500', fontSize: '15px' }}>🛒 Meu Carrinho</span>
      </header>

      <main style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto', display: 'flex', gap: '30px', alignItems: 'flex-start' }}>
        
        {/* Lista de Itens */}
        <div style={{ flex: 2, backgroundColor: '#fff', borderRadius: '10px', padding: '25px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border: '1px solid #eaeaea' }}>
          <h2 style={{ margin: '0 0 20px 0', fontSize: '20px', color: '#111', borderBottom: '1px solid #eee', paddingBottom: '15px' }}>Itens Selecionados</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {mockCarrinho.map((item) => (
              <div key={item.id} style={{ display: 'flex', gap: '15px', alignItems: 'center', borderBottom: '1px solid #f5f5f5', paddingBottom: '15px' }}>
                <img src={item.imagem} alt={item.nome} style={{ borderRadius: '6px' }} />
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 5px 0', fontSize: '16px', color: '#222' }}>{item.nome}</h3>
                  <p style={{ margin: 0, color: '#777', fontSize: '13px' }}>{item.descricao}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button style={{ width: '28px', height: '28px', border: '1px solid #ddd', backgroundColor: '#fff', borderRadius: '4px', cursor: 'pointer' }}>-</button>
                  <span style={{ fontSize: '15px', fontWeight: '500', width: '20px', textAlign: 'center' }}>{item.quantidade}</span>
                  <button style={{ width: '28px', height: '28px', border: '1px solid #ddd', backgroundColor: '#fff', borderRadius: '4px', cursor: 'pointer' }}>+</button>
                </div>
                <div style={{ width: '100px', textAlign: 'right', fontWeight: 'bold', color: '#111', fontSize: '16px' }}>
                  R$ {(item.preco * item.quantidade).toFixed(2).replace('.', ',')}
                </div>
                <button style={{ border: 'none', backgroundColor: 'transparent', color: '#d32f2f', cursor: 'pointer', fontSize: '18px' }}>🗑️</button>
              </div>
            ))}
          </div>
          
          <Link to="/" style={{ display: 'inline-block', marginTop: '20px', color: '#0284c7', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>
            ← Continuar Comprando
          </Link>
        </div>

        {/* Resumo do Pedido */}
        <div style={{ flex: 1, backgroundColor: '#fff', borderRadius: '10px', padding: '25px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border: '1px solid #eaeaea' }}>
          <h2 style={{ margin: '0 0 20px 0', fontSize: '18px', color: '#111' }}>Resumo do Pedido</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', color: '#555', borderBottom: '1px solid #eee', paddingBottom: '15px', marginBottom: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Subtotal ({mockCarrinho.length} itens)</span>
              <span>R$ {subtotal.toFixed(2).replace('.', ',')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Frete (Fixo)</span>
              <span>R$ {frete.toFixed(2).replace('.', ',')}</span>
            </div>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
            <span style={{ fontSize: '16px', fontWeight: '600', color: '#111' }}>Total</span>
            <span style={{ fontSize: '22px', fontWeight: '900', color: '#c62828' }}>R$ {total.toFixed(2).replace('.', ',')}</span>
          </div>

          <button style={{ width: '100%', backgroundColor: '#27ae60', color: '#fff', border: 'none', padding: '14px', borderRadius: '8px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer' }}>
            Finalizar Pedido ✅
          </button>
        </div>

      </main>
    </div>
  );
}

export default Carrinho;