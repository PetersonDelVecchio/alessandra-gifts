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

  // Logout
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/"; // ou "/login"
  };

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
      <button
        onClick={handleLogout}
        style={{
          borderColor: theme?.logoutButtonColor || "#d1d5db",
          background: theme?.logoutButtonColor || "#ffffff",
          color: theme?.logoutButtonTextColor || "#db2777",
          fontFamily: theme?.logoutButtonFontFamily || "inherit",
        }}
        className="absolute top-6 right-6 bg-white border-2 border-pink-500 text-pink-500 font-semibold px-4 py-2 rounded-xl shadow-md hover:bg-pink-50 transition-colors duration-300"
      >
        Sair
      </button>

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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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

      {/* Modal Criar Presente */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 relative max-w-lg w-full">
            <button
              className="absolute top-2 right-3 text-pink-500 text-2xl font-bold"
              onClick={() => setIsModalOpen(false)}
              aria-label="Fechar"
            >
              ×
            </button>
            <CreateGift onGiftCreated={handleGiftCreated} />
          </div>
        </div>
      )}

      {/* Modal Editar Presente */}
      {editModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 relative max-w-lg w-full">
            <button
              className="absolute top-2 right-3 text-pink-500 text-2xl font-bold"
              onClick={() => setEditModalOpen(false)}
              aria-label="Fechar"
            >
              ×
            </button>
            <h2 className="text-xl font-bold mb-4 text-center">
              Editar Presente
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Título</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) =>
                    setEditForm({ ...editForm, title: e.target.value })
                  }
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">URL</label>
                <input
                  type="url"
                  value={editForm.url}
                  onChange={(e) =>
                    setEditForm({ ...editForm, url: e.target.value })
                  }
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Descrição
                </label>
                <textarea
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm({ ...editForm, description: e.target.value })
                  }
                  className="w-full border rounded px-3 py-2"
                  rows={3}
                  maxLength={100}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Valor</label>
                <input
                  type="text"
                  value={editForm.valor}
                  onChange={(e) =>
                    setEditForm({ ...editForm, valor: e.target.value })
                  }
                  className="w-full border rounded px-3 py-2"
                  placeholder="199.90"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={handleEditGift}
                className="flex-1 bg-pink-600 text-white py-2 rounded-lg hover:bg-pink-700 transition"
              >
                Salvar
              </button>
              <button
                onClick={() => setEditModalOpen(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Deletar Presente */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 relative max-w-lg w-full">
            <h2 className="text-xl font-bold mb-4 text-center text-red-600">
              Confirmar Remoção
            </h2>
            <p className="text-center mb-6">
              Certeza que deseja remover este presente?
              <br />
              <strong>Essa ação não poderá ser desfeita.</strong>
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleConfirmDelete}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition"
              >
                Confirmar
              </button>
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Desvincular Presente */}
      {unlinkModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 relative max-w-lg w-full">
            <h2 className="text-xl font-bold mb-4 text-center text-orange-600">
              Desvincular Presente
            </h2>
            <p className="text-center mb-6">
              Remover o presente desta confirmação?
              <br />
              <strong>A pessoa terá de selecionar novamente.</strong>
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleConfirmUnlink}
                className="flex-1 bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 transition"
              >
                Confirmar
              </button>
              <button
                onClick={() => setUnlinkModalOpen(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

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
