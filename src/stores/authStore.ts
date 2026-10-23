import { create } from "zustand";
import type { PlanType, Profile, SlotPreferido } from "@/types";
import { supabase } from "@/lib/supabase";
import { firebaseAuth } from "@/lib/db/firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from "firebase/auth";
import { db, getMotor } from "@/lib/db";
import {
  autenticar,
  borrarSesionLocal,
  crearUsuario,
  guardarSesionLocal,
  leerSesionLocal,
  listarUsuarios,
} from "@/lib/db/auth-local";
import { planDeFrecuencia, VECES_MES_POR_FRECUENCIA } from "@/lib/semilla";

export interface DatosRegistro {
  email: string;
  password: string;
  nombre: string;
  telefono: string;
  /** Veces por semana que el cliente se propone venir. */
  frecuencia_semana: number;
  franja: "manana" | "tarde" | "ambas";
  slots_preferidos: SlotPreferido[];
}

interface AuthState {
  user: Profile | null;
  loading: boolean;
  isAuthenticated: boolean;
  /** En modo local: todavía no hay ninguna cuenta y hay que crear al profesor. */
  necesitaSetup: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  signup: (datos: DatosRegistro) => Promise<{ error?: string }>;
  crearCuentaProfesor: (datos: DatosRegistro) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  loadSession: () => Promise<void>;
}

