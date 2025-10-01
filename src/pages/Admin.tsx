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
import { useNavigate } from "react-router-dom";
import { useTheme } from "../hooks/useTheme";
import { useToast } from "../context/ToastContext";

type Guest = {
  id: string;
  name: string;
  email: string;
  giftSelected: boolean;
  giftId?: string | null;
  createdAt?: Timestamp | null;
};

type Gift = {
  id: string;
  title: string;
  url: string;
  description: string;
  valor?: string | number;
  selected: boolean;
  guestId?: string | null;
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
  const totalValue = gifts.reduce(
    (acc, gift) => acc + (Number(gift.valor) || 0),
    0
  );

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
          <p className="text-2xl font-bold text-blue-600">R$ {totalValue}</p>
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

      {/* Tabela de convidados */}
      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-4">Convidados</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300 rounded-xl">
            <thead
              style={{
                backgroundColor: theme?.navBarColor,
                color: theme?.navBarText,
              }}
            >
              <tr>
                <th className="px-4 py-2">Nome</th>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Presente</th>
                <th className="px-4 py-2">Data Confirmação</th>
                <th className="px-4 py-2">Valor</th>
              </tr>
            </thead>
            <tbody>
              {guests.map((guest) => {
                let giftTitle = "-";
                let giftUrl = "";
                if (guest.giftId) {
                  const gift = gifts.find((g) => g.id === guest.giftId);
                  if (gift) {
                    giftTitle = gift.title;
                    giftUrl = typeof gift.url === "string" ? gift.url : "";
                  }
                }
                return (
                  <tr key={guest.id} className="text-center border-b">
                    <td className="px-4 py-2">{guest.name}</td>
                    <td className="px-4 py-2">{guest.email}</td>
                    <td className="px-4 py-2">
                      {giftTitle !== "-" && giftUrl ? (
                        <a
                          href={giftUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-pink-600 underline "
                          style={{ color: theme?.navBarColor }}
                        >
                          {giftTitle}
                        </a>
                      ) : (
                        giftTitle
                      )}
                    </td>
                    <td className="px-4 py-2">
                      {guest.createdAt?.toDate
                        ? guest.createdAt.toDate().toLocaleDateString("pt-BR")
                        : "-"}
                    </td>
                    <td className="px-4 py-2">
                      {guest.giftSelected ? "✔️" : "❌"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tabela de presentes */}
      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-4">Presentes</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300 rounded-xl">
            <thead
              style={{
                backgroundColor: theme?.navBarColor,
                color: theme?.navBarText,
              }}
            >
              <tr>
                <th className="px-4 py-2">Nome</th>
                <th className="px-4 py-2">Selecionado</th>
                <th className="px-4 py-2">E-mail</th>
                <th className="px-4 py-2">Valor</th>
                <th className="px-4 py-2">Ações</th>
              </tr>
            </thead>
            <tbody>
              {gifts.map((gift) => {
                const guest = gift.guestId ? guestMap[gift.guestId] : null;
                return (
                  <tr key={gift.id} className="text-center border-b">
                    <td className="px-4 py-2">{gift.title}</td>
                    <td className="px-4 py-2">
                      {gift.selected
                        ? guest
                          ? guest.name
                          : "Selecionado"
                        : "❌"}
                    </td>
                    <td className="px-4 py-2">
                      {gift.selected ? (guest ? guest.email : "-") : "-"}
                    </td>
                    <td className="px-4 py-2">R$ {gift.valor}</td>
                    <td className="px-4 py-2">
                      <div className="flex justify-center gap-2">
                        {/* Botão Editar */}
                        <button
                          onClick={() => openEditModal(gift)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            className="w-5 h-5"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                            />
                          </svg>
                        </button>

                        {/* Botão Deletar */}
                        <button
                          onClick={() => openDeleteModal(gift)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                          title="Remover"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            className="w-5 h-5"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                            />
                          </svg>
                        </button>

                        {/* Botão Desvincular - sempre aparece, mas disabled quando não selecionado */}
                        <button
                          onClick={
                            gift.selected
                              ? () => openUnlinkModal(gift)
                              : undefined
                          }
                          disabled={!gift.selected}
                          className={`p-2 rounded-lg transition-colors ${
                            gift.selected
                              ? "text-orange-600 hover:bg-orange-100 cursor-pointer"
                              : "text-gray-400 cursor-not-allowed"
                          }`}
                          title={
                            gift.selected
                              ? "Desvincular presente"
                              : "Presente não vinculado"
                          }
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            className="w-5 h-5"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M22 10.5h-6m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM4 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 10.374 21c-2.331 0-4.512-.645-6.374-1.766Z"
                            />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Admin;
