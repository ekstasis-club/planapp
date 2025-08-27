"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import type { User } from "@supabase/supabase-js";


export default function ProtectedPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        router.replace("/auth");
      } else {
        setUser(data.user);
      }

      setLoading(false);
    };

    fetchUser();
  }, [router]);

  if (loading) return <p className="text-white text-center mt-20">Cargando...</p>;

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white">
      <h1 className="text-3xl font-bold mb-4">Página Protegida</h1>
      <p>¡Hola {user.user_metadata.full_name || user.email}! Solo puedes ver esto si estás logeado.</p>
    </div>
  );
}
