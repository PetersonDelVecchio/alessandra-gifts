// src/components/ReservationTimer.tsx
import { useState, useEffect, useRef } from "react";

type ReservationTimerProps = {
  initialTime: number;
  onExpired: () => void;
  isActive: boolean;
};

export default function ReservationTimer({
  initialTime,
  onExpired,
  isActive,
}: ReservationTimerProps) {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const intervalRef = useRef<number | null>(null);
  const hasExpiredRef = useRef(false);
  const onExpiredRef = useRef(onExpired);

  // Atualiza a referência da função sem causar re-render
  useEffect(() => {
    onExpiredRef.current = onExpired;
  }, [onExpired]);

  // Effect principal - APENAS isActive como dependência
  useEffect(() => {
    // Se não está ativo, limpa e reseta
    if (!isActive) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setTimeLeft(initialTime);
      hasExpiredRef.current = false;
      return;
    }

    // Se já tem timer ativo, não faz nada
    if (intervalRef.current) {
      return;
    }

    // Inicia novo timer
    setTimeLeft(initialTime);
    hasExpiredRef.current = false;

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = prev - 1;

        if (newTime <= 0) {
          // Timer expirou
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }

          if (!hasExpiredRef.current) {
            hasExpiredRef.current = true;
            onExpiredRef.current();
          }

          return 0;
        }

        return newTime;
      });
    }, 1000);

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isActive]); // APENAS isActive!

  // Cleanup final
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getTimerColor = () => {
    if (timeLeft > initialTime * 0.5) return "text-blue-700";
    if (timeLeft > initialTime * 0.25) return "text-yellow-700";
    return "text-red-700";
  };

  const getProgressColor = () => {
    if (timeLeft > initialTime * 0.5) return "bg-blue-600";
    if (timeLeft > initialTime * 0.25) return "bg-yellow-600";
    return "bg-red-600";
  };

  const getBackgroundColor = () => {
    if (timeLeft > initialTime * 0.5) return "bg-blue-50 border-blue-200";
    if (timeLeft > initialTime * 0.25) return "bg-yellow-50 border-yellow-200";
    return "bg-red-50 border-red-200";
  };

  const progressPercentage = Math.max(0, (timeLeft / initialTime) * 100);

  return (
    <div
      className={`border rounded-lg p-3 mb-4 text-center ${getBackgroundColor()}`}
    >
      {/* Debug - remover depois */}
      {/* <div className="text-xs text-gray-400 mb-1">
        Timer: {timeLeft}s | Active: {isActive ? "ON" : "OFF"}
      </div> */}

      <div className="text-sm mb-1">
        ⏰ Este presente está reservado por:{" "}
        <span className={`font-mono font-bold text-lg ${getTimerColor()}`}>
          {formatTime(timeLeft)}
        </span>
      </div>

      <div className="text-xs text-gray-600 mb-2">
        Ao finalizar o tempo, voltará para a lista de seleção
      </div>

      <div className="w-full bg-gray-200 rounded-full h-3">
        <div
          className={`h-3 rounded-full transition-all duration-500 ${getProgressColor()}`}
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>
      {/* 
      <div className="text-xs mt-1 text-gray-500">
        {Math.round(progressPercentage)}% restante
      </div> */}
    </div>
  );
}
