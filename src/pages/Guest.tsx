// src/pages/Guest.tsx - LÓGICA DE RESERVA COM TEMPO ABSOLUTO
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  getDocs,
  doc,
  serverTimestamp,
  getDoc,
  runTransaction,
} from "firebase/firestore";
import { db } from "../firebase/config";
import { useTheme } from "../hooks/useTheme";
import { useToast } from "../context/ToastContext";
import Loading from "../components/Loading";
import LogoutButton from "../components/LogoutButton";
import GiftConfirmationModal from "../components/GiftConfirmation";
import PixModal from "../components/GiftPix";
import { Timestamp } from "firebase/firestore";

// Tipos
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

  // ✅ CARREGAMENTO ÚNICO: Só carrega uma vez ao inicializar
  useEffect(() => {
    const loadInitialData = async () => {
      const guestId = localStorage.getItem("guestId");
      if (!guestId) {
        navigate("/login");
        return;
      }

      try {
        // Verifica se usuário já confirmou presente
        const guestRef = doc(db, "guests", guestId);
        const guestSnap = await getDoc(guestRef);

        if (guestSnap.exists()) {
          const guestData = guestSnap.data();
          if (guestData.giftSelected && guestData.giftId) {
            navigate("/invite");
            return;
          }
        }

        // ✅ CARREGA PRESENTES UMA VEZ SÓ (sem listener)
        const giftsSnapshot = await getDocs(collection(db, "gifts"));
        
        const giftsList: Gift[] = giftsSnapshot.docs.map((docSnap) => {
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
        
      } catch (error) {
        console.error("❌ Erro ao carregar dados:", error);
        showToast("Erro ao carregar presentes");
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [navigate, showToast]);

  // ✅ NOVA LÓGICA: Verificar se presente está livre baseado no tempo absoluto
  const checkAndReserveGift = async (gift: Gift): Promise<boolean> => {
    const guestId = localStorage.getItem("guestId");
    if (!guestId) {
      showToast("Erro: usuário não encontrado.");
      return false;
    }

    setReservingGift(gift.id);

    try {
      const success = await runTransaction(db, async (transaction) => {
        const giftRef = doc(db, "gifts", gift.id);
        const giftDoc = await transaction.get(giftRef);

        if (!giftDoc.exists()) {
          throw new Error("Presente não encontrado");
        }

        const currentData = giftDoc.data() as Gift;

        // Verifica se foi selecionado definitivamente
        if (currentData.selected === true) {
          throw new Error("ALREADY_SELECTED");
        }

        // ✅ NOVA LÓGICA: Verifica reserva baseada no tempo absoluto
        if (currentData.reservedBy && currentData.reservationExpiry) {
          const now = new Date();
          let expiryTime: Date;

          // Converte o tempo de expiração para Date
          if (currentData.reservationExpiry instanceof Date) {
            expiryTime = currentData.reservationExpiry;
          } else if ('toDate' in currentData.reservationExpiry) {
            expiryTime = currentData.reservationExpiry.toDate();
          } else {
            // Fallback para timestamp
            expiryTime = new Date(currentData.reservationExpiry);
          }

          // ✅ VERIFICAÇÃO TEMPORAL: Se ainda não expirou e não é o mesmo usuário
          if (now < expiryTime && currentData.reservedBy !== guestId) {
            const minutosRestantes = Math.ceil((expiryTime.getTime() - now.getTime()) / 60000);
            throw new Error(`RESERVED_BY_OTHER:${minutosRestantes}`);
          }
        }

        // ✅ CRIA NOVA RESERVA: Com tempo de expiração absoluto
        const now = new Date();
        const expiryTime = new Date(now.getTime() + 60000); // 1 minuto a partir de agora

        transaction.update(giftRef, {
          reservedBy: guestId,
          reservedAt: now,
          reservationExpiry: expiryTime, // ✅ TEMPO ABSOLUTO quando vai expirar
        });

        return true;
      });

      return success;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";

      if (errorMessage === "ALREADY_SELECTED") {
        showToast("Este presente já foi escolhido por outro convidado.");
      } else if (errorMessage.startsWith("RESERVED_BY_OTHER:")) {
        const minutos = errorMessage.split(":")[1];
        showToast(`Alguém já está vendo este presente. Tente novamente em ${minutos} minuto(s).`);
      } else {
        showToast("Erro ao selecionar presente. Tente novamente.");
      }

      return false;
    } finally {
      setReservingGift(null);
    }
  };

  // ✅ ADICIONAR: Função updateLocalGift que estava faltando
  const updateLocalGift = (giftId: string, updates: Partial<Gift>) => {
    setGifts(currentGifts => 
      currentGifts.map(gift => 
        gift.id === giftId ? { ...gift, ...updates } : gift
      )
    );
  };

  // ✅ MODIFICAÇÃO MÍNIMA: handleConfirmGift verifica expiração absoluta
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

        // ✅ VERIFICA TEMPO ABSOLUTO: Se a reserva ainda é válida
        if (giftData.reservationExpiry) {
          const now = new Date();
          let expiryTime: Date;

          if (giftData.reservationExpiry instanceof Date) {
            expiryTime = giftData.reservationExpiry;
          } else if ('toDate' in giftData.reservationExpiry) {
            expiryTime = giftData.reservationExpiry.toDate();
          } else {
            expiryTime = new Date(giftData.reservationExpiry);
          }

          if (now >= expiryTime) {
            throw new Error("RESERVATION_EXPIRED");
          }
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

      // ✅ ATUALIZA LOCAL: Marca como selecionado
      updateLocalGift(selectedGift.id, {
        selected: true,
        guestId: guestId,
        reservedBy: null,
        reservedAt: null,
        reservationExpiry: null
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
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";

      if (errorMessage === "RESERVATION_EXPIRED") {
        showToast("Tempo esgotado. O presente voltou para a lista.");
        
        // ✅ LIMPA LOCAL: Remove reserva local
        updateLocalGift(selectedGift.id, {
          reservedBy: null,
          reservedAt: null,
          reservationExpiry: null
        });
        
        setShowConfirmationModal(false);
        setSelectedGift(null);
      } else {
        showToast("Erro ao confirmar presente. Tente novamente.");
      }
    }
  };

  const handleSelect = async (gift: Gift) => {
    const success = await checkAndReserveGift(gift);
    if (success) {
      // ✅ ATUALIZA LOCAL: Com tempo de expiração correto
      const guestId = localStorage.getItem("guestId");
      const now = new Date();
      const expiryTime = new Date(now.getTime() + 60000);

      updateLocalGift(gift.id, {
        reservedBy: guestId,
        reservedAt: now,
        reservationExpiry: expiryTime
      });

      setSelectedGift({
        ...gift,
        reservedBy: guestId,
        reservedAt: now,
        reservationExpiry: expiryTime
      });
      setShowConfirmationModal(true);
    }
  };

  // ✅ CORRIGIR: handleCloseModals também usava updateLocalGift
  const handleCloseModals = async () => {
    if (selectedGift?.id) {
      // ✅ LIBERA NO BANCO: Só uma consulta para liberar
      try {
        const guestId = localStorage.getItem("guestId");
        if (guestId) {
          await runTransaction(db, async (transaction) => {
            const giftRef = doc(db, "gifts", selectedGift.id);
            const giftDoc = await transaction.get(giftRef);

            if (giftDoc.exists()) {
              const giftData = giftDoc.data();
              if (giftData.reservedBy === guestId) {
                transaction.update(giftRef, {
                  reservedBy: null,
                  reservedAt: null,
                  reservationExpiry: null,
                });

                // ✅ ATUALIZA LOCAL: Remove reserva
                updateLocalGift(selectedGift.id, {
                  reservedBy: null,
                  reservedAt: null,
                  reservationExpiry: null
                });
              }
            }
          });
        }
      } catch (error) {
        console.error("Erro ao liberar reserva:", error);
      }
    }

    setShowConfirmationModal(false);
    setShowPixModal(false);
    setSelectedGift(null);
  };

  const handleGoToInvite = () => {
    setShowPixModal(false);
    navigate("/invite");
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
      <LogoutButton className="flex justify-end mt-4 me-5" />

      <div
        className="rounded-lg px-4 py-3 shadow text-center mb-6"
        style={{
          background: theme?.navBarColor,
          color: theme?.navBarText,
          boxShadow: theme?.navBarShadow ? "0 3px 8px 0 rgba(0,0,0,0.35)" : "none",
          fontFamily: theme?.titleFontFamily,
          fontSize: 22,
        }}
      >
        {theme?.titleListGift || "Lista de Presentes"}
      </div>

      <div
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))" }}
      >
        {gifts
          .filter((gift) => {
            const isActive = gift.active !== false;
            return isActive && (theme?.listSelected ? true : !gift.selected);
          })
          .sort((a, b) => a.title.localeCompare(b.title, "pt-BR", { sensitivity: "base" }))
          .map((gift) => {
            const isReserving = reservingGift === gift.id;

            return (
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
                  height: "200px",
                  maxWidth: "350px",
                }}
              >
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

                <div className="font-extralight text-lg mb-3">
                  R$ {gift.valor}
                </div>

                <div>
                  <button
                    disabled={gift.selected || isReserving}
                    style={{
                      background: gift.selected
                        ? "#ccc"
                        : isReserving
                        ? "#d97706"
                        : theme?.giftButtonColor,
                      color: gift.selected
                        ? "#666"
                        : isReserving
                        ? "#fff"
                        : theme?.giftTextButtonColor,
                      fontFamily: theme?.giftFontFamily,
                    }}
                    className="w-full px-4 py-3 rounded-lg shadow transition-colors hover:brightness-90 disabled:cursor-not-allowed font-medium"
                    onClick={() => handleSelect(gift)}
                  >
                    {isReserving
                      ? "Verificando..."
                      : gift.selected
                      ? "Indisponível"
                      : "Escolher presente"}
                  </button>
                </div>
              </div>
            );
          })}
      </div>

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
