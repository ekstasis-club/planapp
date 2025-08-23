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
    alert("¡Te has apuntado!");
  };

  if (!plan) return <div className="p-4">Plan no encontrado</div>;

  return (
    <div className="p-4 space-y-4 pb-24">
      <h1 className="text-2xl font-bold">{plan.emoji} {plan.title}</h1>
      <p className="text-gray-600">{timeText}{plan.place ? ` · ${plan.place}` : ""}</p>

      <button onClick={join} className="w-full bg-purple-600 text-white py-3 rounded-xl font-bold">
        Apuntarme
      </button>

      {plan.groupLink && (
        <a href={plan.groupLink} target="_blank" className="block text-center w-full bg-green-600 text-white py-3 rounded-xl font-bold">
          Entrar al grupo
        </a>
      )}

      <section>
        <h2 className="font-bold mb-2">Asistentes ({attendees.length})</h2>
        <ul className="bg-white border border-gray-100 rounded-xl divide-y">
          {attendees.map((h, i) => (
            <li key={i} className="p-3 text-sm">{h}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
