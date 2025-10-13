// src/components/CountdownWidget.tsx
import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { useTheme } from "../hooks/useTheme";

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
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isFinished: false,
  });
  const { theme } = useTheme();

  useEffect(() => {
    const updateCountdown = () => {
      const now = dayjs();

      // Tentar diferentes formatos de data
      let event;
      const dateFormats = [
        "DD/MM/YYYY HH:mm", // Formato brasileiro
        "MM/DD/YYYY HH:mm", // Formato americano
        "YYYY-MM-DD HH:mm", // Formato ISO
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

      const diff = event.diff(now);

      if (diff > 0) {
        const d = dayjs.duration(diff);
        const days = Math.floor(d.asDays());
        const hours = d.hours();
        const minutes = d.minutes();
        const seconds = d.seconds();

        setTimeLeft({
          days,
          hours,
          minutes,
          seconds,
          isFinished: false,
        });
      } else {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isFinished: true,
        });
      }
    };

    // Atualizar imediatamente
    updateCountdown();

    // Configurar intervalo
    const interval = setInterval(updateCountdown, 1000);

    // Cleanup
    return () => clearInterval(interval);
  }, [eventDate, eventHour]);

  if (timeLeft.isFinished) {
    return (
      <div
        className={`flex flex-col items-center w-full  ${className}`}
        style={style}
      >
        {/* Título quando festa já começou */}
        <h3
          className="text-lg sm:text-xl font-semibold mb-2 sm:mb-4 shadow-md p-4 rounded-lg"
          style={{ color: theme?.navBarColor || "#000" }}
        >
          🎉 A festa já começou!
        </h3>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col items-center w-full ${className}`}
      style={style}
    >
      {/* Título "Faltam:" */}
      <h3
        className="text-lg sm:text-xl font-semibold mb-2 sm:mb-4"
        style={{ color: theme?.navBarColor || "#000" }}
      >
        Faltam:
      </h3>

      {/* Contador */}
      <div className="grid grid-flow-col gap-3 sm:gap-5 text-center auto-cols-max">
        <div className="flex flex-col">
          <span className="countdown font-mono text-3xl sm:text-5xl">
            <span
              style={{ "--value": timeLeft.days } as React.CSSProperties}
              aria-live="polite"
              aria-label={`${timeLeft.days} days`}
            >
              {timeLeft.days}
            </span>
          </span>
          <span className="text-xs sm:text-sm">dias</span>
        </div>
        <div className="flex flex-col">
          <span className="countdown font-mono text-3xl sm:text-5xl">
            <span
              style={{ "--value": timeLeft.hours } as React.CSSProperties}
              aria-live="polite"
              aria-label={`${timeLeft.hours} hours`}
            >
              {timeLeft.hours}
            </span>
          </span>
          <span className="text-xs sm:text-sm">horas</span>
        </div>
        <div className="flex flex-col">
          <span className="countdown font-mono text-3xl sm:text-5xl">
            <span
              style={{ "--value": timeLeft.minutes } as React.CSSProperties}
              aria-live="polite"
              aria-label={`${timeLeft.minutes} minutes`}
            >
              {timeLeft.minutes}
            </span>
          </span>
          <span className="text-xs sm:text-sm">min</span>
        </div>
        <div className="flex flex-col">
          <span className="countdown font-mono text-3xl sm:text-5xl">
            <span
              style={{ "--value": timeLeft.seconds } as React.CSSProperties}
              aria-live="polite"
              aria-label={`${timeLeft.seconds} seconds`}
            >
              {timeLeft.seconds}
            </span>
          </span>
          <span className="text-xs sm:text-sm">seg</span>
        </div>
      </div>
    </div>
  );
};

export default CountdownWidget;
