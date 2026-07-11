export type UserRole = "admin" | "alumno";

export interface Profile {
  id: string;
  email: string;
  nombre: string;
  role: UserRole;
  plan: PlanType;
  estado: "activo" | "vencido";
  telefono: string;
  avatar_url?: string;
  created_at: string;
}

export type PlanType = "Full" | "3x semana" | "2x semana";

export type DiaSemana = "Lun" | "Mar" | "Mié" | "Jue" | "Vie" | "Sáb" | "Dom";

export const DIAS: DiaSemana[] = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

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

export interface Reserva {
  id: string;
  turno_id: string;
  alumno_id: string;
  fecha: string;
  estado: "activa" | "cancelada";
  es_fijo: boolean;
  created_at: string;
}

export interface Asistencia {
  id: string;
  turno_id: string;
  alumno_id: string;
  fecha: string;
  presente: boolean;
  created_at: string;
}

export interface Pago {
  id: string;
  alumno_id: string;
  monto: number;
  fecha: string;
  metodo: "efectivo" | "transferencia" | "tarjeta" | "mercadopago";
  estado: "pagado" | "pendiente" | "vencido";
  descripcion: string;
  created_at: string;
}

export interface Membresia {
  id: string;
  alumno_id: string;
  plan: PlanType;
  fecha_inicio: string;
  fecha_fin: string;
  estado: "activa" | "vencida" | "cancelada";
  created_at: string;
}

export interface TurnoConReservas extends Turno {
  inscritos: string[];
  ocupados: number;
  fijos: string[];
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
