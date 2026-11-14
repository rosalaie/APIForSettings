require('dotenv').config();

const express = require('express');
const { PrismaClient } = require('@prisma/client');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const app = express();
const prisma = new PrismaClient();

app.use(cors());

// Guarda o corpo original para validar a assinatura dos webhooks.
app.use(express.json({
  verify: (req, res, buffer) => {
    req.rawBody = buffer.toString('utf8');
  }
}));

const JWT_SECRET = process.env.JWT_SECRET;
const PAGBANK_TOKEN = process.env.PAGBANK_TOKEN;

const PAGBANK_API_URL =
  process.env.PAGBANK_API_URL || 'https://sandbox.api.pagseguro.com';

const FRONTEND_URL = process.env.FRONTEND_URL;
const API_PUBLIC_URL = process.env.API_PUBLIC_URL;

if (!JWT_SECRET) {
  console.error('ERRO: JWT_SECRET não está configurado no arquivo .env.');
  process.exit(1);
}

// ==========================================
// 1. MIDDLEWARE DE AUTENTICAÇÃO E PERMISSÕES
// ==========================================

async function autenticarToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Acesso não autorizado. Faça login novamente.'
      });
    }

    const token = authHeader.split(' ')[1];
    const dadosToken = jwt.verify(token, JWT_SECRET);

    const usuario = await prisma.users.findUnique({
      where: { id: Number(dadosToken.id) },
      select: {
        id: true,
        role: true
      }
    });

    if (!usuario) {
      return res.status(401).json({
        error: 'Usuário não encontrado. Faça login novamente.'
      });
    }

    req.usuario = usuario;

    next();

  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Sua sessão expirou. Faça login novamente.'
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Token inválido. Faça login novamente.'
      });
    }

    console.error('Erro na autenticação:', error);

    return res.status(500).json({
      error: 'Erro ao verificar autenticação.'
    });
  }
}

function exigirRole(...rolesPermitidas) {
  return (req, res, next) => {
    if (!req.usuario || !rolesPermitidas.includes(req.usuario.role)) {
      return res.status(403).json({
        error: 'Você não tem permissão para realizar esta operação.'
      });
    }

    next();
  };
}

// ==========================================
// 2. AUTENTICAÇÃO E USUÁRIOS / CLIENTES
// ==========================================

async function criarCliente(req, res, permitirBalcao = false) {
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
      return res.status(400).json({
        error: 'O Nome é obrigatório.'
      });
    }

    if (origem === 'BALCAO' && !permitirBalcao) {
      return res.status(403).json({
        error: 'Cadastro de balcão não permitido por esta rota.'
      });
    }

    if (origem !== 'BALCAO' && (!email || !senha)) {
      return res.status(400).json({
        error: 'E-mail e Senha são obrigatórios para cadastro pelo site.'
      });
    }

    const senhaFinal = senha || 'ClienteBalcao@123';

    const salt = await bcrypt.genSalt(10);
    const senhaCriptografada = await bcrypt.hash(senhaFinal, salt);

    const enderecoCompleto =
      endereco ||
      [rua, numero, bairro, cidade, cep]
        .filter(Boolean)
        .join(', ');

    const novoUsuario = await prisma.users.create({
      data: {
        nome,
        sobrenome: sobrenome || '',
        email: email || `balcao_${Date.now()}@temp.com`,
        cpf: cpf || null,
        telefone: telefone || null,
        endereco: enderecoCompleto || null,
        senha: senhaCriptografada,
        role: 'CLIENT'
      }
    });

    return res.status(201).json({
      message: 'Cliente cadastrado com sucesso!',
      id: novoUsuario.id
    });

  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({
        error: 'Este e-mail ou CPF já está cadastrado.'
      });
    }

    console.error('Erro ao cadastrar cliente:', error);

    return res.status(500).json({
      error: 'Erro ao cadastrar cliente.'
    });
  }
}

app.post('/register', async (req, res) => {
  return criarCliente(req, res, false);
});

app.post(
  '/clients',
  autenticarToken,
  exigirRole('ADMIN'),
  async (req, res) => {
    return criarCliente(req, res, true);
  }
);

// ==========================================
// LOGIN
// ==========================================

app.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({
        error: 'E-mail e senha são obrigatórios.'
      });
    }

    const usuario = await prisma.users.findUnique({
      where: { email }
    });

    if (!usuario) {
      return res.status(401).json({
        error: 'E-mail ou senha incorretos.'
      });
    }

    const senhaValida = await bcrypt.compare(
      senha,
      usuario.senha
    );

    if (!senhaValida) {
      return res.status(401).json({
        error: 'E-mail ou senha incorretos.'
      });
    }

    const token = jwt.sign(
      {
        id: usuario.id,
        role: usuario.role
      },
      JWT_SECRET,
      {
        expiresIn: '1d'
      }
    );

    const { senha: _, ...dadosUsuario } = usuario;

    return res.json({
      user: dadosUsuario,
      token
    });

  } catch (error) {
    console.error('Erro no login:', error);

    return res.status(500).json({
      error: 'Erro interno no login.'
    });
  }
});

