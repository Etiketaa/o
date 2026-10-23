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
import { supabase } from "@/lib/supabase";
import { generarSesionesFaltantes } from "@/lib/sesiones";

/**
 * Motor Supabase. Mapea 1:1 con el schema de `supabase/migrations/`.
 *
 * OJO: este motor no se pudo verificar contra un proyecto real (el proyecto
 * original fue borrado). Cuando se cree un proyecto nuevo hay que correr las
 * migraciones y revisar los nombres de columnas.
 */
export const supabaseStore: DataStore = {
  motor: "supabase",

  async getConfig() {
    const { data } = await supabase.from("gym_config").select("*").eq("id", "unica").maybeSingle();
    return (data as GymConfig | null) ?? null;
  },

  async saveConfig(config) {
    await supabase.from("gym_config").upsert({ ...config, id: "unica" });
  },

  async listPerfiles() {
    const { data } = await supabase.from("profiles").select("*").order("nombre");
    return (data as Profile[]) ?? [];
  },

  async getPerfil(id) {
    const { data } = await supabase.from("profiles").select("*").eq("id", id).maybeSingle();
    return (data as Profile | null) ?? null;
  },

  async savePerfil(perfil) {
    if (perfil.role === "admin") {
      const { data } = await supabase.from("profiles").select("id, role");
      const perfiles = (data as Array<{ id: string; role: string }> | null) ?? [];
      if (perfiles.some((p) => p.role === "admin" && p.id !== perfil.id)) {
        throw new Error("Ya existe un profesor registrado");
      }
    }
    await supabase.from("profiles").upsert(perfil);
  },

  async listTurnos() {
    const { data } = await supabase.from("turnos").select("*").order("hora");
    return (data as Turno[]) ?? [];
  },

  async saveTurno(turno) {
    await supabase.from("turnos").upsert(turno);
  },

  async deleteTurno(id) {
    await supabase.from("turnos").delete().eq("id", id);
  },

  async listSesiones(desde, hasta) {
    const { data } = await supabase
      .from("sesiones")
      .select("*")
      .gte("fecha", desde)
      .lte("fecha", hasta)
      .order("fecha")
      .order("hora");
    return (data as Sesion[]) ?? [];
  },

  async ensureSesiones(fechas) {
    if (fechas.length === 0) return [];
    const desde = [...fechas].sort()[0];
    const hasta = [...fechas].sort()[fechas.length - 1];

    const [{ data: turnos }, { data: existentes }] = await Promise.all([
      supabase.from("turnos").select("*").eq("activo", true),
      supabase.from("sesiones").select("*").gte("fecha", desde).lte("fecha", hasta),
    ]);

    const nuevos = generarSesionesFaltantes(fechas, (turnos as Turno[]) ?? [], (existentes as Sesion[]) ?? []);

    if (nuevos.length > 0) {
      await supabase
        .from("sesiones")
        .upsert(nuevos, { onConflict: "fecha,hora,actividad", ignoreDuplicates: true });
    }

    return [...(existentes as Sesion[] | null ?? []), ...nuevos].filter((s) => fechas.includes(s.fecha));
  },

  async listInscripciones(filtro) {
    let query = supabase.from("inscripciones").select("*");
    if (filtro?.sesionIds?.length) query = query.in("sesion_id", filtro.sesionIds);
    if (filtro?.alumnoIds?.length) query = query.in("alumno_id", filtro.alumnoIds);
    const { data } = await query;
    return (data as Inscripcion[]) ?? [];
  },

  async crearInscripcion(sesionId, alumnoId) {
    const { data: existentes } = await supabase
      .from("inscripciones")
      .select("*")
      .eq("sesion_id", sesionId)
      .eq("alumno_id", alumnoId)
      .neq("estado", "cancelada")
      .maybeSingle();

    if (existentes) return existentes as Inscripcion;

    const fila: Omit<Inscripcion, "id" | "created_at"> = {
      sesion_id: sesionId,
      alumno_id: alumnoId,
      estado: "confirmada",
      feedback: null,
      comentario: null,
      feedback_at: null,
    };

    const { data, error } = await supabase
      .from("inscripciones")
      .insert({ ...fila, id: crypto.randomUUID(), created_at: new Date().toISOString() })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data as Inscripcion;
  },

  async actualizarInscripcion(id, cambios) {
    const { error } = await supabase.from("inscripciones").update(cambios).eq("id", id);
    if (error) throw new Error(error.message);
  },

  async listPagos() {
    const { data } = await supabase.from("pagos").select("*").order("mes_pago", { ascending: false });
    return (data as Pago[]) ?? [];
  },

  async savePago(pago) {
    await supabase.from("pagos").upsert(pago);
  },

  async getPagoConfig() {
    const { data } = await supabase.from("pago_config").select("*").eq("id", "unica").maybeSingle();
    return (data as PagoConfig | null) ?? null;
  },

  async savePagoConfig(config) {
    await supabase.from("pago_config").upsert({ ...config, id: "unica" });
  },

  async listPlanActividades() {
    const { data } = await supabase.from("plan_actividades").select("*");
    return (data as PlanActividad[]) ?? [];
  },

  async savePlanActividad(planActividad) {
    await supabase.from("plan_actividades").upsert(planActividad);
  },

  async deletePlanActividad(id) {
    await supabase.from("plan_actividades").delete().eq("id", id);
  },
};
