"use client";

import Link from "next/link";
import { MapPin } from "lucide-react";

type Props = {
  id: string;
  title: string;
  emoji: string;
  time: string;
  date: string;
  place: string | null; 
};

export default function PlanCard({ id, title, emoji, time, date, place }: Props) {
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
      {/* Fecha y hora en una línea, responsive */}
      <div className="absolute top-3 left-3 right-3 flex justify-between gap-2">
        <span className="bg-gray-200 text-gray-700 text-[10px] md:text-xs px-2 py-0.5 rounded-full font-medium truncate">
          {formattedDate}
        </span>
        <span className="bg-gray-200 text-gray-700 text-[10px] md:text-xs px-2 py-0.5 rounded-full font-medium truncate">
          {time}
        </span>
      </div>

      {/* Contenido central */}
      <div className="flex flex-col items-center justify-center flex-1 px-2 text-center mt-2 md:mt-0">
        <div className="text-3xl md:text-4xl">{emoji}</div>
        <div className="text-sm font-bold mt-3 tracking-wide uppercase drop-shadow-sm line-clamp-2 leading-tight">
          {title}
        </div>
      </div>

      {/* Localización */}
      <div className="text-xs text-gray-600 flex items-center gap-1 truncate max-w-[90%] mb-2">
        <MapPin size={12} className="text-gray-400 shrink-0" />
        <span className="truncate">{place}</span>
      </div>
    </Link>
  );
}

