import { useState } from "react";
import { DIAS } from "@/types";
import type { DiaSemana, TurnoConReservas } from "@/types";
import { COLORS, FONTS } from "@/lib/utils";
import { PlateMeter, Pill, Modal } from "@/components";
import { useTurnosStore } from "@/stores/turnosStore";
import { useUIStore } from "@/stores/uiStore";
import { Calendar } from "lucide-react";

export function AgendaView() {
  const { turnos, alumnos } = useTurnosStore();
  const { selectedDay, setSelectedDay } = useUIStore();
  const [selectedTurno, setSelectedTurno] = useState<TurnoConReservas | null>(null);

  const alumnosById = Object.fromEntries(alumnos.map((a) => [a.id, a]));
  const list = (turnos[selectedDay as keyof typeof turnos] || [])
    .slice()
    .sort((a, b) => a.hora.localeCompare(b.hora));

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
            <p style={{ fontFamily: FONTS.body }} className="text-sm">Sin turnos cargados este día</p>
          </div>
        )}
        {list.map((t) => (
          <button
            key={t.id}
            onClick={() => setSelectedTurno(t)}
            className="text-left rounded-lg p-4 flex items-center justify-between transition-all hover:opacity-90"
            style={{ backgroundColor: COLORS.surface, border: `1px solid ${COLORS.border}` }}
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
              </div>
            </div>
            <PlateMeter ocupados={t.ocupados} total={t.cupo} />
          </button>
        ))}
      </div>

      <Modal open={!!selectedTurno} onClose={() => setSelectedTurno(null)}>
        {selectedTurno && (
          <div className="flex flex-col gap-4">
            <div>
              <p style={{ fontFamily: FONTS.mono, color: COLORS.limeDim }} className="text-xs">
                {selectedTurno.hora} · Coach {selectedTurno.coach}
              </p>
              <h3 style={{ fontFamily: FONTS.display, color: COLORS.textHi, fontSize: 26, letterSpacing: 1 }}>
                {selectedTurno.actividad}
              </h3>
            </div>
            <PlateMeter ocupados={selectedTurno.ocupados} total={selectedTurno.cupo} />
            <div className="flex-1 overflow-y-auto flex flex-col gap-2">
              {selectedTurno.inscritos.length === 0 && (
                <p style={{ fontFamily: FONTS.body, color: COLORS.textMuted }} className="text-sm py-4 text-center">
                  Nadie anotado todavía
                </p>
              )}
              {selectedTurno.inscritos.map((id) => {
                const al = alumnosById[id];
                if (!al) return null;
                return (
                  <div key={id} className="flex items-center justify-between py-2" style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                    <span style={{ fontFamily: FONTS.body, color: COLORS.textHi }} className="text-sm">{al.nombre}</span>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{
                        fontFamily: FONTS.mono,
                        color: al.estado === "activo" ? COLORS.lime : COLORS.danger,
                        border: `1px solid ${al.estado === "activo" ? COLORS.limeDim : COLORS.danger}`,
                      }}
                    >
                      {al.estado === "activo" ? "ACTIVO" : "VENCIDO"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
