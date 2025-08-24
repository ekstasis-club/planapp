"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MessageSquare, Plus } from "lucide-react";

export default function BottomNav() {
  const pathname = usePathname();

  const leftItem = { name: "Planes", href: "/", icon: <Home className="w-5 h-5 mb-1" /> };
  const rightItem = { name: "Mensajes", href: "/mensajes", icon: <MessageSquare className="w-5 h-5 mb-1" /> };
  const centerItem = { href: "/plan/new", icon: <Plus className="w-5 h-5" /> };

  const isCreating = pathname === centerItem.href;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-zinc-900 z-50 shadow-md border-t border-gray-800 h-16">
      <div className="relative flex items-center h-full">
        {/* Mitad izquierda */}
        <div className="w-1/3 flex justify-center">
          <Link
            href={leftItem.href}
            className={`flex flex-col items-center justify-center text-sm font-bold transition ${
              pathname === leftItem.href ? "text-white" : "text-gray-400 hover:text-gray-200"
            }`}
          >
            {leftItem.icon}
            <span>{leftItem.name}</span>
          </Link>
        </div>

        {/* Botón central + con círculo */}
        <div className="w-1/3 flex justify-center">
          <Link
            href={centerItem.href}
            className={`flex items-center justify-center w-10 h-10 rounded-full border border-gray-600 transition
                        ${isCreating ? "bg-white" : ""} hover:border-gray-400`}
          >
            <Plus className={`w-5 h-5 ${isCreating ? "text-black" : "text-white"}`} />
          </Link>
        </div>

        {/* Mitad derecha */}
        <div className="w-1/3 flex justify-center">
          <Link
            href={rightItem.href}
            className={`flex flex-col items-center justify-center text-sm font-bold transition ${
              pathname === rightItem.href ? "text-white" : "text-gray-400 hover:text-gray-200"
            }`}
          >
            {rightItem.icon}
            <span>{rightItem.name}</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}

