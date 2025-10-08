import React, { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { useNavigate } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import Loading from "../components/Loading";
import GeneralTab from "../components/theme/GeneralTab";
import ListTab from "../components/theme/ListTab";
import InviteTab from "../components/theme/InviteTab";
import QrCodeTab from "../components/theme/QrCodeTab";

export type Theme = {
  invitationCategory?: string;
  invitationFontFamily?: string;
  invitationTextColor?: string;
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
  giftTextButtonColor: string;
  logoutButtonFontFamily?: string;
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
  // Novas propriedades para QR Code
  pixQrCodeImage?: string;
  pixKey?: string;
  pixBeneficiary?: string;
};

const THEME_DOC_ID = "59zMCCzevS9uOZumvxZ4";

const parseFormattedText = (text: string) => {
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
    const boldMatch = line.slice(currentIndex).match(/^\*\*([^*]+)\*\*/);
    if (boldMatch) {
      tokens.push({ type: "bold", content: boldMatch[1] });
      currentIndex += boldMatch[0].length;
      continue;
    }

    const italicMatch = line.slice(currentIndex).match(/^_([^_]+)_/);
    if (italicMatch) {
      tokens.push({ type: "italic", content: italicMatch[1] });
      currentIndex += italicMatch[0].length;
      continue;
    }

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
      tokens.push({ type: "text", content: line[currentIndex] });
      currentIndex++;
    }
  }

  return tokens.map((token, index) => {
    if (token.type === "bold") {
      return <strong key={index}>{processFormattedLine(token.content)}</strong>;
    } else if (token.type === "italic") {
      return <em key={index}>{processFormattedLine(token.content)}</em>;
    } else {
      return token.content;
    }
  });
};

type TabType = "geral" | "lista" | "convite" | "qrcode";

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
    giftTextButtonColor: "#FFFFFF",
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
    // Novos valores padrão
    pixQrCodeImage: "",
    pixKey: "",
    pixBeneficiary: "",
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

  const handleImageChange = (imageUrl: string) => {
    setTheme((prev) => ({
      ...prev,
      pixQrCodeImage: imageUrl,
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

  const handleCancel = () => {
    navigate("/admin");
  };

  const tabs: Array<{ id: TabType; label: string }> = [
    { id: "geral", label: "Geral" },
    { id: "lista", label: "Lista" },
    { id: "convite", label: "Convite" },
    { id: "qrcode", label: "QR Code" },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "geral":
        return <GeneralTab theme={theme} onChange={handleChange} />;
      case "lista":
        return <ListTab theme={theme} onChange={handleChange} />;
      case "convite":
        return (
          <InviteTab
            theme={theme}
            onChange={handleChange}
            parseFormattedText={parseFormattedText}
          />
        );
      case "qrcode":
        return (
          <QrCodeTab
            theme={theme}
            onChange={handleChange}
            onImageChange={handleImageChange}
          />
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

      {/* Botões */}
      <div className="flex justify-center gap-4 mt-8">
        <button
          onClick={handleCancel}
          className="px-8 py-3 border-2 rounded-lg transition-colors duration-300 hover:bg-gray-50"
          style={{
            borderColor: theme?.logoutButtonColor || "#d1d5db",
            color: theme?.navBarColor || "#374151",
          }}
        >
          Cancelar
        </button>
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
