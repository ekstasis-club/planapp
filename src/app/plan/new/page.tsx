"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { uid, pushJSON } from "../../../lib/storage";
import type { Plan } from "../../../lib/types";

// Carga el mapa solo en cliente
const Map = dynamic(() => import("./Map"), { ssr: false });

export default function NewPlanPage() {
  const [title, setTitle] = useState("");
  const [emoji, setEmoji] = useState("🎉");
  const [time, setTime] = useState("");
  const [handle, setHandle] = useState("");

  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [place, setPlace] = useState<string>("");

  // Obtener ubicación automáticamente
  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(async (pos) => {
      let { latitude, longitude } = pos.coords;

      // Desplazamos ligeramente el pin para privacidad
      latitude += 0.002;
      longitude += 0.002;

      setLat(latitude);
      setLng(longitude);

      try {
        const resp = await fetch(
          `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&apiKey=d59ea046b89d4b76bbfda88186667ca7`
        );
        const geoData = await resp.json();
        const firstFeature = geoData.features?.[0];
        const city =
          firstFeature?.properties?.city ||
          firstFeature?.properties?.town ||
          firstFeature?.properties?.village ||
          "Ubicación aproximada";

        setPlace(city);
      } catch (err) {
        console.error("Error obteniendo ciudad:", err);
        setPlace("Ubicación aproximada");
      }
    });
  }, []);

  const setPreset = (hour: number) => {
    const d = new Date();
    d.setMinutes(0, 0, 0);
    d.setHours(hour);
    setTime(d.toISOString().slice(0, 16));
  };

  const createPlan = () => {
    if (!title || !time) {
      alert("Añade al menos un título y una hora");
      return;
    }

    const id = uid();
    const now = Date.now();

    const plan: Plan = {
      id,
      title,
      emoji,
      timeISO: new Date(time).toISOString(),
      place,
      visibility: "link",
      createdBy: handle || "anónimo",
      createdAt: now,
      expiresAt: now + 1000 * 60 * 60 * 24, // 24h
    };

    pushJSON<Plan>("plans", plan);
    window.location.href = `/plan/${id}`;
  };

  const inputClasses =
    "w-4/5 mx-auto block p-4 rounded-2xl bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 text-base placeholder:text-gray-400";

  return (
    <div className="min-h-screen flex flex-col items-center justify-start py-8 space-y-6">
      <h1 className="text-3xl font-bold text-center">Crear Plan</h1>

      {/* Emoji */}
      <div className="flex items-center gap-3">
        <label htmlFor="emoji" className="text-3xl">Emoji</label>
        <input
          id="emoji"
          className={`${inputClasses} text-center text-2xl`}
          value={emoji}
          onChange={(e) => setEmoji(e.target.value)}
        />
      </div>

      {/* Título */}
      <input
        className={inputClasses}
        placeholder="Título (ej. Cañas en Malasaña)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      {/* Fecha y hora */}
      <div className="space-y-2 w-full flex flex-col items-center">
        <input
          type="datetime-local"
          className={inputClasses}
          value={time}
          onChange={(e) => setTime(e.target.value)}
        />
        <div className="flex gap-3">
          {[20, 22].map((h) => (
            <button
              key={h}
              onClick={() => setPreset(h)}
              className="px-4 py-2 rounded-full bg-gray-200 hover:bg-purple-100 transition"
            >
              Hoy {h}:00
            </button>
          ))}
        </div>
      </div>

      {/* Ubicación y mapa */}
      {lat && lng ? (
        <div className="space-y-2 w-full flex flex-col items-center">
          <p className="text-gray-600">{place}</p>
          <Map lat={lat} lng={lng} place={place} />
        </div>
      ) : (
        <p className="text-gray-400">Obteniendo tu ubicación...</p>
      )}

      {/* Instagram */}
      <input
        className={inputClasses}
        placeholder="Tu @instagram (opcional)"
        value={handle}
        onChange={(e) => setHandle(e.target.value)}
      />

      {/* Botón Crear */}
      <button
        onClick={createPlan}
        className="w-4/5 py-4 rounded-2xl font-bold text-white text-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 transition"
      >
        Crear 🚀
      </button>
    </div>
  );
}
