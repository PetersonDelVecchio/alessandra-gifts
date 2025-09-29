import React from "react";

type PopupProps = {
  message: string;
  show: boolean;
  onClose: () => void;
};

const Popup: React.FC<PopupProps> = ({ message, show, onClose }) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-30">
      <div className="bg-white rounded-lg shadow-lg p-6 min-w-[250px] text-center">
        <div className="mb-4">{message}</div>
        <button
          className="bg-pink-600 text-white px-4 py-2 rounded hover:bg-pink-700"
          onClick={onClose}
        >
          OK
        </button>
      </div>
    </div>
  );
};

export default Popup;