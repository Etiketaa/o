import { addDays, format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import type { DiaSemana } from "@/types";

const DIAS_SEMANA: DiaSemana[] = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

/** Fecha local en formato "YYYY-MM-DD" (sin líos de zona horaria). */
export function aISO(fecha: Date): string {
  return format(fecha, "yyyy-MM-dd");
}

/** Hoy en "YYYY-MM-DD". */
export function hoyISO(): string {
  return aISO(new Date());
}

/** Suma días a una fecha ISO y devuelve ISO. */
export function sumarDias(fechaISO: string, dias: number): string {
  return aISO(addDays(parseISO(fechaISO), dias));
}

/** Día de la semana de una fecha ISO. */
export function diaSemanaDe(fechaISO: string): DiaSemana {
  return DIAS_SEMANA[parseISO(fechaISO).getDay()];
}

/** "lunes 21 de octubre" */
export function fechaLarga(fechaISO: string): string {
  return format(parseISO(fechaISO), "EEEE d 'de' MMMM", { locale: es });
}

/** "21 oct" */
export function fechaCorta(fechaISO: string): string {
  return format(parseISO(fechaISO), "d MMM", { locale: es });
}

/** "Hoy" · "Mañana" · "Hoy" */
export function etiquetaDiaRelativo(fechaISO: string): string {
  const hoy = hoyISO();
  if (fechaISO === hoy) return "HOY";
  if (fechaISO === sumarDias(hoy, 1)) return "MAÑ";
  if (fechaISO === sumarDias(hoy, -1)) return "AYER";
  return "";
}

/** Instante real de una sesión (fecha + hora), en hora local. */
export function instanteSesion(fechaISO: string, hora: string): Date {
  const [y, m, d] = fechaISO.split("-").map(Number);
  const [hh, mm] = hora.split(":").map(Number);
  return new Date(y, (m || 1) - 1, d || 1, hh || 0, mm || 0, 0, 0);
}

/** ¿La sesión ya terminó? */
export function sesionTermino(fechaISO: string, hora: string, duracionMin: number, ahora = new Date()): boolean {
  return ahora.getTime() >= instanteSesion(fechaISO, hora).getTime() + duracionMin * 60_000;
}

/** ¿La sesión ya empezó? */
export function sesionEmpezo(fechaISO: string, hora: string, ahora = new Date()): boolean {
  return ahora.getTime() >= instanteSesion(fechaISO, hora).getTime();
}

/** Minutos que faltan para que empiece la sesión (negativo si ya empezó). */
export function minutosParaEmpezar(fechaISO: string, hora: string, ahora = new Date()): number {
  return Math.round((instanteSesion(fechaISO, hora).getTime() - ahora.getTime()) / 60_000);
}

/** Minutos que faltan para que termine la sesión. */
export function minutosParaTerminar(
  fechaISO: string,
  hora: string,
  duracionMin: number,
  ahora = new Date(),
): number {
  return Math.round(
    (instanteSesion(fechaISO, hora).getTime() + duracionMin * 60_000 - ahora.getTime()) / 60_000,
  );
}

/** Rango de la semana (lunes a domingo) que contiene la fecha. */
export function semanaDe(fechaISO: string): { inicio: string; fin: string } {
  const fecha = parseISO(fechaISO);
  const dia = fecha.getDay();
  const offset = dia === 0 ? -6 : 1 - dia;
  const inicio = addDays(fecha, offset);
  return { inicio: aISO(inicio), fin: aISO(addDays(inicio, 6)) };
}

/** Etiqueta de semana, ej. "20 – 26 oct". */
export function etiquetaSemana(fechaISO: string): string {
  const { inicio, fin } = semanaDe(fechaISO);
  return `${format(parseISO(inicio), "d")} – ${format(parseISO(fin), "d MMM")}`;
}

/** ¿La fecha ISO cae dentro del mes en curso? */
export function esDelMesActual(fechaISO: string, ahora = new Date()): boolean {
  return fechaISO.startsWith(format(ahora, "yyyy-MM"));
}
