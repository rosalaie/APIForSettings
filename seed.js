// seed.js - Execute com: node seed.js
const http = require('http');

const API_URL = 'http://localhost:3000';

function postJSON(url, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const parsedUrl = new URL(url);
    
    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || 3000,
      path: parsedUrl.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    };

    const req = http.request(options, (res) => {
      let responseBody = '';
      res.on('data', (chunk) => responseBody += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(responseBody);
          resolve({ ok: res.statusCode >= 200 && res.statusCode < 300, status: res.statusCode, json: () => Promise.resolve(json) });
        } catch (e) {
          resolve({ ok: res.statusCode >= 200 && res.statusCode < 300, status: res.statusCode, json: () => Promise.resolve({}) });
        }
      });
    });

    req.on('error', (err) => reject(err));
    req.write(data);
    req.end();
  });
}

// 1. CATEGORIAS REALISTAS
const categorias = [
  { nome: 'Canecas e Xícaras', descricao: 'Canecas cerâmicas e térmicas personalizadas' },
  { nome: 'Copos e Garrafas', descricao: 'Copos Stanley, garrafas térmicas e Squeeze' },
  { nome: 'Decoração e Casa', descricao: 'Quadros, vasos e itens de decoração sob medida' },
  { nome: 'Cozinha e Utensílios', descricao: 'Kits de utensílios, tábuas de corte e potes' },
  { nome: 'Papelaria e Escritório', descricao: 'Cadernos, organizadores de mesa e pranchetas' },
  { nome: 'Textil e Vestuário', descricao: 'Camisetas, aventais e bolsas ecobags' },
  { nome: 'Acessórios Pessoais', descricao: 'Chaveiros, carteiras e necessaires' },
  { nome: 'Linha Gourmet', descricao: 'Acessórios para churrasco e petisqueiras' },
];

// URLs REAIS DE IMAGENS DO UNSPLASH (Sem bloqueio de CORS)
const imagensUnsplash = [
  'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1577937927133-66ef06acdf18?w=500&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?w=500&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1612196808214-b7e239e5f6b7?w=500&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=500&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=500&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1555244162-803834f70033?w=500&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1572119865084-43c285814d63?w=500&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop'
];

const produtosBase = [
  { nome: 'Caneca Cerâmica Black Matte 350ml', preco: 45.90, catIdx: 0 },
  { nome: 'Copo Térmico Inox 473ml com Tampa', preco: 89.90, catIdx: 1 },
  { nome: 'Garrafa Térmica Pacco 800ml', preco: 129.00, catIdx: 1 },
  { nome: 'Tábua de Corte Bamboo Personalizada', preco: 75.00, catIdx: 3 },
  { nome: 'Vaso Cerâmico Minimalista Nude', preco: 62.50, catIdx: 2 },
  { nome: 'Planner Semanal de Mesa A4', preco: 34.90, catIdx: 4 },
  { nome: 'Avental Profissional em Jeans e Couro', preco: 98.00, catIdx: 5 },
  { nome: 'Kit Churrasco Inox 3 Peças com Estojo', preco: 149.90, catIdx: 7 }
];

const gerar50Produtos = () => {
  const lista = [];
  const adjetivos = ['Premium', 'Vintage', 'Artesanal', 'Edição Especial', 'Compacto', 'Executive', 'Eco-Friendly'];
  
  for (let i = 1; i <= 50; i++) {
    const base = produtosBase[(i - 1) % produtosBase.length];
    const adj = adjetivos[i % adjetivos.length];
    const imgUrl = imagensUnsplash[(i - 1) % imagensUnsplash.length];

    lista.push({
      nome: `${base.nome} ${adj} v${i}`,
      preco: parseFloat((base.preco + (i * 1.5)).toFixed(2)),
      categoriaId: base.catIdx,
      descricao: `${base.nome} de alta qualidade. Ideal para uso diário ou presente. Fabricação própria sob medida.`,
      imagem: imgUrl,
      foto: imgUrl, // Envia nos dois campos para garantir compatibilidade com o backend
      estoque: 10 + (i * 2)
    });
  }
  return lista;
};

