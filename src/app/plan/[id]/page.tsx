"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import { readJSON, writeJSON } from "@/lib/storage";
import { supabase } from "@/lib/supabaseClient";
import type { Database } from "@/lib/database.types";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

const Map = dynamic(() => import("../new/Map"), { ssr: false });

type Plan = Database["public"]["Tables"]["plans"]["Row"];

interface NavigatorShareFile {
  files?: File[];
  title?: string;
  text?: string;
  url?: string;
}

export default function PlanPage() {
  const { id } = useParams() as { id: string };
  const [plan, setPlan] = useState<Plan | null>(null);
  const [attendees, setAttendees] = useState<string[]>([]);
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  //const [place, setPlace] = useState<string>("");
  const [showPopup, setShowPopup] = useState(false);

  // Imagen para compartir (full) y preview pequeña
  const [storyDataUrl, setStoryDataUrl] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
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
        //setPlace(data.place || "");
      }
    };

    fetchPlan();
    setAttendees(readJSON<string[]>(keyAtt, []));
  }, [id, keyAtt]);

  useEffect(() => {
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

  // Generación de la imagen para compartir
  useEffect(() => {
    if (!showPopup || !plan) return;

    const W = 1080;
    const H = 1920;

    const canvas = canvasRef.current ?? document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, W, H);

    ctx.textAlign = "center";
    ctx.textBaseline = "top";

    ctx.font =
      '120px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",system-ui,sans-serif';
    ctx.fillStyle = "#ffffff";
    ctx.fillText(plan.emoji ?? "✨", W / 2, 280);

    ctx.font = "bold 70px Arial";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(plan.title ?? "", W / 2, 500);

    ctx.font = "28px Arial";
    ctx.fillStyle = "#cccccc";
    ctx.fillText(timeText ?? "", W / 2, 580);

    const fullDataUrl = canvas.toDataURL("image/png");
    setStoryDataUrl(fullDataUrl);

    const previewWidth = 150;
    const previewHeight = Math.round((H / W) * previewWidth);
    const previewCanvas = document.createElement("canvas");
    previewCanvas.width = previewWidth;
    previewCanvas.height = previewHeight;
    const pctx = previewCanvas.getContext("2d");
    if (pctx) {
      pctx.drawImage(canvas, 0, 0, previewWidth, previewHeight);
      setPreview(previewCanvas.toDataURL("image/png"));
    }
  }, [showPopup, plan, timeText]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert("✅ Enlace copiado al portapapeles");
    } catch {
      const ta = document.createElement("textarea");
      ta.value = window.location.href;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      alert("✅ Enlace copiado al portapapeles");
    }
  };

  const handleShare = async () => {
    if (!storyDataUrl) return;

    try {
      const res = await fetch(storyDataUrl);
      const blob = await res.blob();
      const file = new File([blob], "plan.png", { type: "image/png" });

      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

      const nav = navigator as unknown as {
        canShare?: (data: NavigatorShareFile) => boolean;
        share?: (data: NavigatorShareFile) => Promise<void>;
      };

      if (isMobile && nav.canShare?.({ files: [file] }) && nav.share) {
        await nav.share({
          files: [file],
          title: plan?.title ?? "Plan",
          text: "¡Únete a este plan!",
          url: window.location.href,
        });
        return;
      }

      const a = document.createElement("a");
      a.href = storyDataUrl;
      a.download = "plan.png";
      a.click();

      if (isMobile) {
        alert(
          "Imagen descargada. Abre Instagram y súbela a tu historia desde la galería."
        );
      } else {
        alert("Imagen descargada. Súbela manualmente a tu historia de Instagram.");
      }
    } catch (e) {
      console.error("Error al compartir:", e);
      alert("No se pudo compartir. Descarga la imagen y súbela manualmente.");
    }
  };

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
      <div className="min-h-screen bg-gradient-to-b from-black via-zinc-900 to-black flex flex-col items-center gap-6 p-6 pb-28 pt-20">
        {/* Card principal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md bg-white/10 backdrop-blur-xl rounded-2xl shadow-lg border border-white/15 p-6 flex flex-col items-center gap-4"
        >
          <div className="text-6xl">{plan.emoji ?? "✨"}</div>
          <h1 className="text-3xl font-bold text-white text-center leading-snug">
            {plan.title ?? ""}
          </h1>
          <p className="text-white/70 text-sm text-center font-medium">
            {timeText} {plan.place ? `· ${plan.place}` : ""}
          </p>
        </motion.div>

        {/* Mapa */}
        {lat && lng && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-md rounded-2xl overflow-hidden shadow-lg border border-white/15"
          >
            <div className="h-[220px] w-full">
              <Map
                lat={lat}
                lng={lng}
                
                setLat={() => {}}
                setLng={() => {}}
                
                draggable={false}
              />
            </div>
          </motion.div>
        )}

        {/* Botón unirse */}
        <div className="w-full max-w-md">
          <button
            onClick={join}
            className="w-full py-4 rounded-2xl font-bold text-lg text-white bg-gradient-to-r from-fuchsia-500 via-pink-500 to-amber-400 shadow-lg hover:scale-[1.02] active:scale-95 transition"
          >
            Apuntarme 🚀
          </button>
        </div>

        {/* Lista asistentes */}
        <section className="w-full max-w-md">
          <h2 className="font-semibold mb-3 text-white text-lg">
            Asistentes ({attendees.length})
          </h2>
          <div className="flex flex-wrap gap-2">
            {attendees.map((h, i) => (
              <div
                key={i}
                className="flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-4 py-2 shadow-sm"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-fuchsia-500 via-pink-500 to-amber-400 flex items-center justify-center text-sm font-bold text-white">
                  {h[0].toUpperCase()}
                </div>
                <span className="text-sm text-white">{h}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Popup de compartir */}
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
              className="bg-black/80 rounded-2xl border border-white/10 p-6 max-w-sm w-full shadow-2xl flex flex-col items-center gap-4 text-center"
            >
              <canvas ref={canvasRef} className="hidden" />

              <div className="flex items-center gap-2 mt-1">
                <span className="text-3xl">{plan.emoji ?? "✨"}</span>
                <h2 className="text-xl font-bold text-white">{plan.title ?? ""}</h2>
              </div>
              
{/* Texto con link en vez de fecha/hora */}
<a
  href={typeof window !== "undefined" ? window.location.href : ""}
  target="_blank"
  rel="noopener noreferrer"
  className="text-white/70 text-sm break-all underline hover:text-white"
>
  {typeof window !== "undefined" ? window.location.href : ""}
</a>

{preview && (
  <Image
    src={preview}
    alt="Previsualización historia"
    width={150}
    height={Math.round((1920 / 1080) * 150)}
    className="rounded-lg shadow-md border border-white/20"
  />
)}

{/* Botón copiar enlace modificado */}
<button
  onClick={handleCopyLink}
  className="px-6 py-3 rounded-xl font-semibold bg-white/90 text-black shadow hover:bg-white transition mx-auto"
>
  Copiar enlace 🔗
</button>

<button
  onClick={handleShare}
  className="w-full px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-fuchsia-500 via-pink-500 to-amber-400 text-white shadow-lg hover:scale-[1.02] active:scale-95 transition"
  disabled={!storyDataUrl}
>
  Compartir en Instagram 📸
</button>

<button
  onClick={() => setShowPopup(false)}
  className="text-white/60 hover:text-white mt-1 text-sm"
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
