// frontend/src/routes/AppRoutes.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import App from '../App';
import Login from '../pages/Login.jsx';
import Register from '../pages/Register.jsx';
import Clientes from '../pages/Clientes.jsx'; 
import Produtos from '../pages/Produtos.jsx'; 
import Categorias from '../pages/Categorias.jsx'; // Importado corretamente aqui!

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rota principal que carrega a Sidebar e Topbar (App.js) */}
        <Route path="/" element={<App />}>
          
          {/* Sub-rota 1: Listagem dedicada de Clientes */}
          <Route path="clientes" element={<Clientes />} />
          
          {/* Sub-rota 2: Catálogo de Produtos */}
          <Route path="produtos" element={<Produtos />} />

          {/* Sub-rota 3: Gerenciamento de Categorias (Unificado aqui dentro!) */}
          <Route path="categorias" element={<Categorias />} />
          
        </Route>
        
        {/* Rotas de Autenticação fora do painel administrativo */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Captura qualquer rota inválida e redireciona de volta para a Home */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}