import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function Home() {
  const [produtos, setProdutos] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    // Apontando para a rota exata da API configurada pela equipe
    axios.get('http://localhost:3000/products')
      .then((resposta) => {
        setProdutos(resposta.data);
        setCarregando(false);
      })
      .catch((erro) => {
        console.error("Erro ao buscar os produtos da API:", erro);
        setCarregando(false);
      });
  }, []);

  return (
    <div style={{ backgroundColor: '#f9fafb', minHeight: '100vh', fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif' }}>
      
      {/* Cabeçalho */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 40px', backgroundColor: '#fff', borderBottom: '1px solid #eaeaea' }}>
        <h1 style={{ color: '#000', margin: 0, fontSize: '24px', fontWeight: '900', letterSpacing: '-1px' }}>SOBMDIDA</h1>
        <nav style={{ display: 'flex', gap: '25px', fontWeight: '500', color: '#555', fontSize: '14px' }}>
          <span style={{ color: '#000', fontWeight: 'bold' }}>Nosso Catálogo</span>
          <Link to="/carrinho" style={{ color: '#555', textDecoration: 'none' }}>Seus Pedidos</Link>
          <span style={{ cursor: 'pointer' }}>Nosso Contato</span>
          <Link to="/cadastro" style={{ color: '#555', textDecoration: 'none' }}>Sua Conta</Link>
        </nav>
      </header>

      {/* Vitrine de Produtos */}
      <main style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '28px', color: '#111', marginBottom: '10px' }}>🎁 Produtos em Destaque</h2>
        <p style={{ color: '#666', marginBottom: '40px' }}>Produtos personalizados com qualidade e carinho para momentos únicos!</p>
        
        {carregando ? (
          <p style={{ textAlign: 'center', color: '#555', fontSize: '18px', padding: '50px' }}>⏳ Carregando produtos do banco de dados...</p>
        ) : produtos.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #eaeaea' }}>
            <h3 style={{ color: '#333' }}>Nenhum produto cadastrado ainda.</h3>
            <p style={{ color: '#666' }}>Acesse a Área Administrativa para adicionar itens ao catálogo.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '30px' }}>
            {produtos.map((produto) => (
              <div key={produto.id} style={{ backgroundColor: '#fff', borderRadius: '12px', overflow: 'hidden', border: '1px solid #eaeaea', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                
                {/* Imagem do Produto ajustada para ler "imagemUrl" */}
                <div style={{ height: '200px', backgroundColor: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                 {(produto.imagemUrl || produto.imagem) ? (
  <img src={produto.imagemUrl || produto.imagem} alt={produto.nome} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
) : (
                    <span style={{ color: '#999' }}>Sem Imagem</span>
                  )}
                </div>
                
                {/* Detalhes do Produto */}
                <div style={{ padding: '20px' }}>
                  <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#111' }}>{produto.nome}</h3>
                  <p style={{ margin: '0 0 15px 0', fontSize: '13px', color: '#777', height: '40px', overflow: 'hidden' }}>{produto.descricao}</p>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#c62828' }}>
                      R$ {Number(produto.preco).toFixed(2).replace('.', ',')}
                    </span>
                    <Link to="/produto">
                      <button style={{ backgroundColor: '#c62828', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}>
                        Ver Produto
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default Home;