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

// Proteção de rotas conforme o perfil do usuário
function RequireRole({ role, children }) {
  const token = localStorage.getItem('token');
  const userStorage = localStorage.getItem('user');

  if (!token || !userStorage) {
    return <Navigate to="/login" replace />;
  }

  let user;

  try {
    user = JSON.parse(userStorage);
  } catch (error) {
    localStorage.removeItem('user');
    localStorage.removeItem('token');

    return <Navigate to="/login" replace />;
  }

  if (user.role !== role) {
    if (user.role === 'CLIENT') {
      return <Navigate to="/loja" replace />;
    }

    if (user.role === 'ADMIN') {
      return <Navigate to="/categorias" replace />;
    }

    localStorage.removeItem('user');
    localStorage.removeItem('token');

    return <Navigate to="/login" replace />;
  }

  return children;
}

// Área do cliente
function MinhaContaPlaceholder() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      fontFamily: 'Arial, sans-serif',
      background: '#f8fafc'
    }}>
      <h1>Minha Conta</h1>

      <p>
        Estamos preparando sua área de cliente.
      </p>

      <a
        href="/loja"
        style={{
          color: '#b51f36',
          textDecoration: 'none',
          fontWeight: 'bold'
        }}
      >
        Voltar à loja
      </a>
    </div>
  );
}

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        {/* PAINEL ADMINISTRATIVO */}
        <Route
          path="/"
          element={
            <RequireRole role="ADMIN">
              <App />
            </RequireRole>
          }
        >
          <Route index element={<Navigate to="/categorias" replace />} />

          <Route path="clientes" element={<Clientes />} />
          <Route path="produtos" element={<Produtos />} />
          <Route path="categorias" element={<Categorias />} />
          <Route path="pedidos" element={<Pedidos />} />
          <Route path="relatorios" element={<Relatorios />} />
        </Route>

        {/* LOJA VIRTUAL */}
        <Route path="/loja" element={<Loja />} />

        {/* ÁREA DO CLIENTE */}
        <Route
          path="/minha-conta"
          element={
            <RequireRole role="CLIENT">
              <MinhaContaPlaceholder />
            </RequireRole>
          }
        />

        {/* AUTENTICAÇÃO */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ROTAS INEXISTENTES */}
        <Route path="*" element={<Navigate to="/loja" replace />} />

      </Routes>
    </BrowserRouter>
  );
}