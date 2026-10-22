import type { DiaSemana, Franja, GymConfig, TramoHorario } from "@/types";

/** "08:30" → 510 minutos desde medianoche. */
export function horaAMinutos(hora: string): number {
  const [h, m] = hora.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

/** 510 → "08:30". */
export function minutosAHora(min: number): string {
  const h = Math.floor(min / 60) % 24;
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/**
 * Genera los horarios de INICIO de turno dentro de los tramos de apertura.
 * Un turno solo entra si termina antes del cierre de su tramo.
 *
 * Con 08:00-11:00, 13:00-21:00, duración 60 y paso 30:
 * 08:00 · 08:30 · 09:00 · 09:30 · 10:00 | 13:00 … 20:00  → 20 horarios por día.
 */
export function generarSlots(config: Pick<GymConfig, "franjas" | "paso_min" | "duracion_min">): string[] {
  const slots: string[] = [];
  for (const tramo of config.franjas) {
    const inicio = horaAMinutos(tramo.inicio);
    const fin = horaAMinutos(tramo.fin);
    for (let m = inicio; m + config.duracion_min <= fin; m += config.paso_min) {
      slots.push(minutosAHora(m));
    }
  }
  return [...new Set(slots)].sort((a, b) => horaAMinutos(a) - horaAMinutos(b));
}

/** ¿Se solapan dos turnos? (8:00-9:00 y 8:30-9:30 sí). */
export function turnosSeSolapan(horaA: string, horaB: string, duracionMin: number): boolean {
  const a = horaAMinutos(horaA);
  const b = horaAMinutos(horaB);
  return a < b + duracionMin && b < a + duracionMin;
}

/** Mañana es todo lo que arranca antes de las 12:00. */
export function franjaDeHora(hora: string): Exclude<Franja, "ambas"> {
  return horaAMinutos(hora) < 12 * 60 ? "manana" : "tarde";
}

export function etiquetaFranja(franja: Franja): string {
  if (franja === "manana") return "Mañana";
  if (franja === "tarde") return "Tarde";
  return "Ambos";
}

/** Etiqueta legible de un tramo, ej. "08:00 – 11:00". */
export function etiquetaTramo(tramo: TramoHorario): string {
  return `${tramo.inicio} – ${tramo.fin}`;
}

/** Suma minutos a un horario string, mee horas que pasan de medianoche. */
export function sumarMinutos(hora: string, minutos: number): string {
  return minutosAHora((horaAMinutos(hora) + minutos + 24 * 60) % (24 * 60));
}

/** Nombre del día a partir del índice de la semana (0 = lunes). */
export function diaSemanaDesdeIndice(indice: number): DiaSemana {
  const dias: DiaSemana[] = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
  return dias[((indice % 7) + 7) % 7];
}

export const NOMBRES_DIA: Record<DiaSemana, string> = {
  Lun: "lunes",
  Mar: "martes",
  Mié: "miércoles",
  Jue: "jueves",
  Vie: "viernes",
  Sáb: "sábado",
  Dom: "domingo",
};

export const NOMBRES_DIA_CORTO: Record<DiaSemana, string> = {
  Lun: "LUN",
  Mar: "MAR",
  Mié: "MIÉ",
  Jue: "JUE",
  Vie: "VIE",
  Sáb: "SÁB",
  Dom: "DOM",
};
