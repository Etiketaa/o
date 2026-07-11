import { DIAS } from "@/types";
import { COLORS, FONTS } from "@/lib/utils";
import { PlateMeter, Pill, Modal, Skeleton } from "@/components";
import { useTurnosStore } from "@/stores/turnosStore";
import { useUIStore } from "@/stores/uiStore";
import { useAuthStore } from "@/stores/authStore";
import { Calendar, Lock, CalendarCheck } from "lucide-react";
import type { TurnoConReservas } from "@/types";

export function ReservarView() {
  const { turnos, misReservas, reservar, loading } = useTurnosStore();
  const { selectedDay, setSelectedDay, selectedTurnoId, setSelectedTurnoId } = useUIStore();
  const { user } = useAuthStore();

  const list = (turnos[selectedDay as keyof typeof turnos] || [])
    .slice()
    .sort((a, b) => a.hora.localeCompare(b.hora));

  const openTurno = list.find((t) => t.id === selectedTurnoId);

  const handleReservar = (turno: TurnoConReservas) => {
    if (user) reservar(turno.id, user.id);
    setSelectedTurnoId(null);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex gap-2 overflow-x-auto px-4 pt-4 pb-3" style={{ borderBottom: `1px solid ${COLORS.border}` }}>
        {DIAS.map((d) => (
          <Pill key={d} active={d === selectedDay} onClick={() => setSelectedDay(d)}>
            {d}
          </Pill>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
        {list.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-2" style={{ color: COLORS.textMuted }}>
            <Calendar size={28} strokeWidth={1.5} />
            <p style={{ fontFamily: FONTS.body }} className="text-sm">No hay turnos este día</p>
          </div>
        )}
        {loading && list.length === 0
          ? Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} height={64} className="rounded-lg" />
            ))
          : list.map((t) => {
          const lleno = t.ocupados >= t.cupo;
          const reservado = misReservas.has(t.id);
          return (
            <button
              key={t.id}
              onClick={() => setSelectedTurnoId(t.id)}
              className="text-left rounded-lg p-4 flex items-center justify-between transition-all"
              style={{
                backgroundColor: reservado ? "rgba(212,255,61,0.06)" : COLORS.surface,
                border: `1px solid ${reservado ? COLORS.limeDim : COLORS.border}`,
                opacity: lleno && !reservado ? 0.55 : 1,
              }}
            >
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-center justify-center" style={{ width: 52 }}>
                  <span style={{ fontFamily: FONTS.display, fontSize: 22, color: COLORS.textHi, letterSpacing: 1 }}>
                    {t.hora}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span style={{ fontFamily: FONTS.body, fontWeight: 700, color: COLORS.textHi }}>{t.actividad}</span>
                  <span style={{ fontFamily: FONTS.body, color: COLORS.textMuted }} className="text-xs">
                    Coach {t.coach}
                  </span>
                  {reservado && (
                    <span style={{ fontFamily: FONTS.mono, color: COLORS.lime }} className="text-xs">
                      RESERVADO
                    </span>
                  )}
                  {lleno && !reservado && (
                    <span style={{ fontFamily: FONTS.mono, color: COLORS.danger }} className="text-xs">
                      SIN CUPO
                    </span>
                  )}
                </div>
              </div>
              <PlateMeter ocupados={t.ocupados} total={t.cupo} />
            </button>
          );
        })}
      </div>

      <Modal open={!!openTurno} onClose={() => setSelectedTurnoId(null)}>
        {openTurno && (
          <div className="flex flex-col gap-4">
            <div>
              <p style={{ fontFamily: FONTS.mono, color: COLORS.limeDim }} className="text-xs">
                {openTurno.hora} · Coach {openTurno.coach}
              </p>
              <h3 style={{ fontFamily: FONTS.display, color: COLORS.textHi, fontSize: 26, letterSpacing: 1 }}>
                {openTurno.actividad}
              </h3>
            </div>
            <PlateMeter ocupados={openTurno.ocupados} total={openTurno.cupo} />
            {misReservas.has(openTurno.id) ? (
              <button
                onClick={() => {
                  if (user) useTurnosStore.getState().cancelarReserva(openTurno.id, user.id);
                  setSelectedTurnoId(null);
                }}
                className="w-full py-3 rounded-lg text-center font-bold"
                style={{
                  fontFamily: FONTS.body,
                  color: COLORS.danger,
                  border: `1px solid ${COLORS.danger}`,
                  backgroundColor: "transparent",
                }}
              >
                Cancelar mi reserva
              </button>
            ) : openTurno.ocupados >= openTurno.cupo ? (
              <div
                className="w-full py-3 rounded-lg text-center flex items-center justify-center gap-2"
                style={{ fontFamily: FONTS.body, color: COLORS.textMuted, border: `1px solid ${COLORS.border}` }}
              >
                <Lock size={14} /> Sin cupo disponible
              </div>
            ) : (
              <button
                onClick={() => handleReservar(openTurno)}
                className="w-full py-3 rounded-lg text-center font-bold"
                style={{
                  fontFamily: FONTS.body,
                  color: COLORS.bg,
                  backgroundColor: COLORS.lime,
                }}
              >
                Reservar mi lugar
              </button>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
