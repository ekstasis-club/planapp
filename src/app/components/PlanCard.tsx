"use client";

import Link from "next/link";
import { MapPin, Calendar, Clock, Users } from "lucide-react";

type Props = {
  id: string;
  title: string;
  emoji: string;
  time: string;
  date: string;
  place: string | null; 
  attendees?: number;
};

export default function PlanCard({ id, title, emoji, time, date, place, attendees }: Props) {
  const formattedDate = new Date(date).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
  });

  return (
    <Link
      href={`/plan/${id}`}
      className="relative w-full aspect-square md:aspect-auto md:h-56 
                 bg-white rounded-2xl shadow-lg flex flex-col p-4 text-gray-900 
                 hover:scale-[1.02] transition-transform overflow-hidden"
    >
      {/* Fecha y hora */}
      <div className="absolute top-3 left-3 right-3 flex justify-between gap-2">
        <span className="bg-gray-200 text-gray-700 text-[10px] md:text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1 truncate">
          <Calendar size={12} className="text-gray-500" />
          {formattedDate}
        </span>
        <span className="bg-gray-200 text-gray-700 text-[10px] md:text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1 truncate">
          <Clock size={12} className="text-gray-500" />
          {time}
        </span>
      </div>

      {/* Contenido central */}
      <div className="flex flex-col items-center justify-center flex-1 px-2 text-center mt-2">
        <div className="text-3xl md:text-4xl mb-1">{emoji}</div>
        <div
          className="text-sm md:text-base font-bold tracking-tight leading-snug 
                     line-clamp-2 overflow-hidden text-ellipsis break-words"
          title={title}
        >
          {title}
        </div>
      </div>

      {/* Localización */}
      <div className="text-xs text-gray-600 flex flex-col items-center gap-1 mt-1">
        <div className="flex items-center gap-1 truncate max-w-[90%]">
          <MapPin size={12} className="text-gray-400 shrink-0" />
          <span className="truncate">{place}</span>
        </div>
        {attendees !== undefined && (
          <div className="flex items-center gap-1 text-gray-500 text-[10px] md:text-xs">
            <Users size={12} />
            {attendees}
          </div>
        )}
      </div>
    </Link>
  );
}
