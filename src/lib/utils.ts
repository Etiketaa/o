
export const COLORS = {
  bg: "#060607",
  surface: "#0d0e10",
  surfaceHi: "#15171a",
  border: "#24282d",
  borderHi: "#3b4249",
  chrome: "#D9DEE4",
  chromeDim: "#878E97",
  chromeDeep: "#565C64",
  steel: "#7D94AD",
  textHi: "#F3F5F7",
  textMid: "#B3B9C1",
  textMuted: "#6F767E",
  danger: "#FF5252",
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
