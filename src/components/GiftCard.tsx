import React from "react";

interface GiftCardProps {
  title: string;
  description: string;
  onSelect: () => void;
  disabled?: boolean;
}

const GiftCard: React.FC<GiftCardProps> = ({ title, description, onSelect, disabled }) => {
  return (
    <div className="gift-card">
      <h3 className="text-alessandra-500 font-bold text-lg">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
      <button
        onClick={onSelect}
        disabled={disabled}
        className="btn-primary mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {disabled ? "Já escolhido" : "Escolher presente"}
      </button>
    </div>
  );
};

export default GiftCard;
