"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MessageSquare, Plus } from "lucide-react";

export default function BottomNav() {
  const pathname = usePathname();

  const leftItem = { href: "/", icon: <Home className="w-6 h-6" /> };
  const rightItem = { href: "/mensajes", icon: <MessageSquare className="w-6 h-6" /> };
  const centerItem = { href: "/plan/new", icon: <Plus className="w-5 h-5" /> };

  const isCreating = pathname === centerItem.href;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-zinc-900 z-50 border-t border-zinc-800 h-16">
      <div className="relative flex items-center justify-around px-6 h-full">
        {/* Icono izquierdo */}
        <Link
          href={leftItem.href}
          className={`transition ${
            pathname === leftItem.href ? "text-white" : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          {leftItem.icon}
        </Link>

        {/* Botón central rectangular */}
        <Link
          href={centerItem.href}
          className={`flex items-center justify-center w-14 h-12 rounded-2xl shadow-md transition 
                      ${isCreating ? "bg-zinc-700" : "bg-zinc-800 hover:bg-zinc-700"}`}
        >
          <Plus className={`w-5 h-5 ${isCreating ? "text-zinc-300" : "text-zinc-200"}`} />
        </Link>

        {/* Icono derecho */}
        <Link
          href={rightItem.href}
          className={`transition ${
            pathname === rightItem.href ? "text-white" : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          {rightItem.icon}
        </Link>
      </div>
    </nav>
  );
}
