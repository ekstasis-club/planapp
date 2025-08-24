"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import { readJSON, writeJSON } from "@/lib/storage";
import { supabase } from "@/lib/supabaseClient";
import type { Database } from "@/lib/database.types";

// Import dinámico del mapa para evitar SSR
const Map = dynamic(() => import("../new/Map"), { ssr: false });

// Tipado del plan
type Plan = Database["public"]["Tables"]["plans"]["Row"];

export default function PlanPage() {
  const { id } = useParams() as { id: string };
  const [plan, setPlan] = useState<Plan | null>(null);
  const [attendees, setAttendees] = useState<string[]>([]);

  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [place, setPlace] = useState<string>("");

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

    // cargar asistentes desde localStorage
    setAttendees(readJSON<string[]>(keyAtt, []));
  }, [id, keyAtt]);

  const timeText = useMemo(() => {
    if (!plan) return "";
    const d = new Date(plan.time_iso);
    return d.toLocaleString([], { dateStyle: "short", timeStyle: "short" });
  }, [plan]);

  const join = () => {
    const handle = prompt("Tu @instagram (o deja vacío para entrar como anónimo):")?.trim() || "anónimo";
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
    <div className="min-h-screen bg-black flex flex-col items-center gap-6 p-4 pb-24">
      {/* Card principal */}
      <div className="w-full max-w-md bg-gray-900 rounded-3xl shadow-lg p-6 flex flex-col gap-4 items-center border border-gray-800">
        <div className="text-5xl">{plan.emoji}</div>
        <h1 className="text-2xl font-bold text-white text-center">{plan.title}</h1>
        <p className="text-gray-400 text-sm">{timeText}{plan.place ? ` · ${plan.place}` : ""}</p>
      </div>

      {/* Mapa solo visual */}
      {lat && lng && (
        <div className="w-full max-w-md rounded-3xl overflow-hidden shadow-lg">
          <Map
            lat={lat}
            lng={lng}
            place={place}
            setLat={() => {}}
            setLng={() => {}}
            setPlace={() => {}}
            draggable={false} // marcador fijo
          />
        </div>
      )}

      {/* Botones */}
      <div className="w-full max-w-md flex flex-col gap-3">
        <button
          onClick={join}
          className="w-full py-3 rounded-2xl font-bold text-white bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-400 shadow-lg hover:opacity-90 transition"
        >
          Apuntarme 🚀
        </button>
      </div>

      {/* Lista de asistentes */}
      <section className="w-full max-w-md">
        <h2 className="font-bold mb-3 text-white text-lg">Asistentes ({attendees.length})</h2>
        <ul className="bg-gray-900 border border-gray-800 rounded-3xl divide-y divide-gray-800 shadow-inner">
          {attendees.map((h, i) => (
            <li key={i} className="p-3 flex items-center gap-3 text-white text-sm hover:bg-gray-800 transition">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-400 flex items-center justify-center font-bold text-white shadow-md">
                {h[0].toUpperCase()}
              </div>
              <span>{h}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
