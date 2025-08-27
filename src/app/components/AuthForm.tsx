"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AuthForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setError(error.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <form
        onSubmit={handleSubmit}
        className="bg-black border border-white/10 p-8 rounded-3xl shadow-lg w-80"
      >
        <h1 className="text-2xl font-bold mb-6 text-center text-white">
          {isLogin ? "Inicia sesión" : "Regístrate"}
        </h1>

        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 mb-3 rounded-xl bg-neutral-900 text-white placeholder-gray-400 border border-white/10 focus:outline-none focus:ring-2 focus:ring-violet-500"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Contraseña"
          className="w-full p-3 mb-3 rounded-xl bg-neutral-900 text-white placeholder-gray-400 border border-white/10 focus:outline-none focus:ring-2 focus:ring-violet-500"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && (
          <p className="text-red-400 text-sm mb-3 text-center">{error}</p>
        )}

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-violet-500 to-pink-500 text-white py-3 rounded-xl font-semibold hover:opacity-90 transition"
        >
          {isLogin ? "Entrar" : "Registrarse"}
        </button>

        <p
          onClick={() => setIsLogin(!isLogin)}
          className="mt-4 text-sm text-center text-violet-400 hover:underline cursor-pointer"
        >
          {isLogin
            ? "¿No tienes cuenta? Regístrate"
            : "¿Ya tienes cuenta? Inicia sesión"}
        </p>
      </form>
    </div>
  );
}
