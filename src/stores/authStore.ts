import { create } from "zustand";
import type { Profile } from "@/types";
import { supabase, isMockMode } from "@/lib/supabase";
import { mockAdmin, mockAlumnoActual } from "@/lib/mock-data";

interface AuthState {
  user: Profile | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  signup: (email: string, password: string, nombre: string, telefono: string) => Promise<{ error?: string }>;
  loginAs: (role: "admin" | "alumno") => void;
  logout: () => Promise<void>;
  loadSession: () => Promise<void>;
}

async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  if (error) {
    console.error("[fetchProfile] Error:", error.message, error.code);
    return null;
  }
  return data as Profile;
}

async function createProfile(user: { id: string; email?: string; user_metadata?: Record<string, unknown> }): Promise<Profile | null> {
  const nombre = (user.user_metadata?.nombre as string) || user.email || "Sin nombre";
  const telefono = (user.user_metadata?.telefono as string) || "";
  const role = (user.user_metadata?.role as string) || "alumno";
  const plan = (user.user_metadata?.plan as string) || "2x semana";

  const { data, error } = await supabase
    .from("profiles")
    .insert({
      id: user.id,
      email: user.email || "",
      nombre,
      telefono,
      role,
      plan,
      estado: "activo",
    })
    .select()
    .single();

  if (error) {
    console.error("[createProfile] Error:", error.message);
    return null;
  }
  return data as Profile;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  isAuthenticated: false,

  login: async (email, password) => {
    set({ loading: true });
    if (isMockMode) {
      const user = email.includes("admin") ? mockAdmin : mockAlumnoActual;
      set({ user, isAuthenticated: true, loading: false });
      return {};
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      console.error("[login] Auth error:", error.message);
      set({ loading: false });
      return { error: error.message === "Invalid login credentials" ? "Email o contraseña incorrectos" : error.message };
    }

    console.log("[login] Auth OK, user id:", data.user.id);

    let profile = await fetchProfile(data.user.id);

    if (!profile) {
      console.log("[login] Profile not found, creating...");
      profile = await createProfile(data.user);
    }

    if (!profile) {
      set({ loading: false });
      return { error: "No se pudo cargar tu perfil. Contactá al administrador." };
    }

    console.log("[login] Profile loaded:", profile.nombre, profile.role);
    set({ user: profile, isAuthenticated: true, loading: false });
    return {};
  },

  signup: async (email, password, nombre, telefono) => {
    set({ loading: true });
    if (isMockMode) {
      set({ user: mockAlumnoActual, isAuthenticated: true, loading: false });
      return {};
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { nombre, telefono, role: "alumno", plan: "2x semana" },
      },
    });

    if (error) {
      console.error("[signup] Error:", error.message);
      set({ loading: false });
      return { error: error.message };
    }

    if (data.user && !data.session) {
      set({ loading: false });
      return { error: "" };
    }

    if (data.user) {
      const profile = await fetchProfile(data.user.id) || await createProfile(data.user);
      if (profile) {
        set({ user: profile, isAuthenticated: true, loading: false });
      }
    }
    set({ loading: false });
    return {};
  },

  loginAs: (role) => {
    const user = role === "admin" ? mockAdmin : mockAlumnoActual;
    set({ user, isAuthenticated: true, loading: false });
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null, isAuthenticated: false, loading: false });
  },

  loadSession: async () => {
    if (isMockMode) {
      set({ loading: false });
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      console.log("[loadSession] Session found, user id:", session.user.id);
      let profile = await fetchProfile(session.user.id);
      if (!profile) {
        console.log("[loadSession] Profile not found, creating...");
        profile = await createProfile(session.user);
      }
      if (profile) {
        set({ user: profile, isAuthenticated: true });
      }
    }
    set({ loading: false });
  },
}));
