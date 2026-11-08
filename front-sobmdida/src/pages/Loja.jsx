// frontend/src/pages/Loja.jsx
import { useEffect, useState } from 'react';
import { FaWhatsapp, FaSearch, FaBoxOpen } from 'react-icons/fa';
import { Link } from 'react-router-dom';

export default function Loja() {
  const [produtos, setProdutos] = useState([]);
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const [busca, setBusca] = useState('');
  const [loading, setLoading] = useState(true);

  const TELEFONE_WHATSAPP = '5542988381309';

  // Trata corretamente a URL sem modificar se já for um link externo (ImgBB)
  const obterUrlImagem = (url) => {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url; // Link direto do ImgBB
    }
    return `http://localhost:3000${url.startsWith('/') ? '' : '/'}${url}`;
  };

  async function carregarProdutos() {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:3000/products');
      const data = await res.json();
      setProdutos(Array.isArray(data) ? data : []);
      if (Array.isArray(data) && data.length > 0) {
        setProdutoSelecionado(data[0]);
      }
    } catch (err) {
      console.error('Erro ao buscar produtos da loja:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarProdutos();
  }, []);

  const produtosFiltrados = produtos.filter(p =>
    p.nome.toLowerCase().includes(busca.toLowerCase()) ||
    (p.descricao && p.descricao.toLowerCase().includes(busca.toLowerCase()))
  );

  const gerarLinkWhatsapp = (produto) => {
    const mensagem = encodeURIComponent(`Olá! Vi o produto "${produto.nome}" no catálogo SOBMDIDA no valor de R$ ${produto.preco?.toFixed(2)} e gostaria de tirar dúvidas / fazer um pedido!`);
    return `https://wa.me/${TELEFONE_WHATSAPP}?text=${mensagem}`;
  };

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      {/* TOPO DA LOJA */}
      <header style={{
        background: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        padding: '15px 40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
          <h1 style={{ color: '#d97706', fontSize: '26px', fontWeight: '800', margin: 0, letterSpacing: '0.5px' }}>
            SOB<span style={{ color: '#1e293b' }}>MDIDA</span>
          </h1>
          <nav style={{ display: 'flex', gap: '20px', fontSize: '14px', fontWeight: '600', color: '#475569' }}>
            <span style={{ color: '#d97706', borderBottom: '2px solid #d97706', paddingBottom: '4px' }}>Nosso Catálogo</span>
            <span style={{ color: '#94a3b8', cursor: 'not-allowed' }}>Nosso Contato</span>
          </nav>
        </div>

        <Link to="/" style={{ fontSize: '13px', color: '#3b82f6', textDecoration: 'none', fontWeight: '600' }}>
          ← Acessar Painel Admin
        </Link>
      </header>

      {/* CONTEÚDO PRINCIPAL */}
      <div style={{ maxWidth: '1280px', margin: '30px auto', padding: '0 20px' }}>
        
        {/* PESQUISA */}
        <div style={{ marginBottom: '25px', display: 'flex', gap: '15px', alignItems: 'center' }}>
          <div style={{
            position: 'relative',
            width: '320px',
            background: '#fff',
            borderRadius: '8px',
            border: '1px solid #cbd5e1'
          }}>
            <FaSearch style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Buscar produto..."
              value={busca}
              onChange={e => setBusca(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 10px 10px 38px',
                border: 'none',
                borderRadius: '8px',
                outline: 'none',
                fontSize: '14px'
              }}
            />
          </div>
        </div>

        {/* LISTAGEM E PAINEL */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '25px', alignItems: 'start' }}>
          
          <div>
            {loading ? (
              <p style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Carregando catálogo de produtos...</p>
            ) : produtosFiltrados.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <FaBoxOpen style={{ fontSize: '40px', color: '#cbd5e1', marginBottom: '10px' }} />
                <p style={{ color: '#64748b', margin: 0 }}>Nenhum produto encontrado no catálogo.</p>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                gap: '20px'
              }}>
                {produtosFiltrados.map(prod => {
                  const imgUrl = obterUrlImagem(prod.imagemUrl);
                  return (
                    <div
                      key={prod.id}
                      onClick={() => setProdutoSelecionado(prod)}
                      style={{
                        background: '#fff',
                        borderRadius: '12px',
                        border: produtoSelecionado?.id === prod.id ? '2px solid #d97706' : '1px solid #e2e8f0',
                        padding: '15px',
                        textAlign: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
                      }}
                    >
                      {/* FOTO DO PRODUTO (IMGBB) */}
                      <div style={{
                        height: '160px',
                        background: '#f1f5f9',
                        borderRadius: '8px',
                        marginBottom: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden'
                      }}>
                        {imgUrl ? (
                          <img
                            src={imgUrl}
                            alt={prod.nome}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          <FaBoxOpen style={{ fontSize: '32px', color: '#cbd5e1' }} />
                        )}
                      </div>

                      <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#1e293b', margin: '0 0 6px 0', textTransform: 'capitalize' }}>
                        {prod.nome}
                      </h3>
                      
                      <p style={{ fontSize: '16px', fontWeight: '800', color: '#b91c1c', margin: '0 0 12px 0' }}>
                        R$ {prod.preco ? prod.preco.toFixed(2) : '0.00'}
                      </p>

                      <a
                        href={gerarLinkWhatsapp(prod)}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          background: '#25D366',
                          color: '#fff',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          textDecoration: 'none',
                          fontSize: '13px',
                          fontWeight: 'bold'
                        }}
                      >
                        <FaWhatsapp style={{ fontSize: '16px' }} /> Chama no Whats
                      </a>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* PAINEL LATERAL DE DETALHES */}
          {produtoSelecionado ? (
            <div style={{
              background: '#fff',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              padding: '20px',
              position: 'sticky',
              top: '90px'
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b', marginBottom: '15px', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                Detalhes do Produto
              </h3>

              <div style={{
                height: '200px',
                background: '#f8fafc',
                borderRadius: '8px',
                marginBottom: '15px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden'
              }}>
                {produtoSelecionado.imagemUrl ? (
                  <img
                    src={obterUrlImagem(produtoSelecionado.imagemUrl)}
                    alt={produtoSelecionado.nome}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <FaBoxOpen style={{ fontSize: '48px', color: '#cbd5e1' }} />
                )}
              </div>

              <h2 style={{ fontSize: '18px', color: '#0f172a', margin: '0 0 8px 0' }}>{produtoSelecionado.nome}</h2>
              <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#b91c1c', margin: '0 0 15px 0' }}>
                R$ {produtoSelecionado.preco?.toFixed(2)}
              </p>

              {produtoSelecionado.descricao && (
                <div style={{ marginBottom: '15px', background: '#f8fafc', padding: '10px', borderRadius: '6px', fontSize: '13px', color: '#475569' }}>
                  <strong>Descrição:</strong><br />
                  {produtoSelecionado.descricao}
                </div>
              )}

              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '12px', borderRadius: '8px', fontSize: '12px', color: '#991b1b', marginBottom: '15px' }}>
                ℹ️ <strong>Personalize do seu jeito!</strong><br />
                Chame a gente no WhatsApp para acertar os detalhes do produto e o envio da sua arte.
              </div>

              <a
                href={gerarLinkWhatsapp(produtoSelecionado)}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  background: '#25D366',
                  color: '#fff',
                  width: '100%',
                  padding: '12px 0',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  textAlign: 'center'
                }}
              >
                <FaWhatsapp style={{ fontSize: '18px' }} /> Pedir pelo WhatsApp
              </a>
            </div>
          ) : (
            <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', textAlign: 'center', color: '#94a3b8' }}>
              Selecione um produto para ver os detalhes
            </div>
          )}

        </div>
      </div>
    </div>
  );
}