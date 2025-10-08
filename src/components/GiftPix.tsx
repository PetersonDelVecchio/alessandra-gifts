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
          <div className="text-xl font-bold" style={{ color: theme?.navBarColor || "#ec4899" }}>
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

        {/* Botão */}
        <button
          onClick={onGoToInvite}
          className="w-full px-4 py-3 rounded-lg transition-all duration-300 hover:brightness-90"
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