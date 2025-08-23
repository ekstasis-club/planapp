import Link from "next/link";

export default function FAB() {
    return (
      <Link  href="/plan/new"
      className="fixed bottom-5 right-5 bg-purple-600 text-white rounded-full w-14 h-14 flex items-center justify-center text-3xl shadow-lg"
      aria-label="Crear plan"
      >
        Crear Plan
      </Link>
      
    );
  }
  