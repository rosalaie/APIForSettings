import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Carrinho from './pages/Carrinho';
import CadastroCliente from './pages/CadastroCliente'; 
import Produto from './pages/Produto'; 
import CadastrarProduto from './pages/CadastrarProduto';
import LoginAdmin from './pages/LoginAdmin';
import LoginCliente from './pages/LoginCliente';
import Checkout from './pages/Checkout'; 
import Contato from './pages/Contato'; // Importação da nova página
import './App.css';

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
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/contato" element={<Contato />} /> {/* Nova Rota de Contato */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;