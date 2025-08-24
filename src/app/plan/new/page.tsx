"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { uid, pushJSON } from "../../../lib/storage";
import type { Plan } from "../../../lib/types";

const Map = dynamic(() => import("./Map"), { ssr: false });

const EMOJIS = ["🎉","🍻","🎬","🎮","🏖️","🏃‍♂️","🍕","☕","🎵","📸","🛶","🏔️"];

export default function NewPlanPage() {
  const [title, setTitle] = useState("");
  const [emoji, setEmoji] = useState("🎉");
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [handle, setHandle] = useState("");
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [place, setPlace] = useState<string>("");

  useEffect(() => {
    const now = new Date();
    setDate(now.toISOString().split("T")[0]);
    now.setMinutes(0, 0, 0);
    now.setHours(now.getHours() + 1);
    const hh = now.getHours().toString().padStart(2, "0");
    const mm = now.getMinutes().toString().padStart(2, "0");
    setTime(`${hh}:${mm}`);
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(async (pos) => {
      let { latitude, longitude } = pos.coords;
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
      } catch {
        setPlace("Ubicación aproximada");
      }
    });
  }, []);

  const createPlan = () => {
    if (!title || !time || !date) return alert("Añade título, fecha y hora");
    const [year, month, day] = date.split("-").map(Number);
    const [hours, minutes] = time.split(":").map(Number);
    const dt = new Date(year, month - 1, day, hours, minutes);
    const id = uid();
    const now = Date.now();

    const plan: Plan = {
      id,
      title,
      emoji,
      timeISO: dt.toISOString(),
      place,
      visibility: "link",
      createdBy: handle || "anónimo",
      createdAt: now,
      expiresAt: now + 1000 * 60 * 60 * 24,
    };

    pushJSON<Plan>("plans", plan);
    window.location.href = `/plan/${id}`;
  };

  const inputClasses =
    "w-full p-3 rounded-xl bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm placeholder:text-gray-400";
  const today = new Date().toISOString().split("T")[0];
  const nowTime = new Date().toTimeString().slice(0, 5);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="bg-gray-900 rounded-3xl shadow-xl p-6 w-full max-w-md flex flex-col gap-4 border border-gray-800">
        <h1 className="text-2xl font-bold text-center text-white">Crear Plan</h1>

        {/* Emoji + título */}
        <div className="flex gap-2 items-center relative">
          {/* Selector de emojis */}
          <div className="relative">
            <button
              type="button"
              className="w-12 h-12 text-2xl flex items-center justify-center bg-gray-800 text-white rounded-xl hover:ring-2 hover:ring-purple-500 transition"
              onClick={() => setEmojiOpen(!emojiOpen)}
            >
              {emoji}
            </button>

            {emojiOpen && (
              <div className="absolute top-14 left-0 bg-gray-800 shadow-lg rounded-xl p-2 flex gap-2 overflow-x-auto z-50 max-w-xs">
                {EMOJIS.map((em) => (
                  <button
                    key={em}
                    onClick={() => {
                      setEmoji(em);
                      setEmojiOpen(false);
                    }}
                    className={`text-2xl p-1 rounded-xl hover:scale-125 transition-transform ${emoji === em ? "bg-purple-700" : ""}`}
                  >
                    {em}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Input del título */}
          <input
            className={inputClasses}
            placeholder="Título (ej. Cañas en Malasaña)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* Fecha + hora */}
        <div className="flex gap-2">
          <input
            type="date"
            className="flex-2 p-3 rounded-xl bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm placeholder:text-gray-400"
            value={date}
            min={today}
            onChange={(e) => setDate(e.target.value)}
          />
          <input
            type="time"
            className="flex-1 p-3 rounded-xl bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm placeholder:text-gray-400"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            min={date === today ? nowTime : undefined}
          />
        </div>

        {/* Ubicación */}
        <div className="text-center text-gray-400 text-sm">
          {lat && lng ? (
            <>
              <p>{place}</p>
              <div className="rounded-xl overflow-hidden h-32 border border-gray-700">
                <Map
                  lat={lat}
                  lng={lng}
                  place={place}
                  setLat={setLat}
                  setLng={setLng}
                  setPlace={setPlace}
                />
              </div>
            </>
          ) : (
            <p>Obteniendo ubicación...</p>
          )}
        </div>

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
          className="w-full py-3 rounded-2xl font-bold text-white bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-400 hover:opacity-90 transition shadow-lg"
        >
          Crear 🚀
        </button>
      </div>
    </div>
  );
}
