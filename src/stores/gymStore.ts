import { create } from "zustand";
import type {
  EstadoInscripcion,
  Feedback,
  GymConfig,
  Inscripcion,
  Pago,
  PagoConfig,
  PlanActividad,
  PlanType,
  Profile,
  Sesion,
  Turno,
} from "@/types";
import { db, detectarMotor, getMotor, type Motor } from "@/lib/db";
import {
  ACTIVIDADES_POR_PLAN,
  CONFIG_POR_DEFECTO,
  generarPlantillaPorDefecto,
  planActividadesPorDefecto,
} from "@/lib/semilla";
import { hoyISO, semanaDe, sumarDias } from "@/lib/fechas";

interface FiltroInscripciones {
  sesionIds?: string[];
  alumnoIds?: string[];
}

interface GymState {
  motor: Motor;
  config: GymConfig | null;
  perfiles: Profile[];
  turnos: Turno[];
  sesiones: Sesion[];
  inscripciones: Inscripcion[];
  pagos: Pago[];
  pagoConfig: PagoConfig | null;
  planActividades: PlanActividad[];
  loading: boolean;
  initialized: boolean;
  error: string | null;

  init: () => Promise<void>;
  cargarConfig: () => Promise<void>;
  guardarConfig: (config: GymConfig) => Promise<void>;
  cargarPlantilla: () => Promise<void>;
  guardarTurno: (turno: Turno) => Promise<void>;
  borrarTurno: (id: string) => Promise<void>;
  cargarSesiones: (desde: string, hasta: string) => Promise<void>;
  asegurarSesiones: (fechas: string[]) => Promise<void>;
  cargarInscripciones: (filtro?: FiltroInscripciones) => Promise<void>;
  inscribir: (sesionId: string, alumnoId: string) => Promise<Inscripcion>;
  cancelarInscripcion: (id: string) => Promise<void>;
  marcarAsistencia: (id: string, estado: EstadoInscripcion) => Promise<void>;
  guardarFeedback: (id: string, feedback: Feedback, comentario?: string) => Promise<void>;
  cargarPagos: () => Promise<void>;
  guardarPago: (pago: Pago) => Promise<void>;
  guardarPerfil: (perfil: Profile) => Promise<void>;
}

