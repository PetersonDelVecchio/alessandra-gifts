import React, { useEffect, useState } from "react";
import GiftCard from "../components/GiftCard";
import emailjs from "@emailjs/browser";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "../firebase/config";

const Guest: React.FC = () => {
  const [gifts, setGifts] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const giftsCollection = collection(db, "gifts");

  useEffect(() => {
    const storedName = localStorage.getItem("guestName") || "";
    const storedEmail = localStorage.getItem("guestEmail") || "";
    setName(storedName);
    setEmail(storedEmail);

    fetchGifts();
  }, []);

  const fetchGifts = async () => {
    const snapshot = await getDocs(giftsCollection);
    const giftsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setGifts(giftsList);
  };

  const handleSelect = async (gift: any) => {
    if (!gift.id) return;

    const giftRef = doc(db, "gifts", gift.id);
    await updateDoc(giftRef, {
      selected: true,
      selectedBy: name,
      selectedEmail: email
    });

    const templateParams = {
      guest_name: name,
      guest_email: email,
      gift_title: gift.title,
      gift_description: gift.description
    };

    emailjs.send("service_5xc6qm7", "template_08j75bw", templateParams, "_T2E1SvzXatO1LUoX")
      .then(() => alert(`🎉 Presente reservado com sucesso! Confirmação enviada para ${email}`))
      .catch(() => alert("🎉 Presente reservado, mas não foi possível enviar o e-mail."));

    fetchGifts();
  };

  const handleLogout = () => {
    localStorage.removeItem("guestName");
    localStorage.removeItem("guestEmail");
    navigate("/");
  };

  return (
    <div className="p-6 relative">
      <button
        onClick={handleLogout}
        className="absolute top-6 right-6 bg-white border-2 border-pink-500 text-pink-500 font-semibold px-4 py-2 rounded-xl shadow-md hover:bg-pink-50 transition-colors duration-300"
      >
        Sair
      </button>

      <h1 className="header text-center">Lista de Presentes da Alessandra 🎂</h1>

      <p className="mt-2 text-black text-center">
        Olá, {name}! ({email})
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-6">
        {gifts.map(gift => (
          <GiftCard
            key={gift.id}
            title={gift.title}
            description={gift.description}
            onSelect={() => handleSelect(gift)}
            disabled={gift.selected}
          />
        ))}
      </div>
    </div>
  );
};

export default Guest;
