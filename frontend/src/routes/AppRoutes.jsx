// frontend/src/routes/AppRoutes.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import App from '../App';
import Login from '../pages/Login.jsx';
import Register from '../pages/Register.jsx';
import Clientes from '../pages/Clientes.jsx'; 
import Produtos from '../pages/Produtos.jsx'; 
import Categorias from '../pages/Categorias.jsx';

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rota principal que carrega o layout administrativo */}
        <Route path="/" element={<App />}>
          <Route path="clientes" element={<Clientes />} />
          <Route path="produtos" element={<Produtos />} />
          <Route path="categorias" element={<Categorias />} />
        </Route>
        
        {/* Rotas externas de Autenticação */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Redirecionamento padrão para rotas não encontradas */}
        <Route path="*" element={<Navigate to="/clientes" replace />} />
      </Routes>
    </BrowserRouter>
  );
}