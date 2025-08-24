"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MessageSquare, User } from "lucide-react";

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { name: "Planes", href: "/", icon: <Home className="w-6 h-6" /> },
    { name: "Mensajes", href: "/mensajes", icon: <MessageSquare className="w-6 h-6" /> },
    { name: "Perfil", href: "/perfil", icon: <User className="w-6 h-6" /> },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-zinc-900 border-t border-zinc-800 shadow-lg z-30">
      <div className="flex justify-around items-center h-16 relative">
        {/* Ítems laterales */}
        {navItems.map((item, idx) => {
          // Dejamos hueco en el centro (idx === 1)
          if (idx === 1) {
            return (
              <div key="crear" className="relative -top-6">
                <Link
                  href="/plan/new"
                  className="flex items-center justify-center w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full shadow-lg text-2xl"
                >
                  +
                </Link>
              </div>
            );
          }

          const active = pathname === item.href;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center text-xs font-medium transition ${
                active ? "text-purple-400" : "text-gray-400 hover:text-gray-200"
              }`}
            >
              {item.icon}
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
