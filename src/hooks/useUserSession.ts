// src/hooks/useUserSession.ts
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { User } from "@supabase/supabase-js";

export function useUserSession(redirectTo: string = "/auth") {
  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    supabase.auth.getUser().then(({ data }) => {
      if (!mounted) return;
      setUser(data.user);
      setLoadingUser(false);
      if (!data.user) router.replace(redirectTo);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setUser(session?.user ?? null);
      if (!session?.user) router.replace(redirectTo);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [router, redirectTo]);

  return { user, loadingUser };
}
