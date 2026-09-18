import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import LoginAdmin from './pages/LoginAdmin';
import Dashboard from './pages/Dashboard';
import Carrinho from './pages/Carrinho'; // <-- Importe aqui
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<LoginAdmin />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/carrinho" element={<Carrinho />} /> {/* <-- Nova rota aqui */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;