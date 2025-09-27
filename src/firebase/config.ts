// src/firebase/config.ts

// Importa as funções necessárias do Firebase
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Configurações do Firebase (preenchidas com seu projeto)
const firebaseConfig = {
  apiKey: "AIzaSyCQdoJHfkXgSdaLyS-odicJhx5ojno30Xo",
  authDomain: "gifts-list-2025.firebaseapp.com",
  projectId: "gifts-list-2025",
  storageBucket: "gifts-list-2025.firebasestorage.app",
  messagingSenderId: "799228120047",
  appId: "1:799228120047:web:96e3ee2a510fe361af441a",
  measurementId: "G-N2SD9VEHSL"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Inicializa o Firestore (banco de dados)
export const db = getFirestore(app);
export const auth = getAuth(app); // <-- Adicione esta linha
