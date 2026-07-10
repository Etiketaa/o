import { COLORS, FONTS } from "@/lib/utils";

interface StatusChipProps {
  estado: "activo" | "vencido" | "activa" | "vencida" | "cancelada" | "pagado" | "pendiente";
  size?: "sm" | "md";
}

const STATUS_MAP: Record<string, { label: string; color: string; border: string }> = {
  activo: { label: "ACTIVO", color: COLORS.lime, border: COLORS.limeDim },
  vencido: { label: "VENCIDO", color: COLORS.danger, border: COLORS.danger },
  activa: { label: "ACTIVA", color: COLORS.lime, border: COLORS.limeDim },
  vencida: { label: "VENCIDA", color: COLORS.danger, border: COLORS.danger },
  cancelada: { label: "CANCELADA", color: COLORS.textMuted, border: COLORS.border },
  pagado: { label: "PAGADO", color: COLORS.lime, border: COLORS.limeDim },
  pendiente: { label: "PENDIENTE", color: COLORS.steel, border: COLORS.steel },
};

export function StatusChip({ estado, size = "md" }: StatusChipProps) {
  const s = STATUS_MAP[estado] || STATUS_MAP.activo;
  return (
    <span
      className={`rounded-full ${size === "sm" ? "text-[10px] px-1.5 py-0" : "text-xs px-2 py-0.5"}`}
      style={{
        fontFamily: FONTS.mono,
        color: s.color,
        border: `1px solid ${s.border}`,
      }}
    >
      {s.label}
    </span>
  );
}