// ==========================================
// DADOS DA CONTA DO CLIENTE
// ==========================================

app.get(
  '/me',
  autenticarToken,
  exigirRole('CLIENT'),
  async (req, res) => {
    try {
      const usuario = await prisma.users.findUnique({
        where: { id: req.usuario.id },
        select: {
          id: true,
          nome: true,
          sobrenome: true,
          email: true,
          cpf: true,
          telefone: true,
          endereco: true,
          role: true,
          createdAt: true
        }
      });

      if (!usuario) {
        return res.status(404).json({
          error: 'Usuário não encontrado.'
        });
      }

      return res.json(usuario);

    } catch (error) {
      console.error('Erro ao consultar conta:', error);

      return res.status(500).json({
        error: 'Erro ao buscar dados da conta.'
      });
    }
  }
);

app.put(
  '/me',
  autenticarToken,
  exigirRole('CLIENT'),
  async (req, res) => {
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
        complemento,
        bairro,
        cidade,
        uf,
        cep
      } = req.body;

      const enderecoCompleto =
        endereco !== undefined
          ? endereco
          : [rua, numero, complemento, bairro, cidade, uf, cep]
              .filter(Boolean)
              .join(', ');

      const dadosAtualizacao = {};

      if (nome !== undefined) {
        if (!nome.trim()) {
          return res.status(400).json({
            error: 'O Nome não pode ficar vazio.'
          });
        }

        dadosAtualizacao.nome = nome;
      }

      if (sobrenome !== undefined) {
        dadosAtualizacao.sobrenome = sobrenome;
      }

      if (email !== undefined) {
        if (!email.trim()) {
          return res.status(400).json({
            error: 'O e-mail não pode ficar vazio.'
          });
        }

        dadosAtualizacao.email = email;
      }

      if (cpf !== undefined) {
        dadosAtualizacao.cpf = cpf || null;
      }

      if (telefone !== undefined) {
        dadosAtualizacao.telefone = telefone || null;
      }

      if (
        endereco !== undefined ||
        rua !== undefined ||
        numero !== undefined ||
        complemento !== undefined ||
        bairro !== undefined ||
        cidade !== undefined ||
        uf !== undefined ||
        cep !== undefined
      ) {
        dadosAtualizacao.endereco = enderecoCompleto || null;
      }

      const usuarioAtualizado = await prisma.users.update({
        where: { id: req.usuario.id },
        data: dadosAtualizacao,
        select: {
          id: true,
          nome: true,
          sobrenome: true,
          email: true,
          cpf: true,
          telefone: true,
          endereco: true,
          role: true,
          createdAt: true
        }
      });

      return res.json({
        message: 'Dados atualizados com sucesso!',
        user: usuarioAtualizado
      });

    } catch (error) {
      console.error('Erro ao atualizar conta:', error);

      if (error.code === 'P2002') {
        return res.status(400).json({
          error: 'Este e-mail ou CPF já está cadastrado.'
        });
      }

      return res.status(500).json({
        error: 'Erro ao atualizar os dados da conta.'
      });
    }
  }
);

// ==========================================
// PEDIDOS DO CLIENTE
// ==========================================

app.get(
  '/me/orders',
  autenticarToken,
  exigirRole('CLIENT'),
  async (req, res) => {
    try {
      const pedidos = await prisma.orders.findMany({
        where: {
          clienteId: req.usuario.id
        },
        include: {
          cliente: {
            select: {
              id: true,
              nome: true,
              email: true,
              telefone: true
            }
          },
          itens: {
            include: {
              produto: {
                select: {
                  id: true,
                  nome: true,
                  imagemUrl: true
                }
              }
            }
          }
        },
        orderBy: {
          id: 'desc'
        }
      });

      return res.json(pedidos);

    } catch (error) {
      console.error('Erro ao buscar pedidos do cliente:', error);

      return res.status(500).json({
        error: 'Erro ao buscar seus pedidos.'
      });
    }
  }
);

// ==========================================
// LISTAGEM DE CLIENTES - ADMIN
// ==========================================

async function buscarClientes(req, res) {
  try {
    const clientes = await prisma.users.findMany({
      where: {
        role: 'CLIENT'
      },
      select: {
        id: true,
        nome: true,
        email: true,
        cpf: true,
        telefone: true,
        endereco: true,
        role: true
      },
      orderBy: {
        id: 'desc'
      }
    });

    return res.json(clientes);

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: 'Erro ao buscar clientes.'
    });
  }
}

app.get(
  '/users',
  autenticarToken,
  exigirRole('ADMIN'),
  buscarClientes
);

app.get(
  '/clients',
  autenticarToken,
  exigirRole('ADMIN'),
  buscarClientes
);

// ==========================================
// EXCLUIR CLIENTE - ADMIN
// ==========================================

