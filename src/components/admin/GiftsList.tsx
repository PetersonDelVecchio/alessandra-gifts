import type { Theme } from "../../pages/ThemePage";

type Guest = {
  id: string;
  name: string;
  phone: string;
  giftSelected: boolean;
  giftId?: string | null;
  giftMethod?: string;
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

type GiftsListProps = {
  gifts: Gift[];
  guestMap: Record<string, Guest>;
  theme: Theme;
  onEditGift: (gift: Gift) => void;
  onDeleteGift: (gift: Gift) => void;
  onUnlinkGift: (gift: Gift) => void;
};

export default function GiftsList({
  gifts,
  guestMap,
  theme,
  onEditGift,
  onDeleteGift,
  onUnlinkGift,
}: GiftsListProps) {
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

  return (
    <div className="mt-10">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Presentes</h2>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          onClick={() => {
            // Aqui futuramente você pode adicionar a função de export
            console.log("Export presentes");
          }}
        >
          📋 Exportar Presentes
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300 rounded-xl">
          <thead
            className=""
            style={{
              backgroundColor: theme?.navBarColor,
              color: theme?.navBarText,
            }}
          >
            <tr className="h-16 sm:h-auto">
              <th className="px-4 py-2">Nome</th>
              <th className="px-4 py-2">Selecionado</th>
              <th className="px-4 py-2">WhatsApp</th>
              <th className="px-4 py-2">Valor</th>
              <th className="px-4 py-2">Ações</th>
            </tr>
          </thead>
          <tbody>
            {gifts
              .filter((gift) => gift.active !== false)
              .sort((a, b) => {
                // Primeiro, verifica se algum título começa com número
                const aStartsWithNumber = /^\d/.test(a.title);
                const bStartsWithNumber = /^\d/.test(b.title);

                // Se um começa com número e outro não, coloca o número por último
                if (aStartsWithNumber && !bStartsWithNumber) return 1;
                if (!aStartsWithNumber && bStartsWithNumber) return -1;

                // Caso contrário, ordenação alfabética normal
                return a.title.localeCompare(b.title, 'pt-BR', { 
                  sensitivity: 'base',
                  numeric: true
                });
              })
              .map((gift) => {
                const guest = gift.guestId ? guestMap[gift.guestId] : null;
                return (
                  <tr key={gift.id} className="text-center border-b">
                    <td className="px-4 py-2">
                      {gift.url ? (
                        <a
                          href={gift.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline hover:opacity-75 transition-opacity"
                          style={{ color: theme?.navBarColor || "#ec4899" }}
                        >
                          {gift.title}
                        </a>
                      ) : (
                        gift.title
                      )}
                    </td>
                    <td className="px-4 py-2">
                      {gift.selected
                        ? guest
                          ? guest.name
                          : "Selecionado"
                        : "-"}
                    </td>
                    <td className="px-1 py-1 sm:px-2 sm:py-2 w-32">
                      {gift.selected && guest?.phone ? (
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
                    <td className="px-4 py-2">R$ {gift.valor}</td>
                    <td className="px-4 py-2">
                      <div className="flex justify-center gap-2">
                        {/* Botão Editar */}
                        <button
                          onClick={() => onEditGift(gift)}
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
                          onClick={() => onDeleteGift(gift)}
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

                        {/* Botão Desvincular */}
                        <button
                          onClick={
                            gift.selected ? () => onUnlinkGift(gift) : undefined
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
  );
}
