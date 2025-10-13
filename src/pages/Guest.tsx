import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, onSnapshot, updateDoc, doc, serverTimestamp, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { useTheme } from "../hooks/useTheme";
import { useToast } from "../context/ToastContext";
import Loading from "../components/Loading";
import LogoutButton from "../components/LogoutButton";
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
  const [selectedGift, setSelectedGift] = useState<Gift | null>(null);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showPixModal, setShowPixModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { theme, loading: themeLoading } = useTheme();
  const { showToast } = useToast();

  const giftsCollection = collection(db, "gifts");

  // Verificar se o usuário já confirmou presente
  useEffect(() => {
    const checkGuestStatus = async () => {
      const guestId = localStorage.getItem("guestId");
      if (!guestId) {
        navigate("/login");
        return;
      }

      try {
        const guestRef = doc(db, "guests", guestId);
        const guestSnap = await getDoc(guestRef);
        
        if (guestSnap.exists()) {
          const guestData = guestSnap.data();
          
          // Se já confirmou presente, redireciona para invite
          if (guestData.giftSelected && guestData.giftId) {
            navigate("/invite");
            return;
          }
        }
      } catch (error) {
        console.error("Erro ao verificar status do convidado:", error);
      }
      
      setLoading(false);
    };

    checkGuestStatus();
  }, [navigate]);

  // Listener em tempo real para presentes
  useEffect(() => {
    if (loading) return; // Só inicia o listener após verificar status

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
  }, [giftsCollection, loading]);

  const handleSelect = (gift: Gift) => {
    setSelectedGift(gift);
    setShowConfirmationModal(true);
  };

  const handleConfirmGift = async (method: "levar" | "pix") => {
    if (!selectedGift) return;

    const guestId = localStorage.getItem("guestId");
    if (!guestId) {
      showToast("Erro: usuário não encontrado.");
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

      showToast("Presente confirmado com sucesso!");
      setShowConfirmationModal(false);

      if (method === "pix") {
        // Mostra modal do PIX
        setShowPixModal(true);
      } else {
        // Método "levar" - vai direto para invite após um delay
        setTimeout(() => {
          navigate("/invite");
        }, 1500);
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

  if (themeLoading || loading) return <Loading message="Carregando..." />;

  return (
    <div
      className="p-6 relative"
      style={{
        background: theme?.bgColor,
        color: theme?.bgTextColor,
        minHeight: "100vh",
      }}
    >
      {/* Botão Sair no topo centralizado */}
      <LogoutButton className="flex justify-end mt-4 me-5" />

      {/* Navbar/Título */}
      <div
        className="rounded-lg px-4 py-3 shadow text-center mb-6"
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
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))" }}
      >
        {gifts
          .filter((gift) => {
            const isActive = gift.active !== false;
            return isActive && (theme?.listSelected ? true : !gift.selected);
          })
          .sort((a, b) => a.title.localeCompare(b.title, 'pt-BR', { sensitivity: 'base' }))
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
