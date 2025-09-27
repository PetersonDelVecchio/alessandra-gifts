import React, { useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { auth, db } from "../firebase/config";
import Modal from "../components/Modal";
import CreateGift from "../components/CreateGift";
import { useNavigate } from "react-router-dom";

type Guest = {
  id: string;
  name: string;
  email: string;
  giftSelected: boolean;
  giftId?: string | null;
  createdAt?: any;
};

type Gift = {
  id: string;
  title: string;
  description: string;
  valor: number;
  selected: boolean;
  selectedBy?: string;
  selectedEmail?: string;
};

const Admin: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [showChosenGifts, setShowChosenGifts] = useState(
    localStorage.getItem("showChosenGifts") === "true"
  );
  const navigate = useNavigate();

  const handleToggleShowChosen = () => {
    const newValue = !showChosenGifts;
    setShowChosenGifts(newValue);
    localStorage.setItem("showChosenGifts", newValue ? "true" : "false");
  };

  // Buscar dados do Firestore
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Guests
        const guestsSnapshot = await getDocs(collection(db, "guests"));
        const guestsData: Guest[] = guestsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Guest[];
        setGuests(guestsData);

        // Gifts
        const giftsSnapshot = await getDocs(collection(db, "gifts"));
        const giftsData: Gift[] = giftsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Gift[];
        setGifts(giftsData);

        setLoading(false);
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      }
    };

    fetchData();
  }, []);

  // Estatísticas
  const totalGuests = guests.length;
  const confirmedGuests = guests.filter((g) => g.giftSelected).length;
  const totalValue = gifts.reduce(
    (acc, gift) => acc + (Number(gift.valor) || 0),
    0
  );

  // Logout
  const handleLogout = async () => {
    await signOut(auth);
    window.location.href = "/"; // redirecionar para login
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
    setShowPopup(true);    // Mostra o popup
    setTimeout(() => setShowPopup(false), 3000);
    navigate("/admin");
  };

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
      <label className="flex items-center gap-2 mt-4">
        <input
          type="checkbox"
          checked={showChosenGifts}
          onChange={handleToggleShowChosen}
        />
        Mostrar presentes já escolhidos na lista dos convidados
      </label>
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
            <thead className="bg-pink-500 text-white">
              <tr>
                <th className="px-4 py-2">Nome</th>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Presente</th>
                <th className="px-4 py-2">Data Confirmação</th>
                <th className="px-4 py-2">Valor</th>
              </tr>
            </thead>
            <tbody>
              {guests.map((guest) => (
                <tr key={guest.id} className="text-center border-b">
                  <td className="px-4 py-2">{guest.name}</td>
                  <td className="px-4 py-2">{guest.email}</td>
                  <td className="px-4 py-2">
                    {typeof guest.giftId === "string" ||
                    typeof guest.giftId === "number"
                      ? guest.giftId
                      : "-"}
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
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tabela de presentes */}
      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-4">Presentes</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300 rounded-xl">
            <thead className="bg-pink-500 text-white">
              <tr>
                <th className="px-4 py-2">Nome</th>
                <th className="px-4 py-2">Selecionado</th>
                <th className="px-4 py-2">E-mail</th>
                <th className="px-4 py-2">Valor</th>
                <th className="px-4 py-2">Ações</th>
              </tr>
            </thead>
            <tbody>
              {gifts.map((gift) => (
                <tr key={gift.id} className="text-center border-b">
                  <td className="px-4 py-2">{gift.title}</td>
                  <td className="px-4 py-2">
                    {gift.selected ? gift.selectedBy : "❌"}
                  </td>
                  <td className="px-4 py-2">
                    {gift.selectedEmail ? gift.selectedEmail : "-"}
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
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Admin;
