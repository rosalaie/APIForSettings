import * as authService from '../services/authService.js';

export async function register(req, res, next) {
  try {
    const { nome, email, senha } = req.body;
    
    if (!nome || !email || !senha) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
    }

    const user = await authService.registerClient({ nome, email, senha });
    return res.status(201).json({ message: 'Usuário registrado com sucesso!', user });
  } catch (error) {
    next(error); // Encaminha para o middleware de tratamento de erro genérico
  }
}

export async function login(req, res, next) {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
    }

    const data = await authService.loginClient({ email, senha });
    return res.status(200).json(data);
  } catch (error) {
    return res.status(401).json({ error: error.message });
  }
}