require('dotenv').config();

const express = require('express');
const { PrismaClient } = require('@prisma/client');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error('ERRO: JWT_SECRET não está configurado no arquivo .env.');
  process.exit(1);
}

// ==========================================
// 1. MIDDLEWARE DE AUTENTICAÇÃO E PERMISSÕES
// ==========================================

// Verifica se o usuário está autenticado
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

// Verifica se o usuário possui uma das funções permitidas
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

// Função compartilhada para cadastrar clientes
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

    // Cadastro pelo balcão só pode ser realizado pelo administrador
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

// Cadastro público pelo site
app.post('/register', async (req, res) => {
  return criarCliente(req, res, false);
});

// Cadastro de cliente pelo painel administrativo / balcão
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

// Consultar os próprios dados
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

// Atualizar os próprios dados
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

// Consultar somente os pedidos do cliente autenticado
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

// Listar produtos - público
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

// Buscar produto por ID - público
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

// Cadastrar produto - ADMIN
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

// Editar produto - ADMIN
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

// Deletar produto - ADMIN
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

// Listar categorias - público
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

// Cadastrar categoria - ADMIN
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

// Editar categoria - ADMIN
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

// Deletar categoria - ADMIN
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

// Listar todos os pedidos - ADMIN
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

      // O cliente não pode escolher outro cliente para o pedido.
      // O ID dele é obtido diretamente do token autenticado.
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
        !itens ||
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
          formaPagamento: formaPagamento || 'Dinheiro',
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

      // Verifica se o pedido existe.
      const pedidoExistente = await prisma.orders.findUnique({
        where: { id }
      });

      if (!pedidoExistente) {
        return res.status(404).json({
          error: 'Pedido não encontrado.'
        });
      }

      // Valida o cliente informado.
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

      // Valida os itens do pedido.
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

      const origensPermitidas = ['BALCAO', 'SITE'];

      if (
        origem !== undefined &&
        !origensPermitidas.includes(origem)
      ) {
        return res.status(400).json({
          error: 'Origem do pedido inválida.'
        });
      }

      // Busca os preços reais no banco e calcula o total.
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

      // Atualiza o pedido e substitui seus itens em uma transação.
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

// Atualizar status do pedido - ADMIN
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

// Excluir pedido - ADMIN
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
// 6. ROTAS DE PAGAMENTO - PAGBANK
// ==========================================

app.post(
  '/pagamento',
  autenticarToken,
  exigirRole('CLIENT', 'ADMIN'),
  async (req, res) => {
    try {
      const { valor, descricao, cliente } = req.body;

      const TOKEN = process.env.PAGBANK_TOKEN || '';

      if (!TOKEN) {
        return res.status(500).json({
          erro: 'Token do PagBank não configurado no servidor.'
        });
      }

      const valorNumerico = Number(valor);

      if (
        !Number.isFinite(valorNumerico) ||
        valorNumerico <= 0 ||
        !descricao
      ) {
        return res.status(400).json({
          erro: 'Valor e descrição válidos são obrigatórios.'
        });
      }

      let dadosCliente;

      if (req.usuario.role === 'CLIENT') {
        // Para clientes, os dados vêm do banco.
        // Não confiamos nos dados de outro usuário enviados pelo navegador.
        dadosCliente = await prisma.users.findUnique({
          where: {
            id: req.usuario.id
          },
          select: {
            nome: true,
            email: true,
            cpf: true
          }
        });
      } else {
        // No balcão, o administrador pode informar os dados do cliente.
        dadosCliente = cliente;
      }

      if (
        !dadosCliente ||
        !dadosCliente.nome ||
        !dadosCliente.email ||
        !dadosCliente.cpf
      ) {
        return res.status(400).json({
          erro: 'Nome, e-mail e CPF do cliente são necessários para o pagamento.'
        });
      }

      const options = {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reference_id: `PEDIDO-${Date.now()}`,
          customer: {
            name: dadosCliente.nome,
            email: dadosCliente.email,
            tax_id: dadosCliente.cpf
          },
          items: [
            {
              name: descricao,
              quantity: 1,
              unit_amount: Math.round(valorNumerico * 100)
            }
          ]
        })
      };

      const response = await fetch(
        'https://sandbox.api.pagseguro.com/orders',
        options
      );

      const data = await response.json();

      if (response.ok) {
        return res.status(201).json({
          sucesso: true,
          order: data
        });
      }

      console.error('Erro do PagBank:', data);

      return res.status(400).json({
        sucesso: false,
        erro: data
      });

    } catch (error) {
      console.error('Erro interno no pagamento:', error);

      return res.status(500).json({
        erro: 'Falha ao processar pagamento.'
      });
    }
  }
);

// ==========================================
// 7. INICIALIZAÇÃO DO SERVIDOR
// ==========================================

const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});