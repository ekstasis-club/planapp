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

export default function HomeClient() {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [denied, setDenied] = useState(false);
  const [loading, setLoading] = useState(true);

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setDenied(true);
      setLoading(false);
      return;
    }

    setLoading(true); // ⬅️ volvemos a mostrar "pidiendo ubicación"
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

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <header className="flex items-center justify-between px-5 py-4 bg-white shadow-sm sticky top-0 z-10">
        <h1 className="text-xl font-bold">Planes cerca de ti</h1>
        <Link href="/plan/new" className="text-purple-600 font-bold">
          Crear
        </Link>
      </header>

      <main className="p-4">
        {/* Estado: cargando ubicación */}
        {loading && !coords && !denied && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-6 shadow-md mb-6 text-center animate-pulse">
            <div className="text-lg font-medium text-gray-700">📍 Pidiendo tu ubicación…</div>
            <p className="text-sm text-gray-500 mt-1">Para mostrarte planes cercanos a ti</p>
          </div>
        )}

        {/* Estado: ubicación denegada */}
        {denied && !loading && (
          <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-100 rounded-2xl p-6 shadow-md mb-6 text-center flex flex-col items-center">
            <div className="w-10 h-10 flex items-center justify-center rounded-full bg-red-100 text-red-600 mb-3">
              ⚠️
            </div>
            <h2 className="text-base font-semibold text-gray-800">No pudimos acceder a tu ubicación</h2>
            <p className="text-sm text-gray-500 mt-1">
              Te mostramos algunos <span className="font-medium text-red-600">planes populares</span> cerca de ti.
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
            {demoPlans.map((plan) => (
              <div key={plan.id} className="w-full h-full">
                <PlanCard {...plan} />
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Botón flotante */}
      <Link
        href="/plan/new"
        className="fixed bottom-5 right-5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full w-14 h-14 flex items-center justify-center text-3xl shadow-lg"
        aria-label="Crear plan"
      >
        +
      </Link>
    </div>
  );
}
