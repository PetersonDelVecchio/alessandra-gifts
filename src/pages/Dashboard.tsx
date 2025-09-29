import React, { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { useTheme } from "../hooks/useTheme";
import { useNavigate } from "react-router-dom";

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
  const { theme, loading: themeLoading } = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

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
        setBirthday(guestData.birthday || ""); // ajuste conforme seu banco
        setAddress(guestData.address || ""); // ajuste conforme seu banco

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

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  // WhatsApp link (ajuste o número e mensagem)
  const whatsappNumber = theme?.whatsapp
    ? theme.whatsapp.replace(/\D/g, "") // remove tudo que não for número
    : ""; // fallback

  const whatsappLink = `https://wa.me/55${whatsappNumber}?text=Olá!%20Gostaria%20de%20confirmar%20meu%20presente%20para%20a%20Alessandra.`;

  if (themeLoading) return <div>Carregando tema...</div>;
  if (loading) return <div>Carregando...</div>;

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

      {gift ? (
        <div
          className="rounded-lg border p-6 max-w-md mx-auto"
          style={{
            background: theme?.giftBgColor,
            color: theme?.giftTextColor,
            borderColor: theme?.giftBorderColor,
            borderWidth: 1,
            borderStyle: "solid",
            fontFamily: theme?.giftFontFamily,
          }}
        >
          <h2 className="text-xl font-bold mb-2">
            {gift.url ? (
              <a
                href={gift.url}
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
                style={{ color: theme?.giftTextColor }}
              >
                {gift.title}
              </a>
            ) : (
              gift.title
            )}
          </h2>
          <p className="mb-2">{gift.description}</p>
          {gift.value && (
            <p className="mb-2 font-semibold">
              Valor: R$ {gift.value.toFixed(2)}
            </p>
          )}
          <p className="mb-2">
            Aniversário: {birthday || "Data não informada"}
          </p>
          <p className="mb-4">
            Endereço: {address || "Endereço não informado"}
          </p>
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-4 py-2 rounded-lg font-semibold transition"
            style={{
              background: theme?.giftButtonColor,
              color: theme?.giftTextButtonColor,
              fontFamily: theme?.giftFontFamily,
            }}
          >
            Falar no WhatsApp
          </a>
        </div>
      ) : (
        <p className="text-center">Carregando informações do presente...</p>
      )}
    </div>
  );
};

export default Dashboard;
