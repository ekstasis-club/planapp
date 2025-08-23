import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "PlanApp",
  description: "Crea y comparte planes cerca de ti",
  //themeColor: "#8b5cf6",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "PlanApp",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-gray-50 text-gray-900 font-sans">
        <main className="max-w-md mx-auto min-h-screen flex flex-col">
          {children}
        </main>
      </body>
    </html>
  );
}



