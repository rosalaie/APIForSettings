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
// 1. ROTAS DE AUTENTICAÇÃO & USUÁRIOS (Sprint 1)
// ==========================================

// Rota de registro (Geral / Clientes)
app.post('/register', async (req, res) => {
  try {
    const { nome, sobrenome, email, cpf, telefone, endereco, senha } = req.body;

    if (!nome || !email || !senha || !cpf) {
      return res.status(400).json({ error: 'Nome, E-mail, CPF e Senha são obrigatórios.' });
    }

    const salt = await bcrypt.genSalt(10);
    const senhaCriptografada = await bcrypt.hash(senha, salt);

    const novoUsuario = await prisma.users.create({
      data: {
        nome,
        sobrenome,
        email,
        cpf,
        telefone,
        endereco,
        senha: senhaCriptografada,
        role: 'CLIENT'
      }
    });

    res.status(201).json({ message: 'Usuário cadastrado com sucesso!', id: novoUsuario.id });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Este e-mail ou CPF já está cadastrado.' });
    }
    console.error(error);
    res.status(500).json({ error: 'Erro ao cadastrar usuário.' });
  }
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

// Listar clientes para o Dashboard
app.get('/users', async (req, res) => {
  try {
    const clientes = await prisma.users.findMany({
      where: { role: 'CLIENT' },
      select: { id: true, nome: true, email: true, role: true }
    });
    res.json(clientes);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar clientes.' });
  }
});


// ==========================================
// 2. ROTAS DE PRODUTOS (Sprint 2 - Atualizado)
// ==========================================

// Listar todos os produtos (Incluindo os dados da categoria vinculada)
app.get('/products', async (req, res) => {
  try {
    const produtos = await prisma.products.findMany({
      include: {
        categoria: true // Faz o Prisma trazer o objeto da categoria automaticamente
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

// Cadastrar um novo produto ligado a uma categoria
app.post('/products', async (req, res) => {
  try {
    const { nome, descricao, preco, estoque, imagemUrl, categoriaId } = req.body;

    // Validação estrita exigindo a categoria na hora de cadastrar
    if (!nome || preco === undefined || estoque === undefined || !categoriaId) {
      return res.status(400).json({ error: 'Nome, preço, estoque e categoria são obrigatórios.' });
    }

    const novoProduto = await prisma.products.create({
      data: {
        nome,
        descricao,
        preco: parseFloat(preco),
        estoque: parseInt(estoque),
        imagemUrl,
        categoriaId: parseInt(categoriaId) // Salva o ID que veio da caixa de seleção do front
      }
    });
    res.status(201).json(novoProduto);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao cadastrar o produto.' });
  }
});

// Editar um produto existente (Aceitando alteração de categoria)
app.put('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, descricao, preco, estoque, imagemUrl, categoriaId } = req.body;

    const produtoAtualizado = await prisma.products.update({
      where: { id: Number(id) },
      data: {
        nome,
        descricao,
        preco: preco !== undefined ? parseFloat(preco) : undefined,
        estoque: estoque !== undefined ? parseInt(estoque) : undefined,
        imagemUrl,
        categoriaId: categoriaId !== undefined ? parseInt(categoriaId) : undefined
      }
    });
    res.json(produtoAtualizado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao atualizar produto.' });
  }
});

// Deletar um produto
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
// 3. ROTAS DE CATEGORIAS (Nova Seção)
// ==========================================

// Listar todas as categorias em ordem alfabética
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

// Cadastrar uma nova categoria
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

// Deletar uma categoria por ID
app.delete('/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.categories.delete({
      where: { id: Number(id) }
    });

    res.json({ message: 'Categoria excluída com sucesso!' });
  } catch (error) {
    console.error(error);
    // Se falhar porque há produtos amarrados nela, o Prisma gera uma restrição de chave estrangeira
    res.status(500).json({ 
      error: 'Não é possível excluir esta categoria pois existem produtos associados a ela.' 
    });
  }
});


// Inicialização do Servidor
app.listen(3000, () => {
  console.log('Servidor rodando liso na porta 3000')
})