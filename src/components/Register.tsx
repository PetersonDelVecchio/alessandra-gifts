import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/config";
import { useTheme } from "../hooks/useTheme";

// Tipo do formulário
type FormGuest = {
  name: string;
  email: string;
  password: string;
};

// Esquema de validação
const schemaGuest = z.object({
  name: z.string().min(3, "Nome muito curto").max(50),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(4, "Mínimo 4 caracteres"),
});

type RegisterProps = {
  onRegisterSuccess?: () => void;
};

export default function CreateGuest({ onRegisterSuccess }: RegisterProps) {
  const { register, handleSubmit, reset, formState } = useForm<FormGuest>({
    resolver: zodResolver(schemaGuest),
  });

  const [showPopup, setShowPopup] = useState(false);
  const { theme } = useTheme();

  const togglePopup = () => {
    setShowPopup(true);
    setTimeout(() => setShowPopup(false), 3000);
  };

  const createGuest = async (data: FormGuest) => {
    try {
      const guestsCollectionRef = collection(db, "/guests");

      await addDoc(guestsCollectionRef, {
        name: data.name,
        email: data.email,
        password: data.password,
        type: "guest",
        giftSelected: false,
        giftId: null,
        createdAt: serverTimestamp(),
      });

      togglePopup();
      reset();
      if (onRegisterSuccess) {
        onRegisterSuccess();
      }
    } catch (error) {
      console.error("Erro ao registrar usuário: ", error);
    }
  };

  return (
    <div className="relative">
      <form
        onSubmit={handleSubmit(createGuest)}
        className="max-w-md mx-auto p-6 bg-white shadow-lg rounded-xl"
      >
        <h2 
          className="text-2xl font-semibold text-center mb-6"
          style={{ color: theme?.navBarColor || "#e91e63" }}
        >
          Registro de Convidado
        </h2>

        {/* Nome */}
        <div className="mb-4">
          <label htmlFor="name" className="block font-medium text-gray-700">
            Nome
          </label>
          <input
            type="text"
            id="name"
            {...register("name")}
            className="mt-1 w-full border p-2 rounded-lg"
            style={{ 
              borderColor: formState.errors.name 
                ? "#ef4444" 
                : theme?.giftBorderColor || "#e5e7eb" 
            }}
          />
          {formState.errors.name && (
            <p className="text-red-500 text-sm">
              {formState.errors.name.message}
            </p>
          )}
        </div>

        {/* Email */}
        <div className="mb-4">
          <label htmlFor="email" className="block font-medium text-gray-700">
            E-mail
          </label>
          <input
            type="email"
            id="email"
            {...register("email")}
            className="mt-1 w-full border p-2 rounded-lg"
            style={{ 
              borderColor: formState.errors.email 
                ? "#ef4444" 
                : theme?.giftBorderColor || "#e5e7eb" 
            }}
          />
          {formState.errors.email && (
            <p className="text-red-500 text-sm">
              {formState.errors.email.message}
            </p>
          )}
        </div>

        {/* Senha */}
        <div className="mb-4">
          <label htmlFor="password" className="block font-medium text-gray-700">
            Senha
          </label>
          <input
            type="password"
            id="password"
            {...register("password")}
            className="mt-1 w-full border p-2 rounded-lg"
            style={{ 
              borderColor: formState.errors.password 
                ? "#ef4444" 
                : theme?.giftBorderColor || "#e5e7eb" 
            }}
          />
          {formState.errors.password && (
            <p className="text-red-500 text-sm">
              {formState.errors.password.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          className="w-full py-2 px-4 rounded-lg transition-colors duration-300 hover:brightness-90"
          style={{ 
            background: theme?.giftButtonColor || "#e91e63",
            color: theme?.giftTextButtonColor || "#ffffff"
          }}
        >
          Criar
        </button>
      </form>

      {showPopup && (
        <div className="fixed bottom-5 right-5 bg-white p-4 rounded-lg shadow-md z-50">
          <p className="text-green-600 font-semibold">
            Usuário criado com sucesso!
          </p>
        </div>
      )}
    </div>
  );
}
