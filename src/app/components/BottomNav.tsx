"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MessageSquare, Plus } from "lucide-react";

export default function BottomNav() {
  const pathname = usePathname();

  const items = [
    { href: "/", icon: <Home /> },
    { href: "/plan/new", icon: <Plus /> },
    { href: "/mensajes", icon: <MessageSquare /> },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-black/60 backdrop-blur-md z-50 border-t border-zinc-800 h-16 flex items-center justify-around px-6">
      {items.map((item, idx) => {
        const isCenter = idx === 1;
        const isSelected = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center justify-center transition-transform hover:scale-110 ${
              isSelected ? "text-white" : "text-zinc-400"
            }`}
          >
            {React.cloneElement(item.icon, {
              className: isCenter ? "w-7 h-7" : "w-6 h-6",
              strokeWidth: isSelected ? 2.5 : 1.5,
            })}
          </Link>
        );
      })}
    </nav>
  );
}

