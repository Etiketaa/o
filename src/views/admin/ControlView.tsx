import { useState } from "react";
import { DIAS } from "@/types";
import { COLORS, FONTS } from "@/lib/utils";
import { Pill } from "@/components";
import { useTurnosStore } from "@/stores/turnosStore";
import { useUIStore } from "@/stores/uiStore";
import { ClipboardCheck, Check } from "lucide-react";

export function ControlView() {
  const { turnos, alumnos, toggleAsistencia } = useTurnosStore();
  const { selectedDay, setSelectedDay } = useUIStore();
  const [selectedTurnoId, setSelectedTurnoId] = useState<string | null>(null);
  const [asistencias, setAsistencias] = useState<Record<string, Set<string>>>({});

  const alumnosById = Object.fromEntries(alumnos.map((a) => [a.id, a]));
  const list = (turnos[selectedDay as keyof typeof turnos] || []).slice().sort((a, b) => a.hora.localeCompare(b.hora));
  const selected = list.find((t) => t.id === selectedTurnoId) || list[0];

  const key = selected ? `${selectedDay}-${selected.id}` : "";
  const presentSet = asistencias[key] || new Set<string>();

  const togglePresente = (alumnoId: string) => {
    setAsistencias((prev) => {
      const current = new Set(prev[key] || []);
      if (current.has(alumnoId)) current.delete(alumnoId);
      else current.add(alumnoId);
      return { ...prev, [key]: current };
    });
    if (selected) {
      const presente = !presentSet.has(alumnoId);
      toggleAsistencia(selected.id, alumnoId, presente);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex gap-2 overflow-x-auto px-4 pt-4 pb-3" style={{ borderBottom: `1px solid ${COLORS.border}` }}>
        {DIAS.map((d) => (
          <Pill key={d} active={d === selectedDay} onClick={() => { setSelectedDay(d); setSelectedTurnoId(null); }}>
            {d}
          </Pill>
        ))}
      </div>

      {list.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-2" style={{ color: COLORS.textMuted }}>
          <ClipboardCheck size={28} strokeWidth={1.5} />
          <p style={{ fontFamily: FONTS.body }} className="text-sm">No hay turnos para controlar este día</p>
        </div>
      ) : (
        <>
          <div className="flex gap-2 overflow-x-auto px-4 py-3">
            {list.map((t) => (
              <Pill key={t.id} active={t.id === selected?.id} onClick={() => setSelectedTurnoId(t.id)}>
                {t.hora} {t.actividad}
              </Pill>
            ))}
          </div>

          {selected && (
            <>
              <div className="px-4 pb-2 flex items-center justify-between">
                <span style={{ fontFamily: FONTS.mono, color: COLORS.textMuted }} className="text-xs">PRESENTES</span>
                <span style={{ fontFamily: FONTS.mono, color: COLORS.lime }} className="text-sm">
                  {presentSet.size}/{selected.inscritos.length}
                </span>
              </div>
              <div className="flex-1 overflow-y-auto px-4 pb-4 flex flex-col gap-2">
                {selected.inscritos.map((id) => {
                  const al = alumnosById[id];
                  if (!al) return null;
                  const present = presentSet.has(id);
                  return (
                    <button
                      key={id}
                      onClick={() => togglePresente(id)}
                      className="w-full flex items-center justify-between rounded-lg px-4 py-3 transition-all"
                      style={{
                        backgroundColor: present ? "rgba(212,255,61,0.08)" : COLORS.surface,
                        border: `1px solid ${present ? COLORS.limeDim : COLORS.border}`,
                      }}
                    >
                      <span style={{ fontFamily: FONTS.body, color: COLORS.textHi }} className="text-sm">
                        {al.nombre}
                      </span>
                      <div
                        className="flex items-center justify-center rounded-full transition-all"
                        style={{
                          width: 24,
                          height: 24,
                          backgroundColor: present ? COLORS.lime : "transparent",
                          border: `1px solid ${present ? COLORS.lime : COLORS.border}`,
                        }}
                      >
                        {present && <Check size={14} color="#101215" strokeWidth={3} />}
                      </div>
                    </button>
                  );
                })}
                {selected.inscritos.length === 0 && (
                  <p style={{ fontFamily: FONTS.body, color: COLORS.textMuted }} className="text-sm text-center py-8">
                    Nadie anotado en este turno
                  </p>
                )}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
