"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AuthForm() {
  const [showNamePopup, setShowNamePopup] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Detecta automáticamente si el usuario está logueado y no tiene nombre
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user && !data.user.user_metadata?.full_name) {
        setShowNamePopup(true);
      }
    };
    checkUser();
  }, []);

  const handleOAuthLogin = async (provider: "google" | "apple") => {
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: window.location.origin, // redirige a la misma página
      },
    });

    if (error) {
      setError(error.message);
    }
  };

  const handleSaveName = async () => {
    const { error } = await supabase.auth.updateUser({
      data: { full_name: name },
    });

    if (error) {
      setError(error.message);
    } else {
      setShowNamePopup(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black">
      <h1 className="text-2xl font-bold mb-6 text-white">Inicia sesión</h1>

      {error && <p className="text-red-400 text-sm mb-3">{error}</p>}

      <div className="flex flex-col gap-4">
        <button
          onClick={() => handleOAuthLogin("google")}
          className="w-64 bg-red-600 text-white py-3 rounded-xl font-semibold hover:opacity-90 transition"
        >
          Iniciar con Google
        </button>

        <button
          onClick={() => handleOAuthLogin("apple")}
          className="w-64 bg-gray-300 text-black py-3 rounded-xl font-semibold hover:opacity-90 transition"
        >
          Iniciar con Apple
        </button>

        {/* Placeholder para Instagram */}
        <button
          onClick={() => alert("Instagram OAuth requiere integración manual")}
          className="w-64 bg-gradient-to-r from-pink-500 to-yellow-400 text-white py-3 rounded-xl font-semibold hover:opacity-90 transition"
        >
          Iniciar con Instagram
        </button>
      </div>

      {/* Popup para nombre */}
      {showNamePopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70">
          <div className="bg-neutral-900 p-6 rounded-xl w-80">
            <h2 className="text-white text-lg mb-3">Escribe tu nombre</h2>
            <input
              type="text"
              placeholder="Nombre"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 mb-3 rounded-xl bg-neutral-800 text-white placeholder-gray-400 border border-white/10 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
            <button
              onClick={handleSaveName}
              className="w-full bg-gradient-to-r from-violet-500 to-pink-500 text-white py-3 rounded-xl font-semibold hover:opacity-90 transition"
            >
              Guardar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
