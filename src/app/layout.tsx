import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "PlanApp",
  description: "Crea y comparte planes cerca de ti",
  themeColor: "#8b5cf6",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
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
        <meta name="theme-color" content="#8b5cf6" />
      </head>
      <body className="bg-gray-50 text-gray-900 font-sans">
        <main className="max-w-md mx-auto min-h-screen flex flex-col">
          {children}
        </main>
      </body>
    </html>
  );
}
