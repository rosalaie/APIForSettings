import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import App from '../App.jsx';
import Login from '../pages/Login.jsx';
import Register from '../pages/Register.jsx';
import Clientes from '../pages/Clientes.jsx';
import Produtos from '../pages/Produtos.jsx';
import Categorias from '../pages/Categorias.jsx';
import Pedidos from '../pages/Pedidos.jsx';
import Relatorios from '../pages/Relatorios.jsx';
import Loja from '../pages/Loja.jsx';

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Painel Administrativo */}
        <Route path="/" element={<App />}>

          <Route index element={<Navigate to="/categorias" replace />} />

          <Route path="clientes" element={<Clientes />} />
          <Route path="produtos" element={<Produtos />} />
          <Route path="categorias" element={<Categorias />} />
          <Route path="pedidos" element={<Pedidos />} />
          <Route path="relatorios" element={<Relatorios />} />

        </Route>

        {/* Loja */}
        <Route path="/loja" element={<Loja />} />

        {/* Autenticação */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Rota inexistente */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}