async function deletarCliente(req, res) {
  try {
    const id = Number(req.params.id);

    const cliente = await prisma.users.findFirst({
      where: {
        id,
        role: 'CLIENT'
      }
    });

    if (!cliente) {
      return res.status(404).json({
        error: 'Cliente não encontrado.'
      });
    }

    await prisma.users.delete({
      where: { id }
    });

    return res.json({
      message: 'Cliente excluído com sucesso!'
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: 'Erro ao tentar excluir cliente.'
    });
  }
}

app.delete(
  '/users/:id',
  autenticarToken,
  exigirRole('ADMIN'),
  deletarCliente
);

app.delete(
  '/clients/:id',
  autenticarToken,
  exigirRole('ADMIN'),
  deletarCliente
);

// ==========================================
// EDITAR CLIENTE PELO PAINEL - ADMIN
// ==========================================

app.put(
  '/clients/:id',
  autenticarToken,
  exigirRole('ADMIN'),
  async (req, res) => {
    try {
      const id = Number(req.params.id);

      const {
        nome,
        cpf,
        email,
        telefone,
        endereco,
        rua,
        numero,
        complemento,
        bairro,
        cidade,
        uf
      } = req.body;

      if (!nome) {
        return res.status(400).json({
          error: 'O Nome é obrigatório.'
        });
      }

      const enderecoCompleto =
        endereco ||
        [
          rua,
          numero,
          complemento,
          bairro,
          cidade,
          uf
        ].filter(Boolean).join(', ');

      const clienteExistente = await prisma.users.findFirst({
        where: {
          id,
          role: 'CLIENT'
        }
      });

      if (!clienteExistente) {
        return res.status(404).json({
          error: 'Cliente não encontrado.'
        });
      }

      const clienteAtualizado = await prisma.users.update({
        where: { id },
        data: {
          nome,
          ...(cpf !== undefined && { cpf: cpf || null }),
          ...(email !== undefined && { email }),
          ...(telefone !== undefined && { telefone }),
          ...(enderecoCompleto !== undefined && {
            endereco: enderecoCompleto
          })
        }
      });

      const { senha: _, ...dadosCliente } = clienteAtualizado;

      return res.json({
        message: 'Cliente atualizado com sucesso!',
        cliente: dadosCliente
      });

    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);

      if (error.code === 'P2002') {
        return res.status(400).json({
          error: 'Este e-mail ou CPF já pertence a outro cliente.'
        });
      }

      return res.status(500).json({
        error: 'Erro ao atualizar cliente no servidor.'
      });
    }
  }
);

// ==========================================
// 3. ROTAS DE PRODUTOS
// ==========================================

app.get('/products', async (req, res) => {
  try {
    const produtos = await prisma.products.findMany({
      include: {
        categoria: true
      },
      orderBy: {
        id: 'desc'
      }
    });

    return res.json(produtos);

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: 'Erro ao buscar a lista de produtos.'
    });
  }
});

app.get('/products/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);

    const produto = await prisma.products.findUnique({
      where: { id },
      include: {
        categoria: true
      }
    });

    if (!produto) {
      return res.status(404).json({
        error: 'Produto não encontrado.'
      });
    }

    return res.json(produto);

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: 'Erro ao obter dados do produto.'
    });
  }
});

app.post(
  '/products',
  autenticarToken,
  exigirRole('ADMIN'),
  async (req, res) => {
    try {
      const {
        nome,
        descricao,
        preco,
        estoque,
        imagemUrl,
        categoriaId
      } = req.body;

      if (!nome || preco === undefined || !categoriaId) {
        return res.status(400).json({
          error: 'Nome, preço e categoria são obrigatórios.'
        });
      }

      const precoConvertido = Number(preco);
      const categoriaConvertida = Number(categoriaId);

      if (
        !Number.isFinite(precoConvertido) ||
        !Number.isInteger(categoriaConvertida)
      ) {
        return res.status(400).json({
          error: 'Preço ou categoria inválidos.'
        });
      }

      const novoProduto = await prisma.products.create({
        data: {
          nome,
          descricao,
          preco: precoConvertido,
          estoque: estoque !== undefined ? parseInt(estoque, 10) : 0,
          imagemUrl,
          categoriaId: categoriaConvertida
        }
      });

      return res.status(201).json(novoProduto);

    } catch (error) {
      console.error(error);

      return res.status(500).json({
        error: 'Erro ao cadastrar o produto.'
      });
    }
  }
);

