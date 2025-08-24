"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { readJSON, writeJSON } from "../../../lib/storage";
import type { Plan } from "../../../lib/types";

export default function PlanPage() {
  const { id } = useParams() as { id: string };
  const [plan, setPlan] = useState<Plan | null>(null);
  const [attendees, setAttendees] = useState<string[]>([]);

  const keyPlans = "plans";
  const keyAtt = `attendees_${id}`;

  useEffect(() => {
    const all = readJSON<Plan[]>(keyPlans, []);
    setPlan(all.find(p => p.id === id) || null);
    setAttendees(readJSON<string[]>(keyAtt, []));
  }, [id]);

  const timeText = useMemo(() => {
    if (!plan) return "";
    const d = new Date(plan.timeISO);
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
    return <div className="min-h-screen flex items-center justify-center text-white text-center p-4">Plan no encontrado</div>;

  return (
    <div className="min-h-screen bg-black flex flex-col items-center gap-6 p-4 pb-24">
      {/* Card principal */}
      <div className="w-full max-w-md bg-gray-900 rounded-3xl shadow-lg p-6 flex flex-col gap-4 items-center border border-gray-800">
        <div className="text-5xl">{plan.emoji}</div>
        <h1 className="text-2xl font-bold text-white text-center">{plan.title}</h1>
        <p className="text-gray-400 text-sm">{timeText}{plan.place ? ` · ${plan.place}` : ""}</p>
      </div>

      {/* Botones */}
      <div className="w-full max-w-md flex flex-col gap-3">
        <button
          onClick={join}
          className="w-full py-3 rounded-2xl font-bold text-white bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-400 shadow-lg hover:opacity-90 transition"
        >
          Apuntarme 🚀
        </button>

        {plan.groupLink && (
          <a
            href={plan.groupLink}
            target="_blank"
            className="w-full py-3 rounded-2xl font-bold text-white bg-gradient-to-r from-green-500 to-teal-400 shadow-lg text-center hover:opacity-90 transition"
          >
            Entrar al grupo
          </a>
        )}
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
