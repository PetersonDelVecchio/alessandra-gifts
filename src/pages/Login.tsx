import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";
import Register from "../components/Register";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false); // novo estado
  const navigate = useNavigate();

  useEffect(() => {
    const userType = localStorage.getItem("userType");
    if (userType === "admin") {
      navigate("/admin");
    } else if (userType === "guest") {
      navigate("/guest");
    }
  }, [navigate]);

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Por favor, preencha todos os campos.");
      return;
    }
    setLoading(true);
    try {
      const q = query(
        collection(db, "guests"),
        where("email", "==", email),
        where("password", "==", password)
      );
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        alert("Usuário ou senha inválidos.");
        setLoading(false);
        return;
      }
      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();
      localStorage.setItem("guestId", userDoc.id); // Salva o id do guest
      localStorage.setItem("guestName", userData.name);
      localStorage.setItem("guestEmail", userData.email);
      localStorage.setItem("userType", userData.type);

      if (userData.type === "admin") {
        navigate("/admin");
      } else {
        navigate("/guest");
      }
    } catch (error) {
      alert("Erro ao autenticar.");
      console.error("Login error:", error);
    }
    setLoading(false);
  };

  // Função chamada ao registrar com sucesso
  const handleRegisterSuccess = () => {
    setShowRegister(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="min-h-screen bg-pink-50 flex justify-center items-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-sm flex flex-col items-center"
      >
        <h1 className="text-3xl md:text-4xl font-parisienne text-pink-500 text-center mb-6">
          Bem-vindo à Lista de Presentes 🎂
        </h1>
        <div className="flex flex-col gap-4 w-full mt-2">
          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border-2 border-pink-500 rounded-xl px-4 py-3 w-full text-base focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition"
          />
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border-2 border-pink-500 rounded-xl px-4 py-3 w-full text-base focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition"
          />
          <button
            className="w-full bg-pink-500 hover:bg-pink-600 text-white font-semibold text-lg py-3 rounded-2xl shadow-md transition-colors duration-300"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </div>

        {/* Linha divisória */}
        <div className="my-4 w-full border-t border-pink-100"></div>

        {/* Botão de registro */}
        <div className="w-full text-center">
          <span className="text-gray-600">Não possui conta? </span>
          <button
            className="text-pink-500 font-semibold hover:underline"
            onClick={() => setShowRegister(true)}
            type="button"
          >
            Clique aqui
          </button>
        </div>
      </motion.div>

      {/* Modal de registro */}
      {showRegister && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 relative max-w-lg w-full">
            <button
              className="absolute top-2 right-3 text-pink-500 text-2xl font-bold"
              onClick={() => setShowRegister(false)}
              aria-label="Fechar"
            >
              ×
            </button>
            <Register onRegisterSuccess={handleRegisterSuccess} />
          </div>
        </div>
      )}

      {/* Popup de sucesso */}
      {showSuccess && (
        <div className="fixed bottom-5 right-5 bg-white p-4 rounded-lg shadow-md z-50">
          <p className="text-green-600 font-semibold">
            Usuário criado com sucesso!
          </p>
        </div>
      )}
    </div>
  );
};

export default Login;
