import React, { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { useNavigate } from "react-router-dom";
import { useToast } from "../context/ToastContext";

export type Theme = {
  bgColor: string;
  bgTextColor: string;
  navBarColor: string;
  navBarShadow: boolean;
  navBarText: string;
  titleListGift: string;
  titleSelectedGift: string;
  whatsapp: string;
  listSelected: boolean;
  buttonColor: string;
  buttonTextColor: string;
  logoutButtonColor: string;
  logoutButtonTextColor: string;
  titleFontFamily: string;
  // Novos campos para os cards
  giftBorderColor: string;
  giftBgColor: string;
  giftButtonColor: string;
  giftTextColor: string;
  giftFontFamily: string;
  giftTextButtonColor: string; // Novo campo para a cor do texto do botão do presente
  logoutButtonFontFamily?: string; // Fonte do botão de logout
};

const THEME_DOC_ID = "59zMCCzevS9uOZumvxZ4";

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

const ThemePage: React.FC = () => {
  const [theme, setTheme] = useState<Theme>({
    bgColor: "#ffffff",
    bgTextColor: "#000000",
    navBarColor: "#ffffff",
    navBarShadow: false,
    navBarText: "#000000",
    titleListGift: "Lista de Presentes",
    titleSelectedGift: "Presente Selecionado",
    whatsapp: "",
    listSelected: false,
    buttonColor: "#4CAF50",
    buttonTextColor: "#FFFFFF",
    logoutButtonColor: "#f44336",
    logoutButtonTextColor: "#FFFFFF",
    titleFontFamily: "inherit",
    giftBorderColor: "#e5e7eb",
    giftBgColor: "#fff",
    giftButtonColor: "#e91e63",
    giftTextColor: "#222",
    giftFontFamily: "inherit",
    giftTextButtonColor: "#FFFFFF", // Valor padrão para a cor do texto do botão do presente
    logoutButtonFontFamily: "inherit",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTheme = async () => {
      const themeRef = doc(db, "theme", THEME_DOC_ID);
      const snap = await getDoc(themeRef);
      if (snap.exists()) {
        setTheme({ ...theme, ...snap.data() } as Theme);
      }
      setLoading(false);
    };
    fetchTheme();
    // eslint-disable-next-line
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    setTheme((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };
  const { showToast } = useToast();

  const handleSave = async () => {
    setSaving(true);
    const themeRef = doc(db, "theme", THEME_DOC_ID);
    await updateDoc(themeRef, { ...theme });
    setSaving(false);
    showToast("Tema atualizado!");
    navigate("/admin");
  };

  if (loading) return <div className="p-8 text-center">Carregando tema...</div>;

  return (
    <div className="max-w-6xl mx-auto p-8 bg-white rounded-xl shadow-lg mt-8 flex flex-col md:flex-row gap-8">
      {/* LADO ESQUERDO: Configurações */}
      <div className="flex-1 flex flex-col gap-6">
        <h2 className="text-2xl font-bold mb-2 text-pink-600">
          Configuração de Tema
        </h2>
        {/* Background */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Background</h3>
          <label className="block mb-2">
            Cor de fundo
            <input
              type="color"
              name="bgColor"
              value={theme.bgColor}
              onChange={handleChange}
              className="ml-2"
            />
          </label>
          <label className="block mb-2">
            Cor do texto do fundo
            <input
              type="color"
              name="bgTextColor"
              value={theme.bgTextColor}
              onChange={handleChange}
              className="ml-2"
            />
          </label>
        </div>
        {/* NavBar/Títulos */}
        <div>
          <h3 className="text-lg font-semibold mb-2">NavBar / Títulos</h3>
          <label className="block mb-2">
            Cor da navbar
            <input
              type="color"
              name="navBarColor"
              value={theme.navBarColor}
              onChange={handleChange}
              className="ml-2"
            />
          </label>
          <label className="block mb-2">
            Cor do texto da navbar
            <input
              type="color"
              name="navBarText"
              value={theme.navBarText}
              onChange={handleChange}
              className="ml-2"
            />
          </label>
          <div className="flex items-center gap-2 mb-2">
              Ativar sombra na navbar
            <div className="relative inline-block w-11 h-5">

              <input
                id="switch-navbar-shadow"
                type="checkbox"
                checked={!!theme.navBarShadow}
                onChange={handleChange}
                name="navBarShadow"
                className="peer appearance-none w-11 h-5 bg-slate-100 rounded-full checked:bg-pink-600 cursor-pointer transition-colors duration-300"
                style={{
                  backgroundColor: theme.navBarShadow ? theme.navBarColor : undefined,
                }}
              />
              <label
                htmlFor="switch-navbar-shadow"
                className="absolute top-0 left-0 w-5 h-5 bg-white rounded-full border border-slate-300 shadow-sm transition-transform duration-300 peer-checked:translate-x-6 cursor-pointer"
                style={{
                  borderColor: theme.navBarShadow ? theme.navBarColor : undefined,
                }}
              ></label>
            </div>
          </div>
          <label className="block mb-2">
            Fonte do título das páginas
            <select
              name="titleFontFamily"
              value={theme.titleFontFamily}
              onChange={handleChange}
              className="ml-2 border rounded px-2 py-1"
            >
              <option value="inherit">Padrão</option>
              <option value="'Montserrat', sans-serif">Montserrat</option>
              <option value="'Roboto', sans-serif">Roboto</option>
              <option value="'Parisienne', cursive">Parisienne</option>
              <option value="'Arial', sans-serif">Arial</option>
              <option value="'Times New Roman', serif">Times New Roman</option>
            </select>
          </label>
          <label className="block mb-2">
            Título da lista de presentes
            <input
              type="text"
              name="titleListGift"
              value={theme.titleListGift}
              onChange={handleChange}
              className="ml-2 border rounded px-2 py-1"
            />
          </label>
          <label className="block mb-2">
            Título do presente selecionado
            <input
              type="text"
              name="titleSelectedGift"
              value={theme.titleSelectedGift}
              onChange={handleChange}
              className="ml-2 border rounded px-2 py-1"
            />
          </label>
        </div>
        {/* Botões do sistema */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Botões do sistema</h3>
          <label className="block mb-2">
            Sair: Cor
            <input
              type="color"
              name="logoutButtonColor"
              value={theme.logoutButtonColor}
              onChange={handleChange}
              className="ml-2"
            />
          </label>
          <label className="block mb-2">
            Sair: Cor do texto
            <input
              type="color"
              name="logoutButtonTextColor"
              value={theme.logoutButtonTextColor}
              onChange={handleChange}
              className="ml-2"
            />
          </label>
          <label className="block mb-2">
            Sair: Fonte
            <select
              name="logoutButtonFontFamily"
              value={theme.logoutButtonFontFamily || "inherit"}
              onChange={handleChange}
              className="ml-2 border rounded px-2 py-1"
            >
              <option value="inherit">Padrão</option>
              <option value="'Montserrat', sans-serif">Montserrat</option>
              <option value="'Roboto', sans-serif">Roboto</option>
              <option value="'Parisienne', cursive">Parisienne</option>
              <option value="'Arial', sans-serif">Arial</option>
              <option value="'Times New Roman', serif">Times New Roman</option>
            </select>
          </label>
        </div>
        {/* Estilo dos presentes */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Estilo dos presentes</h3>
          <label className="block mb-2">
            Fonte
            <select
              name="giftFontFamily"
              value={theme.giftFontFamily}
              onChange={handleChange}
              className="ml-2 border rounded px-2 py-1"
            >
              <option value="inherit">Padrão</option>
              <option value="'Montserrat', sans-serif">Montserrat</option>
              <option value="'Roboto', sans-serif">Roboto</option>
              <option value="'Parisienne', cursive">Parisienne</option>
              <option value="'Arial', sans-serif">Arial</option>
              <option value="'Times New Roman', serif">Times New Roman</option>
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
                onChange={handleChange}
                className="ml-2"
              />
            </label>
            <label className="block mb-2">
              Cor do fundo
              <input
                type="color"
                name="giftBgColor"
                value={theme.giftBgColor}
                onChange={handleChange}
                className="ml-2"
              />
            </label>
            <label className="block mb-2">
              Cor do texto
              <input
                type="color"
                name="giftTextColor"
                value={theme.giftTextColor}
                onChange={handleChange}
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
                onChange={handleChange}
                className="ml-2"
              />
            </label>
            <label className="block mb-2">
              Cor do texto
              <input
                type="color"
                name="giftTextButtonColor"
                value={theme.giftTextButtonColor}
                onChange={handleChange}
                className="ml-2"
              />
            </label>
          </div>
        </div>
        {/* Outros */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Outros</h3>
          <label className="block mb-2">
            WhatsApp (somente números)
            <input
              type="text"
              name="whatsapp"
              value={theme.whatsapp}
              onChange={handleChange}
              className="ml-2 border rounded px-2 py-1"
            />
          </label>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition mt-4"
        >
          {saving ? "Salvando..." : "Salvar"}
        </button>
      </div>

      {/* LADO DIREITO: Preview */}
      <div className="flex-1 flex flex-col gap-6">
        <h2 className="text-2xl font-bold mb-2 text-pink-600">
          Visualização do Tema
        </h2>
        {/* Navbar Preview */}
        <h2
          className=" font-bold mb-4"
          style={{ fontFamily: theme.titleFontFamily }}
        >
          Lista de presentes
        </h2>
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
        </div>{" "}
        <h2
          className=" font-bold mb-4"
          style={{ fontFamily: theme.titleFontFamily }}
        >
          Presente selecionado
        </h2>
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
        <div
          className="rounded-lg p-6"
          style={{
            background: theme.bgColor,
            color: theme.bgTextColor,
            minHeight: 320,
          }}
        >
          <h1
            className="text-2xl font-bold mb-4"
            style={{ fontFamily: theme.titleFontFamily }}
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
                    background: gift.selected ? "#ccc" : theme.giftButtonColor,
                    color: gift.selected ? "#666" : theme.giftTextButtonColor, // <-- aqui!
                    fontFamily: theme.giftFontFamily,
                  }}
                  className="px-4 py-2 rounded-lg shadow mt-2"
                >
                  {gift.selected ? "Indisponível" : "Escolher presente"}
                </button>
              </div>
            ))}
          </div>
          <button
            style={{
              background: theme.logoutButtonColor,
              color: theme.logoutButtonTextColor,
              fontFamily: theme.logoutButtonFontFamily || theme.titleFontFamily,
            }}
            className="px-4 py-2 rounded-lg shadow mt-6"
          >
            Sair
          </button>
        </div>
      </div>
    </div>
  );
};

export default ThemePage;
