// backend/server.js
require('dotenv').config()
const express = require('express')
const { PrismaClient } = require('@prisma/client')
const cors = require('cors')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const app = express()
const prisma = new PrismaClient()

app.use(cors())
app.use(express.json())

const JWT_SECRET = process.env.JWT_SECRET || 'chave_secreta_super_segura'

// ==========================================
// 1. ROTAS DE AUTENTICAÇÃO & USUÁRIOS / CLIENTES
// ==========================================

// Rota de registro (Site + Balcão)
app.post('/register', async (req, res) => {
  try {
    const { 
      nome, 
      sobrenome, 
      email, 
      cpf, 
      telefone, 
      endereco, 
      rua,
      numero,
      bairro,
      cidade,
      cep,
      senha, 
      origem 
    } = req.body;

    if (!nome) {
      return res.status(400).json({ error: 'O Nome é obrigatório.' });
    }

    // Se a requisição for do site (não BALCAO), exige e-mail e senha
    if (origem !== 'BALCAO' && (!email || !senha)) {
      return res.status(400).json({ error: 'E-mail e Senha são obrigatórios para cadastro pelo site.' });
    }

    // Se não informou senha (cadastro de balcão), gera uma senha padrão
    const senhaFinal = senha || 'ClienteBalcao@123';
    const salt = await bcrypt.genSalt(10);
    const senhaCriptografada = await bcrypt.hash(senhaFinal, salt);

    // Monta o endereço completo caso venham os campos separados
    const enderecoCompleto = endereco || [rua, numero, bairro, cidade, cep].filter(Boolean).join(', ');

    const novoUsuario = await prisma.users.create({
      data: {
        nome,
        sobrenome: sobrenome || '',
        email: email || `balcao_${Date.now()}@temp.com`, // E-mail temporário se não for informado no balcão
        cpf: cpf || null,
        telefone: telefone || null,
        endereco: enderecoCompleto || null,
        senha: senhaCriptografada,
        role: 'CLIENT'
      }
    });

    res.status(201).json({ message: 'Cliente cadastrado com sucesso!', id: novoUsuario.id });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Este e-mail ou CPF já está cadastrado.' });
    }
    console.error(error);
    res.status(500).json({ error: 'Erro ao cadastrar cliente.' });
  }
});

// Alias da rota de cadastro apontando para /clients (usado no frontend)
app.post('/clients', async (req, res) => {
  req.url = '/register';
  return app._router.handle(req, res);
});

// Rota de login geral
app.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
    }

    const usuario = await prisma.users.findUnique({ where: { email } });
    if (!usuario) {
      return res.status(401).json({ error: 'E-mail ou senha incorretos.' });
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) {
      return res.status(401).json({ error: 'E-mail ou senha incorretos.' });
    }

    const token = jwt.sign(
      { id: usuario.id, role: usuario.role },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    const { senha: _, ...dadosUsuario } = usuario;
    return res.json({ user: dadosUsuario, token });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro interno no login.' });
  }
});

// Listar clientes para o Dashboard (/users e /clients)
async function buscarClientes(req, res) {
  try {
    const clientes = await prisma.users.findMany({
      where: { role: 'CLIENT' },
      select: { 
        id: true, 
        nome: true, 
        email: true, 
        cpf: true, 
        telefone: true, 
        endereco: true, 
        role: true 
      },
      orderBy: { id: 'desc' }
    });
    res.json(clientes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar clientes.' });
  }
}

app.get('/users', buscarClientes);
app.get('/clients', buscarClientes);

// Deletar cliente
async function deletarCliente(req, res) {
  try {
    const { id } = req.params;
    await prisma.users.delete({ where: { id: Number(id) } });
    res.json({ message: 'Cliente excluído com sucesso!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao tentar excluir cliente.' });
  }
}

app.delete('/users/:id', deletarCliente);
app.delete('/clients/:id', deletarCliente);


// ==========================================
// 2. ROTAS DE PRODUTOS
// ==========================================

// Listar todos os produtos
app.get('/products', async (req, res) => {
  try {
    const produtos = await prisma.products.findMany({
      include: {
        categoria: true
      },
      orderBy: { id: 'desc' }
    });
    res.json(produtos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar a lista de produtos.' });
  }
});

// Buscar produto específico por ID
app.get('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const produto = await prisma.products.findUnique({
      where: { id: Number(id) },
      include: { categoria: true }
    });
    if (!produto) return res.status(404).json({ error: 'Produto não encontrado.' });
    res.json(produto);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao obter dados do produto.' });
  }
});

// Cadastrar novo produto
// Cadastrar um novo produto (sem exigir estoque)
app.post('/products', async (req, res) => {
  try {
    const { nome, descricao, preco, estoque, imagemUrl, categoriaId } = req.body;

    // Removemos a verificação estrita do estoque
    if (!nome || preco === undefined || !categoriaId) {
      return res.status(400).json({ error: 'Nome, preço e categoria são obrigatórios.' });
    }

    const novoProduto = await prisma.products.create({
      data: {
        nome,
        descricao,
        preco: parseFloat(preco),
        estoque: estoque !== undefined ? parseInt(estoque) : 0, // Padrão 0 se não enviado
        imagemUrl,
        categoriaId: parseInt(categoriaId)
      }
    });
    res.status(201).json(novoProduto);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao cadastrar o produto.' });
  }
});

