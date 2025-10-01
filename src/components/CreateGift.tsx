import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../firebase/config";
import { useTheme } from "../hooks/useTheme";

const schemaGift = z.object({
  title: z.string().min(3, "Título muito curto"),
  url: z.string().url("URL inválida"),
  valor: z.string().min(1, "Informe o valor"),
  description: z
    .string()
    .max(100, "Descrição muito longa (máximo 100 caracteres)")
    .optional(),
});

type FormGift = z.infer<typeof schemaGift>;

interface CreateGiftProps {
  onGiftCreated: () => void;
}

const CreateGift: React.FC<CreateGiftProps> = ({ onGiftCreated }) => {
  const { theme } = useTheme();
  const { register, handleSubmit, reset, formState, watch } = useForm<FormGift>({
    resolver: zodResolver(schemaGift),
  });

  const onSubmit = async (data: FormGift) => {
    try {
      await addDoc(collection(db, "gifts"), {
        ...data,
        selected: false,
        active: true,
        createdAt: new Date(),
      });
      reset();
      onGiftCreated();
    } catch (error) {
      console.error("Erro ao criar presente:", error);
    }
  };

  return (
    <div className="p-6">
      <h2
        className="text-xl font-bold mb-4 text-center"
        style={{ color: theme?.navBarColor }}
      >
        Adicionar Novo Presente
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Título */}
        <div className="mb-4">
          <label
            htmlFor="title"
            className="block font-medium text-gray-700"
          >
            Título *
          </label>
          <input
            id="title"
            {...register("title")}
            className="mt-1 w-full p-2 rounded-lg border"
            style={{ borderColor:  "#e5e7eb" }}
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
            URL *
          </label>
          <input
            id="url"
            type="url"
            {...register("url")}
            className="mt-1 w-full p-2 rounded-lg border"
            style={{ borderColor:  "#e5e7eb" }}
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
            Valor *
          </label>
          <input
            id="valor"
            {...register("valor")}
            className="mt-1 w-full p-2 rounded-lg border"
            style={{ borderColor:  "#e5e7eb" }}
            placeholder="199.90"
          />
          {formState.errors.valor && (
            <p className="text-red-500 text-sm">
              {formState.errors.valor.message}
            </p>
          )}
        </div>

        {/* Descrição */}
        <div className="mb-4">
          <label
            htmlFor="description"
            className="block font-medium text-gray-700"
          >
            Descrição (opcional)
          </label>
          <textarea
            id="description"
            {...register("description")}
            className="mt-1 w-full p-2 rounded-lg border"
            style={{ borderColor:  "#e5e7eb" }}
            maxLength={100}
            rows={3}
          />
          <div className="text-right text-sm text-gray-500 mt-1">
            {(watch("description") || "").length}/100 caracteres
          </div>
          {formState.errors.description && (
            <p className="text-red-500 text-sm">
              {formState.errors.description.message}
            </p>
          )}
        </div>

        {/* Botão */}
        <button
          type="submit"
          className="w-full py-2 px-4 rounded-lg font-medium transition-colors hover:opacity-90"
          style={{
            background: theme?.giftButtonColor,
            color: theme?.giftTextButtonColor || "#ffffff",
          }}
        >
          Criar Presente
        </button>
      </form>
    </div>
  );
};

export default CreateGift;
