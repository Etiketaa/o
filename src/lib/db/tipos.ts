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

/**
 * Contrato de persistencia. Hay dos motores:
 *  - `local`    → IndexedDB del navegador (funciona offline, sin backend).
 *  - `supabase` → Postgres de Supabase (requiere VITE_SUPABASE_URL / KEY).
 *
 * La lógica de negocio nunca habla con el motor directamente: siempre pasa por acá.
 */
export interface DataStore {
  // --- configuración del gym ---
  getConfig(): Promise<GymConfig | null>;
  saveConfig(config: GymConfig): Promise<void>;

  // --- perfiles ---
  listPerfiles(): Promise<Profile[]>;
  getPerfil(id: string): Promise<Profile | null>;
  savePerfil(perfil: Profile): Promise<void>;

  // --- plantilla semanal (qué actividad hay en cada horario) ---
  listTurnos(): Promise<Turno[]>;
  saveTurno(turno: Turno): Promise<void>;
  deleteTurno(id: string): Promise<void>;

  // --- sesiones con fecha real ---
  listSesiones(desde: string, hasta: string): Promise<Sesion[]>;
  ensureSesiones(fechas: string[]): Promise<Sesion[]>;

  // --- inscripciones ---
  listInscripciones(filtro?: { sesionIds?: string[]; alumnoIds?: string[] }): Promise<Inscripcion[]>;
  crearInscripcion(sesionId: string, alumnoId: string): Promise<Inscripcion>;
  actualizarInscripcion(id: string, cambios: Partial<Inscripcion>): Promise<void>;

  // --- pagos (se conservan del sistema anterior) ---
  listPagos(): Promise<Pago[]>;
  savePago(pago: Pago): Promise<void>;
  getPagoConfig(): Promise<PagoConfig | null>;
  savePagoConfig(config: PagoConfig): Promise<void>;

  // --- actividades incluidas en cada plan ---
  listPlanActividades(): Promise<PlanActividad[]>;
  savePlanActividad(planActividad: PlanActividad): Promise<void>;
  deletePlanActividad(id: string): Promise<void>;

  /** Identifica el motor, para mostrarlo en la interfaz. */
  readonly motor: "local" | "supabase" | "firebase";
}
