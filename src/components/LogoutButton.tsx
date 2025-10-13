// src/components/LogoutButton.tsx
import React from "react";
import { useTheme } from "../hooks/useTheme";

type LogoutButtonProps = {
  className?: string;
  style?: React.CSSProperties;
  position?: "top-right" | "top-center" | "custom";
};

const LogoutButton: React.FC<LogoutButtonProps> = ({
  className = "",
  style = {},
  position = "top-right",
}) => {
  const { theme } = useTheme();

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  const positionClasses = {
    "top-right": "absolute top-4 right-4",
    "top-center": "mx-auto mb-4",
    "custom": "",
  };

  return (
    <button
      onClick={handleLogout}
      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95 flex items-center gap-2 shadow-md ${positionClasses[position]} ${className}`}
      style={{
        background: theme?.logoutButtonColor || theme?.navBarColor || "#333",
        color: theme?.logoutButtonTextColor || theme?.navBarText || "#fff",
        border: `1px solid ${theme?.logoutButtonColor || theme?.navBarColor || "#333"}`,
        fontFamily: theme?.logoutButtonFontFamily || theme?.titleFontFamily || "inherit",
        opacity: 0.9,
        ...style,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.opacity = "1";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.opacity = "0.9";
      }}
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
          d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9"
        />
      </svg>
      <span className="hidden sm:inline">Sair</span>
    </button>
  );
};

export default LogoutButton;