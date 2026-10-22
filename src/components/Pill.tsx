import { COLORS, FONTS } from "@/lib/utils";

interface PillProps {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
  size?: "sm" | "md";
}

export function Pill({ active, children, onClick, size = "md" }: PillProps) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full transition-colors shrink-0 ${
        size === "sm" ? "px-2 py-1 text-xs" : "px-3 py-1.5 text-sm"
      }`}
      style={{
        fontFamily: FONTS.body,
        backgroundColor: active ? COLORS.chrome : "transparent",
        color: active ? "#101215" : COLORS.textMid,
        border: `1px solid ${active ? COLORS.chrome : COLORS.border}`,
        fontWeight: active ? 700 : 500,
      }}
    >
      {children}
    </button>
  );
}
