import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000', // ajuste a porta se o seu Node rodar em outra
});

// Interceptor para injetar o token JWT em cada requisição de forma automática
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('@sobmedida:token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;