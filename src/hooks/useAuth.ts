"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export function useAuth() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const login = async (email: string, password: string) => {
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) setError(error.message);
    else router.push("/profile"); // Redirigir tras login
  };

  const register = async (email: string, password: string) => {
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password, options: { data: {} } });
    setLoading(false);
    if (error) setError(error.message);
    return !error;
  };

  const oauthLogin = async (provider: "google" | "apple") => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: window.location.origin + "?fromOAuth=true" },
    });
    if (error) setError(error.message);
  };

  const saveName = async (name: string) => {
    const { error } = await supabase.auth.updateUser({ data: { full_name: name } });
    if (error) setError(error.message);
    else router.push("/profile");
  };

  return { login, register, oauthLogin, saveName, loading, error };
}
