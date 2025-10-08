// src/components/theme/GeneralTab.tsx
import React from "react";
import type { Theme } from "../../pages/ThemePage";

type GeneralTabProps = {
  theme: Theme;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
};

export default function GeneralTab({ theme, onChange }: GeneralTabProps) {
  return (
    <>
      {/* Lado esquerdo - Configurações Gerais */}
      <div className="flex-1 flex flex-col gap-6">
        <h3
          className="text-xl font-semibold"
          style={{
            color: theme?.navBarColor,
          }}
        >
          Configurações Gerais
        </h3>

        {/* Background */}
        <div>
          <h4 className="text-lg font-semibold mb-2">Background</h4>
          <label className="block mb-2">
            Cor de fundo
            <input
              type="color"
              name="bgColor"
              value={theme.bgColor}
              onChange={onChange}
              className="ml-2"
            />
          </label>
          <label className="block mb-2">
            Cor do texto
            <input
              type="color"
              name="bgTextColor"
              value={theme.bgTextColor}
              onChange={onChange}
              className="ml-2"
            />
          </label>
        </div>

        {/* NavBar/Títulos */}
        <div>
          <h4 className="text-lg font-semibold mb-2">NavBar / Títulos</h4>
          <label className="block mb-2">
            Cor da navbar
            <input
              type="color"
              name="navBarColor"
              value={theme.navBarColor}
              onChange={onChange}
              className="ml-2"
            />
          </label>
          <label className="block mb-2">
            Cor do texto da navbar
            <input
              type="color"
              name="navBarText"
              value={theme.navBarText}
              onChange={onChange}
              className="ml-2"
            />
          </label>
          <div className="flex items-center gap-2 my-3">
            <label
              htmlFor="switch-navbar-shadow"
              className="block cursor-pointer"
            >
              Ativar sombra na navbar
            </label>
            <div className="relative inline-block w-11 h-5">
              <input
                id="switch-navbar-shadow"
                type="checkbox"
                checked={!!theme.navBarShadow}
                onChange={onChange}
                name="navBarShadow"
                className="peer appearance-none w-11 h-5 bg-slate-100 rounded-full checked:bg-pink-600 cursor-pointer transition-colors duration-300"
                style={{
                  backgroundColor: theme.navBarShadow
                    ? theme.navBarColor
                    : undefined,
                }}
              />
              <label
                htmlFor="switch-navbar-shadow"
                className="absolute top-0 left-0 w-5 h-5 bg-white rounded-full border border-slate-300 shadow-sm transition-transform duration-300 peer-checked:translate-x-6 cursor-pointer"
                style={{
                  borderColor: theme.navBarShadow
                    ? theme.navBarColor
                    : undefined,
                }}
              ></label>
            </div>
          </div>
          <label className="block mb-2">
            Fonte dos títulos
            <select
              name="titleFontFamily"
              value={theme.titleFontFamily}
              onChange={onChange}
              className="ml-2 border rounded px-2 py-1"
            >
              <option value="inherit">Padrão</option>
              <option value="'Montserrat', sans-serif">Montserrat</option>
              <option value="'Roboto', sans-serif">Roboto</option>
              <option value="'Parisienne', cursive">Parisienne</option>
            </select>
          </label>
        </div>

        {/* Botões do Sistema */}
        <div>
          <h4 className="text-lg font-semibold mb-2">Botão Sair</h4>
          <label className="block mb-2">
            Cor do botão
            <input
              type="color"
              name="logoutButtonColor"
              value={theme.logoutButtonColor}
              onChange={onChange}
              className="ml-2"
            />
          </label>
          <label className="block mb-2">
            Cor do texto
            <input
              type="color"
              name="logoutButtonTextColor"
              value={theme.logoutButtonTextColor}
              onChange={onChange}
              className="ml-2"
            />
          </label>
          <label className="block mb-2">
            Sair: Fonte
            <select
              name="logoutButtonFontFamily"
              value={theme.logoutButtonFontFamily || "inherit"}
              onChange={onChange}
              className="ml-2 border rounded px-2 py-1"
            >
              <option value="inherit">Padrão</option>
              <option value="'Montserrat', sans-serif">Montserrat</option>
              <option value="'Roboto', sans-serif">Roboto</option>
              <option value="'Parisienne', cursive">Parisienne</option>
              <option value="'Arial', sans-serif">Arial</option>
              <option value="'Times New Roman', serif">
                Times New Roman
              </option>
            </select>
          </label>
        </div>
      </div>

      {/* Preview */}
      <div className="flex-1 flex flex-col gap-6">
        <h2
          className="text-xl font-semibold"
          style={{ color: theme.navBarColor }}
        >
          Visualização do Tema
        </h2>
        <div
          className="rounded-lg p-6 border shadow-md"
          style={{
            background: theme.bgColor,
            color: theme.bgTextColor,
            minHeight: 200,
            borderColor: "#e5e7eb",
          }}
        >
          {/* Conteúdo de exemplo para mostrar o background e texto */}
          <div className="text-center">
            <h3
              className="text-lg font-semibold mb-3"
              style={{ fontFamily: theme.titleFontFamily }}
            >
              Preview do Background
            </h3>

            <p className="mb-3">
              Este é um exemplo de como o texto aparece no fundo da
              aplicação.
            </p>

            <p className="mb-3">
              Aqui você pode visualizar o contraste entre a cor de fundo e
              a cor do texto escolhidas.
            </p>

            <div className="bg-white bg-opacity-10 rounded p-3 mb-3">
              <p className="text-sm">
                Área de destaque para testar legibilidade
              </p>
            </div>

            <p className="text-sm opacity-75">
              Texto secundário com menor opacidade para testar hierarquia
              visual.
            </p>
          </div>
        </div>
        {/* Navbar Preview */}
        <div
          className="rounded-lg px-4 py-3 mb-2 shadow text-center"
          style={{
            background: theme.navBarColor,
            color: theme.navBarText,
            boxShadow: theme.navBarShadow
              ? "0 3px 8px 0 rgba(0,0,0,0.35)"
              : "none",
            fontFamily: theme.titleFontFamily,
            fontSize: 22,
          }}
        >
          {theme.titleListGift}
        </div>
        <div
          className="rounded-lg px-4 py-3 mb-2 shadow text-center"
          style={{
            background: theme.navBarColor,
            color: theme.navBarText,
            boxShadow: theme.navBarShadow
              ? "0 3px 8px 0 rgba(0,0,0,0.35)"
              : "none",
            fontFamily: theme.titleFontFamily,
            fontSize: 22,
          }}
        >
          {theme.titleSelectedGift}
        </div>
        {/* Guest Page Preview */}
        <div className="mb-5">
          <button
            style={{
              background: theme.logoutButtonColor,
              color: theme.logoutButtonTextColor,
              fontFamily:
                theme.logoutButtonFontFamily || theme.titleFontFamily,
            }}
            className="px-4 py-2 rounded-lg shadow mt-6 transition-colors duration-300 hover:opacity-90"
          >
            Sair
          </button>
        </div>
      </div>
    </>
  );
}