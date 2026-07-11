import type { DiaSemana, TurnoConReservas, Profile, Pago, Asistencia } from "@/types";

export const COLORS = {
  bg: "#0c0e11",
  surface: "#16191e",
  surfaceHi: "#1e2228",
  border: "#2e343c",
  lime: "#D4FF3D",
  limeDim: "#8FA83A",
  steel: "#5B7C99",
  textHi: "#F2F3F0",
  textMid: "#B8BCC4",
  textMuted: "#7C8189",
  danger: "#FF5C5C",
};

export const FONTS = {
  display: "'Bebas Neue', 'Arial Narrow', sans-serif",
  body: "'IBM Plex Sans', sans-serif",
  mono: "'IBM Plex Mono', monospace",
};

export function getInitials(nombre: string): string {
  return nombre
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function formatMoney(amount: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
}

export function isPlanExpired(fechaFin: string): boolean {
  return new Date(fechaFin) < new Date();
}
