import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FaInfoCircle, FaInstagram, FaWhatsapp } from 'react-icons/fa'; 

function Home() {
  const [produtos, setProdutos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  
  // Estados para a paginação
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 10; 

  useEffect(() => {
    axios.get('http://localhost:3000/products')
      .then((resposta) => {
        // Limita a 30 produtos no total
        const limite30Produtos = Array.isArray(resposta.data) ? resposta.data.slice(0, 30) : [];
        setProdutos(limite30Produtos);
        setCarregando(false);
      })
      .catch((erro) => {
        console.error("Erro ao buscar os produtos da API:", erro);
        setCarregando(false);
      });
  }, []);

  // Lógica matemática da paginação
  const indiceUltimoItem = paginaAtual * itensPorPagina;
  const indicePrimeiroItem = indiceUltimoItem - itensPorPagina;
  const produtosAtuais = produtos.slice(indicePrimeiroItem, indiceUltimoItem);
  const totalPaginas = Math.ceil(produtos.length / itensPorPagina);

  const mudarPagina = (numero) => setPaginaAtual(numero);

  return (
    <div style={{ backgroundColor: '#fff', minHeight: '100vh', fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif', display: 'flex', flexDirection: 'column' }}>
      
      {/* Cabeçalho Ajustado - Fundo Azul, Título Vermelho, Links Brancos */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 40px', backgroundColor: '#0f172a', borderBottom: '4px solid #e11d48' }}>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <h1 style={{ color: '#e11d48', margin: 0, fontSize: '26px', fontWeight: '900', letterSpacing: '-1px' }}>SOBMDIDA</h1>
        </Link>
        
        <nav style={{ display: 'flex', gap: '25px', fontWeight: '600', fontSize: '15px' }}>
          <span style={{ color: '#fff', fontWeight: 'bold' }}>Catálogo De Itens</span>
          <Link to="/carrinho" style={{ color: '#fff', textDecoration: 'none' }}>Seu Pedido</Link>
          <Link to="/contato" style={{ color: '#fff', textDecoration: 'none' }}>Nosso Contato</Link>
          <Link to="/login" style={{ color: '#fff', textDecoration: 'none' }}>Sua Conta</Link>
        </nav>
      </header>

      {/* Vitrine de Produtos */}
      <main style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto', flexGrow: 1, width: '100%' }}>
        
        <h2 style={{ fontSize: '28px', color: '#0f172a', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          🎁 Produtos em Destaque
          <FaInfoCircle 
            style={{ color: '#64748b', cursor: 'help', fontSize: '18px' }} 
            title="Exibindo os nossos 30 produtos mais recentes e populares. Clique em 'Ver Produto' para personalizar." 
          />
        </h2>
        <p style={{ color: '#64748b', marginBottom: '40px' }}>Produtos personalizados com qualidade e carinho para momentos únicos!</p>
        
        {carregando ? (
          <p style={{ textAlign: 'center', color: '#64748b', fontSize: '18px', padding: '50px' }}>⏳ Carregando produtos do banco de dados...</p>
        ) : produtos.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #eaeaea' }}>
            <h3 style={{ color: '#0f172a' }}>Nenhum produto cadastrado ainda.</h3>
            <p style={{ color: '#64748b' }}>Acesse a Área Administrativa para adicionar itens ao catálogo.</p>
          </div>
        ) : (
          <>
            {/* Grid de Produtos */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '30px' }}>
              {produtosAtuais.map((produto) => (
                <div key={produto.id} style={{ backgroundColor: '#fff', borderRadius: '12px', overflow: 'hidden', border: '1px solid #eaeaea', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column' }}>
                  
                  <div style={{ height: '200px', backgroundColor: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                   {(produto.imagemUrl || produto.imagem) ? (
                    <img src={produto.imagemUrl || produto.imagem} alt={produto.nome} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ color: '#94a3b8' }}>Sem Imagem</span>
                    )}
                  </div>
                  
                  <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                    <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#0f172a' }}>{produto.nome}</h3>
                    <p style={{ margin: '0 0 15px 0', fontSize: '13px', color: '#64748b', height: '40px', overflow: 'hidden' }}>{produto.descricao}</p>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                         <span style={{ fontSize: '11px', color: '#64748b' }}>A partir de</span>
                         <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#e11d48' }}>
                           R$ {Number(produto.preco).toFixed(2).replace('.', ',')}
                         </span>
                      </div>
                      <Link to={`/produto/${produto.id}`} style={{ textDecoration: 'none' }}>
                        <button style={{ backgroundColor: '#e11d48', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                          Ver Produto 🔒
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Controles de Paginação */}
            {totalPaginas > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '40px' }}>
                {Array.from({ length: totalPaginas }, (_, index) => (
                  <button 
                    key={index + 1} 
                    onClick={() => mudarPagina(index + 1)}
                    style={{ 
                      padding: '10px 15px', 
                      borderRadius: '6px', 
                      border: paginaAtual === index + 1 ? 'none' : '1px solid #ddd', 
                      backgroundColor: paginaAtual === index + 1 ? '#0f172a' : '#fff', 
                      color: paginaAtual === index + 1 ? '#fff' : '#0f172a',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      transition: '0.2s'
                    }}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* Rodapé */}
      <footer id="contato" style={{ backgroundColor: '#0f172a', color: '#f8fafc', padding: '40px 20px', marginTop: '40px', borderTop: '4px solid #e11d48' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '30px' }}>
          
          <div>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '22px', fontWeight: '900', color: '#fff' }}>MJ ESTAMPARIA</h3>
            <p style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#94a3b8' }}>Produtos personalizados sob medida para você.</p>
            <p style={{ margin: 0, fontSize: '14px', color: '#94a3b8' }}>Responsável: <strong>Michely de Lara Rodrigues</strong></p>
          </div>

          <div>
            <h4 style={{ margin: '0 0 15px 0', fontSize: '16px', color: '#fff' }}>Fale Conosco</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <a href="https://www.instagram.com/m_j.estamparia" target="_blank" rel="noreferrer" style={{ color: '#94a3b8', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                <FaInstagram style={{ fontSize: '18px', color: '#e11d48' }} /> @m_j.estamparia
              </a>
              <a href="#" style={{ color: '#94a3b8', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                <FaWhatsapp style={{ fontSize: '18px', color: '#25D366' }} /> Solicite um orçamento rápido
              </a>
            </div>
          </div>

        </div>
        <div style={{ textAlign: 'center', marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #1e293b', fontSize: '12px', color: '#64748b' }}>
          &copy; {new Date().getFullYear()} SOBMDIDA & MJ Estamparia. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
}

export default Home;