import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/config";
import { useState } from "react";

const schemaGift = z.object({
  title: z.string().min(3, "Título muito curto"),
  url: z.string().url("URL inválida"),
  valor: z.string().min(1, "Informe o valor"),
  description: z.string().optional(),
});

type FormGift = z.infer<typeof schemaGift>;

export default function CreateGift() {
  const { register, handleSubmit, reset, formState } = useForm<FormGift>({
    resolver: zodResolver(schemaGift),
  });

  const [showPopup, setShowPopup] = useState(false);

  const togglePopup = () => {
    setShowPopup(true);
    setTimeout(() => setShowPopup(false), 3000);
  };

  const createGift = async (data: FormGift) => {
    try {
      const giftsRef = collection(db, "gifts");
      await addDoc(giftsRef, {
        title: data.title,
        url: data.url,
        valor:(data.valor), // <-- converte para número
        description: data.description || "",
        selected: false,
        guestId: null,
        selectedBy: null,
        selectedEmail: null,
        createdAt: serverTimestamp(),
      });
      togglePopup();
      reset();
    } catch (error: any) {
      console.error("Erro ao criar presente:", error.message);
    }
  };

  return (
    <div className="relative">
      <form
        onSubmit={handleSubmit(createGift)}
        className="max-w-md mx-auto p-6 bg-white shadow-lg rounded-xl"
      >
        <h2 className="text-2xl font-semibold text-center text-pink-600 mb-6">
          Adicionar Presente
        </h2>

        {/* Título */}
        <div className="mb-4">
          <label htmlFor="title" className="block font-medium text-gray-700">
            Nome do Presente
          </label>
          <input
            type="text"
            id="title"
            {...register("title")}
            className={`mt-1 w-full border p-2 rounded-lg ${
              formState.errors.title ? "border-red-500" : "border-gray-300"
            }`}
          />
          {formState.errors.title && (
            <p className="text-red-500 text-sm">
              {formState.errors.title.message}
            </p>
          )}
        </div>

        {/* URL */}
        <div className="mb-4">
          <label htmlFor="url" className="block font-medium text-gray-700">
            Link do Produto
          </label>
          <input
            type="url"
            id="url"
            {...register("url")}
            className={`mt-1 w-full border p-2 rounded-lg ${
              formState.errors.url ? "border-red-500" : "border-gray-300"
            }`}
          />
          {formState.errors.url && (
            <p className="text-red-500 text-sm">
              {formState.errors.url.message}
            </p>
          )}
        </div>

        {/* Valor */}
        <div className="mb-4">
          <label htmlFor="valor" className="block font-medium text-gray-700">
            Valor
          </label>
          <input
            type="text"
            id="valor"
            {...register("valor")}
            className={`mt-1 w-full border p-2 rounded-lg ${
              formState.errors.valor ? "border-red-500" : "border-gray-300"
            }`}
          />
          {formState.errors.valor && (
            <p className="text-red-500 text-sm">
              {formState.errors.valor.message}
            </p>
          )}
        </div>

        {/* Descrição */}
        <div className="mb-4">
          <label htmlFor="description" className="block font-medium text-gray-700">
            Descrição (opcional)
          </label>
          <textarea
            id="description"
            {...register("description")}
            className="mt-1 w-full border p-2 rounded-lg border-gray-300"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-pink-600 text-white py-2 px-4 rounded-lg hover:bg-pink-700 transition"
        >
          Criar Presente
        </button>
      </form>

      {showPopup && (
        <div className="fixed bottom-5 right-5 bg-white p-4 rounded-lg shadow-md">
          <p className="text-green-600 font-semibold">
            Presente criado com sucesso!
          </p>
        </div>
      )}
    </div>
  );
}
