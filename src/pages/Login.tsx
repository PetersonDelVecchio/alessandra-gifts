import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase/config";
import Loading from "../components/Loading";
import { useTheme } from "../hooks/useTheme";
import { z } from "zod";

// Esquema de validação
const loginSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  phone: z
    .string()
    .min(10, "Celular deve ter pelo menos 10 dígitos")
    .regex(/^\d+$/, "Apenas números são permitidos"),
});

const Login: React.FC = () => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const { theme, loading: themeLoading } = useTheme();

  useEffect(() => {
    const userType = localStorage.getItem("userType");
    if (userType === "admin") {
      navigate("/admin");
    } else if (userType === "guest") {
      navigate("/guest");
    }
  }, [navigate]);

  const formatPhone = (value: string) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, "");

    // Aplica a máscara (11) 99999-9999
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    }
    return value;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setPhone(formatted);
  };

  const getCleanPhone = (phone: string) => {
    return phone.replace(/\D/g, "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validação
    const cleanPhone = getCleanPhone(phone);
    const validation = loginSchema.safeParse({ name, phone: cleanPhone });

    if (!validation.success) {
      const fieldErrors: { name?: string; phone?: string } = {};
      validation.error.issues.forEach((issue) => {
        if (issue.path[0] === "name") fieldErrors.name = issue.message;
        if (issue.path[0] === "phone") fieldErrors.phone = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setLoading(true);
    setMessage("");

    try {
      // Busca por celular existente
      const q = query(
        collection(db, "guests"),
        where("phone", "==", cleanPhone)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // Usuário existe - fazer login
        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data();

        localStorage.setItem("guestId", userDoc.id);
        localStorage.setItem("guestName", userData.name);
        localStorage.setItem("guestPhone", userData.phone);
        localStorage.setItem("userType", userData.type);

        setMessage("Login realizado com sucesso!");

        setTimeout(() => {
          if (userData.type === "admin") {
            navigate("/admin");
          } else {
            navigate("/guest");
          }
        }, 1000);
      } else {
        // Usuário não existe - registrar
        const newUserData = {
          name: name.trim(),
          phone: cleanPhone,
          type: "guest",
          giftSelected: false,
          giftId: null,
          createdAt: serverTimestamp(),
        };

        const docRef = await addDoc(collection(db, "guests"), newUserData);

        localStorage.setItem("guestId", docRef.id);
        localStorage.setItem("guestName", name.trim());
        localStorage.setItem("guestPhone", cleanPhone);
        localStorage.setItem("userType", "guest");

        setMessage("Conta criada e login realizado com sucesso!");

        setTimeout(() => {
          navigate("/guest");
        }, 1000);
      }
    } catch (error) {
      console.error("Erro ao autenticar/registrar:", error);
      setMessage("Erro ao processar solicitação. Tente novamente.");
    }

    setLoading(false);
  };

  if (themeLoading) return <Loading message="Carregando aplicação..." />;

  return (
    <div
      className="min-h-screen flex justify-center items-center px-4"
      style={{
        background: theme?.inviteBackgroundColor || "#ffffff",
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-sm flex flex-col items-center"
      >
        <h1
          className="text-3xl md:text-4xl font-parisienne text-center mb-6"
          style={{
            color: theme?.navBarColor || "#ec4899",
            fontFamily: theme?.titleFontFamily || "'Parisienne', cursive",
          }}
        >
          Lista de Presentes 🎂
        </h1>

        <p className="text-center text-gray-600 mb-6 text-sm">
          Digite seu nome e celular para entrar ou criar sua conta
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
          {/* Nome */}
          <div>
            <input
              type="text"
              placeholder="Seu nome completo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-xl px-4 py-3 w-full text-base focus:outline-none focus:ring-2 transition border-2"
              style={{
                borderColor: errors.name
                  ? "#ef4444"
                  : theme?.giftBorderColor || "#d1d5db",
              }}
              disabled={loading}
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          {/* Celular */}
          <div>
            <input
              type="tel"
              placeholder="(11) 99999-9999"
              value={phone}
              onChange={handlePhoneChange}
              className="rounded-xl px-4 py-3 w-full text-base focus:outline-none focus:ring-2 transition border-2"
              style={{
                borderColor: errors.phone
                  ? "#ef4444"
                  : theme?.giftBorderColor || "#d1d5db",
              }}
              maxLength={15}
              disabled={loading}
            />
            {errors.phone && (
              <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
            )}
          </div>

          {/* Botão */}
          <button
            type="submit"
            disabled={loading}
            className="w-full font-semibold text-lg py-3 rounded-2xl shadow-md transition-all duration-300 hover:brightness-90 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: theme?.giftButtonColor || "#ec4899",
              color: theme?.giftTextButtonColor || "#ffffff",
            }}
          >
            {loading ? "Processando..." : "Entrar"}
          </button>
        </form>

        {/* Mensagem de feedback */}
        {message && (
          <div
            className={`mt-4 p-3 rounded-lg text-center text-sm ${
              message.includes("sucesso")
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {message}
          </div>
        )}

        {/* Informação adicional */}
        <div className="mt-6 text-center text-xs text-gray-500">
          <p>Se você já tem uma conta, será feito o login automaticamente.</p>
          <p>Caso contrário, uma nova conta será criada para você.</p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