// Editar produto
app.put('/products/:id', async (req, res) => {
  const { id } = req.params;
  const { nome, descricao, preco, estoque, imagemUrl, categoriaId } = req.body;

  try {
    const produtoAtualizado = await prisma.products.update({
      where: { id: Number(id) },
      data: {
        nome,
        descricao,
        preco: parseFloat(preco),
        ...(estoque !== undefined && { estoque: parseInt(estoque) }),
        ...(imagemUrl && { imagemUrl }),
        ...(categoriaId && { categoriaId: parseInt(categoriaId) })
      }
    });

    res.json(produtoAtualizado);
  } catch (error) {
    console.error("Erro ao atualizar produto:", error);
    res.status(400).json({ error: "Não foi possível atualizar o produto." });
  }
});

// Deletar produto
app.delete('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.products.delete({ where: { id: Number(id) } });
    res.json({ message: 'Produto excluído com sucesso!' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao tentar excluir o produto.' });
  }
});


// ==========================================
// 3. ROTAS DE CATEGORIAS
// ==========================================

// Listar todas as categorias
app.get('/categories', async (req, res) => {
  try {
    const categorias = await prisma.categories.findMany({
      orderBy: { nome: 'asc' }
    });
    res.json(categorias);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar categorias.' });
  }
});

// Cadastrar nova categoria
app.post('/categories', async (req, res) => {
  try {
    const { nome, descricao } = req.body;

    if (!nome) {
      return res.status(400).json({ error: 'O nome da categoria é obrigatório.' });
    }

    const novaCategoria = await prisma.categories.create({
      data: { nome, descricao }
    });
    res.status(201).json(novaCategoria);
  } catch (error) {
    console.error(error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Esta categoria já está cadastrada.' });
    }
    res.status(500).json({ error: 'Erro ao cadastrar categoria.' });
  }
});

// Deletar categoria
app.delete('/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.categories.delete({
      where: { id: Number(id) }
    });

    res.json({ message: 'Categoria excluída com sucesso!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      error: 'Não é possível excluir esta categoria pois existem produtos associados a ela.' 
    });
  }
});

// ==========================================
// 4. ROTAS DE PEDIDOS (Sprint Pedidos)
// ==========================================

// Listar todos os pedidos
app.get('/orders', async (req, res) => {
  try {
    const pedidos = await prisma.orders.findMany({
      include: {
        cliente: { select: { id: true, nome: true, email: true, telefone: true } },
        itens: { include: { produto: { select: { id: true, nome: true } } } }
      },
      orderBy: { id: 'desc' }
    });
    res.json(pedidos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar lista de pedidos.' });
  }
});

// Criar novo pedido (Manual / Site)
app.post('/orders', async (req, res) => {
  try {
    const { clienteId, itens, formaPagamento, observacoes, origem } = req.body;

    if (!clienteId || !itens || !Array.isArray(itens) || itens.length === 0) {
      return res.status(400).json({ error: 'Selecione um cliente e ao menos um produto.' });
    }

    // Calcula o total e prepara os itens
    let totalCalculado = 0;
    const itensParaInserir = [];

    for (const item of itens) {
      const prod = await prisma.products.findUnique({ where: { id: Number(item.produtoId) } });
      if (!prod) {
        return res.status(400).json({ error: `Produto ID ${item.produtoId} não encontrado.` });
      }

      const subtotal = prod.preco * item.quantidade;
      totalCalculado += subtotal;

      itensParaInserir.push({
        produtoId: prod.id,
        quantidade: parseInt(item.quantidade),
        precoUnit: prod.preco
      });
    }

    const novoPedido = await prisma.orders.create({
      data: {
        clienteId: parseInt(clienteId),
        total: totalCalculado,
        formaPagamento: formaPagamento || 'Dinheiro',
        origem: origem || 'BALCAO',
        observacoes,
        itens: { create: itensParaInserir }
      },
      include: {
        cliente: { select: { nome: true } },
        itens: true
      }
    });

    res.status(201).json(novoPedido);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao registrar pedido.' });
  }
});

// Atualizar Status do Pedido
app.patch('/orders/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const pedidoAtualizado = await prisma.orders.update({
      where: { id: Number(id) },
      data: { status }
    });

    res.json(pedidoAtualizado);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar status do pedido.' });
  }
});

// Cancelar/Deletar Pedido
app.delete('/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.orders.delete({ where: { id: Number(id) } });
    res.json({ message: 'Pedido excluído com sucesso!' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao excluir pedido.' });
  }
});

// Inicialização do Servidor
app.listen(3000, () => {
  console.log('Servidor rodando liso na porta 3000');
});