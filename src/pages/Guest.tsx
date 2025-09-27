import React, { useEffect, useState } from "react";
import GiftCard from "../components/GiftCard";
import emailjs from "@emailjs/browser";
import { useNavigate } from "react-router-dom";
import { collection, onSnapshot, updateDoc, doc } from "firebase/firestore";
import { db } from "../firebase/config";

// Defina o tipo Gift
type Gift = {
  id: string;
  title: string;
  description: string;
  selected: boolean;
  selectedBy?: string;
  selectedEmail?: string;
};

const Guest: React.FC = () => {
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [giftId, setGiftId] = useState<string | null>(null);
  const navigate = useNavigate();

  const giftsCollection = collection(db, "gifts");

  useEffect(() => {
    const storedName = localStorage.getItem("guestName") || "";
    const storedEmail = localStorage.getItem("guestEmail") || "";
    setName(storedName);
    setEmail(storedEmail);

    // Busca o guestId e verifica se já escolheu presente
    const guestId = localStorage.getItem("guestId");
    if (guestId) {
      import("firebase/firestore").then(({ doc, getDoc }) => {
        const guestRef = doc(db, "guests", guestId);
        getDoc(guestRef).then((snap) => {
          const data = snap.data();
          if (data && data.giftId) {
            setGiftId(data.giftId);
          }
        });
      });
    }

    // Listener em tempo real para presentes
    const unsubscribe = onSnapshot(giftsCollection, (snapshot) => {
      const giftsList: Gift[] = snapshot.docs.map(doc => ({
        id: doc.id,
        title: doc.data().title,
        description: doc.data().description,
        selected: doc.data().selected,
        selectedBy: doc.data().selectedBy,
        selectedEmail: doc.data().selectedEmail,
      }));
      setGifts(giftsList);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (giftId) {
      navigate("/dashboard");
    }
  }, [giftId, navigate]);

  const handleSelect = async (gift: Gift) => {
    if (!gift.id) return;

    const guestId = localStorage.getItem("guestId");
    if (!guestId) {
      alert("Erro: guestId não encontrado.");
      return;
    }

    // Atualiza o presente com guestId, selectedBy e selectedEmail
    const giftRef = doc(db, "gifts", gift.id);
    await updateDoc(giftRef, {
      selected: true,
      selectedBy: name,
      selectedEmail: email,
      guestId: guestId,
    });

    // Atualiza o convidado com o giftId escolhido
    const guestRef = doc(db, "guests", guestId);
    await updateDoc(guestRef, {
      giftId: gift.id,
      giftSelected: true,
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
    localStorage.clear();
    window.location.href = "/login";
  };

  const showChosenGifts = localStorage.getItem("showChosenGifts") === "true";

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
        {gifts
          .filter(gift => showChosenGifts || !gift.selected)
          .map(gift => (
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
