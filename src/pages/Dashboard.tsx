import React, { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { useTheme } from "../hooks/useTheme";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";

dayjs.extend(duration);

type Gift = {
  id: string;
  title: string;
  url: string;
  description: string;
  value?: number;
};

const Dashboard: React.FC = () => {
  const [gift, setGift] = useState<Gift | null>(null);
  const [birthday, setBirthday] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [hour, setHour] = useState<string>("19:00"); // exemplo fixo, ajuste conforme seu banco
  const { theme, loading: themeLoading } = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState<string>("");

  // Data do aniversário (ajuste conforme seu banco)
  const eventDate = birthday || "12/10/2025";
  const eventHour = hour || "19:00";
  const eventDateTime = `${eventDate} ${eventHour}`;

  useEffect(() => {
    const guestId = localStorage.getItem("guestId");
    if (!guestId) {
      navigate("/guest");
      return;
    }

    // Busca guest para pegar giftId, aniversário e endereço
    const fetchGuestAndGift = async () => {
      const guestRef = doc(db, "guests", guestId);
      const guestSnap = await getDoc(guestRef);
      const guestData = guestSnap.data();
      if (guestData && guestData.giftId) {
        setBirthday(guestData.birthday || "12/10/2025"); // ajuste conforme seu banco
        setAddress(guestData.address || "Rua das Flores, 123 - Salão de Festas");
        setHour(guestData.hour || "19:00"); // ajuste conforme seu banco

        // Busca o presente escolhido
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
    // Atualiza o timer a cada segundo
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

  // WhatsApp link (ajuste o número e mensagem)
  const whatsappNumber = theme?.whatsapp
    ? theme.whatsapp.replace(/\D/g, "")
    : "";
  const whatsappLink = `https://wa.me/55${whatsappNumber}?text=Olá!%20Gostaria%20de%20confirmar%20meu%20presente%20para%20a%20Alessandra.`;

  const invitationCategory = theme?.invitationCategory || "classic";

  const invitationStyles: Record<string, React.CSSProperties> = {
    classic: {
      borderColor: "#e91e63",
      background: "#fff",
      boxShadow: "0 4px 24px 0 rgba(233,30,99,0.08)",
    },
    modern: {
      borderColor: "#222",
      background: "#f7f7f7",
      boxShadow: "0 4px 24px 0 rgba(34,34,34,0.12)",
    },
    floral: {
      borderColor: "#a3e635",
      background: "linear-gradient(135deg,#f0fff4 60%,#f9fafb 100%)",
      boxShadow: "0 4px 24px 0 rgba(163,230,53,0.10)",
    },
    kids: {
      borderColor: "#fbbf24",
      background: "linear-gradient(135deg,#fef9c3 60%,#fff 100%)",
      boxShadow: "0 4px 24px 0 rgba(251,191,36,0.10)",
    },
  };

  if (themeLoading) return <div>Carregando tema...</div>;
  if (loading) return <div>Carregando...</div>;

  return (
    <div
      className="p-6 min-h-screen flex flex-col items-center justify-center"
      style={{
        background: theme?.bgColor,
        color: theme?.bgTextColor,
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

      {/* Timer regressivo */}
      <div className="mb-6 text-center">
        <span className="text-xl font-bold text-pink-600">
          Faltam: {timeLeft}
        </span>
      </div>

      {/* Convite Bonito */}
      <div
        className="max-w-lg w-full rounded-2xl shadow-xl p-8 flex flex-col items-center border-4"
        style={{
          ...invitationStyles[invitationCategory],
          color: theme?.invitationTextColor || theme?.giftTextColor,
          fontFamily: theme?.invitationFontFamily || theme?.giftFontFamily,
          background: theme?.invitationBgColor || invitationStyles[invitationCategory].background,
        }}
      >
        <h1 className="text-3xl font-bold mb-2 text-pink-600" style={{ fontFamily: theme?.titleFontFamily }}>
          Convite Especial 🎉
        </h1>
        <p className="mb-4 text-lg text-center">
          Você confirmou presença no aniversário da <span className="font-bold">Alessandra</span>!
        </p>
        <div className="mb-6 w-full">
          <div className="bg-pink-50 rounded-lg p-4 shadow text-center">
            <h2 className="text-xl font-semibold mb-2 text-pink-500">Presente Escolhido</h2>
            {gift?.url ? (
              <a
                href={gift.url}
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-bold"
                style={{ color: theme?.giftTextColor }}
              >
                {gift.title}
              </a>
            ) : (
              <span className="font-bold">{gift?.title}</span>
            )}
            <p className="mt-2">{gift?.description}</p>
            {gift?.value && (
              <p className="mt-2 font-semibold">
                Valor: R$ {gift.value.toFixed(2)}
              </p>
            )}
          </div>
        </div>
        <div className="mb-6 w-full">
          <div className="bg-pink-50 rounded-lg p-4 shadow text-center">
            <h2 className="text-xl font-semibold mb-2 text-pink-500">Detalhes do Evento</h2>
            <p>
              <strong>Data:</strong> {birthday || "12/10/2025"}
            </p>
            <p>
              <strong>Horário:</strong> {hour || "19:00"}
            </p>
            <p>
              <strong>Local:</strong> {address || "Rua das Flores, 123 - Salão de Festas"}
            </p>
          </div>
        </div>
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-5 py-3 rounded-lg font-semibold transition bg-green-500 hover:bg-green-600 text-white text-lg shadow"
          style={{
            fontFamily: theme?.giftFontFamily,
          }}
        >
          {/* Ícone WhatsApp SVG */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="28"
            fill="currentColor"
            viewBox="0 0 24 24"
            className="mr-2"
          >
            <path d="M12.004 2.003c-5.523 0-10 4.477-10 10 0 1.768.466 3.484 1.352 4.995l-1.432 5.243 5.377-1.411c1.463.803 3.117 1.173 4.703 1.173 5.523 0 10-4.477 10-10s-4.477-10-10-10zm0 18.001c-1.463 0-2.892-.369-4.141-1.067l-.297-.17-3.191.838.852-3.122-.193-.321c-.813-1.353-1.241-2.899-1.241-4.458 0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8zm4.406-6.309c-.242-.121-1.434-.707-1.655-.788-.221-.081-.382-.121-.543.121-.161.242-.621.788-.761.95-.141.161-.281.181-.523.06-.242-.121-1.022-.377-1.947-1.201-.72-.642-1.207-1.435-1.35-1.677-.141-.242-.015-.373.106-.494.109-.108.242-.281.363-.421.121-.141.161-.242.242-.403.081-.161.04-.302-.02-.423-.06-.121-.543-1.312-.744-1.797-.196-.472-.396-.408-.543-.416-.141-.008-.302-.01-.463-.01-.161 0-.423.06-.645.302-.221.242-.843.825-.843 2.008 0 1.183.863 2.325.983 2.487.121.161 1.697 2.594 4.122 3.527.577.198 1.027.316 1.378.404.578.147 1.104.126 1.52.077.464-.055 1.434-.586 1.637-1.152.202-.566.202-1.051.141-1.152-.06-.101-.221-.161-.463-.282z" />
          </svg>
          Falar no WhatsApp
        </a>
      </div>
    </div>
  );
};

export default Dashboard;
