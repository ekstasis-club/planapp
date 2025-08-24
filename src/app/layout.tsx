import "./globals.css";
import BottomNav from "./components/BottomNav";
import TopNav from "./components/TopNav";

import type { ReactNode } from "react";

export const metadata = {
  title: "PlanApp",
  description: "Crea y comparte planes cerca de ti",
  themeColor: "#000000", // negro
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent", // o "black"
    title: "PlanApp",
  },
  icons: {
    icon: "/icon-192.png",
    apple: "/icon-192.png",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="manifest" href="/manifest.webmanifest" />
        <meta name="theme-color" content="#000000" />
      </head>
      <body className="bg-black text-gray-900 font-sans">
        <main className="max-w-md mx-auto min-h-screen flex flex-col">
          <TopNav />
            {children}
          <BottomNav />
        </main>
      </body>
    </html>
  );
}
