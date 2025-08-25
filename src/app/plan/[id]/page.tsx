"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import { readJSON, writeJSON } from "@/lib/storage";
import { supabase } from "@/lib/supabaseClient";
import type { Database } from "@/lib/database.types";
import { motion, AnimatePresence } from "framer-motion";

const Map = dynamic(() => import("../new/Map"), { ssr: false });

type Plan = Database["public"]["Tables"]["plans"]["Row"];

export default function PlanPage() {
  const { id } = useParams() as { id: string };
  const [plan, setPlan] = useState<Plan | null>(null);
  const [attendees, setAttendees] = useState<string[]>([]);
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [place, setPlace] = useState<string>("");
  const [showPopup, setShowPopup] = useState(false);

  const keyAtt = `attendees_${id}`;

  useEffect(() => {
    const fetchPlan = async () => {
      if (!id) return;
      const { data, error } = await supabase
        .from("plans")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error(error);
        setPlan(null);
        return;
      }

      if (data) {
        setPlan(data);
        setLat(data.lat);
        setLng(data.lng);
        setPlace(data.place || "");
      }
    };

    fetchPlan();
    setAttendees(readJSON<string[]>(keyAtt, []));
  }, [id, keyAtt]);

  useEffect(() => {
    // Mostrar popup solo si viene de crear un nuevo plan
    if (sessionStorage.getItem("justCreatedPlan") === "true") {
      setShowPopup(true);
      sessionStorage.removeItem("justCreatedPlan");
    }
  }, []);

  const timeText = useMemo(() => {
    if (!plan) return "";
    const d = new Date(plan.time_iso);
    return d.toLocaleString([], { dateStyle: "full", timeStyle: "short" });
  }, [plan]);

  const join = () => {
    const handle =
      prompt("Tu @instagram (o deja vacío para entrar como anónimo):")?.trim() ||
      "anónimo";
    const current = readJSON<string[]>(keyAtt, []);
    const next = [handle, ...current];
    writeJSON(keyAtt, next);
    setAttendees(next);
  };

  if (!plan)
    return (
      <div className="min-h-screen flex items-center justify-center text-white text-center p-4">
        Plan no encontrado
      </div>
    );

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-black via-zinc-900 to-black flex flex-col items-center gap-6 p-4 pb-28 pt-20">
        {/* Tarjeta principal */}
        <div className="w-full max-w-md bg-white/10 backdrop-blur-xl rounded-3xl shadow-xl border border-white/10 p-6 flex flex-col items-center gap-4 animate-fadeIn">
          <div className="text-6xl drop-shadow-sm">{plan.emoji}</div>
          <h1 className="text-3xl font-bold text-white text-center leading-snug">
            {plan.title}
          </h1>
          <p className="text-white/70 text-sm text-center font-medium">
            {timeText} {plan.place ? ` · ${plan.place}` : ""}
          </p>
        </div>

        {/* Mapa */}
        {lat && lng && (
          <div className="w-full max-w-md rounded-3xl overflow-hidden shadow-lg border border-white/10 animate-fadeIn">
            <div className="h-[220px] w-full">
              <Map
                lat={lat}
                lng={lng}
                place={place}
                setLat={() => {}}
                setLng={() => {}}
                setPlace={() => {}}
                draggable={false}
              />
            </div>
          </div>
        )}

        {/* Botón principal */}
        <div className="w-full max-w-md flex flex-col gap-3 animate-fadeIn">
          <button
            onClick={join}
            className="w-full py-4 rounded-2xl font-bold text-lg text-white bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-400 shadow-lg hover:scale-[1.02] active:scale-95 transition-transform"
          >
            Apuntarme 🚀
          </button>
        </div>

        {/* Lista de asistentes */}
        <section className="w-full max-w-md animate-fadeIn">
          <h2 className="font-semibold mb-3 text-white text-lg">
            Asistentes ({attendees.length})
          </h2>
          <ul className="bg-white/5 border border-white/10 rounded-3xl shadow-inner divide-y divide-white/10">
            {attendees.map((h, i) => (
              <li
                key={i}
                className="p-3 flex items-center gap-3 text-white/90 hover:bg-white/10 transition"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-400 flex items-center justify-center font-bold text-white shadow-md">
                  {h[0].toUpperCase()}
                </div>
                <span className="text-sm font-medium">{h}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Popup para compartir en Instagram */}
      <AnimatePresence>
        {showPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[9999] p-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="bg-black rounded-3xl border border-white/10 p-6 max-w-sm w-full shadow-2xl flex flex-col items-center gap-4 text-center"
            >
              <span className="text-6xl">{plan.emoji}</span>
              <h2 className="text-2xl font-bold text-white">{plan.title}</h2>
              <p className="text-white/70 text-lg">{timeText}</p>

              <button
                onClick={() => {
                  const storyUrl = "https://www.instagram.com/stories/create/";
                  window.open(storyUrl, "_blank");
                }}
                className="mt-4 px-6 py-3 rounded-2xl font-semibold bg-white text-black shadow-lg hover:bg-gray-200 transition"
              >
                Compartir en Instagram 📸
              </button>

              <button
                onClick={() => setShowPopup(false)}
                className="text-white/60 hover:text-white mt-2 text-sm"
              >
                Cerrar
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
