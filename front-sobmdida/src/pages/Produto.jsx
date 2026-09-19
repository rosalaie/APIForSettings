import { Link } from 'react-router-dom';

function Produto() {
  return (
    <div style={{ backgroundColor: '#f9fafb', minHeight: '100vh', fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif' }}>
      
      {/* Cabeçalho do Cliente */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 40px', backgroundColor: '#fff', borderBottom: '1px solid #eaeaea' }}>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <h1 style={{ color: '#000', margin: 0, fontSize: '24px', fontWeight: '900', letterSpacing: '-1px' }}>SOBMDIDA</h1>
        </Link>
        <nav style={{ display: 'flex', gap: '25px', fontWeight: '500', color: '#555', fontSize: '14px' }}>
          <Link to="/" style={{ color: '#000', fontWeight: 'bold', textDecoration: 'none' }}>Nosso Catálogo</Link>
          <Link to="/carrinho" style={{ color: '#555', textDecoration: 'none' }}>Seus Pedidos</Link>
          <span style={{ cursor: 'pointer' }}>Nosso Contato</span>
          <Link to="/cadastro" style={{ color: '#555', textDecoration: 'none' }}>Sua Conta</Link>
        </nav>
      </header>

      {/* Detalhes do Produto */}
      <main style={{ padding: '40px', maxWidth: '1100px', margin: '0 auto', display: 'flex', gap: '50px', alignItems: 'flex-start' }}>
        
        {/* Coluna da Imagem */}
        <div style={{ flex: 1, backgroundColor: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border: '1px solid #eaeaea', textAlign: 'center' }}>
          <img 
            src="https://via.placeholder.com/400x400/eaeaea/555555?text=Camiseta+Malha+PV" 
            alt="Camiseta Profissional" 
            style={{ width: '100%', maxWidth: '400px', borderRadius: '8px' }} 
          />
        </div>

        {/* Coluna de Informações e Compra */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div>
            <span style={{ backgroundColor: '#e0f2fe', color: '#0284c7', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>
              Vestuário
            </span>
            <h2 style={{ margin: '15px 0 10px 0', fontSize: '28px', color: '#111' }}>Camiseta Profissional Malha PV</h2>
            <p style={{ margin: 0, color: '#666', fontSize: '15px', lineHeight: '1.6' }}>
              Malha confeccionada em 67% poliéster e 33% viscose, garantindo à peça leveza e maciez. Peça com modelagem confortável e caimento solto. Ideal para uniformes corporativos e eventos.
            </p>
          </div>

          <div style={{ fontSize: '32px', fontWeight: '900', color: '#c62828', borderBottom: '1px solid #eee', paddingBottom: '20px' }}>
            R$ 65,00
          </div>

          {/* Opções de Personalização */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#333', marginBottom: '8px' }}>Selecione o Tamanho:</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                {['P', 'M', 'G', 'GG'].map((tamanho) => (
                  <button key={tamanho} style={{ width: '40px', height: '40px', border: '1px solid #ddd', backgroundColor: '#fff', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', color: '#555' }}>
                    {tamanho}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#333', marginBottom: '8px' }}>Selecione a Cor:</label>
              <select style={{ width: '100%', padding: '12px 15px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px', outline: 'none', color: '#555' }}>
                <option>Preta</option>
                <option>Branca</option>
                <option>Cinza Mescla</option>
                <option>Azul Marinho</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#333', marginBottom: '8px' }}>Envie sua Arte (Logo/Estampa):</label>
              <div style={{ border: '1px dashed #bbb', padding: '20px', borderRadius: '6px', textAlign: 'center', backgroundColor: '#fafafa', cursor: 'pointer' }}>
                <span style={{ color: '#666', fontSize: '13px' }}>📁 Clique para anexar o arquivo (PNG, JPG ou PDF)</span>
              </div>
            </div>

          </div>

          {/* Botão de Adicionar ao Carrinho */}
          <Link to="/carrinho" style={{ textDecoration: 'none', marginTop: '10px' }}>
            <button style={{ width: '100%', backgroundColor: '#000', color: '#fff', border: 'none', padding: '16px', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
              🛒 Adicionar ao Carrinho
            </button>
          </Link>

        </div>
      </main>
    </div>
  );
}

export default Produto;