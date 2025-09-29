import React, { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  deleteDoc,
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
  const navigate = useNavigate();
  const { theme } = useTheme();

  const handleToggleShowChosen = async () => {
    if (!theme) return;
    const themeRef = doc(db, "theme", "59zMCCzevS9uOZumvxZ4");
    await updateDoc(themeRef, { listSelected: !theme.listSelected });
  };
  const { showToast } = useToast();

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

  // Deletar presente
  const handleDeleteGift = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir este presente?")) {
      await deleteDoc(doc(db, "gifts", id));
      setGifts(gifts.filter((gift) => gift.id !== id));
    }
  };

  const handleGiftCreated = () => {
    setIsModalOpen(false); // Fecha o modal
    setShowPopup(true); // Mostra o popup
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
          <p className="text-2xl font-bold text-pink-600">{totalGuests}</p>
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
      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
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
                          className="text-pink-600 underline hover:text-pink-800"
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
                    <td className="px-4 py-2 flex justify-center gap-2">
                      <button className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600">
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteGift(gift.id)}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                      >
                        Deletar
                      </button>
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
