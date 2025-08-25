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

  const [emojiFilter, setEmojiFilter] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<string | null>(null);

  // Controla qué filtro está abierto
  const [openFilter, setOpenFilter] = useState<"emoji" | "date" | null>(null);
  const isEmojiOpen = openFilter === "emoji";
  const isDateOpen = openFilter === "date";

  const [userCity, setUserCity] = useState<string | null>(null);

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
  const today = new Date().toISOString().split("T")[0];

  // Inicializar filtro de fecha con hoy
  useEffect(() => {
    setDateFilter(today);
  }, []);

  // Cierra filtros si se hace click fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("#emoji-filter") && !target.closest("#date-filter")) {
        setOpenFilter(null);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Filtrado de planes
  const now = new Date();
  const filteredPlans = plans
    .filter((p) => !emojiFilter || p.emoji === emojiFilter)
    .filter((p) => {
      const planDate = new Date(p.time_iso);
      const sixHoursAgo = new Date(now.getTime() - 6 * 60 * 60 * 1000);
      return planDate > now || planDate >= sixHoursAgo;
    });

  // Ordenamiento inteligente
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
        <div className="flex gap-2 py-2 px-2 items-center relative z-50 bg-black/50 backdrop-blur-md rounded-xl">
          {/* Emoji Filter */}
          <div id="emoji-filter" className="relative">
            <button
              onClick={() => setOpenFilter(isEmojiOpen ? null : "emoji")}
              className={`flex-shrink-0 px-3 py-1 text-sm rounded-full font-medium transition bg-white/20 text-white backdrop-blur-md`}
            >
              {emojiFilter ?? "All"} {isEmojiOpen ? "▲" : "▼"}
            </button>

            {isEmojiOpen && (
              <div className="absolute top-full left-0 flex gap-2 mt-2 p-2 bg-black/80 backdrop-blur-md rounded-xl shadow-lg overflow-x-auto whitespace-nowrap z-50 min-w-[300px] sm:min-w-[360px]">
                {allEmojis.map((em) => (
                  <button
                    key={em}
                    onClick={() => {
                      setEmojiFilter(em);
                      setOpenFilter(null);
                    }}
                    className="w-10 h-10 flex items-center justify-center text-xl rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/40 transition-transform hover:scale-110 flex-shrink-0"
                  >
                    {em}
                  </button>
                ))}

                {/* X para cerrar filtro */}
                {emojiFilter && (
                  <button
                    onClick={() => {
                      setEmojiFilter(null);
                      setOpenFilter(null);
                    }}
                    className="ml-2 w-8 h-8 flex items-center justify-center text-white text-xs rounded-full bg-black hover:bg-gray-800 transition flex-shrink-0"
                  >
                    ✕
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Fecha */}
          <div id="date-filter" className="relative w-36 sm:w-40">
            <input
              type="date"
              className="w-full py-2 px-3 text-sm rounded-full bg-white/10 backdrop-blur-md text-white placeholder-gray-300 focus:outline-none"
              value={dateFilter || ""}
              min={today}
              onChange={(e) => setDateFilter(e.target.value || null)}
              onFocus={() => setOpenFilter("date")}
            />
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
