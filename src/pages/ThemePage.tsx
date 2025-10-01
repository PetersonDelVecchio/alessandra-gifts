import React, { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { useNavigate } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import Loading from "../components/Loading";

export type Theme = {
  invitationCategory?: string;
  invitationFontFamily?: string; // Fonte do convite
  invitationTextColor?: string; // Cor do texto do convite
  invitationBgColor?: string;
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

  giftBorderColor: string;
  giftBgColor: string;
  giftButtonColor: string;
  giftTextColor: string;
  giftFontFamily: string;
  giftTextButtonColor: string; // Novo campo para a cor do texto do botão do presente
  logoutButtonFontFamily?: string; // Fonte do botão de logout

  inviteAddress: string;
  inviteDate: string;
  inviteHour: string;
  inviteObs: string;
  inviteTitle: string;
  inviteCardBorderColor: string;
  inviteCardBackgroundColor: string;
  inviteCardTextColor: string;
  inviteBackgroundColor: string;
  inviteTextColor: string;
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

const parseFormattedText = (text: string) => {
  // Primeiro, divide por quebras de linha
  return text.split("\n").map((line, lineIndex) => (
    <React.Fragment key={lineIndex}>
      {lineIndex > 0 && <br />}
      {processFormattedLine(line)}
    </React.Fragment>
  ));
};

const processFormattedLine = (line: string) => {
  const tokens: Array<{ type: "text" | "bold" | "italic"; content: string }> =
    [];
  let currentIndex = 0;

  while (currentIndex < line.length) {
    // Procura por **texto**
    const boldMatch = line.slice(currentIndex).match(/^\*\*([^*]+)\*\*/);
    if (boldMatch) {
      tokens.push({ type: "bold", content: boldMatch[1] });
      currentIndex += boldMatch[0].length;
      continue;
    }

    // Procura por _texto_
    const italicMatch = line.slice(currentIndex).match(/^_([^_]+)_/);
    if (italicMatch) {
      tokens.push({ type: "italic", content: italicMatch[1] });
      currentIndex += italicMatch[0].length;
      continue;
    }

    // Se não encontrou formatação, adiciona o próximo caractere como texto
    const nextSpecialChar = line.slice(currentIndex).search(/(\*\*|_)/);
    const textLength =
      nextSpecialChar === -1 ? line.length - currentIndex : nextSpecialChar;

    if (textLength > 0) {
      tokens.push({
        type: "text",
        content: line.slice(currentIndex, currentIndex + textLength),
      });
      currentIndex += textLength;
    } else {
      // Se encontrou um caractere especial mas não conseguiu fazer match, trata como texto normal
      tokens.push({ type: "text", content: line[currentIndex] });
      currentIndex++;
    }
  }

  // Agora processa tokens aninhados (itálico dentro de negrito ou vice-versa)
  return tokens.map((token, index) => {
    if (token.type === "bold") {
      // Processa formatação dentro do negrito
      return <strong key={index}>{processFormattedLine(token.content)}</strong>;
    } else if (token.type === "italic") {
      // Processa formatação dentro do itálico
      return <em key={index}>{processFormattedLine(token.content)}</em>;
    } else {
      return token.content;
    }
  });
};

type TabType = "geral" | "lista" | "convite";

const ThemePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>("geral");
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
    inviteAddress: "Rua das Flores, 123 - Salão de Festas",
    inviteDate: "12/10/2025",
    inviteHour: "19:00",
    inviteObs: "",
    inviteTitle: "Você confirmou presença no aniversário da **Alessandra**!",
    inviteCardBorderColor: "#e5e7eb",
    inviteCardBackgroundColor: "#f9fafb",
    inviteCardTextColor: "#374151",
    inviteBackgroundColor: "#ffffff",
    inviteTextColor: "#111827",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

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

  const handleSave = async () => {
    setSaving(true);
    const themeRef = doc(db, "theme", THEME_DOC_ID);
    await updateDoc(themeRef, { ...theme });
    setSaving(false);
    showToast("Tema atualizado!");
    navigate("/admin");
  };

  const tabs: Array<{ id: TabType; label: string }> = [
    { id: "geral", label: "Geral" },
    { id: "lista", label: "Lista" },
    { id: "convite", label: "Convite" },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "geral":
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
                    onChange={handleChange}
                    className="ml-2"
                  />
                </label>
                <label className="block mb-2">
                  Cor do texto
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
                <h4 className="text-lg font-semibold mb-2">NavBar / Títulos</h4>
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
                      onChange={handleChange}
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
                    onChange={handleChange}
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
                    onChange={handleChange}
                    className="ml-2"
                  />
                </label>
                <label className="block mb-2">
                  Cor do texto
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
              </div>{" "}
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

      case "lista":
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
                  onChange={handleChange}
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
                    onChange={handleChange}
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
                    Cor do texto do botão
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

      case "convite":
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
                  onChange={handleChange}
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
                    onChange={handleChange}
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
                    onChange={handleChange}
                    className="ml-2"
                  />
                </label>

                <label className="block mb-2">
                  Cor do texto do convite
                  <input
                    type="color"
                    name="inviteTextColor"
                    value={theme.inviteTextColor}
                    onChange={handleChange}
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
                    onChange={handleChange}
                    className="ml-2"
                  />
                </label>

                <label className="block mb-2">
                  Cor do fundo
                  <input
                    type="color"
                    name="inviteCardBackgroundColor"
                    value={theme.inviteCardBackgroundColor}
                    onChange={handleChange}
                    className="ml-2"
                  />
                </label>

                <label className="block mb-2">
                  Cor do texto
                  <input
                    type="color"
                    name="inviteCardTextColor"
                    value={theme.inviteCardTextColor}
                    onChange={handleChange}
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
                    onChange={handleChange}
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
                    onChange={handleChange}
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
                    onChange={handleChange}
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
                    onChange={handleChange}
                    className="w-full mt-1 border rounded px-3 py-2 text-base"
                    placeholder="11999999999"
                  />
                </label>

                <label className="block mb-2">
                  Observação
                  <textarea
                    name="inviteObs"
                    value={theme.inviteObs}
                    onChange={handleChange}
                    className="w-full mt-1 border rounded px-3 py-2 text-base"
                    placeholder="Não possui garagem, favor vir de uber"
                    rows={3}
                  />
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
                          <p>{theme.inviteObs}</p>
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

      default:
        return null;
    }
  };

  if (loading) return <Loading message="Carregando configurações..." />;

  return (
    <div className="max-w-6xl mx-auto p-8 bg-white rounded-xl shadow-lg mt-8">
      <h2
        className="text-2xl font-bold mb-6 text-center"
        style={{
          color: theme?.navBarColor,
        }}
      >
        Configuração de Tema
      </h2>

      {/* Tabs */}
      <div className="flex border-b mb-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === tab.id
                ? "border-b-2 border-pink-600 text-pink-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex flex-col md:flex-row gap-8">
        {renderTabContent()}
      </div>

      {/* Botão Salvar */}
      <div className="flex justify-center mt-8">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-8 py-3 rounded-lg transition-colors duration-300 hover:opacity-90"
          style={{
            background: theme?.giftButtonColor || "#e91e63",
            color: theme?.giftTextButtonColor || "#ffffff",
          }}
        >
          {saving ? "Salvando..." : "Salvar Tema"}
        </button>
      </div>
    </div>
  );
};

export default ThemePage;
