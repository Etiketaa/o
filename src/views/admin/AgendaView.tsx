import { useEffect, useMemo } from "react";
import { PlateMeter } from "@/components";
import { useGymStore } from "@/stores/gymStore";
import { useUIStore } from "@/stores/uiStore";
import { Calendar, ChevronLeft, ChevronRight, Phone } from "lucide-react";
import { hoyISO, sumarDias, diaSemanaDe } from "@/lib/fechas";
import { franjaDeHora } from "@/lib/horarios";
import type { EstadoInscripcion } from "@/types";

const ETIQUETA_ESTADO: Record<EstadoInscripcion, string> = {
  confirmada: "Confirmado",
  asistio: "Asistió",
  "faltó": "Faltó",
  cancelada: "Cancelado",
};

function getChipClase(estado: EstadoInscripcion) {
  if (estado === "asistio") {
    return "text-chrome border border-chrome-dim";
  }
  if (estado === "faltó") {
    return "text-danger border border-danger";
  }
  if (estado === "cancelada") {
    return "text-text-muted border border-border";
  }
  return "text-text-mid border border-border";
}

export function AgendaView() {
  const { sesiones, inscripciones, perfiles, asegurarSesiones, cargarSesiones } = useGymStore();
  const { selectedFecha, setSelectedFecha, setSelectedSesionId, setActiveTab } = useUIStore();

  const diasSemana = useMemo(() => {
    const base = selectedFecha;
    const inicio = sumarDias(base, -3);
    return Array.from({ length: 7 }, (_, i) => sumarDias(inicio, i));
  }, [selectedFecha]);

  useEffect(() => {
    asegurarSesiones(diasSemana);
    const inicio = diasSemana[0];
    const fin = diasSemana[diasSemana.length - 1];
    cargarSesiones(inicio, fin);
  }, [diasSemana.join(","), asegurarSesiones, cargarSesiones]);

  const sesionesDelDia = useMemo(() => {
    return sesiones
      .filter((s) => s.fecha === selectedFecha)
      .slice()
      .sort((a, b) => a.hora.localeCompare(b.hora));
  }, [sesiones, selectedFecha]);

  const inscripcionesPorSesion = useMemo(() => {
    const mapa = new Map<string, typeof inscripciones>();
    for (const insc of inscripciones) {
      const lista = mapa.get(insc.sesion_id) || [];
      lista.push(insc);
      mapa.set(insc.sesion_id, lista);
    }
    return mapa;
  }, [inscripciones]);

  const perfilesPorId = useMemo(() => {
    return Object.fromEntries(perfiles.map((p) => [p.id, p]));
  }, [perfiles]);

  const manana = sesionesDelDia.filter((s) => franjaDeHora(s.hora) === "manana");
  const tarde = sesionesDelDia.filter((s) => franjaDeHora(s.hora) === "tarde");

  const irAControl = (sesionId: string) => {
    setSelectedSesionId(sesionId);
    setActiveTab("control");
  };

  const esHoy = selectedFecha === hoyISO();
  const etiquetaDia = diaSemanaDe(selectedFecha);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 pt-4 pb-3 border-b border-border">
        <button
          onClick={() => setSelectedFecha(sumarDias(selectedFecha, -7))}
          className="min-h-11 min-w-11 flex items-center justify-center text-text-mid hover:text-text-hi"
          aria-label="Semana anterior"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          onClick={() => setSelectedFecha(hoyISO())}
          className={`min-h-11 px-3 rounded-full text-xs font-mono uppercase tracking-wider ${
            esHoy ? "bg-chrome text-bg" : "border border-border text-text-mid"
          }`}
        >
          HOY
        </button>
        <div className="flex-1 flex gap-2 overflow-x-auto">
          {diasSemana.map((fecha) => {
            const activo = fecha === selectedFecha;
            const esHoyFecha = fecha === hoyISO();
            const dia = diaSemanaDe(fecha);
            const [anio, mes, diaNum] = fecha.split("-");
            return (
              <button
                key={fecha}
                onClick={() => setSelectedFecha(fecha)}
                className={`min-h-11 px-3 rounded-lg flex flex-col items-center shrink-0 ${
                  activo ? "bg-chrome/10 border border-chrome-dim" : "border border-border"
                }`}
                aria-label={fecha}
              >
                <span
                  className={`text-[10px] font-mono uppercase tracking-wider ${
                    activo ? "text-chrome" : "text-text-muted"
                  }`}
                >
                  {esHoyFecha ? "HOY" : dia}
                </span>
                <span className={`text-sm ${activo ? "text-text-hi" : "text-text-mid"}`}>
                  {diaNum}/{mes}
                </span>
              </button>
            );
          })}
        </div>
        <button
          onClick={() => setSelectedFecha(sumarDias(selectedFecha, 7))}
          className="min-h-11 min-w-11 flex items-center justify-center text-text-mid hover:text-text-hi"
          aria-label="Semana siguiente"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pb-[calc(5rem+env(safe-area-inset-bottom,0px))]">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col gap-6">
          {sesionesDelDia.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-text-muted">
              <Calendar size={32} strokeWidth={1.5} />
              <p className="text-sm">No hay turnos programados este día</p>
            </div>
          )}

          {manana.length > 0 && (
            <section className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase tracking-wider text-text-muted">MAÑANA</span>
                <div className="flex-1 h-px bg-border" />
              </div>
              <div className="flex flex-col gap-3">
                {manana.map((sesion) => {
                  const insc = inscripcionesPorSesion.get(sesion.id) || [];
                  const activas = insc.filter((i) => i.estado !== "cancelada");
                  const ocupados = activas.length;
                  const total = sesion.cupo;
                  return (
                    <div
                      key={sesion.id}
                      className="bg-surface border border-border rounded-xl p-4 flex flex-col gap-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <span className="font-display text-text-hi text-3xl tracking-wide block">
                            {sesion.hora}
                          </span>
                          <span className="text-xs font-mono text-text-muted uppercase tracking-wider">
                            {sesion.actividad} · Coach {sesion.coach}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <PlateMeter ocupados={ocupados} total={total} />
                          <span className="text-xs font-mono text-text-mid">
                            {ocupados} / {total}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        {insc.length === 0 && (
                          <p className="text-text-muted text-sm">Sin inscriptos</p>
                        )}
                        {insc.map((inscItem) => {
                          const perfil = perfilesPorId[inscItem.alumno_id];
                          if (!perfil) return null;
                          return (
                            <div
                              key={inscItem.id}
                              className="flex items-center justify-between py-2 border-b border-border last:border-0"
                            >
                              <div className="flex flex-col gap-1 min-w-0">
                                <span className="text-text-hi text-sm truncate">{perfil.nombre}</span>
                                <div className="flex items-center gap-1 text-text-muted">
                                  <Phone size={12} />
                                  <span className="text-xs">{perfil.telefono}</span>
                                </div>
                              </div>
                              <span
                                className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${getChipClase(
                                  inscItem.estado,
                                )}`}
                              >
                                {ETIQUETA_ESTADO[inscItem.estado]}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      <button
                        onClick={() => irAControl(sesion.id)}
                        className="min-h-11 px-4 rounded-lg bg-chrome text-bg font-body font-bold text-sm"
                      >
                        MARCAR / CONTROLAR
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {tarde.length > 0 && (
            <section className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase tracking-wider text-text-muted">TARDE</span>
                <div className="flex-1 h-px bg-border" />
              </div>
              <div className="flex flex-col gap-3">
                {tarde.map((sesion) => {
                  const insc = inscripcionesPorSesion.get(sesion.id) || [];
                  const activas = insc.filter((i) => i.estado !== "cancelada");
                  const ocupados = activas.length;
                  const total = sesion.cupo;
                  return (
                    <div
                      key={sesion.id}
                      className="bg-surface border border-border rounded-xl p-4 flex flex-col gap-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <span className="font-display text-text-hi text-3xl tracking-wide block">
                            {sesion.hora}
                          </span>
                          <span className="text-xs font-mono text-text-muted uppercase tracking-wider">
                            {sesion.actividad} · Coach {sesion.coach}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <PlateMeter ocupados={ocupados} total={total} />
                          <span className="text-xs font-mono text-text-mid">
                            {ocupados} / {total}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        {insc.length === 0 && (
                          <p className="text-text-muted text-sm">Sin inscriptos</p>
                        )}
                        {insc.map((inscItem) => {
                          const perfil = perfilesPorId[inscItem.alumno_id];
                          if (!perfil) return null;
                          return (
                            <div
                              key={inscItem.id}
                              className="flex items-center justify-between py-2 border-b border-border last:border-0"
                            >
                              <div className="flex flex-col gap-1 min-w-0">
                                <span className="text-text-hi text-sm truncate">{perfil.nombre}</span>
                                <div className="flex items-center gap-1 text-text-muted">
                                  <Phone size={12} />
                                  <span className="text-xs">{perfil.telefono}</span>
                                </div>
                              </div>
                              <span
                                className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${getChipClase(
                                  inscItem.estado,
                                )}`}
                              >
                                {ETIQUETA_ESTADO[inscItem.estado]}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      <button
                        onClick={() => irAControl(sesion.id)}
                        className="min-h-11 px-4 rounded-lg bg-chrome text-bg font-body font-bold text-sm"
                      >
                        MARCAR / CONTROLAR
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
