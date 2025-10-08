// src/components/theme/ListTab.tsx
import React from "react";
import type { Theme } from "../../pages/ThemePage";

type ListTabProps = {
  theme: Theme;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
};

const mockGifts = [
  {
    id: "1",
    title: "Jogo de Panelas",
    description: "Conjunto antiaderente Tramontina",
    selected: false,
  },
  {
    id: "2",
    title: "Aspirador de Pó",
    description: "Aspirador vertical 2 em 1",
    selected: true,
  },
];

export default function ListTab({ theme, onChange }: ListTabProps) {
  return (
    <>
      {/* Lado esquerdo - Configurações da Lista */}
      <div className="flex-1 flex flex-col gap-6">
        <h3
          className="text-xl font-semibold"
          style={{
            color: theme?.navBarColor,
          }}
        >
          Lista de Presentes
        </h3>

        <label className="block mb-2">
          Título da lista
          <input
            type="text"
            name="titleListGift"
            value={theme.titleListGift}
            onChange={onChange}
            className="w-full mt-1 border rounded px-3 py-2 text-base"
          />
        </label>

        {/* Estilo dos presentes */}
        <div>
          <h4 className="text-lg font-semibold mb-2">
            Estilo dos presentes
          </h4>
          <label className="block mb-2">
            Fonte dos cards
            <select
              name="giftFontFamily"
              value={theme.giftFontFamily}
              onChange={onChange}
              className="ml-2 border rounded px-2 py-1"
            >
              <option value="inherit">Padrão</option>
              <option value="'Montserrat', sans-serif">Montserrat</option>
              <option value="'Roboto', sans-serif">Roboto</option>
              <option value="'Parisienne', cursive">Parisienne</option>
            </select>
          </label>

          <div className="ml-4">
            <div className="font-semibold mb-1">Card:</div>
            <label className="block mb-2">
              Cor da borda
              <input
                type="color"
                name="giftBorderColor"
                value={theme.giftBorderColor}
                onChange={onChange}
                className="ml-2"
              />
            </label>
            <label className="block mb-2">
              Cor do fundo
              <input
                type="color"
                name="giftBgColor"
                value={theme.giftBgColor}
                onChange={onChange}
                className="ml-2"
              />
            </label>
            <label className="block mb-2">
              Cor do texto
              <input
                type="color"
                name="giftTextColor"
                value={theme.giftTextColor}
                onChange={onChange}
                className="ml-2"
              />
            </label>

            <div className="font-semibold mb-1 mt-2">Botão:</div>
            <label className="block mb-2">
              Cor do botão
              <input
                type="color"
                name="giftButtonColor"
                value={theme.giftButtonColor}
                onChange={onChange}
                className="ml-2"
              />
            </label>
            <label className="block mb-2">
              Cor do texto do botão
              <input
                type="color"
                name="giftTextButtonColor"
                value={theme.giftTextButtonColor}
                onChange={onChange}
                className="ml-2"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Lado direito - Preview da Lista */}
      <div className="flex-1 flex flex-col gap-6">
        {/* Preview da Lista */}
        <h3
          className="text-xl font-semibold"
          style={{ color: theme.navBarColor }}
        >
          Visualização da Lista
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
            {theme.titleListGift}
          </h1>

          <div className="grid grid-cols-1 gap-4">
            {mockGifts.map((gift) => (
              <div
                key={gift.id}
                className="rounded-lg border p-4 flex flex-col gap-2"
                style={{
                  opacity: gift.selected ? 0.6 : 1,
                  background: theme.giftBgColor,
                  color: theme.giftTextColor,
                  borderColor: theme.giftBorderColor,
                  borderWidth: 1,
                  borderStyle: "solid",
                  fontFamily: theme.giftFontFamily,
                }}
              >
                <span className="font-semibold">{gift.title}</span>
                <span className="text-sm">{gift.description}</span>
                <button
                  disabled={gift.selected}
                  style={{
                    background: gift.selected
                      ? "#ccc"
                      : theme.giftButtonColor,
                    color: gift.selected
                      ? "#666"
                      : theme.giftTextButtonColor,
                    fontFamily: theme.giftFontFamily,
                  }}
                  className="px-4 py-2 rounded-lg shadow mt-2"
                >
                  {gift.selected ? "Indisponível" : "Escolher presente"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}