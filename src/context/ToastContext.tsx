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
          className="fixed bottom-5 right-5 bg-black p-4 rounded-lg shadow-md z-50"
          style={{
            background: theme?.giftTextButtonColor
              ? `${theme.giftTextButtonColor}33` // CC = 80% opacity em hex
              : "rgba(236, 72, 153, 0.4)", // fallback para pink-600 com 80% opacity
            backdropFilter: "blur(2px)",
          }}
        >
          {" "}
          <span>{toast.message}</span>
          <button onClick={closeToast} className="font-bold text-lg ml-2">
            ×
          </button>
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
