import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import LoginAdmin from './pages/LoginAdmin';
import Dashboard from './pages/Dashboard';
import Carrinho from './pages/Carrinho';
import CadastroCliente from './pages/CadastroCliente'; 
import Produto from './pages/Produto'; 
import CadastrarProduto from './pages/CadastrarProduto'; // <-- Importe aqui
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<LoginAdmin />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin/novo-produto" element={<CadastrarProduto />} /> {/* <-- Nova rota aqui */}
        <Route path="/carrinho" element={<Carrinho />} />
        <Route path="/cadastro" element={<CadastroCliente />} /> 
        <Route path="/produto" element={<Produto />} /> 
      </Routes>
    </BrowserRouter>
  );
}

export default App;