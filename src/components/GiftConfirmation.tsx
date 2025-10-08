import React, { useState } from "react";
import { useTheme } from "../hooks/useTheme";

type Gift = {
  id: string;
  title: string;
  description: string;
  selected: boolean;
  selectedBy?: string;
  selectedPhone?: string;
  guestId?: string | null;
  active?: boolean;
  valor?: string;
  url?: string;
};

type GiftConfirmationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  gift: Gift | null;
  onConfirm: (method: "levar" | "pix") => void;
};

export default function GiftConfirmationModal({
  isOpen,
  onClose,
  gift,
  onConfirm,
}: GiftConfirmationModalProps) {
  const { theme } = useTheme();
  const [selectedMethod, setSelectedMethod] = useState<"levar" | "pix" | "">("");

  if (!isOpen || !gift) return null;

  const handleConfirm = () => {
    if (selectedMethod && (selectedMethod === "levar" || selectedMethod === "pix")) {
      onConfirm(selectedMethod);
    }
  };

  const handleClose = () => {
    setSelectedMethod("");
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg relative">
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 text-gray-600 hover:text-gray-900 text-xl"
        >
          ✖
        </button>

        <h2 className="text-xl font-semibold mb-4 text-center">
          Confirmar Presente
        </h2>

        {/* Card do presente */}
        <div
          className="rounded-lg border p-4 mb-6"
          style={{
            background: theme?.giftBgColor,
            color: theme?.giftTextColor,
            borderColor: theme?.giftBorderColor,
            borderWidth: 1,
            borderStyle: "solid",
            fontFamily: theme?.giftFontFamily,
          }}
        >
          <div className="font-semibold mb-2">
            {gift.url ? (
              <a
                href={gift.url}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:opacity-75 transition-opacity"
                style={{ color: theme?.navBarColor || "#ec4899" }}
              >
                {gift.title}
              </a>
            ) : (
              gift.title
            )}
          </div>
          <div className="font-extralight text-lg">R$ {gift.valor}</div>
        </div>

        {/* Dropdown de método */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Método de presentear:
          </label>
          <select
            value={selectedMethod}
            onChange={(e) => setSelectedMethod(e.target.value as "levar" | "pix" | "")}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2"
            style={{
              borderColor: theme?.giftBorderColor || "#d1d5db",
              focusRingColor: theme?.giftBorderColor || "#ec4899",
            }}
          >
            <option value="">Selecione uma opção</option>
            <option value="levar">Levar o presente</option>
            <option value="pix">Pix</option>
          </select>
        </div>

        {/* Botões */}
        <div className="flex gap-3">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            style={{
              borderColor: theme?.giftBorderColor || "#d1d5db",
            }}
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedMethod}
            className="flex-1 px-4 py-2 rounded-lg transition-all duration-300 hover:brightness-90 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: selectedMethod ? theme?.giftButtonColor || "#ec4899" : "#ccc",
              color: selectedMethod ? theme?.giftTextButtonColor || "#ffffff" : "#666",
            }}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}