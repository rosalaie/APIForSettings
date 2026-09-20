import { useState } from 'react';
import '../App.css';

// 1. DADOS FICTÍCIOS (MOCK DATA) BASEADOS NO PROTÓTIPO
const mockProdutos = [
  {
    id: 1,
    nome: "Garrafa Personalizada",
    descricao: "Garrafa de alumínio personalizada com nome, frases ou estampas exclusivas. Ideal para presentes, brindes corporativos e uso diário.",
    preco: "39,90",
    avaliacoes: 45,
    icone: "🍼", 
    imagem: "https://via.placeholder.com/300x300/eaeaea/555555?text=Foto+da+Garrafa"
  },
  {
    id: 2,
    nome: "Canecas Personalizadas",
    descricao: "Canecas de porcelana personalizadas com fotos, nomes, times, frases e artes exclusivas. Ótima opção para presentear.",
    preco: "24,90",
    avaliacoes: 128,
    icone: "☕",
    imagem: "https://via.placeholder.com/300x300/eaeaea/555555?text=Foto+da+Caneca"
  },
  {
    id: 3,
    nome: "Porta-Copos Personalizados",
    descricao: "Porta-copos em MDF personalizados para datas comemorativas, eventos, empresas e presentes especiais.",
    preco: "9,90",
    avaliacoes: 76,
    icone: "🔲",
    imagem: "https://via.placeholder.com/300x300/eaeaea/555555?text=Foto+Porta-Copos"
  },
  {
    id: 4,
    nome: "Carteiras Personalizadas",
    descricao: "Carteiras em couro sintético com gravação de nomes, logos e mensagens exclusivas. Perfeitas para brindes corporativos.",
    preco: "49,90",
    avaliacoes: 31,
    icone: "👝",
    imagem: "https://via.placeholder.com/300x300/eaeaea/555555?text=Foto+da+Carteira"
  }
];

function Home() {
  // 2. USANDO OS DADOS LOCAIS EM VEZ DO AXIOS
  const [produtos] = useState(mockProdutos);

  return (
    <div style={{ padding: '30px', fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Menu Superior idêntico ao protótipo */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #eaeaea', paddingBottom: '20px', marginBottom: '40px' }}>
        <h1 style={{ color: '#000', margin: 0, fontSize: '28px', fontWeight: '900', letterSpacing: '-1px' }}>SOBMDIDA</h1>
        <nav style={{ display: 'flex', gap: '30px', fontWeight: '600', color: '#333', fontSize: '15px' }}>
          <span style={{ cursor: 'pointer' }}>Catálogo De Itens</span>
          <span style={{ cursor: 'pointer' }}>Seu Pedido</span>
          <span style={{ cursor: 'pointer', color: '#555' }}>[Nosso Contato]</span>
          <span style={{ cursor: 'pointer', color: '#555' }}>[Sua Conta]</span>
        </nav>
      </header>

      {/* Título da Seção */}
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '26px', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ color: '#d32f2f' }}>🎁</span> Produtos em Destaque
        </h2>
        <p style={{ color: '#777', margin: 0, fontSize: '15px' }}>Produtos personalizados com qualidade e carinho para momentos únicos!</p>
      </div>

      {/* Grid de Produtos */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '25px' }}>
        {produtos.map(produto => (
          <div key={produto.id} style={{ border: '1px solid #f0f0f0', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#fff', boxShadow: '0 4px 15px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', transition: 'transform 0.2s' }}>
            
            {/* Espaço para a Imagem */}
            <div style={{ height: '220px', backgroundImage: `url(${produto.imagem})`, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>

            {/* Conteúdo do Card */}
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#222', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {produto.icone} {produto.nome}
              </h3>
              <p style={{ color: '#666', fontSize: '13px', lineHeight: '1.5', marginBottom: '15px', flexGrow: 1 }}>
                {produto.descricao}
              </p>

              {/* Avaliações (Estrelinhas) */}
              <div style={{ color: '#ffc107', fontSize: '14px', marginBottom: '20px', letterSpacing: '2px' }}>
                ★★★★★ <span style={{ color: '#999', fontSize: '12px', letterSpacing: 'normal' }}>({produto.avaliacoes})</span>
              </div>

              {/* Preço e Botão Vermelho */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                  <span style={{ fontSize: '11px', color: '#999', display: 'block', textTransform: 'uppercase', marginBottom: '2px' }}>A partir de</span>
                  <span style={{ fontWeight: '900', color: '#c62828', fontSize: '22px', letterSpacing: '-0.5px' }}>R$ {produto.preco}</span>
                </div>
                <button style={{ backgroundColor: '#c62828', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  Ver Produto 🛍️
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;