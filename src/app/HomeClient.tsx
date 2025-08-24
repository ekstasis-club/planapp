"use client";

import { useEffect, useState } from "react";
import PlanCard from "./components/PlanCard";
import Link from "next/link";

type Plan = {
  id: string;
  title: string;
  emoji: string;
  time: string;
  date: string;
  place: string;
};

const demoPlans: Plan[] = [
  { id: "1", title: "Pizza tonight", emoji: "🍕", time: "20:00", date: "2025-08-24", place: "Madrid, España" },
  { id: "2", title: "Partido en el parque", emoji: "⚽", time: "18:00", date: "2025-08-25", place: "Parque Retiro" },
  { id: "3", title: "Café con amigos", emoji: "☕", time: "16:00", date: "2025-08-26", place: "Gran Vía" },
  { id: "4", title: "Paseo al aire libre", emoji: "🌳", time: "19:00", date: "2025-08-27", place: "Casa de Campo" },
  { id: "5", title: "Clases de yoga", emoji: "🧘‍♂️", time: "08:00", date: "2025-08-28", place: "Salón de Yoga Central" },
  { id: "6", title: "Concierto local", emoji: "🎸", time: "21:00", date: "2025-08-29", place: "Sala Riviera" },
];

const allEmojis = Array.from(new Set(demoPlans.map((p) => p.emoji)));

export default function HomeClient() {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [denied, setDenied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [emojiFilter, setEmojiFilter] = useState<string | null>(null);

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setDenied(true);
      setLoading(false);
      return;
    }

    setLoading(true);
    setDenied(false);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLoading(false);
      },
      () => {
        setDenied(true);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 30000 }
    );
  };

  useEffect(() => {
    requestLocation();
  }, []);

  const filteredPlans = emojiFilter
    ? demoPlans.filter((p) => p.emoji === emojiFilter)
    : demoPlans;

  return (
    <div className="min-h-screen bg-black pb-24">
      {/* Header */}
      <header className="flex items-center justify-between px-5 py-4 bg-black border-b border-zinc-800 sticky top-0 z-10">
  <div className="flex flex-col md:flex-row items-start md:items-center gap-1 md:gap-2">
    {/* Logo / título grande */}
    <h1 className="text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-400">
      PLANAPP
    </h1>
  </div>
</header>


      <main className="p-4 space-y-4">
        {/* Filtro de emojis en línea estilo Instagram */}
        <div className="flex gap-2 overflow-x-auto py-2 px-1">
  <button
    onClick={() => setEmojiFilter(null)}
    className={`flex-shrink-0 px-3 py-1 rounded-xl font-medium shadow-md transition transform hover:scale-110 ${
      emojiFilter === null
        ? "bg-purple-500 text-white"
        : "bg-zinc-800 text-gray-300 hover:bg-zinc-700"
    }`}
  >
    Todos
  </button>

  {allEmojis.map((em) => (
    <button
      key={em}
      onClick={() => setEmojiFilter(em)}
      className={`flex-shrink-0 px-3 py-1 rounded-xl font-medium shadow-md transition transform hover:scale-125 ${
        emojiFilter === em
          ? "bg-purple-500 text-white"
          : "bg-zinc-800 text-gray-300 hover:bg-zinc-700"
      }`}
    >
      {em}
    </button>
  ))}
</div>


        {/* Estado: cargando ubicación */}
        {loading && !coords && !denied && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-md mb-6 text-center animate-pulse">
            <div className="text-lg font-medium text-gray-100">📍 Pidiendo tu ubicación…</div>
            <p className="text-sm text-gray-400 mt-1">Para mostrarte planes cercanos a ti</p>
          </div>
        )}

        {/* Estado: ubicación denegada */}
        {denied && !loading && (
          <div className="bg-zinc-900 border border-red-500 rounded-2xl p-6 shadow-md mb-6 text-center flex flex-col items-center">
            <div className="w-10 h-10 flex items-center justify-center rounded-full bg-red-500/20 text-red-400 mb-3">
              ⚠️
            </div>
            <h2 className="text-base font-semibold text-white">No pudimos acceder a tu ubicación</h2>
            <p className="text-sm text-gray-400 mt-1">
              Te mostramos algunos <span className="font-medium text-red-400">planes populares</span> cerca de ti.
            </p>
            <button
              onClick={requestLocation}
              className="mt-4 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-medium rounded-lg shadow hover:opacity-90 transition"
            >
              Volver a compartir ubicación
            </button>
          </div>
        )}

        {/* Grid de planes */}
        {(coords || denied) && !loading && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {filteredPlans.length > 0 ? (
              filteredPlans.map((plan) => (
                <div key={plan.id} className="w-full h-full">
                  <PlanCard {...plan} />
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-center col-span-full mt-4">No hay planes para este emoji 😕</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
