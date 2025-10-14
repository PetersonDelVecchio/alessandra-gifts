import type { ReactNode } from "react";
import { useTheme } from "../hooks/useTheme";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
};

export default function Modal({ isOpen, onClose, children }: ModalProps) {
  const { theme } = useTheme();
  
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{
        background: "rgba(0, 0, 0, 0.7)", // Fundo escuro semi-transparente
        backdropFilter: "blur(8px)", // Blur no fundo
        WebkitBackdropFilter: "blur(8px)", // Compatibilidade Safari
      }}
      onClick={onClose} // Fechar ao clicar no backdrop
    >
      <div 
        className="rounded-xl shadow-2xl p-6 w-full max-w-lg relative"
        style={{
          background: "rgba(255, 255, 255, 0.95)", // Fundo branco quase opaco
          backdropFilter: "blur(10px)", // Blur adicional no conteúdo
          WebkitBackdropFilter: "blur(10px)", // Compatibilidade Safari
          border: "1px solid rgba(255, 255, 255, 0.2)", // Borda sutil
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)", // Sombra elegante
        }}
        onClick={(e) => e.stopPropagation()} // Evitar fechar ao clicar no conteúdo
      >
        {/* Botão de fechar estilizado */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 hover:bg-gray-100"
          style={{ 
            color: theme?.navBarColor || "#6b7280",
          }}
          title="Fechar"
        >
          <svg 
            className="w-5 h-5" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              d="M6 18L18 6M6 6l12 12" 
            />
          </svg>
        </button>

        {children}
      </div>
    </div>
  );
}
