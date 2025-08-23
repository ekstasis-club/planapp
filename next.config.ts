import type { NextConfig } from "next";
import withPWA from "next-pwa";

const nextConfig: NextConfig = withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  workboxOptions: {
    navigateFallback: '/offline.html',
  },
  reactStrictMode: true,
  experimental: { turbo: true },
  // Configuración explícita para Turbopack
  turbopack: {
    root: "./", // ruta relativa a la carpeta raíz de tu proyecto
  },
  // Eliminamos opciones no oficiales para evitar warnings
});

export default nextConfig;
