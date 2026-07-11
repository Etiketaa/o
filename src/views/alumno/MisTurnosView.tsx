import { DIAS } from "@/types";
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
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <span className="text-[11px] tracking-[0.2em] uppercase text-lime mb-2 block font-medium">
            Mis turnos
          </span>
          <h2 className="font-display text-text-hi text-2xl tracking-wide">
            Tus reservas
          </h2>
        </div>

        {items.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-text-muted">
            <CalendarCheck size={32} strokeWidth={1.5} />
            <p className="text-sm">Todavía no reservaste ningún turno</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {items.map((t) => (
            <div
              key={t.id}
              className="bg-surface border border-lime-dim rounded-xl p-5 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-center justify-center w-16">
                  <span className="text-[10px] font-mono text-lime uppercase tracking-wider">
                    {t.dia}
                  </span>
                  <span className="font-display text-text-hi text-2xl tracking-wide">
                    {t.hora}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-body font-bold text-text-hi text-sm">
                    {t.actividad}
                  </span>
                  <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider">
                    Coach {t.coach}
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  if (user) cancelarReserva(t.id, user.id);
                }}
                className="flex items-center justify-center w-9 h-9 rounded-full border border-border text-text-muted hover:text-danger hover:border-danger transition-all"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
