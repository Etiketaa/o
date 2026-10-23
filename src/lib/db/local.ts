import type {
  GymConfig,
  Inscripcion,
  Pago,
  PagoConfig,
  PlanActividad,
  Profile,
  Sesion,
  Turno,
} from "@/types";
import type { DataStore } from "./tipos";
import {
  idbBorrar,
  idbGuardar,
  idbGuardarVarios,
  idbObtener,
  idbTodos,
  idbVaciar,
} from "./idb";
import { generarSesionesFaltantes } from "@/lib/sesiones";

/**
 * Motor local: todo vive en el IndexedDB del navegador.
 * Es el que corre cuando no hay un proyecto de Supabase configurado.
 * Permite usar el turnero completo (reservar, control, feedback, puntaje)
 * sin backend, incluso sin conexión.
 */
export const localStore: DataStore = {
  motor: "local",

  async getConfig() {
    const config = await idbObtener<GymConfig>("gym_config", "unica");
    return config ?? null;
  },

  async saveConfig(config) {
    await idbGuardar("gym_config", { ...config, id: "unica" });
  },

  async listPerfiles() {
    return idbTodos<Profile>("perfiles");
  },

  async getPerfil(id) {
    return (await idbObtener<Profile>("perfiles", id)) ?? null;
  },

  async savePerfil(perfil) {
    if (perfil.role === "admin") {
      const perfiles = await idbTodos<Profile>("perfiles");
      if (perfiles.some((p) => p.role === "admin" && p.id !== perfil.id)) {
        throw new Error("Ya existe un profesor registrado");
      }
    }
    await idbGuardar("perfiles", perfil);
  },

  async listTurnos() {
    return idbTodos<Turno>("turnos");
  },

  async saveTurno(turno) {
    await idbGuardar("turnos", turno);
  },

  async deleteTurno(id) {
    await idbBorrar("turnos", id);
  },

  async listSesiones(desde, hasta) {
    const todas = await idbTodos<Sesion>("sesiones");
    return todas.filter((s) => s.fecha >= desde && s.fecha <= hasta);
  },

  async ensureSesiones(fechas) {
    const [turnos, existentes] = await Promise.all([
      localStore.listTurnos(),
      localStore.listSesiones(fechas[0] ?? "", fechas[fechas.length - 1] ?? ""),
    ]);
    const nuevos = generarSesionesFaltantes(fechas, turnos, existentes);
    await idbGuardarVarios("sesiones", nuevos);
    return [...existentes, ...nuevos].filter((s) => fechas.includes(s.fecha));
  },

  async listInscripciones(filtro) {
    const todas = await idbTodos<Inscripcion>("inscripciones");
    if (!filtro) return todas;
    return todas.filter((i) => {
      if (filtro.sesionIds && !filtro.sesionIds.includes(i.sesion_id)) return false;
      if (filtro.alumnoIds && !filtro.alumnoIds.includes(i.alumno_id)) return false;
      return true;
    });
  },

  async crearInscripcion(sesionId, alumnoId) {
    const existentes = await localStore.listInscripciones({ sesionIds: [sesionId] });
    const previa = existentes.find((i) => i.alumno_id === alumnoId && i.estado !== "cancelada");
    if (previa) return previa;

    const inscripcion: Inscripcion = {
      id: crypto.randomUUID(),
      sesion_id: sesionId,
      alumno_id: alumnoId,
      estado: "confirmada",
      feedback: null,
      comentario: null,
      feedback_at: null,
      created_at: new Date().toISOString(),
    };
    await idbGuardar("inscripciones", inscripcion);
    return inscripcion;
  },

  async actualizarInscripcion(id, cambios) {
    const actual = await idbObtener<Inscripcion>("inscripciones", id);
    if (!actual) throw new Error(`No existe la inscripción ${id}`);
    await idbGuardar("inscripciones", { ...actual, ...cambios });
  },

  async listPagos() {
    return idbTodos<Pago>("pagos");
  },

  async savePago(pago) {
    await idbGuardar("pagos", pago);
  },

  async getPagoConfig() {
    return (await idbObtener<PagoConfig>("pago_config", "unica")) ?? null;
  },

  async savePagoConfig(config) {
    await idbGuardar("pago_config", { ...config, id: "unica" });
  },

  async listPlanActividades() {
    return idbTodos<PlanActividad>("plan_actividades");
  },

  async savePlanActividad(planActividad) {
    await idbGuardar("plan_actividades", planActividad);
  },

  async deletePlanActividad(id) {
    await idbBorrar("plan_actividades", id);
  },
};

/** Borra todos los datos locales (útil para "empezar de cero"). */
export async function borrarTodoLocal(): Promise<void> {
  await Promise.all([
    idbVaciar("perfiles"),
    idbVaciar("usuarios"),
    idbVaciar("turnos"),
    idbVaciar("sesiones"),
    idbVaciar("inscripciones"),
    idbVaciar("pagos"),
    idbVaciar("pago_config"),
    idbVaciar("gym_config"),
    idbVaciar("plan_actividades"),
  ]);
}
