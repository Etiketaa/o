import { useState } from "react";
import { DIAS } from "@/types";
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
      <div className="flex gap-2 overflow-x-auto px-6 pt-6 pb-4 border-b border-border">
        {DIAS.map((d) => (
          <Pill key={d} active={d === selectedDay} onClick={() => { setSelectedDay(d); setSelectedTurnoId(null); }}>
            {d}
          </Pill>
        ))}
      </div>

      {list.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-text-muted">
          <ClipboardCheck size={32} strokeWidth={1.5} />
          <p className="text-sm">No hay turnos para controlar este día</p>
        </div>
      ) : (
        <div className="flex-1 flex min-h-0">
          {/* Turnos sidebar - desktop */}
          <div className="hidden md:flex flex-col w-64 border-r border-border bg-surface/50">
            <div className="px-4 py-4 border-b border-border">
              <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider">
                Turnos del día
              </span>
            </div>
            <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1">
              {list.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTurnoId(t.id)}
                  className={`text-left px-4 py-3 rounded-lg transition-all ${
                    t.id === selected?.id
                      ? "bg-lime/10 text-lime"
                      : "text-text-muted hover:text-text-hi hover:bg-surface-hi"
                  }`}
                >
                  <span className="font-display text-lg tracking-wide block">{t.hora}</span>
                  <span className="text-[10px] font-mono uppercase tracking-wider">
                    {t.actividad}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Mobile pills */}
          <div className="md:hidden flex gap-2 overflow-x-auto px-5 py-3">
            {list.map((t) => (
              <Pill key={t.id} active={t.id === selected?.id} onClick={() => setSelectedTurnoId(t.id)}>
                {t.hora} {t.actividad}
              </Pill>
            ))}
          </div>

          {/* Asistencia list */}
          <div className="flex-1 flex flex-col min-h-0">
            {selected && (
              <>
                <div className="px-6 py-4 flex items-center justify-between border-b border-border">
                  <div>
                    <span className="font-display text-text-hi text-xl tracking-wide">
                      {selected.actividad}
                    </span>
                    <span className="text-text-muted text-sm ml-2">
                      {selected.hora}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider">
                      Presentes
                    </span>
                    <span className="text-sm font-mono text-lime font-bold">
                      {presentSet.size}/{selected.inscritos.length}
                    </span>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                    {selected.inscritos.map((id) => {
                      const al = alumnosById[id];
                      if (!al) return null;
                      const present = presentSet.has(id);
                      return (
                        <button
                          key={id}
                          onClick={() => togglePresente(id)}
                          className={`flex items-center justify-between rounded-xl px-5 py-4 transition-all ${
                            present
                              ? "bg-lime/5 border border-lime-dim"
                              : "bg-surface border border-border hover:border-border/80"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-lime/20 flex items-center justify-center">
                              <span className="text-lime text-xs font-bold">
                                {al.nombre.charAt(0)}
                              </span>
                            </div>
                            <span className="text-text-hi text-sm font-medium">{al.nombre}</span>
                          </div>
                          <div
                            className={`flex items-center justify-center rounded-full transition-all w-7 h-7 ${
                              present
                                ? "bg-lime border border-lime"
                                : "bg-transparent border border-border"
                            }`}
                          >
                            {present && <Check size={14} className="text-bg" strokeWidth={3} />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  {selected.inscritos.length === 0 && (
                    <p className="text-text-muted text-sm text-center py-10">
                      Nadie anotado en este turno
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
