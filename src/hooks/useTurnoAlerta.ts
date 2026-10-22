import { useCallback, useEffect, useMemo, useState } from "react";
import type { Inscripcion, Sesion } from "@/types";
import { useGymStore } from "@/stores/gymStore";
import { minutosParaEmpezar } from "@/lib/fechas";

/** Próximo turno confirmado del cliente, con la cuenta regresiva. */
export interface AlertaTurno {
  sesion: Sesion;
  /** Minutos que faltan para que empiece (0 o más). */
  minutos: number;
  /** Está dentro de la ventana de aviso configurada por el profesor. */
  activa: boolean;
}

/** Prefijo de la marca en `localStorage` para no avisar dos veces. */
const PREFIJO_MARCA = "oz:avisado:";

/** "42 min" · "2 h 15 min" */
export function textoMinutos(minutos: number): string {
  const abs = Math.abs(Math.round(minutos));
  if (abs < 60) return `${abs} min`;
  const horas = Math.floor(abs / 60);
  const resto = abs % 60;
  return resto === 0 ? `${horas} h` : `${horas} h ${resto} min`;
}

/** "empieza en 42 min" · "faltan 2 h 15 min" · "empezó hace 10 min" */
export function formatearCuentaRegresiva(minutos: number): string {
  if (minutos > 0) {
    return minutos < 60 ? `empieza en ${minutos} min` : `faltan ${textoMinutos(minutos)}`;
  }
  const pasados = Math.abs(minutos);
  return pasados < 60 ? `empezó hace ${pasados} min` : `empezó hace ${textoMinutos(pasados)}`;
}

/** Reloj que se refresca solo, para que las cuentas regresivas no queden viejas. */
export function useReloj(intervaloMs = 30_000): Date {
  const [ahora, setAhora] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setAhora(new Date()), intervaloMs);
    return () => clearInterval(id);
  }, [intervaloMs]);

  return ahora;
}

interface Candidato {
  inscripcion: Inscripcion;
  sesion: Sesion;
  minutos: number;
}

/**
 * Devuelve el próximo turno confirmado del cliente y una función para avisarle
 * por notificación del navegador.
 *
 * - `proximo` existe aunque todavía no esté en la ventana de aviso, así se puede
 *   mostrar la cuenta regresiva.
 * - `avisar()` no pide permisos: si `Notification.permission` no es "granted"
 *   no hace nada. La marca `oz:avisado:<inscripcionId>` evita repetir el aviso.
 */
export function useTurnoAlerta(alumnoId?: string): {
  proximo: AlertaTurno | null;
  avisar: () => void;
} {
  const { inscripciones, sesiones, config } = useGymStore();
  const ahora = useReloj();
  const minutosAviso = config?.minutos_aviso ?? 15;

  const candidatos = useMemo<Candidato[]>(() => {
    if (!alumnoId) return [];
    const porId = new Map(sesiones.map((s) => [s.id, s]));
    const lista: Candidato[] = [];

    for (const inscripcion of inscripciones) {
      if (inscripcion.alumno_id !== alumnoId) continue;
      if (inscripcion.estado !== "confirmada") continue;
      const sesion = porId.get(inscripcion.sesion_id);
      if (!sesion) continue;
      const minutos = minutosParaEmpezar(sesion.fecha, sesion.hora, ahora);
      if (minutos < 0) continue;
      lista.push({ inscripcion, sesion, minutos });
    }

    return lista.sort((a, b) => a.minutos - b.minutos);
  }, [alumnoId, inscripciones, sesiones, ahora]);

  const candidato = candidatos[0] ?? null;

  const proximo = useMemo<AlertaTurno | null>(() => {
    if (!candidato) return null;
    return {
      sesion: candidato.sesion,
      minutos: candidato.minutos,
      activa: candidato.minutos <= minutosAviso,
    };
  }, [candidato, minutosAviso]);

  const avisar = useCallback(() => {
    if (!candidato) return;
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission !== "granted") return;

    const clave = `${PREFIJO_MARCA}${candidato.inscripcion.id}`;
    try {
      if (localStorage.getItem(clave)) return;
      localStorage.setItem(clave, new Date().toISOString());
    } catch {
      // localStorage bloqueado: avisamos igual, sólo que sin marca.
    }

    try {
      new Notification(`Tu turno empieza en ${textoMinutos(candidato.minutos)}`, {
        body: `${candidato.sesion.actividad} · ${candidato.sesion.hora} · Coach ${candidato.sesion.coach}`,
        tag: candidato.inscripcion.id,
      });
    } catch {
      // Algunos navegadores no dejan crear notificaciones sin interacción.
    }
  }, [candidato]);

  // Si entra en la ventana de aviso, avisamos una sola vez.
  const activa = proximo?.activa ?? false;
  const minutosActual = proximo?.minutos ?? null;
  useEffect(() => {
    if (!activa) return;
    avisar();
  }, [activa, minutosActual, avisar]);

  return { proximo, avisar };
}
