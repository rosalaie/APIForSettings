const express = require('express');
const router = express.Router();
const authService = require('../services/authServices'); // Ajuste o caminho se necessário

// Rota que o seu frontend chama ao clicar em "Cadastrar"
router.post('/register', async (req, res) => {
  try {
    const { nome, email, senha } = req.body;
    
    if (!nome || !email || !senha) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }

    const novoUsuario = await authService.registrar(nome, email, senha);
    return res.status(201).json(novoUsuario);
  } catch (error) {
    return res.status(400).json({ error: error.message || 'Erro ao registrar usuário' });
  }
});

module.exports = router;