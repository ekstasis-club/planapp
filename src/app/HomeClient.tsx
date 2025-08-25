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
  const [userCity, setUserCity] = useState<string | null>(null);
  const [denied, setDenied] = useState(false);
  const [loading, setLoading] = useState(true);

  const [emojiFilter, setEmojiFilter] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<string | null>(null);
  const [invalidDate, setInvalidDate] = useState(false);
  const [openFilter, setOpenFilter] = useState<"emoji" | "date" | null>(null);

  const isEmojiOpen = openFilter === "emoji";
  const today = new Date().toISOString().split("T")[0];

  // Recuperar estado guardado
  useEffect(() => {
    const saved = sessionStorage.getItem("homeState");
    if (saved) {
      const { emojiFilter, dateFilter, coords } = JSON.parse(saved);
      setEmojiFilter(emojiFilter);
      setDateFilter(dateFilter);
      setCoords(coords);
    } else {
      setDateFilter(today);
    }
  }, []);

  // Guardar estado en sessionStorage
  useEffect(() => {
    sessionStorage.setItem(
      "homeState",
      JSON.stringify({ emojiFilter, dateFilter, coords })
    );
  }, [emojiFilter, dateFilter, coords]);

  // Solicitar geolocalización
  useEffect(() => {
    if (!coords) {
      if (!navigator.geolocation) {
        setDenied(true);
        setLoading(false);
        return;
      }

      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setDenied(false);
          setLoading(false);
        },
        () => {
          setDenied(true);
          setLoading(false);
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 30000 }
      );
    }
  }, [coords]);

  // Obtener userCity desde coords
  useEffect(() => {
    if (!coords || userCity) return;

    fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${coords.lat}&lon=${coords.lng}&format=json`
    )
      .then((res) => res.json())
      .then((data) => {
        const city = data.address.city || data.address.town || data.address.village || null;
        setUserCity(city);
      })
      .catch(() => setUserCity(null));
  }, [coords, userCity]);

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

      if (!data) return;

      // Formatear fechas y calcular distancia si coords existen
      const formatted: Plan[] = data.map((p) => {
        const d = new Date(p.time_iso);
        let distance: number | undefined = undefined;
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
    };

    fetchPlans();
  }, [coords]);

  const allEmojis = Array.from(new Set(plans.map((p) => p.emoji)));

  // Cierra filtros al hacer click fuera
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

  const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);

  // Filtrar y ordenar
  const displayedPlans = plans
    .filter((p) => !emojiFilter || p.emoji === emojiFilter)
    .filter((p) => {
      const planDate = new Date(p.time_iso);
      if (!dateFilter) return planDate >= sixHoursAgo;

      const selectedDate = new Date(dateFilter);
      if (selectedDate < new Date(today)) {
        if (!invalidDate) setInvalidDate(true);
        return planDate >= sixHoursAgo;
      }
      if (invalidDate) setInvalidDate(false);
      if (selectedDate.toISOString().split("T")[0] === today) return planDate >= sixHoursAgo;
      return planDate >= selectedDate;
    })
    .sort((a, b) => {
      const dateA = new Date(a.time_iso);
      const dateB = new Date(b.time_iso);

      const dayA = dateA.toISOString().split("T")[0];
      const dayB = dateB.toISOString().split("T")[0];

      const isSameCityA = userCity && a.city === userCity;
      const isSameCityB = userCity && b.city === userCity;

      if (dayA !== dayB) return dateA.getTime() - dateB.getTime();
      if (isSameCityA && !isSameCityB) return -1;
      if (isSameCityB && !isSameCityA) return 1;

      if (isSameCityA && isSameCityB) {
        if ((a.distance ?? Infinity) !== (b.distance ?? Infinity))
          return (a.distance ?? Infinity) - (b.distance ?? Infinity);
        return dateA.getTime() - dateB.getTime();
      }

      if ((a.distance ?? Infinity) !== (b.distance ?? Infinity))
        return (a.distance ?? Infinity) - (b.distance ?? Infinity);

      return dateA.getTime() - dateB.getTime();
    });

  return (
    <div className="min-h-screen bg-black pb-24">
      <main className="p-4 space-y-4 pt-12">
        {/* Filtros Emoji + Fecha */}
        <div className="flex gap-2 py-2 px-2 items-center relative z-50 bg-black/50 backdrop-blur-md rounded-xl">
          {/* Emoji Filter */}
          <div id="emoji-filter" className="relative">
            <button
              onClick={() => setOpenFilter(isEmojiOpen ? null : "emoji")}
              className="flex-shrink-0 px-3 py-1 text-sm rounded-full font-medium transition bg-white/20 text-white backdrop-blur-md"
            >
              {emojiFilter ?? "All"} {isEmojiOpen ? "▲" : "▼"}
            </button>
            {isEmojiOpen && (
              <div className="absolute top-full left-0 mt-2 p-2 bg-black/80 backdrop-blur-md rounded-xl shadow-lg overflow-y-auto overflow-x-hidden z-50 min-w-[300px] sm:min-w-[360px] max-h-40">
                <div className="flex flex-wrap gap-2">
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

        {/* Mensaje fecha inválida */}
        {invalidDate && (
          <div className="bg-yellow-500/10 border border-yellow-500 rounded-xl p-3 text-center text-yellow-400 text-sm">
            Fecha inválida. Te mostramos planes populares
          </div>
        )}

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
            {displayedPlans.length > 0 ? (
              displayedPlans.map((plan) => (
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
