import type { DataStore } from "./tipos";
import { localStore } from "./local";
import { supabaseStore } from "./supabase";
import { firebaseStore } from "./firebase";

export type Motor = "local" | "supabase" | "firebase";

let motorActual: Motor = "local";
let promesaDeteccion: Promise<Motor> | null = null;

/**
 * ¿El backend de Supabase configurado responde? Un proyecto borrado o pausado
 * deja de resolver DNS, y el `.env` sigue apuntando ahí.
 * Si no responde, caemos a modo local en vez de romper la app.
 */
async function respondeSupabase(): Promise<boolean> {
  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  if (!url) return false;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  try {
    const res = await fetch(`${url.replace(/\/$/, "")}/rest/v1/`, {
      method: "HEAD",
      signal: controller.signal,
    });
    return res.ok || res.status === 401 || res.status === 403;
  } catch {
    return false;
  } finally {
    clearTimeout(timeout);
  }
}

/** Detecta (una sola vez) qué motor usar. */
export function detectarMotor(): Promise<Motor> {
  if (!promesaDeteccion) {
    promesaDeteccion = (async () => {
      const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined;
      if (projectId) {
        motorActual = "firebase";
        return motorActual;
      }

      const ok = await respondeSupabase();
      motorActual = ok ? "supabase" : "local";
      if (!ok && import.meta.env.VITE_SUPABASE_URL) {
        console.warn(
          "[db] El backend configurado no responde. Se usa el motor local (IndexedDB).",
        );
      }
      return motorActual;
    })();
  }
  return promesaDeteccion;
}

export function getMotor(): Motor {
  return motorActual;
}

/**
 * Acceso al motor activo. Se resuelve en el momento de la llamada, así que
 * funciona incluso si se cambia de motor después de importar el módulo.
 */
export const db = new Proxy({} as DataStore, {
  get(_target, prop: string) {
    const store =
      motorActual === "firebase"
        ? firebaseStore
        : motorActual === "supabase"
          ? supabaseStore
          : localStore;
    const valor = (store as unknown as Record<string, unknown>)[prop];
    if (typeof valor === "function") {
      return (valor as (...args: unknown[]) => unknown).bind(store);
    }
    return valor;
  },
});

export type { DataStore };
