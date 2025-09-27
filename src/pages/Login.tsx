import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const Login: React.FC = () => {
  const [isGuestFormVisible, setGuestFormVisible] = useState(false);
  const [isAdminFormVisible, setAdminFormVisible] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const navigate = useNavigate();

  const ADMIN_EMAIL = "admin@alessandra.com";
  const ADMIN_PASSWORD = "Admin@123";

  const handleGuestConfirm = () => {
    if (!name || !email) {
      alert("Por favor, preencha todos os campos.");
      return;
    }

    localStorage.setItem("guestName", name);
    localStorage.setItem("guestEmail", email);

    navigate("/guest");
  };

  const handleAdminLogin = () => {
    if (adminEmail === ADMIN_EMAIL && adminPassword === ADMIN_PASSWORD) {
      localStorage.setItem("isAdmin", "true"); // Flag para rotas privadas
      navigate("/admin");
    } else {
      alert("E-mail ou senha inválidos!");
    }
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

        <AnimatePresence mode="wait">
          {!isGuestFormVisible && !isAdminFormVisible ? (
            <motion.div
              key="options"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col gap-5 w-full"
            >
              <button
                className="w-full bg-pink-500 hover:bg-pink-600 text-white font-semibold text-lg py-3 rounded-2xl shadow-md transition-colors duration-300"
                onClick={() => setGuestFormVisible(true)}
              >
                Sou Convidado
              </button>
              <a href="/admin"
                className="w-full text-center bg-white border-2 border-pink-500 text-pink-500 font-semibold text-lg py-3 rounded-2xl shadow-md hover:bg-pink-50 transition-colors duration-300"
              >
                Sou Admin
              </a >
            </motion.div>
          ) : null}

          {isGuestFormVisible && (
            <motion.div
              key="guest-form"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col gap-4 w-full mt-2"
            >
              <input
                type="text"
                placeholder="Nome Completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border-2 border-pink-500 rounded-xl px-4 py-3 w-full text-base focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition"
              />
              <input
                type="email"
                placeholder="E-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-2 border-pink-500 rounded-xl px-4 py-3 w-full text-base focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition"
              />
              <div className="flex gap-3 mt-3">
                <button
                  className="flex-1 bg-pink-500 hover:bg-pink-600 text-white font-semibold text-lg py-3 rounded-2xl shadow-md transition-colors duration-300"
                  onClick={handleGuestConfirm}
                >
                  Confirmar
                </button>
                <button
                  className="flex-1 bg-white border-2 border-pink-500 text-pink-500 font-semibold text-lg py-3 rounded-2xl shadow-md hover:bg-pink-50 transition-colors duration-300"
                  onClick={() => setGuestFormVisible(false)}
                >
                  Voltar
                </button>
              </div>
            </motion.div>
          )}

          {isAdminFormVisible && (
            <motion.div
              key="admin-form"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col gap-4 w-full mt-2"
            >
              <input
                type="email"
                placeholder="E-mail do Admin"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="border-2 border-pink-500 rounded-xl px-4 py-3 w-full text-base focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition"
              />
              <input
                type="password"
                placeholder="Senha"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="border-2 border-pink-500 rounded-xl px-4 py-3 w-full text-base focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition"
              />
              <div className="flex gap-3 mt-3">
                <button
                  className="flex-1 bg-pink-500 hover:bg-pink-600 text-white font-semibold text-lg py-3 rounded-2xl shadow-md transition-colors duration-300"
                  onClick={handleAdminLogin}
                >
                  Entrar
                </button>
                <button
                  className="flex-1 bg-white border-2 border-pink-500 text-pink-500 font-semibold text-lg py-3 rounded-2xl shadow-md hover:bg-pink-50 transition-colors duration-300"
                  onClick={() => setAdminFormVisible(false)}
                >
                  Voltar
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default Login;
