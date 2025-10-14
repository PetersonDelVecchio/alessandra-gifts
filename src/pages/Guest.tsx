import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  onSnapshot,
  updateDoc,
  doc,
  serverTimestamp,
  getDoc,
  runTransaction,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "../firebase/config";
import { useTheme } from "../hooks/useTheme";
import { useToast } from "../context/ToastContext";
import Loading from "../components/Loading";
import LogoutButton from "../components/LogoutButton";
import GiftConfirmationModal from "../components/GiftConfirmation";
import PixModal from "../components/GiftPix";
import { Timestamp } from "firebase/firestore";

// Tipos corrigidos
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
  // Campos de reserva com tipos corretos
  reservedBy?: string | null;
  reservedAt?: Timestamp | Date | null;
  reservationExpiry?: Timestamp | Date | null;
};

// Função helper para converter Timestamp/Date para milliseconds
const getTimeInMillis = (timestamp: Timestamp | Date | null): number => {
  if (!timestamp) return 0;
  if (timestamp instanceof Date) return timestamp.getTime();
  if ("toMillis" in timestamp) return timestamp.toMillis();
  return 0;
};

// Função para verificar se uma reserva expirou (baseada no tempo local)
const isReservationExpired = (gift: Gift): boolean => {
  if (!gift.reservedBy || !gift.reservedAt) return false;

  const now = Date.now();
  const reservedAtTime = getTimeInMillis(gift.reservedAt);
  const twoMinutesInMs = 2 * 60 * 1000; // 2 minutos

  return now - reservedAtTime > twoMinutesInMs;
};

// Função para verificar se um presente está realmente reservado por outro usuário
const isReservedByOtherUser = (
  gift: Gift,
  currentGuestId: string | null
): boolean => {
  if (!gift.reservedBy || !currentGuestId) return false;
  if (gift.reservedBy === currentGuestId) return false; // Reservado pelo usuário atual

  // Se expirou, não está mais reservado
  if (isReservationExpired(gift)) return false;

  return true;
};

