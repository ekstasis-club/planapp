"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { supabase } from "@/lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";

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
  const [creating, setCreating] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const [open, setOpen] = useState(true);

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

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    value = value.replace(
      /([\u2700-\u27BF]|[\uE000-\uF8FF]|[\uD83C-\uDBFF\uDC00-\uDFFF])/g,
      ""
    );
    if (value.length > 50) value = value.slice(0, 50);
    setTitle(value);
  };

  const createPlan = async () => {
    if (!title || !time || !date) return alert("Añade título, fecha y hora");
    if (creating) return;

    const [year, month, day] = date.split("-").map(Number);
    const [hours, minutes] = time.split(":").map(Number);
    const dt = new Date(year, month - 1, day, hours, minutes);

    const now = new Date();
    if (dt < now) {
      alert("No se puede crear un evento con fecha u hora anterior a la actual.");
      return;
    }

    setCreating(true);

    const chatExpiresAt = new Date(dt.getTime() + 12 * 60 * 60 * 1000).toISOString();

    try {
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

      if (error || !data || data.length === 0) {
        console.error(error);
        alert("Error creando el plan");
        return;
      }

      const planId = data[0].id;

      const { error: chatError } = await supabase
        .from("chats")
        .insert([{ plan_id: planId, expires_at: chatExpiresAt }]);

      if (chatError) console.error(chatError);

      const homeState = sessionStorage.getItem("homeState");
      if (homeState) sessionStorage.setItem("homeState", homeState);

      sessionStorage.setItem("justCreatedPlan", "true");
      window.location.href = `/plan/${planId}`;
    } finally {
      setCreating(false);
    }
  };

  const handleCancel = () => {
    if (canceling) return;
    setCanceling(true);

    const homeState = sessionStorage.getItem("homeState");
    if (homeState) sessionStorage.setItem("homeState", homeState);

    setOpen(false);
    setTimeout(() => window.history.back(), 300);
  };

  const inputClasses =
    "w-full p-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/50 text-[16px] focus:outline-none focus:ring-2 focus:ring-white shadow-md transition";

  const today = new Date().toISOString().split("T")[0];
  const nowTime = new Date().toTimeString().slice(0, 5);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end justify-center p-4 pb-[calc(80px+env(safe-area-inset-bottom))] z-[9999]">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            onDragEnd={(event, info) => {
              if (info.offset.y > 120) handleCancel();
            }}
            className="w-full max-w-md bg-white/10 backdrop-blur-md text-white border border-white/20 shadow-2xl rounded-3xl overflow-hidden"
          >
            {/* Wrapper interno con scroll para respetar el borde redondeado */}
            <div className="p-6 flex flex-col gap-6 max-h-[calc(90vh-80px)] overflow-y-auto">
              <div className="w-12 h-1.5 bg-white/30 rounded-full mx-auto mb-2" />

              <h1 className="text-3xl font-bold text-center text-white">Crear Plan</h1>

              {/* Emoji + título */}
              <div className="flex gap-3 items-center relative">
                <div id="emoji-selector" className="relative">
                  <button
                    type="button"
                    onClick={() => setEmojiOpen(!emojiOpen)}
                    className="flex items-center justify-center w-12 h-12 text-2xl rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition"
                  >
                    {emoji}
                  </button>

                  {emojiOpen && (
                    <div className="absolute top-14 left-0 flex flex-nowrap gap-2 p-2 bg-black/80 backdrop-blur-md rounded-xl shadow-lg min-w-[300px] sm:min-w-[360px] max-w-full overflow-x-auto z-50">
                      {EMOJIS.map((em) => (
                        <button
                          key={em}
                          onClick={() => {
                            setEmoji(em);
                            setEmojiOpen(false);
                          }}
                          className="w-10 h-10 flex items-center justify-center text-xl rounded-full bg-white/20 hover:bg-white/40 transition-transform hover:scale-110 flex-shrink-0"
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
                  onChange={handleTitleChange}
                />
              </div>

              {/* Fecha + hora */}
              <div className="flex gap-3">
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
                    <p className="text-left text-white/70 text-sm font-medium">{place}</p>
                    <div className="rounded-xl overflow-hidden h-36 border border-white/20 shadow-sm">
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
                  <p className="text-left text-white/50 text-sm">Obteniendo ubicación...</p>
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
              <div className="flex gap-3">
                <button
                  onClick={createPlan}
                  disabled={creating}
                  className={`flex-1 py-3 rounded-2xl font-bold text-black bg-white hover:bg-gray-200 transition shadow-lg ${
                    creating ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {creating ? "Creando..." : "Crear 🚀"}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={canceling}
                  className="py-3 px-4 rounded-2xl font-semibold text-white bg-white/10 transition shadow-md"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