app.put(
  '/products/:id',
  autenticarToken,
  exigirRole('ADMIN'),
  async (req, res) => {
    try {
      const id = Number(req.params.id);

      const {
        nome,
        descricao,
        preco,
        estoque,
        imagemUrl,
        categoriaId
      } = req.body;

      const dadosAtualizacao = {};

      if (nome !== undefined) dadosAtualizacao.nome = nome;
      if (descricao !== undefined) dadosAtualizacao.descricao = descricao;

      if (preco !== undefined) {
        const precoConvertido = Number(preco);

        if (!Number.isFinite(precoConvertido)) {
          return res.status(400).json({
            error: 'Preço inválido.'
          });
        }

        dadosAtualizacao.preco = precoConvertido;
      }

      if (estoque !== undefined) {
        dadosAtualizacao.estoque = parseInt(estoque, 10);
      }

      if (imagemUrl !== undefined) {
        dadosAtualizacao.imagemUrl = imagemUrl;
      }

      if (categoriaId !== undefined) {
        dadosAtualizacao.categoriaId = Number(categoriaId);
      }

      const produtoAtualizado = await prisma.products.update({
        where: { id },
        data: dadosAtualizacao
      });

      return res.json(produtoAtualizado);

    } catch (error) {
      console.error('Erro ao atualizar produto:', error);

      return res.status(400).json({
        error: 'Não foi possível atualizar o produto.'
      });
    }
  }
);

app.delete(
  '/products/:id',
  autenticarToken,
  exigirRole('ADMIN'),
  async (req, res) => {
    try {
      const id = Number(req.params.id);

      await prisma.products.delete({
        where: { id }
      });

      return res.json({
        message: 'Produto excluído com sucesso!'
      });

    } catch (error) {
      console.error(error);

      return res.status(500).json({
        error: 'Erro ao tentar excluir o produto.'
      });
    }
  }
);

// ==========================================
// 4. ROTAS DE CATEGORIAS
// ==========================================

app.get('/categories', async (req, res) => {
  try {
    const categorias = await prisma.categories.findMany({
      orderBy: {
        nome: 'asc'
      }
    });

    return res.json(categorias);

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: 'Erro ao buscar categorias.'
    });
  }
});

app.post(
  '/categories',
  autenticarToken,
  exigirRole('ADMIN'),
  async (req, res) => {
    try {
      const { nome, descricao } = req.body;

      if (!nome) {
        return res.status(400).json({
          error: 'O nome da categoria é obrigatório.'
        });
      }

      const novaCategoria = await prisma.categories.create({
        data: {
          nome,
          descricao
        }
      });

      return res.status(201).json(novaCategoria);

    } catch (error) {
      console.error(error);

      if (error.code === 'P2002') {
        return res.status(400).json({
          error: 'Esta categoria já está cadastrada.'
        });
      }

      return res.status(500).json({
        error: 'Erro ao cadastrar categoria.'
      });
    }
  }
);

app.put(
  '/categories/:id',
  autenticarToken,
  exigirRole('ADMIN'),
  async (req, res) => {
    try {
      const id = Number(req.params.id);
      const { nome, descricao } = req.body;

      if (!nome) {
        return res.status(400).json({
          error: 'O nome da categoria é obrigatório.'
        });
      }

      const categoriaAtualizada = await prisma.categories.update({
        where: { id },
        data: {
          nome,
          ...(descricao !== undefined && { descricao })
        }
      });

      return res.json(categoriaAtualizada);

    } catch (error) {
      console.error('Erro ao atualizar categoria:', error);

      if (error.code === 'P2002') {
        return res.status(400).json({
          error: 'Esta categoria já está cadastrada.'
        });
      }

      return res.status(500).json({
        error: 'Não foi possível atualizar a categoria.'
      });
    }
  }
);

app.delete(
  '/categories/:id',
  autenticarToken,
  exigirRole('ADMIN'),
  async (req, res) => {
    try {
      const id = Number(req.params.id);

      await prisma.categories.delete({
        where: { id }
      });

      return res.json({
        message: 'Categoria excluída com sucesso!'
      });

    } catch (error) {
      console.error(error);

      return res.status(500).json({
        error: 'Não é possível excluir esta categoria pois existem produtos associados a ela.'
      });
    }
  }
);

// ==========================================
// 5. ROTAS DE PEDIDOS
// ==========================================

// Listar pedidos - ADMIN
app.get(
  '/orders',
  autenticarToken,
  exigirRole('ADMIN'),
  async (req, res) => {
    try {
      const pedidos = await prisma.orders.findMany({
        include: {
          cliente: {
            select: {
              id: true,
              nome: true,
              email: true,
              telefone: true
            }
          },
          itens: {
            include: {
              produto: {
                select: {
                  id: true,
                  nome: true
                }
              }
            }
          }
        },
        orderBy: {
          id: 'desc'
        }
      });

      return res.json(pedidos);

    } catch (error) {
      console.error(error);

      return res.status(500).json({
        error: 'Erro ao buscar lista de pedidos.'
      });
    }
  }
);

