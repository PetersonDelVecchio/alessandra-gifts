import { Timestamp } from "firebase/firestore";
import * as XLSX from "xlsx";
import type { Theme } from "../../pages/ThemePage";

type Guest = {
  id: string;
  name: string;
  phone: string;
  giftSelected: boolean;
  giftId?: string | null;
  giftMethod?: string;
  confirmedAt?: Timestamp | null;
  type?: string; // Adicionar esta propriedade
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

type GuestsListProps = {
  guests: Guest[];
  gifts: Gift[];
  theme: Theme;
};

export default function GuestsList({ guests, gifts, theme }: GuestsListProps) {
  // Função para formatar telefone
  const formatPhone = (phone: string): string => {
    if (!phone) return "-";

    const numbers = phone.replace(/\D/g, "");

    if (numbers.length === 11) {
      return numbers.replace(/(\d{2})(\d{1})(\d{4})(\d{4})/, "($1) $2 $3-$4");
    } else if (numbers.length === 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
    }

    return phone;
  };

  // Função para gerar link do WhatsApp
  const getWhatsAppLink = (phone: string): string => {
    if (!phone) return "#";
    const numbers = phone.replace(/\D/g, "");
    return `https://wa.me/+55${numbers}`;
  };

  // Função para preparar dados dos convidados para export
  const prepareGuestData = (guestList: Guest[], filterConfirmed = false) => {
    const filteredGuests = filterConfirmed
      ? guestList.filter((guest) => guest.giftSelected)
      : guestList;

    return filteredGuests.map((guest) => {
      let giftTitle = "-";
      let giftValue = "-";
      let giftUrl = "-";

      if (guest.giftId) {
        const gift = gifts.find((g) => g.id === guest.giftId);
        if (gift) {
          giftTitle = gift.title;
          giftValue = gift.valor ? `R$ ${gift.valor}` : "-";
          giftUrl = gift.url || "-";
        }
      }

      return {
        Nome: guest.name,
        WhatsApp: formatPhone(guest.phone),
        Presente: giftTitle,
        "Valor do Presente": giftValue,
        "URL do Presente": giftUrl,
        Método: guest.giftMethod
          ? guest.giftMethod.charAt(0).toUpperCase() +
            guest.giftMethod.slice(1).toLowerCase()
          : "-",
        Confirmado: guest.giftSelected ? "Sim" : "Não",
        "Data Confirmação": guest.confirmedAt?.toDate
          ? guest.confirmedAt.toDate().toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })
          : "-",
      };
    });
  };

  // Função para exportar convidados confirmados
  const exportConfirmedGuests = () => {
    const confirmedGuests = prepareGuestData(guests, true);

    if (confirmedGuests.length === 0) {
      alert("Não há convidados confirmados para exportar.");
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(confirmedGuests);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Convidados Confirmados");

    // Ajustar largura das colunas
    const colWidths = [
      { wch: 25 }, // Nome
      { wch: 18 }, // WhatsApp
      { wch: 30 }, // Presente
      { wch: 15 }, // Valor
      { wch: 50 }, // URL
      { wch: 10 }, // Método
      { wch: 12 }, // Confirmado
      { wch: 20 }, // Data
    ];
    worksheet["!cols"] = colWidths;

    const today = new Date().toLocaleDateString("pt-BR").replace(/\//g, "-");
    XLSX.writeFile(workbook, `convidados-confirmados-${today}.xlsx`);
  };

  // Função para exportar todos os convidados
  const exportAllGuests = () => {
    const guestUsers = guests.filter((guest) => guest.type !== "admin");
    const allGuests = prepareGuestData(guestUsers, false);

    if (allGuests.length === 0) {
      alert("Não há convidados para exportar.");
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(allGuests);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Todos os Convidados");

    // Ajustar largura das colunas
    const colWidths = [
      { wch: 25 }, // Nome
      { wch: 18 }, // WhatsApp
      { wch: 30 }, // Presente
      { wch: 15 }, // Valor
      { wch: 50 }, // URL
      { wch: 10 }, // Método
      { wch: 12 }, // Confirmado
      { wch: 20 }, // Data
    ];
    worksheet["!cols"] = colWidths;

    const today = new Date().toLocaleDateString("pt-BR").replace(/\//g, "-");
    XLSX.writeFile(workbook, `todos-convidados-${today}.xlsx`);
  };

  return (
    <div className="mt-10">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Convidados</h2>

        {/* Botões de Export */}
        <div className="flex gap-2">
          <button
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-2"
            onClick={exportConfirmedGuests}
            title="Exportar apenas convidados que confirmaram presença"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>
            Confirmados
          </button>

          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
            onClick={exportAllGuests}
            title="Exportar todos os convidados cadastrados"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
              />
            </svg>
            Todos
          </button>
        </div>
      </div>

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
              <th className="px-4 py-2">WhatsApp</th>
              <th className="px-4 py-2">Presente</th>
              <th className="px-4 py-2">Método</th>
              <th className="px-4 py-2">Confirmado</th>
              <th className="px-4 py-2">Data Confirmação</th>
            </tr>
          </thead>
          <tbody>
            {guests
              .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' }))
              .map((guest) => {
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
                  <td className="px-4 py-2">
                    {guest.phone ? (
                      <a
                          href={getWhatsAppLink(guest.phone)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 hover:opacity-75 transition-opacity"
                          style={{ color: theme?.navBarColor || "#25D366" }}
                          title={`WhatsApp: ${formatPhone(guest.phone)}`}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            fill="currentColor"
                            viewBox="0 0 16 16"
                            className="sm:w-4 sm:h-4"
                          >
                            <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.777-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.692.677-.692 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.480 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z" />
                          </svg>
                          {/* Mostra número apenas em telas maiores */}
                          <span className="hidden sm:inline underline text-xs">
                            {formatPhone(guest.phone)}
                          </span>
                        </a>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="px-4 py-2">
                    {giftTitle !== "-" && giftUrl ? (
                      <a
                        href={giftUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline hover:opacity-75 transition-opacity"
                        style={{ color: theme?.navBarColor || "#ec4899" }}
                      >
                        {giftTitle}
                      </a>
                    ) : (
                      giftTitle
                    )}
                  </td>
                  <td className="px-4 py-2">
                    {guest.giftMethod
                      ? guest.giftMethod.charAt(0).toUpperCase() +
                        guest.giftMethod.slice(1).toLowerCase()
                      : "-"}
                  </td>
                  <td className="px-4 py-2">
                    {guest.giftSelected ? "✔️" : "❌"}
                  </td>
                  <td className="px-4 py-2">
                    {guest.confirmedAt?.toDate
                      ? guest.confirmedAt.toDate().toLocaleDateString("pt-BR")
                      : "-"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
