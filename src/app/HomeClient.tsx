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
  lat?: number;
  lng?: number;
  city?: string;
  date: string;
  time: string;
  distance?: number;
};

export default function HomeClient() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [denied, setDenied] = useState(false);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [emojiFilter, setEmojiFilter] = useState<string | null>(null);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [dateFilter, setDateFilter] = useState<string | null>(null);
  const [dateOpen, setDateOpen] = useState(false);

  const [userCity, setUserCity] = useState<string | null>(null);

  // Obtener ubicación del usuario
  const requestLocation = () => {
    if (!navigator.geolocation) {
      setDenied(true);
      setLoading(false);
      return;
    }

    setLoading(true);
    setDenied(false);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setCoords({ lat, lng });

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
          );
          const data = await res.json();
          setUserCity(data.address.city || data.address.town || data.address.village || null);
        } catch {
          setUserCity(null);
        }

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

  // Traer planes de Supabase
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

          let distance = undefined;
          if (coords && p.lat && p.lng) {
            const R = 6371;
            const dLat = ((p.lat - coords.lat) * Math.PI) / 180;
            const dLng = ((p.lng - coords.lng) * Math.PI) / 180;
            const a =
              Math.sin(dLat / 2) ** 2 +
              Math.cos((coords.lat * Math.PI) / 180) *
                Math.cos((p.lat * Math.PI) / 180) *
                Math.sin(dLng / 2) ** 2;
            distance = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          }

          return {
            id: p.id,
            title: p.title,
            emoji: p.emoji,
            time_iso: p.time_iso,
            place: p.place ?? "",
            lat: p.lat ?? undefined,
            lng: p.lng ?? undefined,
            city: p.city ?? null,
            date: d.toISOString().split("T")[0],
            time: d.toTimeString().slice(0, 5),
            distance,
          };
        });

        setPlans(formatted);
      }
    };

    fetchPlans();
  }, [coords]);

  const allEmojis = Array.from(new Set(plans.map((p) => p.emoji)));
  const allDates = Array.from(new Set(plans.map((p) => p.date))).sort();

  // Filtrado de planes
  const filteredPlans = plans
    .filter((p) => !emojiFilter || p.emoji === emojiFilter)
    .filter((p) => !dateFilter || p.date === dateFilter);

  // Ordenamiento inteligente
  const today = new Date().toISOString().split("T")[0];
  const sortedPlans = filteredPlans.sort((a, b) => {
    const isTodayA = a.date === today;
    const isTodayB = b.date === today;
    const isSameCityA = userCity && a.city === userCity;
    const isSameCityB = userCity && b.city === userCity;

    if (isTodayA && isSameCityA && (!isTodayB || !isSameCityB)) return -1;
    if (isTodayB && isSameCityB && (!isTodayA || !isSameCityA)) return 1;

    if (isTodayA && isTodayB && isSameCityA && isSameCityB) {
      return (a.distance ?? Infinity) - (b.distance ?? Infinity);
    }

    if (isSameCityA && !isSameCityB) return -1;
    if (isSameCityB && !isSameCityA) return 1;
    if (isSameCityA && isSameCityB) {
      return new Date(a.time_iso).getTime() - new Date(b.time_iso).getTime();
    }

    const dateDiff = new Date(a.time_iso).getTime() - new Date(b.time_iso).getTime();
    if (dateDiff !== 0) return dateDiff;

    return (a.distance ?? Infinity) - (b.distance ?? Infinity);
  });

  return (
    <div className="min-h-screen bg-black pb-24">
      <main className="p-4 space-y-4 pt-12">
{/* --- Filtros Emoji + Fecha --- */}
<div className="flex gap-2 py-2 px-1 items-center relative z-50">

  {/* Emoji */}
  {/* Emoji */}
<div className="relative">
  <button
    onClick={() => setEmojiOpen((prev) => !prev)}
    className={`flex-shrink-0 px-3 py-1 text-sm rounded-full font-medium transition ${
      !emojiFilter ? "bg-zinc-700 text-white" : "bg-black text-white"
    }`}
  >
    {emojiFilter ?? "All"} {emojiOpen ? "▲" : "▼"}
  </button>

  {/* Desplegable de emojis */}
  {emojiOpen && (
    <div className="absolute top-full left-0 flex gap-1 mt-2 p-2 bg-zinc-900 rounded-xl shadow-lg z-50 whitespace-nowrap">
      {allEmojis
        .filter((em) => em !== emojiFilter) // ⬅️ Oculta el seleccionado
        .map((em) => (
          <button
            key={em}
            onClick={() => {
              setEmojiFilter(em);
              setEmojiOpen(false);
            }}
            className="px-2 py-1 text-sm rounded-full bg-white text-black hover:bg-black hover:text-white transition"
          >
            {em}
          </button>
        ))}

{emojiFilter && (
  <button
    onClick={() => {
      setEmojiFilter(null);
      setEmojiOpen(false);
    }}
    className="px-2 py-1 text-sm rounded-full bg-gray-400 text-black hover:bg-black hover:text-white transition"
  >
    ✕
  </button>
)}
    </div>
  )}
</div>


{/* Fecha */}
<div className="relative flex items-center w-36 sm:w-40">
  {/* Icono de calendario */}
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-5 h-5 text-white absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <rect x={3} y={4} width={18} height={18} rx={2} ry={2} />
    <line x1={16} y1={2} x2={16} y2={6} />
    <line x1={8} y1={2} x2={8} y2={6} />
    <line x1={3} y1={10} x2={21} y2={10} />
  </svg>

  {/* Input tipo text/date */}
  <input
    type="text"
    value={
      dateFilter
        ? (() => {
            const d = new Date(dateFilter);
            const day = String(d.getDate()).padStart(2, "0");
            const month = String(d.getMonth() + 1).padStart(2, "0");
            const year = d.getFullYear();
            return `${day}-${month}-${year}`;
          })()
        : ""
    }
    placeholder="Fecha"
    onFocus={(e) => (e.target.type = "date")}
    onBlur={(e) => (e.target.type = "text")}
    onChange={(e) => setDateFilter(e.target.value || null)}
    className="pl-10 pr-8 py-2 text-sm rounded-full bg-zinc-700 text-white placeholder-gray-400 focus:outline-none w-full"
  />

  {/* Botón de reset */}
  {dateFilter && (
    <button
      onClick={() => setDateFilter(null)}
      className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-xs rounded-full bg-white text-black hover:bg-black hover:text-white transition"
    >
      ✕
    </button>
  )}
</div>

</div>



        {/* Loading */}
        {loading && !coords && !denied && (
          <div className="flex items-center justify-center p-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
          </div>
        )}

        {/* Ubicación denegada */}
        {denied && !loading && (
          <div className="bg-zinc-900 border border-red-500 rounded-xl p-4 shadow-md mb-6 text-center flex flex-col items-center">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-500/20 mb-2">
              <span className="text-red-400 text-xl">⚠️</span>
            </div>
            <h2 className="text-sm font-semibold text-white">
              No pudimos acceder a tu ubicación
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Te mostramos algunos{" "}
              <span className="font-medium text-red-400">planes populares</span>{" "}
              cerca de ti.
            </p>
          </div>
        )}

        {/* Planes */}
        {(coords || denied) && !loading && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {sortedPlans.length > 0 ? (
              sortedPlans.map((plan) => (
                <div key={plan.id} className="w-full h-full">
                  <PlanCard {...plan} />
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-center col-span-full mt-4">
                No hay planes 😕
              </p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
