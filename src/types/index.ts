export type UserRole = "admin" | "alumno";

export type PlanType = "Full" | "3x semana" | "2x semana";

export type DiaSemana = "Lun" | "Mar" | "Mié" | "Jue" | "Vie" | "Sáb" | "Dom";

export const DIAS: DiaSemana[] = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

/** Días en los que el gym abre (el resto no genera turnos). */
export type DiaLaborable = Extract<DiaSemana, "Lun" | "Mar" | "Mié" | "Jue" | "Vie">;

export type Franja = "manana" | "tarde" | "ambas";

/** Tramo horario de apertura, ej. 08:00 → 11:00. */
export interface TramoHorario {
  inicio: string;
  fin: string;
}

export type EstadoInscripcion = "confirmada" | "cancelada" | "asistio" | "faltó";

export type Feedback = "up" | "down";

/** Perfil de cliente o profesor. */
export interface Profile {
  id: string;
  email: string;
  nombre: string;
  role: UserRole;
  plan: PlanType;
  estado: "activo" | "vencido";
  telefono: string;
  avatar_url?: string;
  /** Veces por semana que el cliente dice venir. */
  frecuencia_semana: number;
  /** Veces por mes que el cliente se compromete a venir. */
  veces_mes_objetivo: number;
  /** Franja en la que prefiere entrenar. */
  franja: Franja;
  /** Horarios que el cliente le pidió al profesor al registrarse. */
  slots_preferidos: SlotPreferido[];
  created_at: string;
}

/** Horario semanal de referencia elegido por el cliente. */
export interface SlotPreferido {
  dia: DiaSemana;
  hora: string;
}

/** Configuración general del gym: horarios de apertura, duración, avisos. */
export interface GymConfig {
  id: string;
  nombre: string;
  direccion: string;
  dias_activos: DiaSemana[];
  franjas: TramoHorario[];
  /** Duración de cada turno, en minutos. */
  duracion_min: number;
  /** Separación entre inicios de turno, en minutos. */
  paso_min: number;
  /** Minutos de anticipación para avisar que el turno empieza. */
  minutos_aviso: number;
  actualizado_at: string;
}

/** Plantilla semanal: qué actividad hay en cada horario. */
export interface Turno {
  id: string;
  dia: DiaSemana;
  hora: string;
  actividad: string;
  coach: string;
  cupo: number;
  activo: boolean;
  created_at: string;
}

/** Sesión concreta de una fecha. Es lo que el cliente reserva. */
export interface Sesion {
  id: string;
  fecha: string;
  hora: string;
  actividad: string;
  coach: string;
  cupo: number;
  turno_id?: string | null;
  created_at: string;
}

/** Inscripción de un cliente a una sesión, con su estado y su feedback. */
export interface Inscripcion {
  id: string;
  sesion_id: string;
  alumno_id: string;
  estado: EstadoInscripcion;
  feedback?: Feedback | null;
  comentario?: string | null;
  feedback_at?: string | null;
  created_at: string;
}

export interface SesionConInscripciones extends Sesion {
  inscritos: Inscripcion[];
  ocupados: number;
  completo: boolean;
}

export interface TurnoConReservas extends Turno {
  inscritos: string[];
  ocupados: number;
  fijos: string[];
}

export interface Pago {
  id: string;
  alumno_id: string;
  monto: number;
  fecha: string;
  metodo: "efectivo" | "transferencia" | "tarjeta" | "mercadopago";
  estado: "pagado" | "pendiente" | "vencido";
  descripcion: string;
  mes_pago: number;
  anio_pago: number;
  comprobante_url?: string;
  comprobante_tipo?: "imagen" | "pdf";
  comprobante_nombre?: string;
  verificado: boolean;
  verificado_por?: string;
  verificado_at?: string;
  notas_admin?: string;
  created_at: string;
}

export interface PagoConfig {
  id: string;
  dia_limite: number;
  monto_base: number;
  cvu: string;
  alias: string;
  titular: string;
  banco: string;
  activo: boolean;
  created_at: string;
}

export type EstadoPago = "pagado" | "pendiente" | "verificando" | "no_registrado";

export interface Membresia {
  id: string;
  alumno_id: string;
  plan: PlanType;
  fecha_inicio: string;
  fecha_fin: string;
  estado: "activa" | "vencida" | "cancelada";
  created_at: string;
}

export interface PlanActividad {
  id: string;
  plan: PlanType;
  actividad: string;
  created_at: string;
}

export interface DashboardStats {
  totalAlumnos: number;
  alumnosActivos: number;
  turnosHoy: number;
  asistenciaHoy: number;
  ingresosMes: number;
  alumnosNuevosMes: number;
}
