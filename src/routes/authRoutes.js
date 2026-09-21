// backend/src/routes/clientRoutes.js
const express = require('express');
const router = express.Router();
const authService = require('../services/authServices'); 

router.post('/', async (req, res) => {
  try {
    const { nome, email, telefone, cpf, rua, numero, bairro, cidade, cep, senha, origem } = req.body;
    
    if (!nome) {
      return res.status(400).json({ error: 'O nome do cliente é obrigatório.' });
    }

    // Se for cadastro via site, a senha é obrigatória.
    // Se for cadastro do balcão (sem senha), gera uma senha padrão interna.
    if (origem !== 'BALCAO' && !senha) {
      return res.status(400).json({ error: 'A senha é obrigatória para cadastros do site.' });
    }

    const senhaFinal = senha || 'ClienteBalcao@123';

    const novoCliente = await authService.registrar(nome, email, senhaFinal, {
      telefone,
      cpf,
      rua,
      numero,
      bairro,
      cidade,
      cep
    });

    return res.status(201).json(novoCliente);
  } catch (error) {
    return res.status(400).json({ error: error.message || 'Erro ao cadastrar cliente.' });
  }
});

module.exports = router;