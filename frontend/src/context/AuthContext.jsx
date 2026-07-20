import { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Ao carregar o app, checa se já existe login salvo no navegador
    const storagedUser = localStorage.getItem('@sobmedida:user');
    const storagedToken = localStorage.getItem('@sobmedida:token');

    if (storagedUser && storagedToken) {
      try {
        // Tenta ler com segurança. Se for inválido/corrompido, limpa e não quebra o app
        const parsedUser = JSON.parse(storagedUser);
        if (parsedUser) {
          setUser(parsedUser);
          // Configura o token por padrão nas chamadas da API
          api.defaults.headers.common['Authorization'] = `Bearer ${storagedToken}`;
        }
      } catch (error) {
        console.error("Erro ao carregar dados do usuário:", error);
        localStorage.removeItem('@sobmedida:user');
        localStorage.removeItem('@sobmedida:token');
      }
    }
    setLoading(false);
  }, []);

  async function login(email, senha) {
    try {
      // Faz a chamada para a rota de login criada no backend
      const response = await api.post('/login', { email, senha });
      
      // Ajustado para "user" (singular) igualzinho ao que seu backend envia!
      const { user: userData, token } = response.data;

      if (!userData || !token) {
        throw new Error('Resposta do servidor inválida');
      }

      setUser(userData);

      // Salva o token no axios para as próximas requisições
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      localStorage.setItem('@sobmedida:user', JSON.stringify(userData));
      localStorage.setItem('@sobmedida:token', token);
      
      return { success: true };
    } catch (error) {
      console.error(error);
      const message = error.response?.data?.error || 'Erro ao realizar login.';
      return { success: false, error: message };
    }
  }

  function logout() {
    localStorage.removeItem('@sobmedida:user');
    localStorage.removeItem('@sobmedida:token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ signed: !!user, user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}