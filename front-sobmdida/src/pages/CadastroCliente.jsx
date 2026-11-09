import { Link } from 'react-router-dom';
import { FaInfoCircle } from 'react-icons/fa';

function CadastroCliente() {
  return (
    <div style={{ backgroundColor: '#f9fafb', minHeight: '100vh', fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif' }}>
      
      {/* Cabeçalho Padronizado */}
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

      {/* Área do Formulário */}
      <main style={{ display: 'flex', justifyContent: 'center', padding: '40px 20px' }}>
        <div style={{ backgroundColor: '#fff', padding: '40px 50px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border: '1px solid #eaeaea', width: '100%', maxWidth: '750px' }}>
          
          <form style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
            
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#0f172a', marginBottom: '8px' }}>Nome</label>
              <input type="text" style={{ padding: '10px 15px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px', outline: 'none' }} />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#0f172a', marginBottom: '8px' }}>Sobrenome</label>
              <input type="text" style={{ padding: '10px 15px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px', outline: 'none' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#0f172a', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                CPF
                <FaInfoCircle style={{ color: '#64748b', cursor: 'help' }} title="Digite apenas números, sem pontos ou traços." />
              </label>
              <input type="text" style={{ padding: '10px 15px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px', outline: 'none' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#0f172a', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                Endereço
                <FaInfoCircle style={{ color: '#64748b', cursor: 'help' }} title="Informe rua, número, bairro e CEP." />
              </label>
              <input type="text" style={{ padding: '10px 15px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px', outline: 'none' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#0f172a', marginBottom: '8px' }}>Login</label>
              <input type="email" style={{ padding: '10px 15px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px', outline: 'none' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#0f172a', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                Senha
                <FaInfoCircle style={{ color: '#64748b', cursor: 'help' }} title="A senha deve conter no mínimo 8 caracteres." />
              </label>
              <input type="password" style={{ padding: '10px 15px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px', outline: 'none' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#0f172a', marginBottom: '8px' }}>Confirmar Senha</label>
              <input type="password" style={{ padding: '10px 15px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px', outline: 'none' }} />
            </div>

            <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'flex-start', gap: '10px', marginTop: '10px' }}>
              <input type="checkbox" id="ofertas" style={{ marginTop: '3px', cursor: 'pointer' }} />
              <label htmlFor="ofertas" style={{ fontSize: '13px', color: '#555', cursor: 'pointer' }}>
                Quero receber alertas de ofertas do SOBMDIDA pelo meu email.
              </label>
            </div>

            <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
              <button type="button" style={{ backgroundColor: '#e11d48', color: '#fff', border: 'none', padding: '12px 35px', borderRadius: '25px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer' }}>
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