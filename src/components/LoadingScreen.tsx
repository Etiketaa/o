import { Loader2 } from "lucide-react";
import { COLORS, FONTS } from "@/lib/utils";

interface LoadingScreenProps {
  text?: string;
}

export function LoadingScreen({ text = "Cargando..." }: LoadingScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3" style={{ color: COLORS.lime }}>
      <Loader2 size={32} className="animate-spin" />
      <span style={{ fontFamily: FONTS.mono, color: COLORS.textMuted }} className="text-sm">
        {text}
      </span>
    </div>
  );
}
