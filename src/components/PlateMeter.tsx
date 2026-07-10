import { COLORS, FONTS } from "@/lib/utils";

interface PlateMeterProps {
  ocupados: number;
  total: number;
  size?: "sm" | "md";
}

export function PlateMeter({ ocupados, total, size = "md" }: PlateMeterProps) {
  const segments = Array.from({ length: total }, (_, i) => i < ocupados);
  const full = ocupados >= total;
  const barHeight = size === "sm" ? 12 : 16;

  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-[2px]">
        {segments.map((filled, i) => (
          <div
            key={i}
            style={{
              width: 5,
              height: barHeight,
              backgroundColor: filled ? (full ? COLORS.danger : COLORS.steel) : "transparent",
              border: `1px solid ${filled ? "transparent" : COLORS.border}`,
              borderRadius: 1,
            }}
          />
        ))}
      </div>
      <span
        style={{ fontFamily: FONTS.mono, color: full ? COLORS.danger : COLORS.textMid }}
        className="text-xs"
      >
        {ocupados}/{total}
      </span>
    </div>
  );
}
