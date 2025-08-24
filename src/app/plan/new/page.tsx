"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { supabase } from "@/lib/supabaseClient";
import type { Database } from "@/lib/database.types";

const Map = dynamic(() => import("./Map"), { ssr: false });

const EMOJIS = ["🎉","🍻","🎬","🎮","🏖️","🏃‍♂️","🍕","☕","🎵","📸","🛶","🏔️"];

type PlanRow = Database["public"]["Tables"]["plans"]["Row"];
type PlanInsert = Database["public"]["Tables"]["plans"]["Insert"];

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

  const createPlan = async () => {
    if (!title || !time || !date) return alert("Añade título, fecha y hora");

    const [year, month, day] = date.split("-").map(Number);
    const [hours, minutes] = time.split(":").map(Number);
    const dt = new Date(year, month - 1, day, hours, minutes);

    const chatExpiresAt = new Date(dt.getTime() + 12 * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from("plans")
      .insert([
        {
          title,
          emoji: emoji || undefined,
          time_iso: dt.toISOString(),
          place: place || undefined,
          lat,
          lng,
          chat_expires_at: chatExpiresAt || undefined
        }
      ])
      .select();

    if (error) {
      console.error(error);
      return alert("Error creando el plan");
    }

    if (!data || data.length === 0) return alert("Error creando el plan");

    const planId = data[0].id;

    const { error: chatError } = await supabase
      .from("chats")
      .insert([{ plan_id: planId, expires_at: chatExpiresAt }]);

    if (chatError) {
      console.error(chatError);
      alert("Plan creado, pero no se pudo crear el chat");
    }

    window.location.href = `/plan/${planId}`;
  };

  const inputClasses =
    "w-full p-3 rounded-xl bg-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm placeholder:text-gray-500";
  const today = new Date().toISOString().split("T")[0];
  const nowTime = new Date().toTimeString().slice(0, 5);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 py-8">
      <div className="bg-white rounded-3xl shadow-xl p-6 w-full max-w-md flex flex-col gap-4 border border-gray-300">
        <h1 className="text-2xl font-bold text-center text-gray-800">Crear Plan</h1>

        {/* Emoji + título */}
        <div className="flex gap-2 items-center relative">
          <div className="relative">
            <button
              type="button"
              className="w-12 h-12 text-2xl flex items-center justify-center bg-gray-300 text-gray-800 rounded-xl hover:ring-2 hover:ring-purple-500 transition"
              onClick={() => setEmojiOpen(!emojiOpen)}
            >
              {emoji}
            </button>

            {emojiOpen && (
              <div className="absolute top-14 left-0 bg-gray-200 shadow-lg rounded-xl p-2 flex gap-2 overflow-x-auto z-50 max-w-xs">
                {EMOJIS.map((em) => (
                  <button
                    key={em}
                    onClick={() => {
                      setEmoji(em);
                      setEmojiOpen(false);
                    }}
                    className={`text-2xl p-1 rounded-xl hover:scale-125 transition-transform ${emoji === em ? "bg-purple-200" : ""}`}
                  >
                    {em}
                  </button>
                ))}
              </div>
            )}
          </div>

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
            className={inputClasses}
            value={date}
            min={today}
            onChange={(e) => setDate(e.target.value)}
          />
          <input
            type="time"
            className={inputClasses}
            value={time}
            onChange={(e) => setTime(e.target.value)}
            min={date === today ? nowTime : undefined}
          />
        </div>

        {/* Ubicación */}
        <div className="flex flex-col gap-2">
          {lat && lng ? (
            <>
              <p className="text-left text-gray-700 text-sm font-medium">{place}</p>
              <div className="rounded-xl overflow-hidden h-32 border border-gray-300">
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
            <p className="text-left text-gray-700 text-sm">Obteniendo ubicación...</p>
          )}
        </div>

        {/* Instagram */}
        <input
          className={inputClasses}
          placeholder="Tu @instagram (opcional)"
          value={handle}
          onChange={(e) => setHandle(e.target.value)}
        />

        {/* Botones Crear + Cancelar */}
        <div className="flex gap-2">
          <button
            onClick={createPlan}
            className="flex-1 py-3 rounded-2xl font-bold text-white bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-400 hover:opacity-90 transition shadow-lg"
          >
            Crear 🚀
          </button>
          <button
            onClick={() => window.history.back()}
            className="py-3 px-4 rounded-2xl font-semibold text-white bg-gray-500 hover:bg-gray-400 transition text-sm"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
