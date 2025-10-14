import { useTheme } from "../hooks/useTheme";
import { useState } from "react";
import Modal from "./Modal"; // Importar o Modal com blur

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
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback para dispositivos que não suportam clipboard API
      console.error("Failed to copy: ", err);
      const textArea = document.createElement("textarea");
      textArea.value = theme.pixKey;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!gift) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className="text-xl font-semibold mb-4 text-center text-gray-900">
        💳 Pagamento via Pix
      </h2>

      {/* QR Code */}
      <div className="flex justify-center mb-6">
        <div className="w-52 h-52 border-2 border-dashed border-gray-300 flex items-center justify-center rounded-xl overflow-hidden bg-white">
          {theme?.pixQrCodeImage ? (
            <img
              src={theme.pixQrCodeImage}
              alt="QR Code PIX"
              className="w-full h-full object-contain p-2"
            />
          ) : (
            <div className="text-center text-gray-500">
              <div className="text-4xl mb-2">📱</div>
              <div className="text-sm font-medium">QR Code do Pix</div>
            </div>
          )}
        </div>
      </div>

      {/* Informações do presente */}
      <div className="text-center mb-6">
        <div className="font-semibold text-lg mb-2 text-gray-900">
          {gift.title}
        </div>
        <div
          className="text-2xl font-bold"
          style={{
            color:
              theme?.giftButtonColor || theme?.navBarColor || "#ec4899",
          }}
        >
          R$ {gift.valor}
        </div>
      </div>

      {/* Informações do PIX */}
      {(theme?.pixKey || theme?.pixBeneficiary) && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6 text-sm border border-gray-200">
          {theme.pixBeneficiary && (
            <div className="mb-2 flex items-center gap-2">
              <span className="font-semibold text-gray-700">👤 Beneficiário:</span>
              <span className="text-gray-900">{theme.pixBeneficiary}</span>
            </div>
          )}
          {theme.pixKey && (
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-700">🔑 Chave PIX:</span>
              <span className="text-gray-900 font-mono text-xs bg-white px-2 py-1 rounded border">
                {theme.pixKey}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Botão para copiar chave PIX */}
      {theme?.pixKey && (
        <div className="flex justify-center mb-6">
          <button
            onClick={copyPixKey}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all duration-200 rounded-lg border"
            style={{
              background: copied ? "#f0fdf4" : "#f9fafb",
              borderColor: copied ? "#16a34a" : "#d1d5db",
              color: copied ? "#16a34a" : "#374151",
              boxShadow: copied
                ? "0 2px 8px rgba(34, 197, 94, 0.2)"
                : "0 1px 3px rgba(0, 0, 0, 0.1)",
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
            <span>
              {copied ? "✅ Chave copiada!" : "📋 Copiar chave PIX"}
            </span>
          </button>
        </div>
      )}

      {/* Instruções */}
      <div className="bg-blue-50 rounded-lg p-4 mb-6 border border-blue-200">
        <div className="flex items-start gap-3">
          <div className="text-blue-600 text-xl">💡</div>
          <div className="text-sm text-blue-800">
            <div className="font-semibold mb-1">Como pagar:</div>
            <ol className="list-decimal list-inside space-y-1 text-xs">
              <li>Escaneie o QR Code com seu app do banco</li>
              <li>Ou copie a chave PIX e cole no app</li>
              <li>
                Confirme o valor:{" "}
                <strong>R$ {gift.valor}</strong>
              </li>
              <li>Efetue o pagamento</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Botão principal */}
      <button
        onClick={onGoToInvite}
        className="w-full px-4 py-3 rounded-lg font-semibold transition-all duration-300 hover:brightness-90 text-white shadow-lg"
        style={{
          background: `linear-gradient(135deg, ${
            theme?.giftButtonColor || theme?.navBarColor || "#ec4899"
          }, ${theme?.giftButtonColor || theme?.navBarColor || "#ec4899"}dd)`,
        }}
      >
        🎉 Ir para o convite
      </button>

      {/* Rodapé */}
      <div className="mt-4 text-center text-xs text-gray-500">
        Após efetuar o pagamento, clique no botão acima
      </div>
    </Modal>
  );
}