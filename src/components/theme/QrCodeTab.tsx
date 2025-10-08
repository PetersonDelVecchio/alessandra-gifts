// src/components/theme/QrCodeTab.tsx
import React, { useRef } from "react";
import type { Theme } from "../../pages/ThemePage";

type QrCodeTabProps = {
  theme: Theme;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onImageChange: (imageUrl: string) => void;
};

export default function QrCodeTab({ theme, onChange, onImageChange }: QrCodeTabProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Verificar se é uma imagem
      if (!file.type.startsWith('image/')) {
        alert('Por favor, selecione apenas arquivos de imagem.');
        return;
      }

      // Verificar tamanho (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('A imagem deve ter no máximo 5MB.');
        return;
      }

      // Converter para base64
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        onImageChange(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    onImageChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSelectImage = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      {/* Lado esquerdo - Configurações do QR Code */}
      <div className="flex-1 flex flex-col gap-6">
        <h3
          className="text-xl font-semibold"
          style={{
            color: theme?.navBarColor,
          }}
        >
          QR Code do Pix
        </h3>

        <div>
          <h4 className="text-lg font-semibold mb-4">Upload da Imagem</h4>
          
          <div className="space-y-4">
            {/* Input file escondido */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />

            {/* Botão para selecionar imagem */}
            <button
              type="button"
              onClick={handleSelectImage}
              className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors duration-200 flex flex-col items-center gap-2"
              style={{
                borderColor: theme?.giftBorderColor || '#d1d5db',
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="w-8 h-8 text-gray-400"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18.75 19.5H6.75Z"
                />
              </svg>
              <span className="text-sm text-gray-600">
                Clique para selecionar uma imagem
              </span>
              <span className="text-xs text-gray-400">
                PNG, JPG, GIF até 5MB
              </span>
            </button>

            {/* Botão para remover imagem (só aparece se tiver imagem) */}
            {theme.pixQrCodeImage && (
              <button
                type="button"
                onClick={handleRemoveImage}
                className="w-full px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors duration-200"
              >
                Remover Imagem
              </button>
            )}
          </div>

          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <h5 className="font-semibold text-blue-800 mb-2">💡 Dicas:</h5>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Use uma imagem quadrada para melhor resultado</li>
              <li>• Resolução recomendada: 300x300px ou maior</li>
              <li>• Certifique-se que o QR Code está bem visível</li>
              <li>• Teste o QR Code antes de usar</li>
            </ul>
          </div>
        </div>

        {/* Informações do PIX */}
        <div>
          <h4 className="text-lg font-semibold mb-2">Informações do PIX</h4>
          
          <label className="block mb-2">
            Chave PIX (opcional)
            <input
              type="text"
              name="pixKey"
              value={theme.pixKey || ''}
              onChange={onChange}
              className="w-full mt-1 border rounded px-3 py-2 text-base"
              placeholder="exemplo@email.com ou 11999999999"
            />
            <small className="text-gray-500">
              Para exibir como informação adicional
            </small>
          </label>

          <label className="block mb-2">
            Nome do beneficiário
            <input
              type="text"
              name="pixBeneficiary"
              value={theme.pixBeneficiary || ''}
              onChange={onChange}
              className="w-full mt-1 border rounded px-3 py-2 text-base"
              placeholder="Nome de quem recebe o PIX"
            />
          </label>
        </div>
      </div>

      {/* Lado direito - Preview do QR Code */}
      <div className="flex-1 flex flex-col gap-6">
        <h3
          className="text-xl font-semibold"
          style={{ color: theme.navBarColor }}
        >
          Visualização do PIX
        </h3>

        <div
          className="rounded-lg p-6"
          style={{
            background: theme.bgColor,
            color: theme.bgTextColor,
          }}
        >
          {/* Simulação do modal do PIX */}
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md mx-auto">
            <h2 className="text-xl font-semibold mb-4 text-center text-gray-800">
              Pagamento via Pix
            </h2>

            {/* QR Code */}
            <div className="flex justify-center mb-4">
              <div className="w-48 h-48 border-2 border-dashed border-gray-300 flex items-center justify-center rounded-lg overflow-hidden">
                {theme.pixQrCodeImage ? (
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

            {/* Informações do presente (simulação) */}
            <div className="text-center mb-4">
              <div className="font-semibold text-lg mb-1 text-gray-800">
                Jogo de Panelas Premium
              </div>
              <div className="text-xl font-bold" style={{ color: theme?.navBarColor || "#ec4899" }}>
                R$ 299,90
              </div>
            </div>

            {/* Informações do PIX */}
            {(theme.pixKey || theme.pixBeneficiary) && (
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
      </div>
    </>
  );
}