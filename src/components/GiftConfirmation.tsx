import { useState, useCallback } from "react";
import { useTheme } from "../hooks/useTheme";
import { Timestamp } from "firebase/firestore";
import ReservationTimer from "./ReservationTimer";
import Modal from "./Modal";

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
  reservedBy?: string | null;
  reservedAt?: Timestamp | Date | null;
  reservationExpiry?: Timestamp | Date | null;
};

type GiftConfirmationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  gift: Gift | null;
  onConfirm: (method: "levar" | "pix") => void;
  onReservationExpired: () => void;
};

export default function GiftConfirmationModal({
  isOpen,
  onClose,
  gift,
  onConfirm,
  onReservationExpired,
}: GiftConfirmationModalProps) {
  const { theme } = useTheme();
  const [selectedMethod, setSelectedMethod] = useState<"levar" | "pix" | "">(
    ""
  );

  // Memoiza o callback para evitar re-renders do timer
  const handleTimerExpired = useCallback(() => {
    onReservationExpired();
  }, [onReservationExpired]);

  const handleConfirm = () => {
    if (
      selectedMethod &&
      (selectedMethod === "levar" || selectedMethod === "pix")
    ) {
      // Reset do método selecionado ANTES de confirmar
      setSelectedMethod("");
      
      // Chama a função de confirmação
      onConfirm(selectedMethod);
    }
  };

  const handleClose = () => {
    setSelectedMethod("");
    onClose();
  };

  if (!gift) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
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
          onChange={(e) =>
            setSelectedMethod(e.target.value as "levar" | "pix" | "")
          }
          className="w-full p-3 border rounded-lg transition-all duration-200 outline-none"
          style={{
            borderColor: selectedMethod 
              ? theme?.giftButtonColor || theme?.navBarColor || "#ec4899"
              : theme?.giftBorderColor || "#d1d5db",
            borderWidth: selectedMethod ? "2px" : "1px",
            boxShadow: selectedMethod 
              ? `0 0 0 3px ${theme?.giftButtonColor || theme?.navBarColor || "#ec4899"}20`
              : "none",
          }}
          onFocus={(e) => {
            e.target.style.borderColor = theme?.giftButtonColor || theme?.navBarColor || "#ec4899";
            e.target.style.borderWidth = "2px";
            e.target.style.boxShadow = `0 0 0 3px ${theme?.giftButtonColor || theme?.navBarColor || "#ec4899"}20`;
          }}
          onBlur={(e) => {
            if (!selectedMethod) {
              e.target.style.borderColor = theme?.giftBorderColor || "#d1d5db";
              e.target.style.borderWidth = "1px";
              e.target.style.boxShadow = "none";
            }
          }}
        >
          <option value="">Selecione uma opção</option>
          <option value="levar">Levar o presente</option>
          <option value="pix">Pix</option>
        </select>
      </div>

      {/* Timer */}
      <div className="mb-6">
        <ReservationTimer
          initialTime={60}
          onExpired={handleTimerExpired}
          isActive={isOpen && !!gift}
        />
      </div>

      {/* Botões */}
      <div className="flex gap-3">
        <button
          onClick={handleClose}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={handleConfirm}
          disabled={!selectedMethod}
          className="flex-1 px-4 py-2 rounded-lg transition-all duration-300 hover:brightness-90 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: selectedMethod
              ? theme?.giftButtonColor || "#ec4899"
              : "#ccc",
            color: selectedMethod
              ? theme?.giftTextButtonColor || "#ffffff"
              : "#666",
          }}
        >
          Confirmar
        </button>
      </div>
    </Modal>
  );
}