export const useGymStore = create<GymState>((set, get) => ({
  motor: "local",
  config: null,
  perfiles: [],
  turnos: [],
  sesiones: [],
  inscripciones: [],
  pagos: [],
  pagoConfig: null,
  planActividades: [],
  loading: false,
  initialized: false,
  error: null,

  /**
   * Arranque: detecta el motor, siembra la configuración por defecto si la base
   * está vacía y materializa las sesiones de la semana en curso.
   */
  init: async () => {
    if (get().initialized) return;
    set({ loading: true, error: null });

    try {
      const motor = await detectarMotor();
      set({ motor });

      let config = await db.getConfig();
      if (!config) {
        config = { ...CONFIG_POR_DEFECTO, actualizado_at: new Date().toISOString() };
        await db.saveConfig(config);
      }

      let turnos = await db.listTurnos();
      if (turnos.length === 0) {
        turnos = generarPlantillaPorDefecto(config);
        for (const turno of turnos) await db.saveTurno(turno);
      }

      let planActividades = await db.listPlanActividades();
      if (planActividades.length === 0) {
        planActividades = planActividadesPorDefecto();
        for (const pa of planActividades) await db.savePlanActividad(pa);
      }

      const [perfiles, sesiones, inscripciones, pagos, pagoConfig] = await Promise.all([
        db.listPerfiles(),
        Promise.resolve([] as Sesion[]),
        db.listInscripciones(),
        db.listPagos(),
        db.getPagoConfig(),
      ]);

      set({
        config,
        turnos,
        planActividades,
        perfiles,
        inscripciones,
        pagos,
        pagoConfig,
        initialized: true,
      });

      const { inicio, fin } = semanaDe(hoyISO());
      await get().asegurarSesiones(
        Array.from({ length: 7 }, (_, i) => sumarDias(inicio, i)),
      );
      await get().cargarSesiones(inicio, fin);
    } catch (error) {
      console.error("[gymStore] Error al inicializar:", error);
      set({ error: error instanceof Error ? error.message : "Error desconocido" });
    } finally {
      set({ loading: false });
    }
  },

  cargarConfig: async () => {
    const config = await db.getConfig();
    if (config) set({ config });
  },

  guardarConfig: async (config) => {
    const actualizada = { ...config, actualizado_at: new Date().toISOString() };
    await db.saveConfig(actualizada);
    set({ config: actualizada });
  },

  cargarPlantilla: async () => {
    const turnos = await db.listTurnos();
    set({ turnos });
  },

  guardarTurno: async (turno) => {
    await db.saveTurno(turno);
    set((state) => ({
      turnos: [...state.turnos.filter((t) => t.id !== turno.id), turno].sort((a, b) =>
        a.dia === b.dia ? a.hora.localeCompare(b.hora) : a.dia.localeCompare(b.dia),
      ),
    }));
  },

  borrarTurno: async (id) => {
    await db.deleteTurno(id);
    set((state) => ({ turnos: state.turnos.filter((t) => t.id !== id) }));
  },

  cargarSesiones: async (desde, hasta) => {
    const sesiones = await db.listSesiones(desde, hasta);
    set({ sesiones });
  },

  asegurarSesiones: async (fechas) => {
    if (fechas.length === 0) return;
    const sesiones = await db.ensureSesiones(fechas);
    set((state) => {
      const porId = new Map(state.sesiones.map((s) => [s.id, s]));
      for (const sesion of sesiones) porId.set(sesion.id, sesion);
      return {
        sesiones: [...porId.values()].sort((a, b) =>
          a.fecha === b.fecha ? a.hora.localeCompare(b.hora) : a.fecha.localeCompare(b.fecha),
        ),
      };
    });
  },

  cargarInscripciones: async (filtro) => {
    const inscripciones = await db.listInscripciones(filtro);
    set((state) => {
      if (!filtro) return { inscripciones };
      // Sólo reemplazamos las del conjunto consultado.
      const ids = new Set(inscripciones.map((i) => i.id));
      const fueraDeFiltro = state.inscripciones.filter(
        (i) =>
          !(filtro.sesionIds?.includes(i.sesion_id) ||
            filtro.alumnoIds?.includes(i.alumno_id)) &&
          !ids.has(i.id),
      );
      return { inscripciones: [...inscripciones, ...fueraDeFiltro] };
    });
  },

  inscribir: async (sesionId, alumnoId) => {
    const sesion = get().sesiones.find((s) => s.id === sesionId);
    const ocupados = get().inscripciones.filter(
      (i) => i.sesion_id === sesionId && i.estado !== "cancelada",
    ).length;

    if (sesion && ocupados >= sesion.cupo) {
      throw new Error("No queda cupo en ese turno");
    }

    const inscripcion = await db.crearInscripcion(sesionId, alumnoId);
    set((state) => ({
      inscripciones: [
        ...state.inscripciones.filter((i) => i.id !== inscripcion.id),
        inscripcion,
      ],
    }));
    return inscripcion;
  },

  cancelarInscripcion: async (id) => {
    await db.actualizarInscripcion(id, { estado: "cancelada" });
    set((state) => ({
      inscripciones: state.inscripciones.map((i) =>
        i.id === id ? { ...i, estado: "cancelada" as EstadoInscripcion } : i,
      ),
    }));
  },

  marcarAsistencia: async (id, estado) => {
    await db.actualizarInscripcion(id, { estado });
    set((state) => ({
      inscripciones: state.inscripciones.map((i) => (i.id === id ? { ...i, estado } : i)),
    }));
  },

  guardarFeedback: async (id, feedback, comentario = "") => {
    await db.actualizarInscripcion(id, {
      feedback,
      comentario,
      feedback_at: new Date().toISOString(),
    });
    set((state) => ({
      inscripciones: state.inscripciones.map((i) =>
        i.id === id ? { ...i, feedback, comentario, feedback_at: new Date().toISOString() } : i,
      ),
    }));
  },

  cargarPagos: async () => {
    const [pagos, pagoConfig] = await Promise.all([db.listPagos(), db.getPagoConfig()]);
    set({ pagos, pagoConfig });
  },

  guardarPago: async (pago) => {
    await db.savePago(pago);
    set((state) => ({ pagos: [...state.pagos.filter((p) => p.id !== pago.id), pago] }));
  },

  guardarPerfil: async (perfil) => {
    await db.savePerfil(perfil);
    set((state) => ({
      perfiles: [...state.perfiles.filter((p) => p.id !== perfil.id), perfil],
    }));
  },
}));

/** Actividades que incluye un plan, según lo cargado de la base. */
export function actividadesDePlan(
  planActividades: PlanActividad[],
  plan: PlanType,
): string[] {
  const desdeBase = planActividades
    .filter((pa) => pa.plan === plan)
    .map((pa) => pa.actividad);
  return desdeBase.length > 0 ? desdeBase : (ACTIVIDADES_POR_PLAN[plan] ?? []);
}

/** Motor activo (para mostrarlo en la interfaz). */
export function motorActivo(): Motor {
  return getMotor();
}
