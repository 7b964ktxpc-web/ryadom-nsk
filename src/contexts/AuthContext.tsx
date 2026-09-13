import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";

interface User {
  id: string;
  name: string;
  phone: string;
  email: string;
  avatar_url: string | null;
  role: string;
  rating: number;
  district_name: string;
  is_pro: boolean;
  is_verified: boolean;
  completed_orders_count: number;
  responses_count: number;
  telegram: string | null;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (phone: string, name: string, role?: string) => Promise<void>;
  loginAsGuest: (name: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthCtx = createContext<AuthContextType | null>(null);

function buildUser(id: string, meta: Record<string, unknown> = {}): User {
  return {
    id,
    name: (meta.name as string) || "Пользователь",
    phone: (meta.phone as string) || "",
    email: (meta.email as string) || "",
    avatar_url: null,
    role: (meta.role as string) || "user",
    rating: 5,
    district_name: "Октябрьский",
    is_pro: false,
    is_verified: false,
    completed_orders_count: 0,
    responses_count: 0,
    telegram: null,
    created_at: new Date().toISOString(),
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setUser(buildUser(session.user.id, session.user.user_metadata as Record<string, unknown>));
        }
        setLoading(false);
      });
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
        if (s?.user) {
          setUser(buildUser(s.user.id, s.user.user_metadata as Record<string, unknown>));
        } else {
          setUser(null);
        }
        setLoading(false);
      });
      return () => subscription.unsubscribe();
    } else {
      const saved = localStorage.getItem("ryadom_user");
      if (saved) {
        try { setUser(JSON.parse(saved)); } catch { /* ignore */ }
      }
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (phone: string, name: string, role?: string) => {
    if (supabase) {
      const { error } = await supabase.auth.signInWithOtp({
        phone: `+7${phone}`,
        options: { data: { name, phone, role: role || "user" } },
      });
      if (!error) {
        setUser(buildUser(crypto.randomUUID(), { name, phone: `+7${phone}`, role: role || "user" }));
      }
    } else {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: `+7${phone}`, name, role: role || "user" }),
      });
      const data = await res.json();
      setUser(data);
      localStorage.setItem("ryadom_user", JSON.stringify(data));
    }
  }, []);

  const loginAsGuest = useCallback(async (name: string) => {
    const res = await fetch("/api/auth/guest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name || "Гость" }),
    });
    const data = await res.json();
    setUser(data);
    localStorage.setItem("ryadom_user", JSON.stringify(data));
  }, []);

  const logout = useCallback(async () => {
    if (supabase) await supabase.auth.signOut();
    setUser(null);
    localStorage.removeItem("ryadom_user");
  }, []);

  return <AuthCtx.Provider value={{ user, loading, login, loginAsGuest, logout }}>
    {loading ? <div className="min-h-screen bg-bg flex items-center justify-center"><div className="text-center"><div className="w-20 h-20 bg-gradient-to-br from-primary to-primary-dark rounded-2xl flex items-center justify-center text-bg font-display font-black text-3xl mx-auto mb-4 shadow-lg shadow-primary/30 animate-float">Р</div><p className="text-text-secondary text-sm">Загрузка РЯДОМ НСК...</p></div></div> : children}
  </AuthCtx.Provider>;
}

export function useAuth() { const c = useContext(AuthCtx); if (!c) throw new Error("useAuth"); return c; }
