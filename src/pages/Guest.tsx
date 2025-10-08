import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, onSnapshot, updateDoc, doc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/config";
import { useTheme } from "../hooks/useTheme";
import { useToast } from "../context/ToastContext";
import Loading from "../components/Loading";
import GiftConfirmationModal from "../components/GiftConfirmation";
import PixModal from "../components/GiftPix";

// Defina o tipo Gift
type Gift = {
  id: string;
  title: string;
  description: string;
  selected: boolean;
  selectedBy?: string;
  selectedPhone?: string;
  guestId?: string | null;
  active?: boolean;
  valor?: string;
  url?: string;
};

const Guest: React.FC = () => {
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [giftId, setGiftId] = useState<string | null>(null);
  const [selectedGift, setSelectedGift] = useState<Gift | null>(null);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showPixModal, setShowPixModal] = useState(false);
  const navigate = useNavigate();
  const { theme, loading: themeLoading } = useTheme();
  const { showToast } = useToast();

  const giftsCollection = collection(db, "gifts");

  useEffect(() => {
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
        selectedPhone: doc.data().selectedPhone,
        guestId: doc.data().guestId,
        active: doc.data().active !== false,
        valor: doc.data().valor || "",
        url: doc.data().url || "",
      }));
      setGifts(giftsList);
    });

    return () => unsubscribe();
  }, [giftsCollection]);

  useEffect(() => {
    if (giftId) {
      navigate("/invite");
    }
  }, [giftId, navigate]);

  const handleSelect = (gift: Gift) => {
    setSelectedGift(gift);
    setShowConfirmationModal(true);
  };

  const handleConfirmGift = async (method: "levar" | "pix") => {
    if (!selectedGift) return;

    const guestId = localStorage.getItem("guestId");
    if (!guestId) {
      alert("Erro: guestId não encontrado.");
      return;
    }

    try {
      // Atualiza o presente
      const giftRef = doc(db, "gifts", selectedGift.id);
      await updateDoc(giftRef, {
        selected: true,
        guestId: guestId,
      });

      // Atualiza o convidado
      const guestRef = doc(db, "guests", guestId);
      await updateDoc(guestRef, {
        giftId: selectedGift.id,
        giftSelected: true,
        giftMethod: method,
        confirmedAt: serverTimestamp(),
      });

      showToast("Presente confirmado!");
      setShowConfirmationModal(false);

      if (method === "pix") {
        setShowPixModal(true);
      } else {
        // Método "levar" - vai direto para invite
        setTimeout(() => {
          navigate("/invite");
        }, 800);
      }
    } catch (error) {
      console.error("Erro ao confirmar presente:", error);
      showToast("Erro ao confirmar presente. Tente novamente.");
    }
  };

  const handleGoToInvite = () => {
    setShowPixModal(false);
    navigate("/invite");
  };

  const handleCloseModals = () => {
    setShowConfirmationModal(false);
    setShowPixModal(false);
    setSelectedGift(null);
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  if (themeLoading) return <Loading message="Carregando aplicação..." />;

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

      {/* Cards */}
      <div
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-6"
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))" }}
      >
        {gifts
          .filter((gift) => {
            const isActive = gift.active !== false;
            return isActive && (theme?.listSelected ? true : !gift.selected);
          })
          .map((gift) => (
            <div
              key={gift.id}
              className="rounded-lg border p-4 flex flex-col"
              style={{
                opacity: gift.selected ? 0.6 : 1,
                background: theme?.giftBgColor,
                color: theme?.giftTextColor,
                borderColor: theme?.giftBorderColor,
                borderWidth: 1,
                borderStyle: "solid",
                fontFamily: theme?.giftFontFamily,
                height: '180px',
                maxWidth: '350px',
              }}
            >
              {/* Título - altura limitada */}
              <div 
                className="font-semibold mb-2"
                style={{
                  minHeight: '48px',
                  maxHeight: '72px',
                  overflow: 'hidden',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  wordBreak: 'break-word',
                }}
              >
                {gift.title}
              </div>
              
              {/* Valor */}
              <div className="font-extralight mb-2">
                R$ {gift.valor}
              </div>
              
              {/* Espaçador flexível */}
              <div className="flex-1"></div>
              
              {/* Botão */}
              <button
                disabled={gift.selected}
                style={{
                  background: gift.selected ? "#ccc" : theme?.giftButtonColor,
                  color: gift.selected ? "#666" : theme?.giftTextButtonColor,
                  fontFamily: theme?.giftFontFamily,
                }}
                className="w-full px-4 py-2 rounded-lg shadow transition-colors hover:brightness-90"
                onClick={() => handleSelect(gift)}
              >
                {gift.selected ? "Indisponível" : "Escolher presente"}
              </button>
            </div>
          ))}
      </div>

      {/* Modal de Confirmação */}
      <GiftConfirmationModal
        isOpen={showConfirmationModal}
        onClose={handleCloseModals}
        gift={selectedGift}
        onConfirm={handleConfirmGift}
      />

      {/* Modal do Pix */}
      <PixModal
        isOpen={showPixModal}
        onClose={handleCloseModals}
        gift={selectedGift}
        onGoToInvite={handleGoToInvite}
      />
    </div>
  );
};

export default Guest;