// Criar pedido - ADMIN ou CLIENT
app.post(
  '/orders',
  autenticarToken,
  exigirRole('ADMIN', 'CLIENT'),
  async (req, res) => {
    try {
      const {
        clienteId,
        itens,
        formaPagamento,
        observacoes,
        origem
      } = req.body;

      const clienteDoPedido =
        req.usuario.role === 'CLIENT'
          ? req.usuario.id
          : Number(clienteId);

      const origemDoPedido =
        req.usuario.role === 'CLIENT'
          ? 'SITE'
          : (origem || 'BALCAO');

      if (
        !clienteDoPedido ||
        !Array.isArray(itens) ||
        itens.length === 0
      ) {
        return res.status(400).json({
          error: 'Selecione um cliente e ao menos um produto.'
        });
      }

      if (!['BALCAO', 'SITE'].includes(origemDoPedido)) {
        return res.status(400).json({
          error: 'Origem do pedido inválida.'
        });
      }

      const cliente = await prisma.users.findUnique({
        where: {
          id: clienteDoPedido
        }
      });

      if (!cliente || cliente.role !== 'CLIENT') {
        return res.status(404).json({
          error: 'Cliente não encontrado.'
        });
      }

      let totalCalculado = 0;
      const itensParaInserir = [];

      for (const item of itens) {
        const produtoId = Number(item.produtoId);
        const quantidade = Number(item.quantidade);

        if (
          !Number.isInteger(produtoId) ||
          !Number.isInteger(quantidade) ||
          quantidade <= 0
        ) {
          return res.status(400).json({
            error: 'Produto ou quantidade inválidos.'
          });
        }

        const produto = await prisma.products.findUnique({
          where: {
            id: produtoId
          }
        });

        if (!produto) {
          return res.status(400).json({
            error: `Produto ID ${item.produtoId} não encontrado.`
          });
        }

        const subtotal = produto.preco * quantidade;

        totalCalculado += subtotal;

        itensParaInserir.push({
          produtoId: produto.id,
          quantidade,
          precoUnit: produto.preco
        });
      }

      const novoPedido = await prisma.orders.create({
        data: {
          clienteId: clienteDoPedido,
          total: totalCalculado,

          // Pedidos feitos pelo site serão pagos pelo checkout PagBank.
          formaPagamento:
            req.usuario.role === 'CLIENT'
              ? 'PagBank'
              : (formaPagamento || 'Dinheiro'),

          origem: origemDoPedido,
          observacoes,
          itens: {
            create: itensParaInserir
          }
        },
        include: {
          cliente: {
            select: {
              nome: true
            }
          },
          itens: true
        }
      });

      return res.status(201).json(novoPedido);

    } catch (error) {
      console.error('Erro ao registrar pedido:', error);

      return res.status(500).json({
        error: 'Erro ao registrar pedido.'
      });
    }
  }
);

// ==========================================
// EDITAR PEDIDO COMPLETO - ADMIN
// ==========================================

app.put(
  '/orders/:id',
  autenticarToken,
  exigirRole('ADMIN'),
  async (req, res) => {
    try {
      const id = Number(req.params.id);

      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
          error: 'ID do pedido inválido.'
        });
      }

      const {
        clienteId,
        itens,
        formaPagamento,
        observacoes,
        origem,
        status
      } = req.body;

      const pedidoExistente = await prisma.orders.findUnique({
        where: { id }
      });

      if (!pedidoExistente) {
        return res.status(404).json({
          error: 'Pedido não encontrado.'
        });
      }

      const clienteConvertido = Number(clienteId);

      if (!Number.isInteger(clienteConvertido) || clienteConvertido <= 0) {
        return res.status(400).json({
          error: 'Cliente inválido.'
        });
      }

      const cliente = await prisma.users.findFirst({
        where: {
          id: clienteConvertido,
          role: 'CLIENT'
        }
      });

      if (!cliente) {
        return res.status(404).json({
          error: 'Cliente não encontrado.'
        });
      }

      if (!Array.isArray(itens) || itens.length === 0) {
        return res.status(400).json({
          error: 'O pedido precisa conter ao menos um produto.'
        });
      }

      const statusPermitidos = [
        'PENDENTE',
        'PAGO',
        'EM_PREPARACAO',
        'ENVIADO',
        'ENTREGUE',
        'CANCELADO'
      ];

      if (
        status !== undefined &&
        !statusPermitidos.includes(status)
      ) {
        return res.status(400).json({
          error: 'Status do pedido inválido.'
        });
      }

      // Pedidos do site só podem ser marcados como pagos pelo webhook.
      if (
        status === 'PAGO' &&
        pedidoExistente.origem === 'SITE' &&
        pedidoExistente.status !== 'PAGO'
      ) {
        return res.status(400).json({
          error: 'Pedidos do site só podem ser marcados como pagos após confirmação do PagBank.'
        });
      }

      const origensPermitidas = ['BALCAO', 'SITE'];

      if (
        origem !== undefined &&
        !origensPermitidas.includes(origem)
      ) {
        return res.status(400).json({
          error: 'Origem do pedido inválida.'
        });
      }

      let totalCalculado = 0;
      const itensParaInserir = [];

      for (const item of itens) {
        const produtoId = Number(item.produtoId);
        const quantidade = Number(item.quantidade);

        if (
          !Number.isInteger(produtoId) ||
          produtoId <= 0 ||
          !Number.isInteger(quantidade) ||
          quantidade <= 0
        ) {
          return res.status(400).json({
            error: 'Produto ou quantidade inválidos.'
          });
        }

        const produto = await prisma.products.findUnique({
          where: {
            id: produtoId
          }
        });

        if (!produto) {
          return res.status(400).json({
            error: `Produto ID ${produtoId} não encontrado.`
          });
        }

        totalCalculado += produto.preco * quantidade;

        itensParaInserir.push({
          produtoId: produto.id,
          quantidade,
          precoUnit: produto.preco
        });
      }

      const pedidoAtualizado = await prisma.$transaction(async (tx) => {
        return tx.orders.update({
          where: { id },
          data: {
            clienteId: clienteConvertido,
            total: totalCalculado,

            ...(formaPagamento !== undefined && {
              formaPagamento: formaPagamento || null
            }),

            ...(observacoes !== undefined && {
              observacoes: observacoes || null
            }),

            ...(origem !== undefined && {
              origem
            }),

            ...(status !== undefined && {
              status
            }),

            itens: {
              deleteMany: {},
              create: itensParaInserir
            }
          },
          include: {
            cliente: {
              select: {
                id: true,
                nome: true,
                email: true,
                telefone: true
              }
            },
            itens: {
              include: {
                produto: {
                  select: {
                    id: true,
                    nome: true
                  }
                }
              }
            }
          }
        });
      });

      return res.json({
        message: 'Pedido atualizado com sucesso!',
        pedido: pedidoAtualizado
      });

    } catch (error) {
      console.error('Erro ao editar pedido:', error);

      if (error.code === 'P2025') {
        return res.status(404).json({
          error: 'Pedido ou registro relacionado não encontrado.'
        });
      }

      return res.status(500).json({
        error: 'Erro ao atualizar pedido.'
      });
    }
  }
);

