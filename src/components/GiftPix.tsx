import { useTheme } from "../hooks/useTheme";
import { useState } from "react";

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

type PixModalProps = {
  isOpen: boolean;
  onClose: () => void;
  gift: Gift | null;
  onGoToInvite: () => void;
};

export default function PixModal({
  isOpen,
  onClose,
  gift,
  onGoToInvite,
}: PixModalProps) {
  const { theme } = useTheme();
  const [copied, setCopied] = useState(false);

  const copyPixKey = async () => {
    if (!theme?.pixKey) return;

    try {
      await navigator.clipboard.writeText(theme.pixKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset após 2 segundos
    } catch (err) {
      // Fallback para dispositivos que não suportam clipboard API
      const textArea = document.createElement("textarea");
      textArea.value = theme.pixKey;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      console.error("Falha ao copiar a chave PIX: ", err);
    }
  };

  if (!isOpen || !gift) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-600 hover:text-gray-900 text-xl"
        >
          ✖
        </button>

        <h2 className="text-xl font-semibold mb-4 text-center">
          Pagamento via Pix
        </h2>

        {/* QR Code */}
        <div className="flex justify-center mb-4">
          <div className="w-48 h-48 border-2 border-dashed border-gray-300 flex items-center justify-center rounded-lg overflow-hidden">
            {theme?.pixQrCodeImage ? (
              <img
                src={theme.pixQrCodeImage}
                alt="QR Code PIX"
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="text-center text-gray-500">
                <div className="text-4xl mb-2">📱</div>
                <div className="text-sm">QR Code do Pix</div>
              </div>
            )}
          </div>
        </div>

        {/* Informações do presente */}
        <div className="text-center mb-4">
          <div className="font-semibold text-lg mb-1">{gift.title}</div>
          <div
            className="text-xl font-bold"
            style={{ color: theme?.navBarColor || "#ec4899" }}
          >
            R$ {gift.valor}
          </div>
        </div>

        {/* Informações do PIX */}
        {(theme?.pixKey || theme?.pixBeneficiary) && (
          <div className="bg-gray-50 rounded-lg p-3 mb-4 text-sm">
            {theme.pixBeneficiary && (
              <div className="mb-1">
                <strong>Beneficiário:</strong> {theme.pixBeneficiary}
              </div>
            )}
            {theme.pixKey && (
              <div>
                <strong>Chave PIX:</strong> {theme.pixKey}
              </div>
            )}
          </div>
        )}

        {/* Botão para copiar chave PIX */}
        {theme?.pixKey && (
          <div className="flex justify-center mb-4">
            <button
              onClick={copyPixKey}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 transition-all duration-200 hover:shadow-md active:scale-95 rounded-lg bg-gray-50 hover:bg-gray-100"
              style={{
                boxShadow:
                  copied && !theme?.pixQrCodeImage
                    ? "0 2px 8px rgba(34, 197, 94, 0.3)"
                    : "0 1px 3px rgba(0, 0, 0, 0.1)",
                color: copied ? "#16a34a" : undefined,
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="w-4 h-4"
              >
                {copied ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.375A2.25 2.25 0 0 1 4.125 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184"
                  />
                )}
              </svg>
              <span className="font-medium">
                {copied ? "Chave copiada!" : "Copiar chave PIX"}
              </span>
            </button>
          </div>
        )}

        {/* Botão principal */}
        <button
          onClick={onGoToInvite}
          className="w-full px-4 py-3 rounded-lg transition-all duration-300 hover:brightness-90 mt-10"
          style={{
            background: theme?.giftButtonColor || "#ec4899",
            color: theme?.giftTextButtonColor || "#ffffff",
          }}
        >
          Ir para o convite
        </button>
      </div>
    </div>
  );
}