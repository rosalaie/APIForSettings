import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Carrinho from './pages/Carrinho';
import CadastroCliente from './pages/CadastroCliente'; 
import Produto from './pages/Produto'; 
import CadastrarProduto from './pages/CadastrarProduto';
import LoginAdmin from './pages/LoginAdmin';
import './App.css';
import LoginCliente from './pages/LoginCliente';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginCliente />} />
        <Route path="/" element={<Home />} />
        <Route path="/carrinho" element={<Carrinho />} />
        <Route path="/cadastro" element={<CadastroCliente />} /> 
        <Route path="/produto/:id" element={<Produto />} /> 
        <Route path="/admin" element={<LoginAdmin />} />
        <Route path="/admin/novo-produto" element={<CadastrarProduto />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;