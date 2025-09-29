import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, onSnapshot, updateDoc, doc } from "firebase/firestore";
import { db } from "../firebase/config";
import { useTheme } from "../hooks/useTheme";
import { useToast } from "../context/ToastContext";

// Defina o tipo Gift
type Gift = {
  id: string;
  title: string;
  description: string;
  selected: boolean;
  selectedBy?: string;
  selectedEmail?: string;
  guestId?: string | null;
};

const Guest: React.FC = () => {
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [giftId, setGiftId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { theme, loading: themeLoading } = useTheme();
  const { showToast } = useToast();

  const giftsCollection = collection(db, "gifts");

  useEffect(() => {
    const storedName = localStorage.getItem("guestName") || "";
    const storedEmail = localStorage.getItem("guestEmail") || "";
    setName(storedName);
    setEmail(storedEmail);

    // Busca o guestId e verifica se já escolheu presente
    const guestId = localStorage.getItem("guestId");
    if (guestId) {
      import("firebase/firestore").then(({ doc, getDoc }) => {
        const guestRef = doc(db, "guests", guestId);
        getDoc(guestRef).then((snap) => {
          const data = snap.data();
          if (data && data.giftId) {
            setGiftId(data.giftId);
          }
        });
      });
    }

    // Listener em tempo real para presentes
    const unsubscribe = onSnapshot(giftsCollection, (snapshot) => {
      const giftsList: Gift[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        title: doc.data().title,
        description: doc.data().description,
        selected: doc.data().selected,
        selectedBy: doc.data().selectedBy,
        selectedEmail: doc.data().selectedEmail,
        guestId: doc.data().guestId,
      }));
      setGifts(giftsList);
    });

    return () => unsubscribe();
  }, [giftsCollection]);

  useEffect(() => {
    if (giftId) {
      navigate("/dashboard");
    }
  }, [giftId, navigate]);

  const handleSelect = async (gift: Gift) => {
    if (!gift.id) return;

    const guestId = localStorage.getItem("guestId");
    if (!guestId) {
      alert("Erro: guestId não encontrado.");
      return;
    }

    // Atualiza o presente com guestId apenas
    const giftRef = doc(db, "gifts", gift.id);
    await updateDoc(giftRef, {
      selected: true,
      guestId: guestId,
    });

    // Atualiza o convidado com o giftId escolhido
    const guestRef = doc(db, "guests", guestId);
    await updateDoc(guestRef, {
      giftId: gift.id,
      giftSelected: true,
    });

    showToast("Presente selecionado!");

    setTimeout(() => {
      navigate("/dashboard");
    }, 1200); // 1.2 segundos para o usuário ver o toast
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  if (themeLoading) return <div>Carregando tema...</div>;

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
        {theme?.titleListGift || "Lista de Presentes"}
      </div>

      <p className="mt-2 text-black text-center">
        Olá, {name}! ({email})
      </p>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-6">
        {gifts
          .filter((gift) => (theme?.listSelected ? true : !gift.selected))
          .map((gift) => (
            <div
              key={gift.id}
              className="rounded-lg border p-4 flex flex-col gap-2"
              style={{
                opacity: gift.selected ? 0.6 : 1,
                background: theme?.giftBgColor,
                color: theme?.giftTextColor,
                borderColor: theme?.giftBorderColor,
                borderWidth: 1,
                borderStyle: "solid",
                fontFamily: theme?.giftFontFamily,
              }}
            >
              <span className="font-semibold">{gift.title}</span>
              <span className="text-sm">{gift.description}</span>
              <button
                disabled={gift.selected}
                style={{
                  background: gift.selected ? "#ccc" : theme?.giftButtonColor,
                  color: gift.selected ? "#666" : theme?.giftTextButtonColor,
                  fontFamily: theme?.giftFontFamily,
                }}
                className="px-4 py-2 rounded-lg shadow mt-2"
                onClick={() => handleSelect(gift)}
              >
                {gift.selected ? "Indisponível" : "Escolher presente"}
              </button>
            </div>
          ))}
      </div>
    </div>
  );
};

export default Guest;


