import React, { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";

type Gift = {
  id: string;
  title: string;
  description: string;
  value?: number;
};

const Dashboard: React.FC = () => {
  const [gift, setGift] = useState<Gift | null>(null);
  const [birthday, setBirthday] = useState<string>("");
  const [address, setAddress] = useState<string>("");

  useEffect(() => {
    const guestId = localStorage.getItem("guestId");
    if (!guestId) return;

    // Busca guest para pegar giftId, aniversário e endereço
    const fetchGuestAndGift = async () => {
      const guestRef = doc(db, "guests", guestId);
      const guestSnap = await getDoc(guestRef);
      const guestData = guestSnap.data();
      if (guestData && guestData.giftId) {
        setBirthday(guestData.birthday || ""); // ajuste conforme seu banco
        setAddress(guestData.address || "");   // ajuste conforme seu banco

        // Busca o presente escolhido
        const giftRef = doc(db, "gifts", guestData.giftId);
        const giftSnap = await getDoc(giftRef);
        const giftData = giftSnap.data();
        if (giftData) {
          setGift({
            id: giftSnap.id,
            title: giftData.title,
            description: giftData.description,
            value: giftData.value,
          });
        }
      }
    };

    fetchGuestAndGift();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  // WhatsApp link (ajuste o número e mensagem)
  const whatsappLink = `https://wa.me/5599999999999?text=Olá!%20Gostaria%20de%20confirmar%20meu%20presente%20para%20a%20Alessandra.`;

  return (
    <div className="p-6 relative">
      <button
        onClick={handleLogout}
        className="absolute top-6 right-6 bg-white border-2 border-pink-500 text-pink-500 font-semibold px-4 py-2 rounded-xl shadow-md hover:bg-pink-50 transition-colors duration-300"
      >
        Sair
      </button>
      <h1 className="header text-center mb-6">Seu Presente Escolhido 🎁</h1>
      {gift ? (
        <div className="bg-white rounded-xl shadow-lg p-6 max-w-md mx-auto">
          <h2 className="text-xl font-bold text-pink-600 mb-2">{gift.title}</h2>
          <p className="mb-2">{gift.description}</p>
          {gift.value && (
            <p className="mb-2 font-semibold">Valor: R$ {gift.value.toFixed(2)}</p>
          )}
          <p className="mb-2">Aniversário: {birthday || "Data não informada"}</p>
          <p className="mb-4">Endereço: {address || "Endereço não informado"}</p>
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-green-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-600 transition"
          >
            Falar no WhatsApp
          </a>
        </div>
      ) : (
        <p className="text-center">Carregando informações do presente...</p>
      )}
    </div>
  );
};

export default Dashboard;