// ==========================================
// ATUALIZAR STATUS DO PEDIDO - ADMIN
// ==========================================

app.patch(
  '/orders/:id/status',
  autenticarToken,
  exigirRole('ADMIN'),
  async (req, res) => {
    try {
      const id = Number(req.params.id);
      const { status } = req.body;

      const statusPermitidos = [
        'PENDENTE',
        'PAGO',
        'EM_PREPARACAO',
        'ENVIADO',
        'ENTREGUE',
        'CANCELADO'
      ];

      if (!statusPermitidos.includes(status)) {
        return res.status(400).json({
          error: 'Status do pedido inválido.'
        });
      }

      const pedidoExistente = await prisma.orders.findUnique({
        where: { id }
      });

      if (!pedidoExistente) {
        return res.status(404).json({
          error: 'Pedido não encontrado.'
        });
      }

      if (
        status === 'PAGO' &&
        pedidoExistente.origem === 'SITE' &&
        pedidoExistente.status !== 'PAGO'
      ) {
        return res.status(400).json({
          error: 'Pedidos do site só podem ser marcados como pagos após confirmação do PagBank.'
        });
      }

      const pedidoAtualizado = await prisma.orders.update({
        where: { id },
        data: { status }
      });

      return res.json(pedidoAtualizado);

    } catch (error) {
      console.error(error);

      return res.status(500).json({
        error: 'Erro ao atualizar status do pedido.'
      });
    }
  }
);

// ==========================================
// EXCLUIR PEDIDO - ADMIN
// ==========================================

app.delete(
  '/orders/:id',
  autenticarToken,
  exigirRole('ADMIN'),
  async (req, res) => {
    try {
      const id = Number(req.params.id);

      await prisma.orders.delete({
        where: { id }
      });

      return res.json({
        message: 'Pedido excluído com sucesso!'
      });

    } catch (error) {
      console.error(error);

      return res.status(500).json({
        error: 'Erro ao excluir pedido.'
      });
    }
  }
);

// ==========================================
// 6. PAGBANK - CRIAR CHECKOUT
// ==========================================

