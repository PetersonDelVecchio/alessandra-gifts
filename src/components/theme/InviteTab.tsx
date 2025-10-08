// src/components/theme/InviteTab.tsx
import React from "react";
import type { Theme } from "../../pages/ThemePage";

type InviteTabProps = {
  theme: Theme;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  parseFormattedText: (text: string) => React.ReactNode;
};

export default function InviteTab({ theme, onChange, parseFormattedText }: InviteTabProps) {
  return (
    <>
      {/* Lado esquerdo - Configurações do Convite */}
      <div className="flex-1 flex flex-col gap-6">
        <h3
          className="text-xl font-semibold"
          style={{
            color: theme?.navBarColor,
          }}
        >
          Invite / Convite
        </h3>

        <label className="block mb-2">
          Título do presente selecionado
          <input
            type="text"
            name="titleSelectedGift"
            value={theme.titleSelectedGift}
            onChange={onChange}
            className="w-full mt-1 border rounded px-3 py-2 text-base"
          />
        </label>

        {/* Configurações do Convite */}
        <div>
          <h4 className="text-lg font-semibold mb-2">
            Aparência do Convite
          </h4>

          <label className="block mb-2">
            Título do convite
            <textarea
              name="inviteTitle"
              value={theme.inviteTitle}
              onChange={onChange}
              className="w-full mt-1 border rounded px-3 py-2 text-base"
              placeholder="Você confirmou presença no aniversário da **Alessandra**!"
              rows={2}
            />
            <small className="text-gray-500">
              Use **texto** para negrito e _texto_ para itálico
            </small>
          </label>

          <label className="block mb-2">
            Cor de fundo do convite
            <input
              type="color"
              name="inviteBackgroundColor"
              value={theme.inviteBackgroundColor}
              onChange={onChange}
              className="ml-2"
            />
          </label>

          <label className="block mb-2">
            Cor do texto do convite
            <input
              type="color"
              name="inviteTextColor"
              value={theme.inviteTextColor}
              onChange={onChange}
              className="ml-2"
            />
          </label>
        </div>

        {/* Card do Presente Escolhido */}
        <div>
          <h4 className="text-lg font-semibold mb-2">
            Card "Presente Escolhido"
          </h4>

          <label className="block mb-2">
            Cor da borda
            <input
              type="color"
              name="inviteCardBorderColor"
              value={theme.inviteCardBorderColor}
              onChange={onChange}
              className="ml-2"
            />
          </label>

          <label className="block mb-2">
            Cor do fundo
            <input
              type="color"
              name="inviteCardBackgroundColor"
              value={theme.inviteCardBackgroundColor}
              onChange={onChange}
              className="ml-2"
            />
          </label>

          <label className="block mb-2">
            Cor do texto
            <input
              type="color"
              name="inviteCardTextColor"
              value={theme.inviteCardTextColor}
              onChange={onChange}
              className="ml-2"
            />
          </label>
        </div>

        {/* Dados do Evento */}
        <div>
          <h4 className="text-lg font-semibold mb-2">Dados do Evento</h4>

          <label className="block mb-2">
            Endereço
            <input
              type="text"
              name="inviteAddress"
              value={theme.inviteAddress}
              onChange={onChange}
              className="w-full mt-1 border rounded px-3 py-2 text-base"
              placeholder="Rua das Flores, 123 - Salão de Festas"
            />
          </label>

          <label className="block mb-2">
            Data
            <input
              type="text"
              name="inviteDate"
              value={theme.inviteDate}
              onChange={onChange}
              className="w-full mt-1 border rounded px-3 py-2 text-base"
              placeholder="12/10/2025"
            />
          </label>

          <label className="block mb-2">
            Hora
            <input
              type="text"
              name="inviteHour"
              value={theme.inviteHour}
              onChange={onChange}
              className="w-full mt-1 border rounded px-3 py-2 text-base"
              placeholder="19:00"
            />
          </label>

          <label className="block mb-2">
            WhatsApp (só números)
            <input
              type="text"
              name="whatsapp"
              value={theme.whatsapp}
              onChange={onChange}
              className="w-full mt-1 border rounded px-3 py-2 text-base"
              placeholder="11999999999"
            />
          </label>

          <label className="block mb-2">
            Observação
            <textarea
              name="inviteObs"
              value={theme.inviteObs}
              onChange={onChange}
              className="w-full mt-1 border rounded px-3 py-2 text-base"
              placeholder="Não possui garagem, favor vir de uber"
              rows={3}
            />
            <small className="text-gray-500">
              Use quebras de linha para separar parágrafos
            </small>
          </label>
        </div>
      </div>

      {/* Lado direito - Preview do Convite */}
      <div className="flex-1 flex flex-col gap-6">
        <h3
          className="text-xl font-semibold"
          style={{ color: theme.navBarColor }}
        >
          Visualização do Convite
        </h3>

        <div
          className="rounded-lg p-6"
          style={{
            background: theme.bgColor,
            color: theme.bgTextColor,
          }}
        >
          <h1
            className="rounded-lg px-4 py-3 shadow text-center mb-10"
            style={{
              background: theme.navBarColor,
              color: theme.navBarText,
              boxShadow: theme.navBarShadow
                ? "0 4px 10px 0 rgba(0,0,0,0.3)"
                : "none",
              fontFamily: theme.titleFontFamily,
            }}
          >
            {theme.titleSelectedGift}
          </h1>

          <div
            className="rounded-lg border p-6 flex flex-col gap-4"
            style={{
              background: theme.inviteBackgroundColor,
              color: theme.inviteTextColor,
              borderColor: theme.giftBorderColor,
              borderWidth: 1,
              borderStyle: "solid",
              fontFamily: theme.giftFontFamily,
            }}
          >
            <h1
              className="text-3xl font-bold text-center mb-2"
              style={{ fontFamily: theme.titleFontFamily }}
            >
              Convite Especial 🎉
            </h1>

            <p className="text-lg text-center mb-4">
              {parseFormattedText(theme.inviteTitle)}
            </p>

            {/* Presente Escolhido */}
            <div
              className="mb-4 border rounded-lg p-4"
              style={{
                background: theme.inviteCardBackgroundColor,
                borderColor: theme.inviteCardBorderColor,
                color: theme.inviteCardTextColor,
              }}
            >
              <h2 className="text-xl font-semibold mb-2 text-center">
                Presente Escolhido
              </h2>
              <div className="text-center">
                <span className="font-bold text-lg">
                  Jogo de Panelas Premium
                </span>
                <p className="mt-2">Conjunto antiaderente com 5 peças</p>
                <p className="mt-2 font-semibold">Valor: R$ 299,90</p>
              </div>
            </div>

            {/* Detalhes do Evento */}
            <div className="mb-4">
              <h2 className="text-xl font-semibold mb-2 text-center">
                Detalhes do Evento
              </h2>
              <div className="text-center">
                <p>
                  <strong>Data:</strong> {theme.inviteDate}
                </p>
                <p>
                  <strong>Horário:</strong> {theme.inviteHour}
                </p>
                <p>
                  <strong>Local:</strong> {theme.inviteAddress}
                </p>
                {theme.inviteObs && (
                  <>
                    <br />
                    <p>
                      <strong>Observação:</strong>
                    </p>
                    <div className="text-center">
                      {parseFormattedText(theme.inviteObs)}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Botão WhatsApp - só aparece se tiver número */}
            {theme.whatsapp && (
              <button
                className="px-4 py-2 rounded-lg shadow mt-4 flex items-center justify-center gap-2 transition-colors duration-300"
                style={{
                  background: theme.giftButtonColor,
                  color: theme.giftTextButtonColor,
                  fontFamily: theme.giftFontFamily,
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12.004 2.003c-5.523 0-10 4.477-10 10 0 1.768.466 3.484 1.352 4.995l-1.432 5.243 5.377-1.411c1.463.803 3.117 1.173 4.703 1.173 5.523 0 10-4.477 10-10s-4.477-10-10-10zm0 18.001c-1.463 0-2.892-.369-4.141-1.067l-.297-.17-3.191.838.852-3.122-.193-.321c-.813-1.353-1.241-2.899-1.241-4.458 0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8zm4.406-6.309c-.242-.121-1.434-.707-1.655-.788-.221-.081-.382-.121-.543.121-.161.242-.621.788-.761.95-.141.161-.281.181-.523.06-.242-.121-1.022-.377-1.947-1.201-.72-.642-1.207-1.435-1.35-1.677-.141-.242-.015-.373.106-.494.109-.108.242-.281.363-.421.121-.141.161-.242.242-.403.081-.161.04-.302-.02-.423-.06-.121-.543-1.312-.744-1.797-.196-.472-.396-.408-.543-.416-.141-.008-.302-.01-.463-.01-.161 0-.423.06-.645.302-.221.242-.843.825-.843 2.008 0 1.183.863 2.325.983 2.487.121.161 1.697 2.594 4.122 3.527.577.198 1.027.316 1.378.404.578.147 1.104.126 1.52.077.464-.055 1.434-.586 1.637-1.152.202-.566.202-1.051.141-1.152-.06-.101-.221-.161-.463-.282z" />
                </svg>
                Falar no WhatsApp
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}