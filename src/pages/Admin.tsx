import React, { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebase/config";
import CreateGift from "../components/CreateGift";
import GuestsList from "../components/admin/GuestsList";
import GiftsList from "../components/admin/GiftsList";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../hooks/useTheme";
import { useToast } from "../context/ToastContext";
import LogoutButton from "../components/LogoutButton";
import Modal from "../components/Modal"; // Importar o Modal com blur

type Guest = {
  id: string;
  name: string;
  phone: string;
  giftSelected: boolean;
  giftId?: string | null;
  giftMethod?: string;
  confirmedAt?: Timestamp | null;
};

type Gift = {
  id: string;
  title: string;
  url: string;
  description: string;
  valor?: string | number;
  selected: boolean;
  guestId?: string | null;
  active?: boolean;
};

const Admin: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPopup, setShowPopup] = useState(false);

  // Estados para os modais
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [unlinkModalOpen, setUnlinkModalOpen] = useState(false);
  const [selectedGift, setSelectedGift] = useState<Gift | null>(null);

  // Estados para edição
  const [editForm, setEditForm] = useState({
    title: "",
    url: "",
    description: "",
    valor: "",
  });

  const navigate = useNavigate();
  const { theme } = useTheme();
  const { showToast } = useToast();

  const handleToggleShowChosen = async () => {
    if (!theme) return;
    const themeRef = doc(db, "theme", "59zMCCzevS9uOZumvxZ4");
    await updateDoc(themeRef, { listSelected: !theme.listSelected });
  };

  // Buscar dados do Firestore
  useEffect(() => {
    // Guests listener
    const guestsUnsub = onSnapshot(
      collection(db, "guests"),
      (guestsSnapshot) => {
        const guestsData: Guest[] = guestsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Guest[];
        setGuests(guestsData);
        setLoading(false);
      }
    );

    // Gifts listener
    const giftsUnsub = onSnapshot(collection(db, "gifts"), (giftsSnapshot) => {
      const giftsData: Gift[] = giftsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Gift[];
      setGifts(giftsData);
      setLoading(false);
    });

    // Cleanup
    return () => {
      guestsUnsub();
      giftsUnsub();
    };
  }, []);

  // Funções para abrir modais
  const openEditModal = (gift: Gift) => {
    setSelectedGift(gift);
    setEditForm({
      title: gift.title,
      url: gift.url,
      description: gift.description,
      valor: gift.valor?.toString() || "",
    });
    setEditModalOpen(true);
  };

  const openDeleteModal = (gift: Gift) => {
    setSelectedGift(gift);
    setDeleteModalOpen(true);
  };

  const openUnlinkModal = (gift: Gift) => {
    setSelectedGift(gift);
    setUnlinkModalOpen(true);
  };

  // Função para editar presente
  const handleEditGift = async () => {
    if (!selectedGift) return;

    try {
      const giftRef = doc(db, "gifts", selectedGift.id);
      await updateDoc(giftRef, {
        title: editForm.title,
        url: editForm.url,
        description: editForm.description,
        valor: editForm.valor,
      });

      setEditModalOpen(false);
      setSelectedGift(null);
      showToast("Presente atualizado com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar presente:", error);
      showToast("Erro ao atualizar presente");
    }
  };

  // Função para deletar presente
  const handleConfirmDelete = async () => {
    if (!selectedGift) return;

    try {
      // Atualizar guest se necessário
      if (selectedGift.guestId) {
        const guestRef = doc(db, "guests", selectedGift.guestId);
        await updateDoc(guestRef, {
          giftId: "",
          giftSelected: false,
        });
      }

      // Atualizar presente
      const giftRef = doc(db, "gifts", selectedGift.id);
      await updateDoc(giftRef, {
        guestId: "",
        selected: false,
        deletedAt: new Date(),
        active: false,
      });

      setDeleteModalOpen(false);
      setSelectedGift(null);
      showToast("Presente removido com sucesso!");
    } catch (error) {
      console.error("Erro ao remover presente:", error);
      showToast("Erro ao remover presente");
    }
  };

  // Função para desvincular presente
  const handleConfirmUnlink = async () => {
    if (!selectedGift) return;

    try {
      // Atualizar guest
      if (selectedGift.guestId) {
        const guestRef = doc(db, "guests", selectedGift.guestId);
        await updateDoc(guestRef, {
          giftId: "",
          giftSelected: false,
          giftMethod: "", // Remove o método também
          confirmedAt: null, // Remove a data de confirmação
        });
      }

      // Atualizar presente
      const giftRef = doc(db, "gifts", selectedGift.id);
      await updateDoc(giftRef, {
        guestId: "",
        selected: false,
      });

      setUnlinkModalOpen(false);
      setSelectedGift(null);
      showToast("Presente desvinculado com sucesso!");
    } catch (error) {
      console.error("Erro ao desvincular presente:", error);
      showToast("Erro ao desvincular presente");
    }
  };

  // Estatísticas
  const totalGuests = guests.length;
  const confirmedGuests = guests.filter((g) => g.giftSelected).length;
  const totalGifts = gifts.filter((gift) => gift.active !== false).length;
  const confirmedGifts = gifts.filter(
    (gift) => gift.active !== false && gift.selected === true
  ).length;

  const handleGiftCreated = () => {
    setIsModalOpen(false);
    setShowPopup(true);
    setTimeout(() => setShowPopup(false), 3000);
    navigate("/admin");
    showToast("Presente criado!");
  };

  const guestMap = React.useMemo(() => {
    const map: Record<string, Guest> = {};
    guests.forEach((g) => {
      map[g.id] = g;
    });
    return map;
  }, [guests]);

  if (loading) return <p className="text-center mt-10">Carregando...</p>;

  return (
    <div className="p-6 relative">
      {/* Botão logout */}
      <LogoutButton className="flex justify-end mt-4 me-5" />

      <button
        className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition"
        style={{ background: theme?.navBarColor, color: theme?.navBarText }}
        onClick={() => navigate("/theme")}
      >
        Tema
      </button>

      <h1 className="text-3xl font-bold text-center mb-8">
        Painel do Admin 🎂
      </h1>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white shadow p-4 rounded-lg text-center">
          <h3 className="text-lg font-semibold">Pessoas Registradas</h3>
          <p
            className="text-2xl font-bold text-pink-600"
            style={{ color: theme?.navBarColor }}
          >
            {totalGuests}
          </p>
        </div>
        <div className="bg-white shadow p-4 rounded-lg text-center">
          <h3 className="text-lg font-semibold">Pessoas Confirmadas</h3>
          <p className="text-2xl font-bold text-green-600">{confirmedGuests}</p>
        </div>
        <div className="bg-white shadow p-4 rounded-lg text-center">
          <h3 className="text-lg font-semibold">Quantidade de Presentes</h3>
          <div className="flex items-center justify-center gap-2">
            <p className="text-2xl font-bold text-green-600">{confirmedGifts}</p>
            <p className="text-2xl font-bold text-gray-600">/</p>
            <p className="text-2xl font-bold text-blue-600">{totalGifts}</p>
          </div>
        </div>
        <div className="bg-white shadow p-4 rounded-lg text-center">
          <h3 className="text-lg font-semibold">Valor Total dos Presentes</h3>
          <div className="flex items-center justify-center gap-2">
            <p className="text-2xl font-bold text-purple-600">
              R${" "}
              {(() => {
                const confirmedValue = gifts
                  .filter(
                    (gift) => gift.active !== false && gift.selected === true
                  )
                  .reduce((acc, gift) => {
                    const valor =
                      typeof gift.valor === "string"
                        ? parseFloat(gift.valor)
                        : gift.valor || 0;
                    return acc + valor;
                  }, 0);
                return confirmedValue.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                });
              })()}
            </p>
            <p className="text-2xl font-bold text-blue-600">/</p>
            <p className="text-2xl font-bold text-blue-600">
              R${" "}
              {(() => {
                const totalValue = gifts
                  .filter((gift) => gift.active !== false)
                  .reduce((acc, gift) => {
                    const valor =
                      typeof gift.valor === "string"
                        ? parseFloat(gift.valor)
                        : gift.valor || 0;
                    return acc + valor;
                  }, 0);
                return totalValue.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                });
              })()}
            </p>
          </div>
        </div>
      </div>
      {/* Botão para abrir modal */}
      <button
        className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition"
        style={{ background: theme?.navBarColor, color: theme?.navBarText }}
        onClick={() => setIsModalOpen(true)}
      >
        Adicionar Presente
      </button>

      <div className="flex items-center gap-2 mt-4">
        <div className="relative inline-block w-11 h-5">
          <input
            id="switch-component-pink"
            type="checkbox"
            checked={!!theme?.listSelected}
            onChange={handleToggleShowChosen}
            className="peer appearance-none w-11 h-5 bg-slate-100 rounded-full checked:bg-pink-600 cursor-pointer transition-colors duration-300"
            style={{
              backgroundColor: theme?.listSelected
                ? theme?.navBarColor
                : undefined,
            }}
          />
          <label
            htmlFor="switch-component-pink"
            className="absolute top-0 left-0 w-5 h-5 bg-white rounded-full border border-slate-300 shadow-sm transition-transform duration-300 peer-checked:translate-x-6 peer-checked:border-pink-600 cursor-pointer "
            style={{
              borderColor: theme?.listSelected ? theme?.navBarColor : undefined,
            }}
          ></label>
        </div>
        <span className="text-sm font-medium text-gray-900">
          Mostrar presentes já escolhidos na lista dos convidados
        </span>
      </div>

      {/* Modal Criar Presente - usando componente Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <h2 className="text-xl font-bold mb-4 text-center">Adicionar Presente</h2>
        <CreateGift onGiftCreated={handleGiftCreated} />
      </Modal>

      {/* Modal Editar Presente - usando componente Modal */}
      <Modal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)}>
        <h2 className="text-xl font-bold mb-4 text-center">
          Editar Presente
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Título
            </label>
            <input
              type="text"
              value={editForm.title}
              onChange={(e) =>
                setEditForm({ ...editForm, title: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              placeholder="Nome do presente"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              URL
            </label>
            <input
              type="url"
              value={editForm.url}
              onChange={(e) =>
                setEditForm({ ...editForm, url: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              placeholder="https://exemplo.com/produto"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Descrição
            </label>
            <textarea
              value={editForm.description}
              onChange={(e) =>
                setEditForm({ ...editForm, description: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
              rows={3}
              maxLength={100}
              placeholder="Descrição breve do presente"
            />
            <p className="text-xs text-gray-500 mt-1">
              {editForm.description.length}/100 caracteres
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Valor (R$)
            </label>
            <input
              type="text"
              value={editForm.valor}
              onChange={(e) => {
                // Permitir apenas números e vírgula/ponto
                const value = e.target.value.replace(/[^\d.,]/g, '');
                setEditForm({ ...editForm, valor: value });
              }}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              placeholder="199,90"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={() => setEditModalOpen(false)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleEditGift}
            className="flex-1 px-4 py-2 rounded-lg text-white transition-colors"
            style={{
              background: theme?.navBarColor || "#ec4899",
            }}
          >
            Salvar Alterações
          </button>
        </div>
      </Modal>

      {/* Modal Deletar Presente - usando componente Modal */}
      <Modal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)}>
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <svg
              className="h-6 w-6 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>

          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Remover Presente
          </h3>

          <p className="text-sm text-gray-500 mb-4">
            Tem certeza que deseja remover este presente?
            <br />
            <strong className="text-red-600">Esta ação não pode ser desfeita.</strong>
          </p>

          {selectedGift && (
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <p className="text-sm font-medium text-gray-900">
                {selectedGift.title}
              </p>
              <p className="text-xs text-gray-500">
                R$ {selectedGift.valor}
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => setDeleteModalOpen(false)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirmDelete}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Remover
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal Desvincular Presente - usando componente Modal */}
      <Modal isOpen={unlinkModalOpen} onClose={() => setUnlinkModalOpen(false)}>
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-orange-100 mb-4">
            <svg
              className="h-6 w-6 text-orange-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
              />
            </svg>
          </div>

          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Desvincular Presente
          </h3>

          <p className="text-sm text-gray-500 mb-4">
            Deseja desvincular este presente do convidado?
            <br />
            <strong className="text-orange-600">A pessoa terá que selecionar novamente.</strong>
          </p>

          {selectedGift && (
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <p className="text-sm font-medium text-gray-900">
                {selectedGift.title}
              </p>
              <p className="text-xs text-gray-500">
                Vinculado a: {selectedGift.guestId && guestMap[selectedGift.guestId]?.name}
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => setUnlinkModalOpen(false)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirmUnlink}
              className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              Desvincular
            </button>
          </div>
        </div>
      </Modal>

      {/* Popup de sucesso */}
      {showPopup && (
        <div className="fixed bottom-5 right-5 bg-white p-4 rounded-lg shadow-md z-50">
          <p className="text-green-600 font-semibold">
            Presente criado com sucesso!
          </p>
        </div>
      )}

      {/* Componentes separados */}
      <GuestsList guests={guests} gifts={gifts} theme={theme} />

      <GiftsList
        gifts={gifts}
        guestMap={guestMap}
        theme={theme}
        onEditGift={openEditModal}
        onDeleteGift={openDeleteModal}
        onUnlinkGift={openUnlinkModal}
      />
    </div>
  );
};

export default Admin;
