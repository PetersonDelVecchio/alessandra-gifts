import React, { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { useTheme } from "../hooks/useTheme";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import Loading from "../components/Loading";

dayjs.extend(duration);

type Gift = {
  id: string;
  title: string;
  url: string;
  description: string;
  value?: number;
};

// Função atualizada para suportar quebras de linha, negrito e itálico
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

const Invite: React.FC = () => {
  const [gift, setGift] = useState<Gift | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState<string>("");
  const { theme, loading: themeLoading } = useTheme();
  const navigate = useNavigate();

  // Usa os dados do tema para o evento
  const eventDate = theme?.inviteDate || "12/10/2025";
  const eventHour = theme?.inviteHour || "19:00";
  const eventDateTime = `${eventDate} ${eventHour}`;

  useEffect(() => {
    const checkGiftSelected = async () => {
      const guestId = localStorage.getItem("guestId");
      if (!guestId) {
        navigate("/guest");
        return;
      }
      const guestRef = doc(db, "guests", guestId);
      const snap = await getDoc(guestRef);
      if (!snap.exists() || !snap.data().giftSelected) {
        navigate("/guest");
        return;
      }
      setLoading(false);
    };
    checkGiftSelected();
  }, [navigate]);

  useEffect(() => {
    const guestId = localStorage.getItem("guestId");
    if (!guestId) {
      navigate("/guest");
      return;
    }

    const fetchGuestAndGift = async () => {
      const guestRef = doc(db, "guests", guestId);
      const guestSnap = await getDoc(guestRef);
      const guestData = guestSnap.data();
      if (guestData && guestData.giftId) {
        const giftRef = doc(db, "gifts", guestData.giftId);
        const giftSnap = await getDoc(giftRef);
        const giftData = giftSnap.data();
        if (giftData) {
          setGift({
            id: giftSnap.id,
            url: giftData.url,
            title: giftData.title,
            description: giftData.description,
            value: giftData.value,
          });
        }
      }
      setLoading(false);
    };

    fetchGuestAndGift();
  }, [navigate]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = dayjs();
      const event = dayjs(eventDateTime, "DD/MM/YYYY HH:mm");
      const diff = event.diff(now);

      if (diff > 0) {
        const d = dayjs.duration(diff);
        setTimeLeft(
          `${d.days()}d ${d.hours()}h ${d.minutes()}m ${d.seconds()}s`
        );
      } else {
        setTimeLeft("A festa já começou!");
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [eventDateTime]);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  const whatsappNumber = theme?.whatsapp
    ? theme.whatsapp.replace(/\D/g, "")
    : "";
  const whatsappLink = `https://wa.me/55${whatsappNumber}?text=Olá!%20Gostaria%20de%20confirmar%20meu%20presente%20para%20a%20Alessandra.`;

  if (themeLoading) return <Loading message="Carregando aplicação..." />;
  if (loading) return <Loading message="Carregando convite..." />;

  return (
    <div
      className="p-6 relative"
      style={{
        background: theme?.bgColor,
        color: theme?.bgTextColor,
        minHeight: "100vh",
      }}
    >
      {/* Botão Sair */}
      <button
        onClick={handleLogout}
        className="absolute top-6 right-6 font-semibold px-4 py-2 rounded-xl shadow-md transition-colors duration-300"
        style={{
          background: theme?.logoutButtonColor,
          color: theme?.logoutButtonTextColor,
          border: `2px solid ${theme?.logoutButtonColor || "#e91e63"}`,
        }}
      >
        Sair
      </button>

      {/* Navbar/Título */}
      <div
        className="rounded-lg px-4 py-3 mb-2 shadow text-center"
        style={{
          background: theme?.navBarColor,
          color: theme?.navBarText,
          boxShadow: theme?.navBarShadow
            ? "0 3px 8px 0 rgba(0,0,0,0.35)"
            : "none",
          fontFamily: theme?.titleFontFamily,
          fontSize: 22,
        }}
      >
        {theme?.titleSelectedGift || "Presente Selecionado"}
      </div>

      {/* Timer regressivo */}
      <div className="mb-6 text-center">
        <span className="text-xl font-bold text-pink-600">
          Faltam: {timeLeft}
        </span>
      </div>

      {/* Card do Convite */}
      <div className="grid grid-cols-1 gap-6 mt-6 max-w-2xl mx-auto">
        <div
          className="rounded-lg border p-6 flex flex-col gap-4"
          style={{
            background: theme?.inviteBackgroundColor || theme?.giftBgColor,
            color: theme?.inviteTextColor || theme?.giftTextColor,
            borderColor: theme?.giftBorderColor,
            borderWidth: 1,
            borderStyle: "solid",
            fontFamily: theme?.giftFontFamily,
          }}
        >
          <h1
            className="text-3xl font-bold text-center mb-2"
            style={{ fontFamily: theme?.titleFontFamily }}
          >
            Convite Especial 🎉
          </h1>

          <p className="text-lg text-center mb-4">
            {parseFormattedText(
              theme?.inviteTitle ||
                "Você confirmou presença no aniversário da **Alessandra**!"
            )}
          </p>

          {/* Presente Escolhido */}
          <div
            className="mb-4 border rounded-lg p-4"
            style={{
              background: theme?.inviteCardBackgroundColor || "#f9fafb",
              borderColor: theme?.inviteCardBorderColor || "#e5e7eb",
              color: theme?.inviteCardTextColor || theme?.giftTextColor,
            }}
          >
            <h2 className="text-xl font-semibold mb-2 text-center">
              Presente Escolhido
            </h2>
            <div className="text-center">
              {gift?.url ? (
                <a
                  href={gift.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline font-bold text-lg"
                  style={{
                    color: theme?.inviteCardTextColor || theme?.giftTextColor,
                  }}
                >
                  {gift.title}
                </a>
              ) : (
                <span className="font-bold text-lg">{gift?.title}</span>
              )}
              <p className="mt-2">{gift?.description}</p>
              {gift?.value && (
                <p className="mt-2 font-semibold">
                  Valor: R$ {gift.value.toFixed(2)}
                </p>
              )}
            </div>
          </div>

          {/* Detalhes do Evento */}
          <div className="mb-4">
            <h2 className="text-xl font-semibold mb-2 text-center">
              Detalhes do Evento
            </h2>
            <div className="text-center">
              <p>
                <strong>Data:</strong> {theme?.inviteDate || "12/10/2025"}
              </p>
              <p>
                <strong>Horário:</strong> {theme?.inviteHour || "19:00"}
              </p>
              <p>
                <strong>Local:</strong>{" "}
                {theme?.inviteAddress ||
                  "Rua das Flores, 123 - Salão de Festas"}
              </p>

              {theme?.inviteObs && (
                <>
                  <br />
                  <p>
                    <strong>Observação:</strong>
                  </p>
                  <p className="text-lg text-center mb-4">
                    {parseFormattedText(
                      theme.inviteObs ||
                        "Você confirmou presença no aniversário da **Alessandra**!"
                    )}
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Botão WhatsApp - só aparece se tiver número */}
          {theme?.whatsapp && (
            <button
              onClick={() => window.open(whatsappLink, "_blank")}
              className="px-4 py-2 rounded-lg shadow mt-4 flex items-center justify-center gap-2 transition-colors duration-300"
              style={{
                background: theme?.giftButtonColor,
                color: theme?.giftTextButtonColor,
                fontFamily: theme?.giftFontFamily,
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
  );
};

export default Invite;
