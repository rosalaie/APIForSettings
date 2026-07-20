const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt'); // para criptografar a senha
const prisma = new PrismaClient();

async function registrar(nome, email, senha) {
  // 1. Verifica se o usuário já existe
  const usuarioExistente = await prisma.users.findUnique({
    where: { email }
  });

  if (usuarioExistente) {
    throw new Error('Este e-mail já está cadastrado.');
  }

  // 2. Criptografa a senha para não salvar em texto limpo
  const salt = await bcrypt.genSalt(10);
  const senhaCriptografada = await bcrypt.hash(senha, salt);

  // 3. Salva no banco de dados usando o modelo "Users" (que o prisma expõe como "users")
  const novoUsuario = await prisma.users.create({
    data: {
      nome,
      email,
      senha: senhaCriptografada,
      role: 'CLIENT' // Padrão inicial como cliente
    }
  });

  // Retorna o usuário sem a senha por segurança
  const { senha: _, ...usuarioSemSenha } = novoUsuario;
  return usuarioSemSenha;
}

module.exports = {
  registrar
};