import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Users } from "lucide-react";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, addMonths, subMonths } from "date-fns";
import { es } from "date-fns/locale";
import { Modal, PlateMeter, Avatar } from "@/components";
import { useTurnosStore } from "@/stores/turnosStore";
import type { TurnoConReservas } from "@/types";

export function CalendarioView() {
  const { turnos, alumnos } = useTurnosStore();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTurno, setSelectedTurno] = useState<TurnoConReservas | null>(null);

  const alumnosById = Object.fromEntries(alumnos.map((a) => [a.id, a]));

  const diasMes = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 });
    const days: Date[] = [];
    let day = start;
    while (day <= end) {
      days.push(day);
      day = addDays(day, 1);
    }
    return days;
  }, [currentMonth]);

  const getTurnosForDate = (date: Date): TurnoConReservas[] => {
    const diaName = format(date, "EEE", { locale: es });
    const diaMap: Record<string, string> = {
      lun: "Lun", mar: "Mar", mié: "Mié", jue: "Jue", vie: "Vie", sáb: "Sáb", dom: "Dom",
    };
    const diaKey = diaMap[diaName.toLowerCase()];
    if (!diaKey) return [];
    return (turnos[diaKey as keyof typeof turnos] || []).filter((t) => t.activo);
  };

  const selectedDayTurnos = selectedDate ? getTurnosForDate(selectedDate) : [];
  const totalInscritos = selectedDayTurnos.reduce((s, t) => s + t.ocupados, 0);
  const totalCupo = selectedDayTurnos.reduce((s, t) => s + t.cupo, 0);

  return (
    <div className="flex flex-col h-full">
      {/* Month header */}
      <div className="px-6 pt-6 pb-4 border-b border-border">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-[11px] tracking-[0.2em] uppercase text-lime mb-2 block font-medium">
                Calendario
              </span>
              <h2 className="font-display text-text-hi text-2xl tracking-wide">
                {format(currentMonth, "MMMM yyyy", { locale: es })}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                className="p-2 rounded-lg border border-border hover:border-lime/30 transition-all text-text-muted hover:text-text-hi"
                aria-label="Mes anterior"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => setCurrentMonth(new Date())}
                className="px-3 py-1.5 rounded-lg text-[10px] font-mono uppercase tracking-wider border border-border hover:border-lime/30 text-text-muted hover:text-text-hi transition-all"
              >
                Hoy
              </button>
              <button
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                className="p-2 rounded-lg border border-border hover:border-lime/30 transition-all text-text-muted hover:text-text-hi"
                aria-label="Mes siguiente"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 text-[10px] font-mono text-text-muted">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-lime" />
              <span>Con clases</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-border" />
              <span>Sin clases</span>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-6xl mx-auto">
          {/* Day names */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((d) => (
              <div key={d} className="text-center text-[10px] font-mono text-text-muted uppercase tracking-wider py-2">
                {d}
              </div>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7 gap-1">
            {diasMes.map((day, i) => {
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isToday = isSameDay(day, new Date());
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              const dayTurnos = getTurnosForDate(day);
              const hasClasses = dayTurnos.length > 0;
              const totalOcupados = dayTurnos.reduce((s, t) => s + t.ocupados, 0);

              return (
                <button
                  key={i}
                  onClick={() => setSelectedDate(day)}
                  className={`relative aspect-square p-2 rounded-xl flex flex-col items-center justify-center gap-1 transition-all ${
                    !isCurrentMonth
                      ? "opacity-30"
                      : isSelected
                      ? "bg-lime/20 border border-lime/40"
                      : isToday
                      ? "bg-surface-hi border border-lime/20"
                      : "bg-surface border border-border hover:border-lime/20"
                  }`}
                >
                  <span className={`text-sm font-mono ${
                    isToday ? "text-lime font-bold" : isCurrentMonth ? "text-text-hi" : "text-text-muted"
                  }`}>
                    {format(day, "d")}
                  </span>
                  {hasClasses && (
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-lime" />
                      <span className="text-[8px] font-mono text-lime">{totalOcupados}</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Selected day details */}
          {selectedDate && (
            <div className="mt-6 bg-surface border border-border rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-text-hi text-xl tracking-wide">
                  {format(selectedDate, "EEEE d", { locale: es })}
                </h3>
                <div className="flex items-center gap-2 text-text-muted text-xs font-mono">
                  <Users size={14} />
                  <span>{totalInscritos}/{totalCupo} inscritos</span>
                </div>
              </div>

              {selectedDayTurnos.length === 0 ? (
                <p className="text-text-muted text-sm py-4 text-center">Sin clases programadas</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {selectedDayTurnos
                    .slice()
                    .sort((a, b) => a.hora.localeCompare(b.hora))
                    .map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setSelectedTurno(t)}
                        className="text-left bg-bg border border-border rounded-xl p-4 hover:border-lime/30 transition-all"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-display text-text-hi text-lg">{t.hora}</span>
                          <PlateMeter ocupados={t.ocupados} total={t.cupo} />
                        </div>
                        <span className="text-text-hi text-xs font-semibold block">{t.actividad}</span>
                        <span className="text-text-muted text-[10px] font-mono">Coach {t.coach}</span>
                      </button>
                    ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal detalle turno */}
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
              {selectedTurno.inscritos.length === 0 ? (
                <p className="text-text-muted text-sm py-4 text-center">Nadie anotado todavía</p>
              ) : (
                selectedTurno.inscritos.map((id) => {
                  const al = alumnosById[id];
                  if (!al) return null;
                  return (
                    <div key={id} className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
                      <div className="flex items-center gap-2">
                        <Avatar nombre={al.nombre} size="sm" />
                        <span className="text-text-hi text-sm">{al.nombre}</span>
                      </div>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                        al.estado === "activo"
                          ? "text-lime border border-lime-dim"
                          : "text-danger border border-danger"
                      }`}>
                        {al.estado === "activo" ? "ACTIVO" : "VENCIDO"}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
