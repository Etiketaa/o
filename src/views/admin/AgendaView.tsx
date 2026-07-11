import { useState } from "react";
import { DIAS } from "@/types";
import type { TurnoConReservas } from "@/types";
import { PlateMeter, Pill, Modal } from "@/components";
import { useTurnosStore } from "@/stores/turnosStore";
import { useUIStore } from "@/stores/uiStore";
import { Calendar, Repeat } from "lucide-react";

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
      {/* Day selector */}
      <div className="flex gap-2 overflow-x-auto px-6 pt-6 pb-4 border-b border-border">
        {DIAS.map((d) => (
          <Pill key={d} active={d === selectedDay} onClick={() => setSelectedDay(d)}>
            {d}
          </Pill>
        ))}
      </div>

      {/* Turnos grid */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-6xl mx-auto">
          {list.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-text-muted">
              <Calendar size={32} strokeWidth={1.5} />
              <p className="text-sm">Sin turnos cargados este día</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {list.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedTurno(t)}
                className="text-left bg-surface border border-border rounded-xl p-5 flex flex-col gap-4 hover:border-lime/30 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-display text-text-hi text-2xl tracking-wide block">
                      {t.hora}
                    </span>
                    <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider">
                      Coach {t.coach}
                    </span>
                  </div>
                  <PlateMeter ocupados={t.ocupados} total={t.cupo} />
                </div>
                <div className="pt-3 border-t border-border">
                  <div className="flex items-center justify-between">
                    <span className="font-body font-bold text-text-hi text-sm">
                      {t.actividad}
                    </span>
                    {t.fijos && t.fijos.length > 0 && (
                      <div className="flex items-center gap-1">
                        <Repeat size={12} className="text-lime" />
                        <span className="text-[10px] font-mono text-lime">
                          {t.fijos.length} fijos
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] font-mono text-text-muted">
                      {t.ocupados}/{t.cupo} inscriptos
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Modal */}
      <Modal open={!!selectedTurno} onClose={() => setSelectedTurno(null)}>
        {selectedTurno && (
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-xs font-mono text-lime-dim mb-1">
                {selectedTurno.hora} · Coach {selectedTurno.coach}
              </p>
              <h3 className="font-display text-text-hi text-2xl tracking-wide">
                {selectedTurno.actividad}
              </h3>
            </div>
            <PlateMeter ocupados={selectedTurno.ocupados} total={selectedTurno.cupo} />
            <div className="flex-1 overflow-y-auto flex flex-col gap-2 max-h-60">
              {selectedTurno.inscritos.length === 0 && (
                <p className="text-text-muted text-sm py-4 text-center">
                  Nadie anotado todavía
                </p>
              )}
              {selectedTurno.inscritos.map((id) => {
                const al = alumnosById[id];
                if (!al) return null;
                const esFijo = selectedTurno.fijos?.includes(id);
                return (
                  <div key={id} className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
                    <div className="flex items-center gap-2">
                      <span className="text-text-hi text-sm">{al.nombre}</span>
                      {esFijo && (
                        <Repeat size={12} className="text-lime" aria-label="Turno fijo" />
                      )}
                    </div>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                        al.estado === "activo"
                          ? "text-lime border border-lime-dim"
                          : "text-danger border border-danger"
                      }`}
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
