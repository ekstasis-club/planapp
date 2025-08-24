"use client";

import Link from "next/link";
import { MapPin } from "lucide-react";

type Props = {
  id: string;
  title: string;
  emoji: string;
  time: string;   // hora (ej: "20:00")
  date: string;   // fecha (ej: "2025-08-25")
  place: string  | null; 
};

export default function PlanCard({ id, title, emoji, time, date, place }: Props) {
  // Formatear fecha a dd/mm
  const formattedDate = new Date(date).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
  });

  return (
    <Link
      href={`/plan/${id}`}
      className="relative w-full aspect-square md:aspect-auto md:h-48 
                 bg-white rounded-2xl shadow-lg flex flex-col items-center 
                 justify-between text-gray-900 hover:scale-[1.02] 
                 transition-transform overflow-hidden p-5"
    >
      {/* Fecha y hora en extremos superiores */}
      <div className="absolute top-3 left-4 text-xs font-medium text-gray-500">
        {formattedDate}
      </div>
      <div className="absolute top-3 right-4 text-xs font-medium text-gray-500">
        {time}
      </div>

      {/* Contenido central */}
      <div className="flex flex-col items-center justify-center flex-1 px-2 text-center">
        <div className="text-3xl md:text-4xl">{emoji}</div>
        <div className="text-sm font-bold mt-3 tracking-wide uppercase drop-shadow-sm line-clamp-2 leading-tight">
          {title}
        </div>
      </div>

      {/* Localización al fondo */}
      <div className="text-xs text-gray-600 flex items-center gap-1 truncate max-w-[90%] mb-2">
        <MapPin size={12} className="text-gray-400 shrink-0" />
        <span className="truncate">{place}</span>
      </div>
    </Link>
  );
}
