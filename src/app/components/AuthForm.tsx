"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { FcGoogle } from "react-icons/fc";
import { FaApple } from "react-icons/fa";

export default function AuthTabs() {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showNamePopup, setShowNamePopup] = useState(false);
  const [name, setName] = useState("");

  const { login, register, oauthLogin, saveName, loading, error } = useAuth();

  const handleRegister = async () => {
    const success = await register(email, password);
    if (success) setShowNamePopup(true);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black px-6 text-white">
      <h1 className="text-3xl font-bold mb-6">Bienvenido</h1>

      {/* Tabs */}
      <div className="flex border-b border-gray-700 mb-6 w-full max-w-xs">
        <button
          onClick={() => setActiveTab("login")}
          className={`w-1/2 py-3 font-semibold ${
            activeTab === "login"
              ? "border-b-2 border-pink-500 text-pink-500"
              : "text-gray-400"
          }`}
        >
          Iniciar Sesión
        </button>
        <button
          onClick={() => setActiveTab("register")}
          className={`w-1/2 py-3 font-semibold ${
            activeTab === "register"
              ? "border-b-2 border-pink-500 text-pink-500"
              : "text-gray-400"
          }`}
        >
          Registrarse
        </button>
      </div>

      {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

      {/* Formulario Login */}
      {activeTab === "login" && (
        <div className="w-full max-w-xs flex flex-col gap-3">
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 rounded-md bg-gray-900 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 rounded-md bg-gray-900 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
          <button
            onClick={() => login(email, password)}
            disabled={loading}
            className="w-full bg-pink-500 text-white py-3 rounded-md font-semibold hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? "Cargando..." : "Iniciar sesión"}
          </button>

          <div className="flex items-center justify-center gap-4 mt-4">
            <button
              onClick={() => oauthLogin("google")}
              className="w-12 h-12 flex items-center justify-center rounded-full border border-gray-700 hover:bg-gray-800"
            >
              <FcGoogle size={22} />
            </button>
            <button
              onClick={() => oauthLogin("apple")}
              className="w-12 h-12 flex items-center justify-center rounded-full border border-gray-700 hover:bg-gray-800"
            >
              <FaApple size={22} />
            </button>
          </div>
        </div>
      )}

      {/* Formulario Registro */}
      {activeTab === "register" && (
        <div className="w-full max-w-xs flex flex-col gap-3">
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 rounded-md bg-gray-900 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 rounded-md bg-gray-900 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
          <button
            onClick={handleRegister}
            disabled={loading}
            className="w-full bg-pink-500 text-white py-3 rounded-md font-semibold hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? "Cargando..." : "Crear cuenta"}
          </button>

          <div className="flex items-center justify-center gap-4 mt-4">
            <button
              onClick={() => oauthLogin("google")}
              className="w-12 h-12 flex items-center justify-center rounded-full border border-gray-700 hover:bg-gray-800"
            >
              <FcGoogle size={22} />
            </button>
            <button
              onClick={() => oauthLogin("apple")}
              className="w-12 h-12 flex items-center justify-center rounded-full border border-gray-700 hover:bg-gray-800"
            >
              <FaApple size={22} />
            </button>
          </div>
        </div>
      )}

      {/* Popup para pedir nombre */}
      {showNamePopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
          <div className="bg-gray-900 p-6 rounded-xl w-80">
            <h2 className="text-white text-lg mb-3">Escribe tu nombre</h2>
            <input
              type="text"
              placeholder="Nombre"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 mb-3 rounded-md bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
            <button
              onClick={() => saveName(name)}
              className="w-full bg-pink-500 text-white py-3 rounded-md font-semibold hover:opacity-90 transition"
            >
              Guardar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
