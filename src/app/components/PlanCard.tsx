"use client";

import Link from "next/link";

type Props = {
  id: string;
  title: string;
  emoji: string;
  time: string;
};

export default function PlanCard({ id, title, emoji, time }: Props) {
  return (
    <Link
      href={`/plan/${id}`}
      className="w-full h-full aspect-square bg-black rounded-2xl shadow-md flex flex-col items-center justify-center text-white hover:scale-105 transition-transform overflow-hidden"
    >
      <div className="text-6xl">{emoji}</div>
      <div className="text-sm font-medium text-center mt-2">{title}</div>
      <div className="text-xs text-gray-400">{time}</div>
    </Link>
  );
}
