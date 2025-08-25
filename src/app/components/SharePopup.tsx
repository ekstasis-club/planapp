"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

type SharePopupProps = {
  open: boolean;
  onClose: () => void;
  emoji: string;
  title: string;
  date: string;
  time: string;
};

export default function SharePopup({ open, onClose, emoji, title, date, time }: SharePopupProps) {
  const [loading, setLoading] = useState(false);

  const handleShare = async () => {
    try {
      setLoading(true);

      // 1. Crear canvas para la plantilla
      const canvas = document.createElement("canvas");
      canvas.width = 1080;
      canvas.height = 1920;
      const ctx = canvas.getContext("2d")!;

      // Fondo degradado
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, "#000000");
      gradient.addColorStop(1, "#1a1a1a");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Emoji
      ctx.font = "200px Arial";
      ctx.textAlign = "center";
      ctx.fillText(emoji, canvas.width / 2, 350);

      // Título
      ctx.font = "bold 70px Arial";
      ctx.fillStyle = "#fff";
      ctx.fillText(title, canvas.width / 2, 600);

      // Fecha y hora
      ctx.font = "40px Arial";
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      ctx.fillText(`${date} · ${time}`, canvas.width / 2, 700);

      // 2. Convertir imagen a PNG
      const imageData = canvas.toDataURL("image/png");
      const blob = await (await fetch(imageData)).blob();
      const file = new File([blob], "plan.png", { type: "image/png" });

      // 3. Intentar abrir Instagram en móvil
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

      if (isMobile && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "Comparte este plan en Instagram",
          text: "¡Únete a este plan!",
        });
      } else if (isMobile) {
        // Fallback: abrir cámara de Instagram Stories
        window.location.href = "instagram-stories://share";
      } else {
        // 4. En escritorio → descarga automática
        const a = document.createElement("a");
        a.href = imageData;
        a.download = `plan.png`;
        a.click();
        alert("Plantilla descargada. Sube la imagen manualmente a tu story.");
      }
    } catch (error) {
      console.error("Error al compartir:", error);
      alert("No se pudo compartir. Descarga la plantilla manualmente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="bg-black rounded-3xl border border-white/10 shadow-2xl p-6 flex flex-col items-center gap-4 text-center max-w-sm w-full"
          >
            <span className="text-6xl">{emoji}</span>
            <h2 className="text-2xl font-bold text-white">{title}</h2>
            <p className="text-white/70 text-lg">{date} · {time}</p>

            <button
              onClick={handleShare}
              disabled={loading}
              className="mt-4 px-6 py-3 rounded-2xl font-semibold bg-white text-black shadow-lg hover:bg-gray-200 transition disabled:opacity-50"
            >
              {loading ? "Generando..." : "Compartir en Instagram 📸"}
            </button>

            <button
              onClick={onClose}
              className="text-white/60 hover:text-white mt-2 text-sm"
            >
              Cerrar
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
