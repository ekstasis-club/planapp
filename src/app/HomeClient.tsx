"use client";

import { useEffect, useState } from "react";
import PlanCard from "./components/PlanCard";

type Plan = {
  id: string;
  title: string;
  emoji: string;
  time: string;
};

const demoPlans: Plan[] = [
  { id: "1", title: "Pizza tonight", emoji: "🍕", time: "20:00" },
  { id: "2", title: "Partido en el parque", emoji: "⚽", time: "18:00" },
  { id: "3", title: "Café con amigos", emoji: "☕", time: "16:00" },
  { id: "4", title: "Paseo al aire libre", emoji: "🌳", time: "19:00" },
  { id: "5", title: "Clases de yoga", emoji: "🧘‍♂️", time: "08:00" },
  { id: "6", title: "Concierto local", emoji: "🎸", time: "21:00" },
];

export default function HomeClient() {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    if (!navigator.geolocation) return setDenied(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setDenied(true),
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 30000 }
    );
  }, []);

  return (
    <div className="p-4 pb-24 space-y-4">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Planes cerca de ti</h1>
        <a href="/plan/new" className="text-purple-600 font-bold">Crear</a>
      </header>

      {!coords && !denied && (
        <div className="bg-white border border-gray-100 rounded-xl p-4 text-sm">
          Pidiendo tu ubicación… <span className="text-gray-500">(para mostrarte planes cercanos)</span>
        </div>
      )}

      {denied && (
        <div className="bg-white border border-gray-100 rounded-xl p-4 text-sm">
          No pudimos acceder a tu ubicación.<br />
          Te mostramos planes populares cerca de ti:
        </div>
      )}

      {(coords || denied) && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {demoPlans.map((plan) => (
            <PlanCard key={plan.id} {...plan} />
          ))}
        </div>
      )}

      {/* Botón flotante */}
      <a
        href="/plan/new"
        className="fixed bottom-5 right-5 bg-purple-600 text-white rounded-full w-14 h-14 flex items-center justify-center text-3xl shadow-lg"
        aria-label="Crear plan"
      >
        +
      </a>
    </div>
  );
}