const Guest: React.FC = () => {
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [selectedGift, setSelectedGift] = useState<Gift | null>(null);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showPixModal, setShowPixModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reservingGift, setReservingGift] = useState<string | null>(null);
  const navigate = useNavigate();
  const { theme, loading: themeLoading } = useTheme();
  const { showToast } = useToast();

  const giftsCollection = collection(db, "gifts");

  // Função para limpar reservas expiradas no banco
  const cleanExpiredReservations = useCallback(async () => {
    try {
      const snapshot = await getDocs(
        query(giftsCollection, where("reservedBy", "!=", null))
      );

      const expiredGifts = snapshot.docs.filter((docSnap) => {
        const gift = { id: docSnap.id, ...docSnap.data() } as Gift;
        return isReservationExpired(gift);
      });

      if (expiredGifts.length > 0) {
        const promises = expiredGifts.map(async (docSnap) => {
          const giftRef = doc(db, "gifts", docSnap.id);
          await updateDoc(giftRef, {
            reservedBy: null,
            reservedAt: null,
            reservationExpiry: null,
          });
        });

        await Promise.all(promises);
      }
    } catch (error) {
      // Silencioso
      console.error("Erro ao limpar reservas expiradas:", error);
    }
  }, [giftsCollection]);

  // Hook para forçar re-render a cada 5 segundos (para atualizar expiração em tempo real)
  const [, setForceUpdate] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setForceUpdate((prev) => prev + 1);
    }, 5000); // Atualiza a cada 5 segundos

    return () => clearInterval(interval);
  }, []);

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

          if (guestData.giftSelected && guestData.giftId) {
            navigate("/invite");
            return;
          }
        }
      } catch (error) {
        // Silencioso
        console.error("Erro ao verificar status do convidado:", error);
      }

      setLoading(false);
    };

    checkGuestStatus();
  }, [navigate]);

  // Listener em tempo real para presentes com limpeza periódica
  useEffect(() => {
    if (loading) return;

    // Limpa reservas expiradas imediatamente
    cleanExpiredReservations();

    // Configura limpeza periódica (a cada 30 segundos)
    const cleanupInterval = setInterval(() => {
      cleanExpiredReservations();
    }, 30000);

    const unsubscribe = onSnapshot(
      giftsCollection,
      (snapshot) => {
        const giftsList: Gift[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            title: data.title,
            description: data.description,
            selected: data.selected,
            selectedBy: data.selectedBy,
            selectedPhone: data.selectedPhone,
            guestId: data.guestId,
            active: data.active !== false,
            valor: data.valor || "",
            url: data.url || "",
            reservedBy: data.reservedBy || null,
            reservedAt: data.reservedAt || null,
            reservationExpiry: data.reservationExpiry || null,
          };
        });

        setGifts(giftsList);
      },
      (error) => {
        // Silencioso
        console.error("Erro ao carregar presentes:", error);
      }
    );

    return () => {
      clearInterval(cleanupInterval);
      unsubscribe();
    };
  }, [loading, cleanExpiredReservations, giftsCollection]);

  // Função para reservar presente
  const reserveGift = async (gift: Gift): Promise<boolean> => {
    const guestId = localStorage.getItem("guestId");
    if (!guestId) {
      showToast("Erro: usuário não encontrado.");
      return false;
    }

    setReservingGift(gift.id);

    try {
      await runTransaction(db, async (transaction) => {
        const giftRef = doc(db, "gifts", gift.id);
        const giftDoc = await transaction.get(giftRef);

        if (!giftDoc.exists()) {
          throw new Error("Presente não encontrado");
        }

        const giftData = giftDoc.data();
        const currentGift = { id: gift.id, ...giftData } as Gift;

        // Verifica se já foi selecionado definitivamente
        if (giftData.selected === true) {
          throw new Error("ALREADY_SELECTED");
        }

        // Verifica se está reservado por outra pessoa (usando lógica local)
        if (isReservedByOtherUser(currentGift, guestId)) {
          throw new Error("RESERVED_BY_OTHER");
        }

        // Cria nova reserva
        transaction.update(giftRef, {
          reservedBy: guestId,
          reservedAt: serverTimestamp(),
          reservationExpiry: new Date(Date.now() + 120000), // 2 minutos
        });
      });

      return true;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Erro desconhecido";

      if (errorMessage === "ALREADY_SELECTED") {
        showToast("Este presente já foi escolhido por outro convidado.");
      } else if (errorMessage === "RESERVED_BY_OTHER") {
        showToast(
          "Outro convidado está vendo este presente agora. Tente novamente em alguns minutos."
        );
      } else {
        showToast("Erro ao selecionar presente. Tente novamente.");
      }

      return false;
    } finally {
      setReservingGift(null);
    }
  };

  // Função para liberar reserva
  const releaseReservation = async (giftId: string) => {
    try {
      const giftRef = doc(db, "gifts", giftId);
      await updateDoc(giftRef, {
        reservedBy: null,
        reservedAt: null,
        reservationExpiry: null,
      });
    } catch (error) {
      // Silencioso
      console.error("Erro ao liberar reserva:", error);
    }
  };

  const handleSelect = async (gift: Gift) => {
    const success = await reserveGift(gift);
    if (success) {
      setSelectedGift(gift);
      setShowConfirmationModal(true);
    }
  };

  const handleConfirmGift = async (method: "levar" | "pix") => {
    if (!selectedGift) return;

    const guestId = localStorage.getItem("guestId");
    if (!guestId) {
      showToast("Erro: usuário não encontrado.");
      return;
    }

    try {
      await runTransaction(db, async (transaction) => {
        const giftRef = doc(db, "gifts", selectedGift.id);
        const giftDoc = await transaction.get(giftRef);

        if (!giftDoc.exists()) {
          throw new Error("Presente não encontrado");
        }

        const giftData = giftDoc.data();

        // Verifica se ainda está reservado para este usuário
        if (giftData.reservedBy !== guestId) {
          throw new Error("RESERVATION_EXPIRED");
        }

        // Verifica se a reserva não expirou (dupla verificação)
        const currentGift = { id: selectedGift.id, ...giftData } as Gift;
        if (isReservationExpired(currentGift)) {
          throw new Error("RESERVATION_EXPIRED");
        }

        // Confirma seleção definitiva
        transaction.update(giftRef, {
          selected: true,
          guestId: guestId,
          reservedBy: null,
          reservedAt: null,
          reservationExpiry: null,
        });

        // Atualiza o convidado
        const guestRef = doc(db, "guests", guestId);
        transaction.update(guestRef, {
          giftId: selectedGift.id,
          giftSelected: true,
          giftMethod: method,
          confirmedAt: serverTimestamp(),
        });
      });

      showToast("Presente confirmado com sucesso!");
      setShowConfirmationModal(false);

      if (method === "pix") {
        setShowPixModal(true);
      } else {
        setTimeout(() => {
          navigate("/invite");
        }, 1500);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Erro desconhecido";

      if (errorMessage === "RESERVATION_EXPIRED") {
        showToast("Tempo esgotado. O presente voltou para a lista.");
        setShowConfirmationModal(false);
        setSelectedGift(null);
      } else {
        showToast("Erro ao confirmar presente. Tente novamente.");
      }
    }
  };

  const handleGoToInvite = () => {
    setShowPixModal(false);
    navigate("/invite");
  };

  const handleCloseModals = () => {
    if (selectedGift?.id) {
      releaseReservation(selectedGift.id);
    }

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
          .sort((a, b) =>
            a.title.localeCompare(b.title, "pt-BR", { sensitivity: "base" })
          )
          .map((gift) => {
            const guestId = localStorage.getItem("guestId");

            // Usa a nova lógica baseada em tempo local
            const isReservedByOther = isReservedByOtherUser(gift, guestId);
            const isReserving = reservingGift === gift.id;

            return (
              <div
                key={gift.id}
                className="rounded-lg border p-4 flex flex-col"
                style={{
                  opacity: gift.selected ? 0.6 : isReservedByOther ? 0.7 : 1,
                  background: isReservedByOther ? "#fef3c7" : theme?.giftBgColor,
                  color: theme?.giftTextColor,
                  borderColor: isReservedByOther ? "#f59e0b" : theme?.giftBorderColor,
                  borderWidth: isReservedByOther ? 2 : 1,
                  borderStyle: "solid",
                  fontFamily: theme?.giftFontFamily,
                  height: "200px",
                  maxWidth: "350px",
                }}
              >
                {/* Título */}
                <div
                  className="font-semibold mb-3 leading-tight flex-1"
                  style={{
                    display: "-webkit-box",
                    WebkitLineClamp: 4,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    wordBreak: "break-word",
                    lineHeight: "1.3",
                  }}
                >
                  {gift.title}
                </div>

                {/* Preço */}
                <div className="font-extralight text-lg mb-3">
                  R$ {gift.valor}
                </div>

                {/* Botão */}
                <div>
                  <button
                    disabled={gift.selected || isReservedByOther || isReserving}
                    style={{
                      background: gift.selected
                        ? "#ccc"
                        : isReservedByOther || isReserving
                        ? "#d97706"
                        : theme?.giftButtonColor,
                      color: gift.selected
                        ? "#666"
                        : isReservedByOther || isReserving
                        ? "#fff"
                        : theme?.giftTextButtonColor,
                      fontFamily: theme?.giftFontFamily,
                    }}
                    className="w-full px-4 py-3 rounded-lg shadow transition-colors hover:brightness-90 disabled:cursor-not-allowed font-medium"
                    onClick={() => handleSelect(gift)}
                  >
                    {isReserving
                      ? "Reservando..."
                      : gift.selected
                      ? "Indisponível"
                      : isReservedByOther
                      ? "Alguem está vendo"
                      : "Escolher presente"}
                  </button>
                </div>
              </div>
            );
          })}
      </div>

      {/* Modais */}
      <GiftConfirmationModal
        isOpen={showConfirmationModal}
        onClose={handleCloseModals}
        gift={selectedGift}
        onConfirm={handleConfirmGift}
        onReservationExpired={handleCloseModals}
      />

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
