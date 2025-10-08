// src/components/CountdownWidget.tsx
import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(duration);
dayjs.extend(customParseFormat);

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

  useEffect(() => {
    const updateCountdown = () => {
      const now = dayjs();
      
      // Tentar diferentes formatos de data
      let event;
      const dateFormats = [
        "DD/MM/YYYY HH:mm",  // Formato brasileiro
        "MM/DD/YYYY HH:mm",  // Formato americano
        "YYYY-MM-DD HH:mm",  // Formato ISO
      ];
      
      const eventDateTime = `${eventDate} ${eventHour}`;
      
      // Tentar cada formato até encontrar um válido
      for (const format of dateFormats) {
        event = dayjs(eventDateTime, format);
        if (event.isValid()) {
          break;
        }
      }
      
      // Se nenhum formato funcionou, tentar parsing automático
      if (!event || !event.isValid()) {
        event = dayjs(eventDateTime);
      }
      
      console.log('Data do evento:', event.format('DD/MM/YYYY HH:mm'));
      console.log('Data atual:', now.format('DD/MM/YYYY HH:mm'));
      
      const diff = event.diff(now);
      console.log('Diferença em ms:', diff);

      if (diff > 0) {
        const d = dayjs.duration(diff);
        const days = Math.floor(d.asDays());
        const hours = d.hours();
        const minutes = d.minutes();
        const seconds = d.seconds();
        
        setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
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
  }, [eventDate, eventHour]);

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