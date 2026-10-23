import type { DiaSemana, GymConfig, PlanActividad, PlanType, Turno } from "@/types";
import { generarSlots } from "@/lib/horarios";

/** Horarios por defecto: lunes a viernes, 8–11 y 13–21. */
export const CONFIG_POR_DEFECTO: GymConfig = {
  id: "unica",
  nombre: "OZ Entrenamiento",
  direccion: "Ingeniero White, Bahía Blanca",
  dias_activos: ["Lun", "Mar", "Mié", "Jue", "Vie"],
  franjas: [
    { inicio: "08:00", fin: "11:00" },
    { inicio: "13:00", fin: "21:00" },
  ],
  duracion_min: 60,
  paso_min: 30,
  minutos_aviso: 15,
  actualizado_at: new Date().toISOString(),
};

interface PlantillaActividad {
  actividad: string;
  coach: string;
  cupo: number;
}

const MANANA: PlantillaActividad[] = [
  { actividad: "Funcional", coach: "Kathy", cupo: 12 },
  { actividad: "Pesas Libres", coach: "Kathy", cupo: 8 },
  { actividad: "Movilidad", coach: "Kathy", cupo: 10 },
];

const TARDE: PlantillaActividad[] = [
  { actividad: "CrossTraining", coach: "Kathy", cupo: 14 },
  { actividad: "Funcional", coach: "Kathy", cupo: 12 },
  { actividad: "Pesas Libres", coach: "Kathy", cupo: 8 },
  { actividad: "Movilidad", coach: "Kathy", cupo: 10 },
];

/**
 * Arma la grilla semanal por defecto: 5 días × 20 horarios = 100 turnos.
 * El profesor puede editarla después desde Configuración.
 */
/** ¿La hora es entera (ej. "08:00", "09:00")? */
function esHoraEntera(hora: string): boolean {
  const [, m] = hora.split(":").map(Number);
  return m === 0;
}

export function generarPlantillaPorDefecto(config: GymConfig = CONFIG_POR_DEFECTO): Turno[] {
  const dias = config.dias_activos;
  const turnos: Turno[] = [];

  for (const dia of dias) {
    let iManana = 0;
    let iTarde = 0;

    for (const tramo of config.franjas) {
      const slots = generarSlots({ ...config, franjas: [tramo] });
      const rotacion = tramo.inicio < "12:00" ? MANANA : TARDE;

      for (const hora of slots) {
        const esManana = tramo.inicio < "12:00";
        const indice = esManana ? iManana++ : iTarde++;
        const item = rotacion[indice % rotacion.length];

        turnos.push({
          id: crypto.randomUUID(),
          dia: dia as DiaSemana,
          hora,
          actividad: item.actividad,
          coach: item.coach,
          cupo: esHoraEntera(hora) ? 10 : 5,
          activo: true,
          created_at: new Date().toISOString(),
        });
      }
    }
  }

  return turnos;
}

/** Qué actividades incluye cada plan. */
export const ACTIVIDADES_POR_PLAN: Record<PlanType, string[]> = {
  Full: ["Funcional", "Pesas Libres", "CrossTraining", "Movilidad"],
  "3x semana": ["Funcional", "Pesas Libres", "Movilidad"],
  "2x semana": ["Pesas Libres", "Movilidad"],
};

/** Turnos aproximados por mes para cada frecuencia semanal. */
export const VECES_MES_POR_FRECUENCIA: Record<number, number> = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
};

/** Frecuencia semanal sugerida a partir de un plan. */
export function frecuenciaDePlan(plan: PlanType): number {
  if (plan === "Full") return 4;
  if (plan === "3x semana") return 3;
  return 2;
}

/** Plan que corresponde a una frecuencia semanal. */
export function planDeFrecuencia(frecuencia: number): PlanType {
  if (frecuencia >= 4) return "Full";
  if (frecuencia === 3) return "3x semana";
  return "2x semana";
}

export function planActividadesPorDefecto(): PlanActividad[] {
  const filas: PlanActividad[] = [];
  for (const [plan, actividades] of Object.entries(ACTIVIDADES_POR_PLAN)) {
    for (const actividad of actividades) {
      filas.push({
        id: crypto.randomUUID(),
        plan: plan as PlanType,
        actividad,
        created_at: new Date().toISOString(),
      });
    }
  }
  return filas;
}