app.post(
  '/pagamento',
  autenticarToken,
  exigirRole('CLIENT', 'ADMIN'),
  async (req, res) => {
    try {
      const pedidoId = Number(req.body.pedidoId);

      if (!Number.isInteger(pedidoId) || pedidoId <= 0) {
        return res.status(400).json({
          erro: 'Informe um ID de pedido válido.'
        });
      }

      if (!PAGBANK_TOKEN) {
        return res.status(500).json({
          erro: 'Token do PagBank não configurado no servidor.'
        });
      }

      if (!FRONTEND_URL || !API_PUBLIC_URL) {
        return res.status(500).json({
          erro: 'Configure FRONTEND_URL e API_PUBLIC_URL no ambiente do servidor.'
        });
      }

      const pedido = await prisma.orders.findUnique({
        where: {
          id: pedidoId
        },
        include: {
          cliente: true,
          itens: {
            include: {
              produto: true
            }
          }
        }
      });

      if (!pedido) {
        return res.status(404).json({
          erro: 'Pedido não encontrado.'
        });
      }

      // O cliente só pode pagar os próprios pedidos.
      if (
        req.usuario.role === 'CLIENT' &&
        pedido.clienteId !== req.usuario.id
      ) {
        return res.status(403).json({
          erro: 'Você não tem permissão para pagar este pedido.'
        });
      }

      if (pedido.origem !== 'SITE') {
        return res.status(400).json({
          erro: 'O checkout PagBank está disponível somente para pedidos do site.'
        });
      }

      if (pedido.status !== 'PENDENTE') {
        return res.status(400).json({
          erro: 'Este pedido não está pendente de pagamento.'
        });
      }

      if (!pedido.itens || pedido.itens.length === 0) {
        return res.status(400).json({
          erro: 'O pedido não possui produtos.'
        });
      }

      // Evita criar vários checkouts para o mesmo pedido.
      if (
        pedido.pagbankCheckoutId &&
        pedido.pagbankCheckoutUrl &&
        pedido.pagbankPaymentStatus === 'WAITING'
      ) {
        return res.json({
          sucesso: true,
          pedidoId: pedido.id,
          checkoutId: pedido.pagbankCheckoutId,
          checkoutUrl: pedido.pagbankCheckoutUrl,
          reutilizado: true
        });
      }

      if (pedido.pagbankPaymentStatus === 'PAID') {
        return res.status(400).json({
          erro: 'Este pedido já possui pagamento confirmado.'
        });
      }

      const dadosCliente = pedido.cliente;

      if (
        !dadosCliente ||
        !dadosCliente.nome ||
        !dadosCliente.email
      ) {
        return res.status(400).json({
          erro: 'O cadastro do cliente precisa ter nome e e-mail.'
        });
      }

      // O valor é calculado exclusivamente com os dados do banco.
      const itensPagBank = pedido.itens.map((item) => ({
        reference_id: String(item.produtoId),
        name: item.produto.nome.substring(0, 100),
        quantity: item.quantidade,
        unit_amount: Math.round(item.precoUnit * 100)
      }));

      const totalEmCentavos = itensPagBank.reduce(
        (total, item) => total + item.unit_amount * item.quantity,
        0
      );

      if (totalEmCentavos <= 0) {
        return res.status(400).json({
          erro: 'O valor do pedido é inválido.'
        });
      }

      const urlFrontend = FRONTEND_URL.replace(/\/$/, '');
      const urlBackend = API_PUBLIC_URL.replace(/\/$/, '');

      const urlRetorno =
        `${urlFrontend}/checkout/retorno?pedido=${pedido.id}`;

      const urlWebhook =
        `${urlBackend}/webhooks/pagbank`;

      const dadosCheckout = {
        reference_id: `PEDIDO-${pedido.id}`,

        customer_modifiable: true,

        customer: {
          name: `${dadosCliente.nome} ${dadosCliente.sobrenome || ''}`.trim(),
          email: dadosCliente.email,
          ...(dadosCliente.cpf && {
            tax_id: dadosCliente.cpf.replace(/\D/g, '')
          })
        },

        items: itensPagBank,

        payment_methods: [
          {
            type: 'CREDIT_CARD'
          },
          {
            type: 'PIX'
          }
        ],

        redirect_url: urlRetorno,
        return_url: urlRetorno,
        redirect_waiting_time: 10,

        notification_urls: [
          urlWebhook
        ],

        payment_notification_urls: [
          urlWebhook
        ]
      };

      const response = await fetch(
        `${PAGBANK_API_URL.replace(/\/$/, '')}/checkouts`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${PAGBANK_TOKEN}`,
            'Content-Type': 'application/json',
            Accept: 'application/json'
          },
          body: JSON.stringify(dadosCheckout)
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error('Erro do PagBank ao criar checkout:', data);

        return res.status(400).json({
          sucesso: false,
          erro: data
        });
      }

      const linkPagamento = data.links?.find(
        (link) => link.rel === 'PAY'
      );

      if (!data.id || !linkPagamento?.href) {
        console.error('Resposta inesperada do PagBank:', data);

        return res.status(502).json({
          erro: 'O PagBank não retornou o identificador e o link do checkout.'
        });
      }

      const pedidoAtualizado = await prisma.orders.update({
        where: {
          id: pedido.id
        },
        data: {
          pagbankCheckoutId: data.id,
          pagbankCheckoutUrl: linkPagamento.href,
          pagbankPaymentStatus: 'WAITING',
          formaPagamento: 'PagBank'
        }
      });

      return res.status(201).json({
        sucesso: true,
        pedidoId: pedidoAtualizado.id,
        checkoutId: data.id,
        checkoutUrl: linkPagamento.href,
        total: totalEmCentavos / 100
      });

    } catch (error) {
      console.error('Erro ao criar checkout PagBank:', error);

      return res.status(500).json({
        erro: 'Falha ao criar checkout de pagamento.'
      });
    }
  }
);

// ==========================================
// 7. WEBHOOK PAGBANK
// ==========================================

// O PagBank chama esta rota sem autenticação JWT.
// A autenticidade é validada pela assinatura SHA-256.
app.post(
  '/webhooks/pagbank',
  async (req, res) => {
    try {
      if (!PAGBANK_TOKEN) {
        console.error('Token PagBank não configurado para validar webhook.');

        return res.status(500).json({
          erro: 'Configuração de webhook indisponível.'
        });
      }

      const assinaturaRecebida =
        req.headers['x-authenticity-token'];

      if (!assinaturaRecebida || !req.rawBody) {
        return res.status(401).json({
          erro: 'Assinatura ou conteúdo da notificação ausente.'
        });
      }

      const assinaturaEsperada = crypto
        .createHash('sha256')
        .update(`${PAGBANK_TOKEN}-${req.rawBody}`)
        .digest('hex');

      const assinaturaRecebidaBuffer = Buffer.from(
        String(assinaturaRecebida).toLowerCase(),
        'hex'
      );

      const assinaturaEsperadaBuffer = Buffer.from(
        assinaturaEsperada,
        'hex'
      );

      if (
        assinaturaRecebidaBuffer.length !== assinaturaEsperadaBuffer.length ||
        !crypto.timingSafeEqual(
          assinaturaRecebidaBuffer,
          assinaturaEsperadaBuffer
        )
      ) {
        console.error('Webhook PagBank rejeitado: assinatura inválida.');

        return res.status(401).json({
          erro: 'Notificação não autenticada.'
        });
      }

      const notificacao = req.body;

      // O checkout usa PEDIDO-ID como referência interna.
      const referencia = String(notificacao.reference_id || '');

      const correspondencia = referencia.match(/^PEDIDO-(\d+)$/);

      let pedido = null;

      if (correspondencia) {
        pedido = await prisma.orders.findUnique({
          where: {
            id: Number(correspondencia[1])
          }
        });
      }

      // Também permite localizar notificações de checkout pelo ID.
      if (!pedido && notificacao.id) {
        pedido = await prisma.orders.findFirst({
          where: {
            pagbankCheckoutId: String(notificacao.id)
          }
        });
      }

      if (!pedido) {
        console.error(
          'Webhook PagBank recebido sem pedido correspondente:',
          notificacao.reference_id,
          notificacao.id
        );

        // Responde 200 para evitar repetição indefinida de evento
        // que não corresponde a um pedido conhecido.
        return res.status(200).json({
          recebido: true,
          processado: false
        });
      }

      const statusCobrancas = Array.isArray(notificacao.charges)
        ? notificacao.charges.map((cobranca) => cobranca.status)
        : [];

      const pagamentoConfirmado =
        notificacao.status === 'PAID' ||
        statusCobrancas.includes('PAID');

      const pagamentoEmAnalise =
        notificacao.status === 'IN_ANALYSIS' ||
        statusCobrancas.includes('IN_ANALYSIS');

      const pagamentoRecusado =
        notificacao.status === 'DECLINED' ||
        statusCobrancas.includes('DECLINED');

      const pagamentoCancelado =
        notificacao.status === 'CANCELED' ||
        statusCobrancas.includes('CANCELED');

      const checkoutExpirado =
        notificacao.status === 'EXPIRED';

      let novoStatusPagamento = 'WAITING';

      if (pagamentoConfirmado) {
        novoStatusPagamento = 'PAID';
      } else if (pagamentoEmAnalise) {
        novoStatusPagamento = 'IN_ANALYSIS';
      } else if (pagamentoRecusado) {
        novoStatusPagamento = 'DECLINED';
      } else if (pagamentoCancelado) {
        novoStatusPagamento = 'CANCELED';
      } else if (checkoutExpirado) {
        novoStatusPagamento = 'EXPIRED';
      }

      const dadosAtualizacao = {
        pagbankPaymentStatus: novoStatusPagamento
      };

      // Só uma notificação autenticada de pagamento PAID
      // pode alterar o status do pedido para PAGO.
      if (pagamentoConfirmado) {
        dadosAtualizacao.status = 'PAGO';
      }

      await prisma.orders.update({
        where: {
          id: pedido.id
        },
        data: dadosAtualizacao
      });

      console.log(
        `Webhook PagBank processado. Pedido ${pedido.id}: ${novoStatusPagamento}`
      );

      return res.status(200).json({
        recebido: true,
        processado: true,
        pedidoId: pedido.id,
        statusPagamento: novoStatusPagamento
      });

    } catch (error) {
      console.error('Erro ao processar webhook PagBank:', error);

      return res.status(500).json({
        erro: 'Erro ao processar notificação do PagBank.'
      });
    }
  }
);

// ==========================================
// 8. INICIALIZAÇÃO DO SERVIDOR
// ==========================================

const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});