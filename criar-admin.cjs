const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const readline = require('readline');

const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function perguntar(texto) {
  return new Promise(resolve => rl.question(texto, resolve));
}

async function criarAdmin() {
  try {
    const nome = await perguntar('Nome do administrador: ');
    const email = await perguntar('E-mail: ');
    const senha = await perguntar('Senha: ');

    const existente = await prisma.users.findUnique({
      where: { email }
    });

    if (existente) {
      console.log('Já existe um usuário com esse e-mail.');
      return;
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    const admin = await prisma.users.create({
      data: {
        nome,
        email,
        senha: senhaHash,
        role: 'ADMIN'
      }
    });

    console.log('\nAdministrador criado com sucesso!');
    console.log('E-mail:', admin.email);
    console.log('Perfil:', admin.role);

  } catch (erro) {
    console.error('\nErro ao criar administrador:', erro.message);
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

criarAdmin();
