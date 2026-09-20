import { Link } from 'react-router-dom';

function CadastroCliente() {
  return (
    <div style={{ backgroundColor: '#f9fafb', minHeight: '100vh', fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif' }}>
      
      {/* Cabeçalho de Navegação */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 40px', backgroundColor: '#fff', borderBottom: '1px solid #eaeaea' }}>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <h1 style={{ color: '#000', margin: 0, fontSize: '24px', fontWeight: '900', letterSpacing: '-1px' }}>SOBMDIDA</h1>
        </Link>
        <nav style={{ display: 'flex', gap: '25px', fontWeight: '500', color: '#555', fontSize: '14px' }}>
          <Link to="/" style={{ color: '#555', textDecoration: 'none' }}>Nosso Catálogo</Link>
          <Link to="/carrinho" style={{ color: '#555', textDecoration: 'none' }}>Seus Pedidos</Link>
          <span style={{ cursor: 'pointer' }}>Nosso Contato</span>
          <span style={{ cursor: 'pointer', fontWeight: 'bold', color: '#000' }}>Sua Conta</span>
        </nav>
      </header>

      {/* Área do Formulário */}
      <main style={{ display: 'flex', justifyContent: 'center', padding: '40px 20px' }}>
        <div style={{ backgroundColor: '#fff', padding: '40px 50px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border: '1px solid #eaeaea', width: '100%', maxWidth: '750px' }}>
          
          <form style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
            
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#333', marginBottom: '8px' }}>Nome</label>
              <input type="text" style={{ padding: '10px 15px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px', outline: 'none' }} />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#333', marginBottom: '8px' }}>Sobrenome</label>
              <input type="text" style={{ padding: '10px 15px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px', outline: 'none' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#333', marginBottom: '8px' }}>CPF</label>
              <input type="text" style={{ padding: '10px 15px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px', outline: 'none' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#333', marginBottom: '8px' }}>Endereço</label>
              <input type="text" style={{ padding: '10px 15px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px', outline: 'none' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#333', marginBottom: '8px' }}>Login</label>
              <input type="email" style={{ padding: '10px 15px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px', outline: 'none' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#333', marginBottom: '8px' }}>Senha</label>
              <input type="password" style={{ padding: '10px 15px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px', outline: 'none' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#333', marginBottom: '8px' }}>Confirmar Senha</label>
              <input type="password" style={{ padding: '10px 15px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px', outline: 'none' }} />
            </div>

            {/* Checkbox */}
            <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'flex-start', gap: '10px', marginTop: '10px' }}>
              <input type="checkbox" id="ofertas" style={{ marginTop: '3px', cursor: 'pointer' }} />
              <label htmlFor="ofertas" style={{ fontSize: '13px', color: '#555', cursor: 'pointer' }}>
                Quero receber alertas de ofertas<br/>do SOBMDIDA pelo meu email.
              </label>
            </div>

            {/* Botão de Envio */}
            <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
              <button type="button" style={{ backgroundColor: '#d1d5db', color: '#000', border: 'none', padding: '12px 35px', borderRadius: '25px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer' }}>
                Criar minha conta
              </button>
            </div>

          </form>
        </div>
      </main>
    </div>
  );
}

export default CadastroCliente;