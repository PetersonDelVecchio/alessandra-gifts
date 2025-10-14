import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import { useTheme } from "../hooks/useTheme";

type ToastContextType = {
  showToast: (msg: string) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const { theme } = useTheme();
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({
    message: "",
    visible: false,
  });

  function showToast(message: string) {
    setToast({ message, visible: true });
    setTimeout(() => setToast((t) => ({ ...t, visible: false })), 3500);
  }

  function closeToast() {
    setToast((t) => ({ ...t, visible: false }));
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast.visible && (
        <div
          className="fixed bottom-5 right-5 p-4 rounded-lg shadow-xl z-50 border max-w-sm"
          style={{
            // Fundo com blur e transparência melhorada
            background: "rgba(0, 0, 0, 0.85)", // Fundo mais escuro
            backdropFilter: "blur(10px)", // Blur mais forte
            borderColor: theme?.navBarColor || "rgba(255, 255, 255, 0.2)",
            borderWidth: "1px",
            // Texto sempre branco para contraste
            color: "#ffffff",
          }}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium pr-2">{toast.message}</span>
            <button
              onClick={closeToast}
              className="text-white hover:text-gray-300 font-bold text-lg ml-2 transition-colors"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
