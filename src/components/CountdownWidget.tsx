// src/components/CountdownWidget.tsx
import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";

dayjs.extend(duration);

type CountdownWidgetProps = {
  eventDate: string;
  eventHour: string;
  className?: string;
  style?: React.CSSProperties;
};

const CountdownWidget: React.FC<CountdownWidgetProps> = ({
  eventDate,
  eventHour,
  className = "",
  style = {},
}) => {
  const [timeLeft, setTimeLeft] = useState<string>("");

  const eventDateTime = `${eventDate} ${eventHour}`;

  useEffect(() => {
    const updateCountdown = () => {
      const now = dayjs();
      const event = dayjs(eventDateTime, "DD/MM/YYYY HH:mm");
      const diff = event.diff(now);

      if (diff > 0) {
        const d = dayjs.duration(diff);
        setTimeLeft(
          `${d.days()}d ${d.hours()}h ${d.minutes()}m ${d.seconds()}s`
        );
      } else {
        setTimeLeft("A festa já começou!");
      }
    };

    // Atualizar imediatamente
    updateCountdown();

    // Configurar intervalo
    const interval = setInterval(updateCountdown, 1000);

    // Cleanup
    return () => clearInterval(interval);
  }, [eventDateTime]);

  return (
    <div className={`text-center ${className}`} style={style}>
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg">
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
            d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
          />
        </svg>
        <span className="text-lg font-bold">
          {timeLeft.includes("começou") ? "🎉 " : "⏰ "}
          {timeLeft.includes("começou") ? timeLeft : `Faltam: ${timeLeft}`}
        </span>
      </div>
    </div>
  );
};

export default CountdownWidget;