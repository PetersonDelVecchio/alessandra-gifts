import React from "react";
import { useTheme } from "../hooks/useTheme";

interface LoadingProps {
  message?: string;
  size?: "small" | "medium" | "large";
  fullScreen?: boolean;
}

const Loading: React.FC<LoadingProps> = ({
  message = "Carregando...",
  size = "medium",
  fullScreen = true,
}) => {
  const sizeClasses = {
    small: "w-6 h-6",
    medium: "w-8 h-8",
    large: "w-12 h-12",
  };
  const { theme } = useTheme();

  const containerClasses = fullScreen
    ? "fixed inset-0 flex flex-col items-center justify-center z-50"
    : "flex flex-col items-center justify-center p-8";

  return (
    <div
      className={containerClasses}
      style={{
        background: theme?.inviteCardBackgroundColor || "#ffffff",
      }}
    >
      <div
        className={`${sizeClasses[size]} animate-spin rounded-full border-4 mb-4`}
        style={{
          borderColor: `${theme?.inviteCardBorderColor || "#e5e7eb"} transparent ${theme?.inviteCardBorderColor || "#e5e7eb"} transparent`,
        }}
      />
      <p
        className="font-medium text-lg"
        style={{
          color: theme?.inviteCardTextColor || "#374151",
        }}
      >
        {message}
      </p>
    </div>
  );
};

export default Loading;