function perfilDesdeUsuarioLocal(
  usuario: { id: string; email: string; nombre: string; telefono: string; role: "admin" | "alumno" },
  extras: Partial<Profile> = {},
): Profile {
  const plan: PlanType = extras.plan ?? planDeFrecuencia(extras.frecuencia_semana ?? 2);
  return {
    id: usuario.id,
    email: usuario.email,
    nombre: usuario.nombre,
    role: usuario.role,
    plan,
    estado: "activo",
    telefono: usuario.telefono,
    frecuencia_semana: extras.frecuencia_semana ?? 2,
    veces_mes_objetivo:
      extras.veces_mes_objetivo ?? VECES_MES_POR_FRECUENCIA[extras.frecuencia_semana ?? 2] ?? 8,
    franja: extras.franja ?? "ambas",
    slots_preferidos: extras.slots_preferidos ?? [],
    created_at: new Date().toISOString(),
  };
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  isAuthenticated: false,
  necesitaSetup: false,

  login: async (email, password) => {
    set({ loading: true });

    if (getMotor() === "supabase") {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        set({ loading: false });
        return {
          error:
            error.message === "Invalid login credentials"
              ? "Correo o contraseña incorrectos"
              : error.message,
        };
      }
      const perfil = await db.getPerfil(data.user.id);
      if (!perfil) {
        set({ loading: false });
        return { error: "No se pudo cargar tu perfil. Contactá al profesor." };
      }
      set({ user: perfil, isAuthenticated: true, loading: false });
      return {};
    }

    if (getMotor() === "firebase") {
      try {
        const cred = await signInWithEmailAndPassword(firebaseAuth, email, password);
        const perfil = await db.getPerfil(cred.user.uid);
        if (!perfil) {
          set({ loading: false });
          return { error: "No se pudo cargar tu perfil. Contactá al profesor." };
        }
        set({ user: perfil, isAuthenticated: true, loading: false });
        return {};
      } catch (error) {
        set({ loading: false });
        const msg = error instanceof Error ? error.message : "No se pudo iniciar sesión";
        return {
          error:
            msg.includes("invalid-credential") ||
            msg.includes("wrong-password") ||
            msg.includes("user-not-found")
              ? "Correo o contraseña incorrectos"
              : msg,
        };
      }
    }

    // --- motor local ---
    const usuario = await autenticar(email, password);
    if (!usuario) {
      set({ loading: false });
      return { error: "Correo o contraseña incorrectos" };
    }
    const perfil = (await db.getPerfil(usuario.id)) ?? perfilDesdeUsuarioLocal(usuario);
    await db.savePerfil(perfil);
    guardarSesionLocal(usuario.id);
    set({ user: perfil, isAuthenticated: true, loading: false, necesitaSetup: false });
    return {};
  },

  signup: async (datos) => {
    set({ loading: true });
    const frecuencia = Math.max(1, Math.min(5, datos.frecuencia_semana));
    const plan = planDeFrecuencia(frecuencia);
    const vecesMes = VECES_MES_POR_FRECUENCIA[frecuencia] ?? frecuencia * 4;

    if (getMotor() === "supabase") {
      const { data, error } = await supabase.auth.signUp({
        email: datos.email,
        password: datos.password,
        options: {
          data: {
            nombre: datos.nombre,
            telefono: datos.telefono,
            role: "alumno",
            plan,
            frecuencia_semana: frecuencia,
            veces_mes_objetivo: vecesMes,
            franja: datos.franja,
            slots_preferidos: datos.slots_preferidos,
          },
        },
      });

      if (error) {
        set({ loading: false });
        return { error: error.message };
      }

      if (data.user && !data.session) {
        set({ loading: false });
        return { error: "" };
      }

      if (data.user) {
        const perfil = (await db.getPerfil(data.user.id)) ?? null;
        if (perfil) set({ user: perfil, isAuthenticated: true, loading: false });
      }
      set({ loading: false });
      return {};
    }

    if (getMotor() === "firebase") {
      try {
        const cred = await createUserWithEmailAndPassword(firebaseAuth, datos.email, datos.password);
        const frecuencia = Math.max(1, Math.min(5, datos.frecuencia_semana));
        const plan = planDeFrecuencia(frecuencia);
        const vecesMes = VECES_MES_POR_FRECUENCIA[frecuencia] ?? frecuencia * 4;
        const perfil: Profile = {
          id: cred.user.uid,
          email: datos.email,
          nombre: datos.nombre,
          role: "alumno",
          plan,
          estado: "activo",
          telefono: datos.telefono,
          frecuencia_semana: frecuencia,
          veces_mes_objetivo: vecesMes,
          franja: datos.franja,
          slots_preferidos: datos.slots_preferidos,
          created_at: new Date().toISOString(),
        };
        await db.savePerfil(perfil);
        set({ user: perfil, isAuthenticated: true, loading: false, necesitaSetup: false });
        return {};
      } catch (error) {
        set({ loading: false });
        return { error: error instanceof Error ? error.message : "No se pudo crear la cuenta" };
      }
    }

    // --- motor local ---
    try {
      const usuario = await crearUsuario(
        {
          email: datos.email,
          nombre: datos.nombre,
          telefono: datos.telefono,
          role: "alumno",
        },
        datos.password,
      );
      const perfil = perfilDesdeUsuarioLocal(usuario, {
        frecuencia_semana: frecuencia,
        veces_mes_objetivo: vecesMes,
        franja: datos.franja,
        slots_preferidos: datos.slots_preferidos,
        plan,
      });
      await db.savePerfil(perfil);
      guardarSesionLocal(usuario.id);
      set({ user: perfil, isAuthenticated: true, loading: false, necesitaSetup: false });
      return {};
    } catch (error) {
      set({ loading: false });
      return { error: error instanceof Error ? error.message : "No se pudo crear la cuenta" };
    }
  },

  crearCuentaProfesor: async (datos) => {
    set({ loading: true });
    const frecuencia = Math.max(1, Math.min(5, datos.frecuencia_semana));
    const plan = planDeFrecuencia(frecuencia);
    const vecesMes = VECES_MES_POR_FRECUENCIA[frecuencia] ?? frecuencia * 4;

    if (getMotor() === "firebase") {
      try {
        const cred = await createUserWithEmailAndPassword(firebaseAuth, datos.email, datos.password);
        const perfil: Profile = {
          id: cred.user.uid,
          email: datos.email,
          nombre: datos.nombre,
          role: "admin",
          plan,
          estado: "activo",
          telefono: datos.telefono,
          frecuencia_semana: frecuencia,
          veces_mes_objetivo: vecesMes,
          franja: datos.franja,
          slots_preferidos: datos.slots_preferidos,
          created_at: new Date().toISOString(),
        };
        await db.savePerfil(perfil);
        set({ user: perfil, isAuthenticated: true, loading: false, necesitaSetup: false });
        return {};
      } catch (error) {
        set({ loading: false });
        return { error: error instanceof Error ? error.message : "No se pudo crear la cuenta" };
      }
    }

    try {
      if (getMotor() === "supabase") {
        const { data, error } = await supabase.auth.signUp({
          email: datos.email,
          password: datos.password,
          options: {
            data: {
              nombre: datos.nombre,
              telefono: datos.telefono,
              role: "admin",
              plan,
              frecuencia_semana: frecuencia,
              veces_mes_objetivo: vecesMes,
              franja: datos.franja,
              slots_preferidos: datos.slots_preferidos,
            },
          },
        });
        if (error) {
          set({ loading: false });
          return { error: error.message };
        }
        if (data.user) {
          const perfil = (await db.getPerfil(data.user.id)) ?? null;
          if (perfil) set({ user: perfil, isAuthenticated: true, loading: false });
        }
        set({ loading: false });
        return {};
      }

      const usuario = await crearUsuario(
        {
          email: datos.email,
          nombre: datos.nombre,
          telefono: datos.telefono,
          role: "admin",
        },
        datos.password,
      );
      const perfil = perfilDesdeUsuarioLocal(usuario, {
        frecuencia_semana: frecuencia,
        veces_mes_objetivo: vecesMes,
        franja: datos.franja,
        slots_preferidos: datos.slots_preferidos,
        plan,
      });
      await db.savePerfil(perfil);
      guardarSesionLocal(usuario.id);
      set({ user: perfil, isAuthenticated: true, loading: false, necesitaSetup: false });
      return {};
    } catch (error) {
      set({ loading: false });
      return { error: error instanceof Error ? error.message : "No se pudo crear la cuenta" };
    }
  },

  logout: async () => {
    if (getMotor() === "supabase") {
      await supabase.auth.signOut();
    }
    if (getMotor() === "firebase") {
      await firebaseSignOut(firebaseAuth);
    }
    borrarSesionLocal();
    set({ user: null, isAuthenticated: false, loading: false });
  },

  loadSession: async () => {
    if (getMotor() === "supabase") {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        const perfil = await db.getPerfil(session.user.id);
        if (perfil) {
          set({ user: perfil, isAuthenticated: true, loading: false });
          return;
        }
      }
      set({ loading: false });
      return;
    }

    if (getMotor() === "firebase") {
      const perfiles = await db.listPerfiles();
      if (perfiles.length === 0) {
        set({ loading: false, necesitaSetup: true });
        return;
      }

      const usuarioFirebase = await new Promise<import("firebase/auth").User | null>((resolve) => {
        const unsub = onAuthStateChanged(firebaseAuth, (u) => {
          unsub();
          resolve(u);
        });
      });

      if (usuarioFirebase) {
        const perfil = await db.getPerfil(usuarioFirebase.uid);
        if (perfil) {
          set({ user: perfil, isAuthenticated: true, loading: false });
          return;
        }
      }
      set({ loading: false });
      return;
    }

    // --- motor local ---
    const usuarios = await listarUsuarios();
    if (usuarios.length === 0) {
      set({ loading: false, necesitaSetup: true });
      return;
    }

    const id = leerSesionLocal();
    if (id) {
      const perfil = await db.getPerfil(id);
      if (perfil) {
        set({ user: perfil, isAuthenticated: true, loading: false });
        return;
      }
    }
    set({ loading: false });
  },
}));
