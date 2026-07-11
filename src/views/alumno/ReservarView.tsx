import { DIAS } from "@/types";
import { PlateMeter, Pill, Modal, Skeleton } from "@/components";
import { useTurnosStore } from "@/stores/turnosStore";
import { useUIStore } from "@/stores/uiStore";
import { useAuthStore } from "@/stores/authStore";
import { Calendar, Lock } from "lucide-react";
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
      <div className="px-6 pt-6 pb-4 border-b border-border">
        <div className="max-w-6xl mx-auto">
          <span className="text-[11px] tracking-[0.2em] uppercase text-lime mb-2 block font-medium">
            Reservar
          </span>
          <h2 className="font-display text-text-hi text-2xl tracking-wide mb-4">
            Elegí tu turno
          </h2>
          <div className="flex gap-2 overflow-x-auto">
            {DIAS.map((d) => (
              <Pill key={d} active={d === selectedDay} onClick={() => setSelectedDay(d)}>
                {d}
              </Pill>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-6xl mx-auto">
          {list.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-text-muted">
              <Calendar size={32} strokeWidth={1.5} />
              <p className="text-sm">No hay turnos este día</p>
            </div>
          )}

          {loading && list.length === 0
            ? Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} height={80} className="rounded-xl mb-4" />
              ))
            : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {list.map((t) => {
                  const lleno = t.ocupados >= t.cupo;
                  const reservado = misReservas.has(t.id);
                  return (
                    <button
                      key={t.id}
                      onClick={() => setSelectedTurnoId(t.id)}
                      className={`text-left rounded-xl p-5 flex flex-col gap-3 transition-all ${
                        reservado
                          ? "bg-lime/5 border border-lime-dim"
                          : "bg-surface border border-border hover:border-lime/30"
                      } ${lleno && !reservado ? "opacity-55" : ""}`}
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
                        <span className="font-body font-bold text-text-hi text-sm">
                          {t.actividad}
                        </span>
                        {reservado && (
                          <span className="text-[10px] font-mono text-lime block mt-1">
                            RESERVADO
                          </span>
                        )}
                        {lleno && !reservado && (
                          <span className="text-[10px] font-mono text-danger block mt-1">
                            SIN CUPO
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
        </div>
      </div>

      <Modal open={!!openTurno} onClose={() => setSelectedTurnoId(null)}>
        {openTurno && (
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-xs font-mono text-lime-dim mb-1">
                {openTurno.hora} · Coach {openTurno.coach}
              </p>
              <h3 className="font-display text-text-hi text-2xl tracking-wide">
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
                className="w-full py-3.5 rounded-xl text-center font-semibold text-sm border border-danger text-danger hover:bg-danger/5 transition-all"
              >
                Cancelar mi reserva
              </button>
            ) : openTurno.ocupados >= openTurno.cupo ? (
              <div className="w-full py-3.5 rounded-xl text-center flex items-center justify-center gap-2 text-text-muted border border-border text-sm">
                <Lock size={14} /> Sin cupo disponible
              </div>
            ) : (
              <button
                onClick={() => handleReservar(openTurno)}
                className="w-full py-3.5 rounded-xl text-center font-semibold text-sm bg-lime text-bg hover:shadow-[0_4px_20px_rgba(212,255,61,0.3)] transition-all"
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
