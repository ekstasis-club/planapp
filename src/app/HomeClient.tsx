"use client";

import { useEffect, useState } from "react";
import PlanCard from "./components/PlanCard";
import { supabase } from "@/lib/supabaseClient";

type Plan = {
  id: string;
  title: string;
  emoji: string;
  time_iso: string;
  place: string | null;
  date: string; // generado a partir de time_iso
  time: string; // generado a partir de time_iso
};

export default function HomeClient() {
  const [plans, setPlans] = useState<Plan[]>([]);
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

  // Traer los planes de Supabase
  useEffect(() => {
    const fetchPlans = async () => {
      const { data, error } = await supabase
        .from("plans")
        .select("*")
        .order("time_iso", { ascending: true });

      if (error) {
        console.error("Error fetching plans:", error);
        return;
      }

      if (data) {
        const formatted: Plan[] = data.map((p) => {
          const d = new Date(p.time_iso);
          return {
            id: p.id,
            title: p.title,
            emoji: p.emoji,
            time_iso: p.time_iso,
            place: p.place ?? "",  // <-- aquí
            date: d.toISOString().split("T")[0],
            time: d.toTimeString().slice(0, 5),
          };
        });        
        setPlans(formatted);
      }
    };

    fetchPlans();
  }, []);

  const allEmojis = Array.from(new Set(plans.map((p) => p.emoji)));

  const filteredPlans = emojiFilter
    ? plans.filter((p) => p.emoji === emojiFilter)
    : plans;

  return (
    <div className="min-h-screen bg-black pb-24">
      
      <main className="p-4 space-y-4">
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

        {loading && !coords && !denied && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-md mb-6 text-center animate-pulse">
            <div className="text-lg font-medium text-gray-100">📍 Pidiendo tu ubicación…</div>
            <p className="text-sm text-gray-400 mt-1">Para mostrarte planes cercanos a ti</p>
          </div>
        )}

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

        {(coords || denied) && !loading && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {filteredPlans.length > 0 ? (
              filteredPlans.map((plan) => (
                <div key={plan.id} className="w-full h-full">
                  <PlanCard {...plan} />
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-center col-span-full mt-4">No hay planes 😕</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

