import React from "react";

type GiftCardProps = {
  title: string;
  description: string;
  value?: string | number;
  selected: boolean;
  selectedBy?: string;
  onSelect: () => void;
};

const GiftCard: React.FC<GiftCardProps> = ({
  title,
  description,
  value,
  selected,
  selectedBy,
  onSelect,
}) => {
  return (
    <div className="relative flex flex-col my-6 bg-white shadow-sm border border-slate-200 rounded-lg w-full max-w-md mx-auto">
      <div className="p-4">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-slate-800 text-xl font-semibold">{title}</p>
          {value && (
            <p className="text-pink-600 text-xl font-semibold">
              R$ {typeof value === "string" ? value : value.toFixed(2)}
            </p>
          )}
        </div>
        <p className="text-slate-600 leading-normal font-light mb-4">{description}</p>
        {selected ? (
          <button
            className="rounded-md w-full mt-4 bg-gray-300 py-2 px-4 border border-transparent text-center text-sm text-gray-600 cursor-not-allowed"
            disabled
          >
            {selectedBy ? `Escolhido por ${selectedBy}` : "Já escolhido"}
          </button>
        ) : (
          <button
            className="rounded-md w-full mt-4 bg-pink-600 py-2 px-4 border border-transparent text-center text-sm text-white transition-all shadow-md hover:shadow-lg focus:bg-pink-700 focus:shadow-none active:bg-pink-700 hover:bg-pink-700 active:shadow-none"
            type="button"
            onClick={onSelect}
          >
            Escolher presente
          </button>
        )}
      </div>
    </div>
  );
};

export default GiftCard;
