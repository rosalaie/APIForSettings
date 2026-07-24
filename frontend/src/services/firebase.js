// src/services/firebase.js
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage"; // Importa o Storage das fotos

// Configuração do seu app Firebase
const firebaseConfig = {
  apiKey: "AIzaSyB2rP2EIGv5-RNwy49_oKMpGJA4yTSBdUE",
  authDomain: "sobmdida.firebaseapp.com",
  projectId: "sobmdida",
  storageBucket: "sobmdida.firebasestorage.app",
  messagingSenderId: "19005761124",
  appId: "1:19005761124:web:535dc91f3bf6bb01d2e171",
  measurementId: "G-EQMWYDRSEG"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Exporta a instância do Storage para o Produtos.jsx usar
export const storage = getStorage(app);