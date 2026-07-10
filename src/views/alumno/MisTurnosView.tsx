import { DIAS } from "@/types";
import { COLORS, FONTS } from "@/lib/utils";
import { useTurnosStore } from "@/stores/turnosStore";
import { useAuthStore } from "@/stores/authStore";
import { CalendarCheck, X } from "lucide-react";

export function MisTurnosView() {
  const { turnos, misReservas, cancelarReserva } = useTurnosStore();
  const { user } = useAuthStore();

  const items: Array<{ id: string; dia: string; hora: string; actividad: string; coach: string }> = [];
  DIAS.forEach((dia) => {
    (turnos[dia as keyof typeof turnos] || []).forEach((t) => {
      if (misReservas.has(t.id)) items.push({ ...t, dia });
    });
  });

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
      {items.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 gap-2" style={{ color: COLORS.textMuted }}>
          <CalendarCheck size={28} strokeWidth={1.5} />
          <p style={{ fontFamily: FONTS.body }} className="text-sm">Todavía no reservaste ningún turno</p>
        </div>
      )}
      {items.map((t) => (
        <div
          key={t.id}
          className="rounded-lg p-4 flex items-center justify-between"
          style={{ backgroundColor: COLORS.surface, border: `1px solid ${COLORS.limeDim}` }}
        >
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-center justify-center" style={{ width: 56 }}>
              <span style={{ fontFamily: FONTS.mono, color: COLORS.lime, fontSize: 11 }}>{t.dia.toUpperCase()}</span>
              <span style={{ fontFamily: FONTS.display, fontSize: 20, color: COLORS.textHi, letterSpacing: 1 }}>
                {t.hora}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span style={{ fontFamily: FONTS.body, fontWeight: 700, color: COLORS.textHi }}>{t.actividad}</span>
              <span style={{ fontFamily: FONTS.body, color: COLORS.textMuted }} className="text-xs">
                Coach {t.coach}
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              if (user) cancelarReserva(t.id, user.id);
            }}
            className="flex items-center justify-center rounded-full transition-colors hover:bg-[rgba(255,92,92,0.1)]"
            style={{ width: 30, height: 30, border: `1px solid ${COLORS.border}`, color: COLORS.textMuted }}
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
