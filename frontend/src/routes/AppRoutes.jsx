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
import MinhaConta from '../pages/MinhaConta.jsx';
import MeusPedidos from '../pages/MeusPedidos.jsx';
import Carrinho from '../pages/Carrinho.jsx';
import Checkout from '../pages/Checkout.jsx';

function RequireRole({ role, children }) {
  const token = localStorage.getItem('token');
  const usuarioSalvo = localStorage.getItem('user');

  if (!token || !usuarioSalvo) {
    return <Navigate to="/login" replace />;
  }

  let usuario;

  try {
    usuario = JSON.parse(usuarioSalvo);
  } catch (erro) {
    console.error('Erro ao validar usuário:', erro);

    localStorage.removeItem('token');
    localStorage.removeItem('user');

    return <Navigate to="/login" replace />;
  }

  if (!usuario || usuario.role !== role) {
    if (usuario?.role === 'CLIENT') {
      return <Navigate to="/loja" replace />;
    }

    if (usuario?.role === 'ADMIN') {
      return <Navigate to="/admin" replace />;
    }

    return <Navigate to="/login" replace />;
  }

  return children;
}

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        {/* LOJA PÚBLICA */}
        <Route path="/" element={<Loja />} />
        <Route path="/loja" element={<Loja />} />

        {/* CARRINHO */}
        <Route path="/carrinho" element={<Carrinho />} />

        {/* AUTENTICAÇÃO */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ÁREA DO CLIENTE */}
        <Route
          path="/minha-conta"
          element={
            <RequireRole role="CLIENT">
              <MinhaConta />
            </RequireRole>
          }
        />

        <Route
          path="/meus-pedidos"
          element={
            <RequireRole role="CLIENT">
              <MeusPedidos />
            </RequireRole>
          }
        />

        {/* CHECKOUT */}
        <Route
          path="/checkout"
          element={
            <RequireRole role="CLIENT">
              <Checkout />
            </RequireRole>
          }
        />

        {/* PAINEL ADMINISTRATIVO */}
        <Route
          path="/admin"
          element={
            <RequireRole role="ADMIN">
              <App />
            </RequireRole>
          }
        >
          <Route path="clientes" element={<Clientes />} />
          <Route path="produtos" element={<Produtos />} />
          <Route path="categorias" element={<Categorias />} />
          <Route path="pedidos" element={<Pedidos />} />
          <Route path="relatorios" element={<Relatorios />} />
        </Route>

        {/* ROTAS NÃO ENCONTRADAS */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}