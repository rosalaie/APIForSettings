/*import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();*/
// frontend/src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import AppRoutes from './routes/AppRoutes.jsx'; // Importa o arquivo de rotas que criamos
import { AuthProvider } from './context/AuthContext.jsx';
import './index.css'; // ou './App.css' dependendo de qual você usa para o layout global

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <AppRoutes /> {/* O AppRoutes precisa ser o cara que inicia tudo! */}
    </AuthProvider>
  </React.StrictMode>
);