// 3. BASE DE DADOS PARA CLIENTES
const nomes = ['Lucas', 'Beatriz', 'Gabriel', 'Mariana', 'Matheus', 'Camila', 'Rodrigo', 'Juliana', 'Fernando', 'Amanda', 'Guilherme', 'Larissa', 'Thiago', 'Fernanda', 'Bruno'];
const sobrenomes = ['Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Almeida', 'Pereira', 'Lima', 'Gomes', 'Costa', 'Ribeiro', 'Martins', 'Carvalho'];
const cidades = [
  { cidade: 'Curitiba', uf: 'PR', cep: '80010-000' },
  { cidade: 'Arapongas', uf: 'PR', cep: '86700-050' },
  { cidade: 'São Paulo', uf: 'SP', cep: '01001-000' },
  { cidade: 'Florianópolis', uf: 'SC', cep: '88010-000' },
  { cidade: 'Belo Horizonte', uf: 'MG', cep: '30110-000' }
];

const gerar50Clientes = () => {
  const lista = [];
  for (let i = 1; i <= 50; i++) {
    const n = nomes[i % nomes.length];
    const s = sobrenomes[(i * 2) % sobrenomes.length];
    const loc = cidades[i % cidades.length];
    const nomeCompleto = `${n} ${s}`;
    const emailStr = `${n.toLowerCase()}.${s.toLowerCase()}${i}@email.com`;
    
    lista.push({
      nome: nomeCompleto,
      email: emailStr,
      telefone: `(42) 999${String(i).padStart(2, '0')}-4411`,
      cep: loc.cep,
      rua: `Rua das Flores`,
      numero: `${100 + i}`,
      bairro: 'Centro',
      cidade: loc.cidade,
      uf: loc.uf,
      endereco: `Rua das Flores, Nº ${100 + i}, Bairro: Centro, ${loc.cidade}/${loc.uf}, CEP: ${loc.cep}`,
      origem: 'BALCAO'
    });
  }
  return lista;
};

// EXECUÇÃO DO SEED
async function rodarSeed() {
  console.log('🚀 Iniciando povoamento do banco de dados com imagens...\n');

  try {
    // A. Cadastrar Categorias
    console.log('📦 Cadastrando Categorias...');
    const catIds = [];
    for (const cat of categorias) {
      const res = await postJSON(`${API_URL}/categories`, cat);
      const data = await res.json();
      if (res.ok && data.id) catIds.push(data.id);
    }
    console.log(`✅ ${catIds.length} Categorias cadastradas!`);

    // B. Cadastrar Produtos
    console.log('\n🏷️ Cadastrando 50 Produtos...');
    const produtos = gerar50Produtos();
    const prodIds = [];
    for (let i = 0; i < produtos.length; i++) {
      const p = produtos[i];
      p.categoriaId = catIds[i % catIds.length] || null;
      
      const res = await postJSON(`${API_URL}/products`, p);
      const data = await res.json();
      if (res.ok && data.id) prodIds.push(data.id);
    }
    console.log(`✅ ${prodIds.length} Produtos cadastrados!`);

    // C. Cadastrar Clientes
    console.log('\n👥 Cadastrando 50 Clientes...');
    const clientes = gerar50Clientes();
    const clientIds = [];
    for (const c of clientes) {
      const res = await postJSON(`${API_URL}/register`, c);
      const data = await res.json();
      if (res.ok && (data.id || data.user?.id)) {
        clientIds.push(data.id || data.user.id);
      }
    }
    console.log(`✅ ${clientIds.length} Clientes cadastrados!`);

    // D. Cadastrar Pedidos
    console.log('\n🛒 Gerando 50 Pedidos...');
    let pedidosSucesso = 0;
    for (let i = 0; i < 50; i++) {
      const clientId = clientIds[i % clientIds.length];
      const prodId = prodIds[i % prodIds.length];

      const payloadPedido = {
        clienteId: clientId,
        itens: [
          { produtoId: prodId, quantidade: (i % 3) + 1, precoUnitario: 49.90 }
        ],
        total: (49.90 * ((i % 3) + 1)),
        formaPagamento: i % 2 === 0 ? 'PIX' : 'CARTAO',
        status: i % 3 === 0 ? 'CONCLUIDO' : 'PENDENTE'
      };

      const res = await postJSON(`${API_URL}/orders`, payloadPedido);
      if (res.ok) pedidosSucesso++;
    }
    console.log(`✅ ${pedidosSucesso} Pedidos gerados!`);

    console.log('\n🎉 BANCO DE DADOS POPULADO COM IMAGENS COM SUCESSO!');

  } catch (err) {
    console.error('❌ Erro durante o seed:', err.message);
  }
}

rodarSeed();