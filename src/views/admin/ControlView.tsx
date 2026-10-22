import { useEffect, useMemo } from "react";
import { PlateMeter } from "@/components";
import { useGymStore } from "@/stores/gymStore";
import { useUIStore } from "@/stores/uiStore";
import { Calendar, ChevronLeft, ChevronRight, CircleAlert, CircleCheck, Phone, ThumbsDown, ThumbsUp } from "lucide-react";
import { hoyISO, sumarDias } from "@/lib/fechas";
import type { EstadoInscripcion } from "@/types";

export function ControlView() {
  const {
    sesiones,
    inscripciones,
    perfiles,
    asegurarSesiones,
    cargarSesiones,
    cargarInscripciones,
    marcarAsistencia,
  } = useGymStore();
  const { selectedFecha, setSelectedFecha, selectedSesionId, setSelectedSesionId } = useUIStore();

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

  useEffect(() => {
    if (sesionesDelDia.length === 0) {
      setSelectedSesionId(null);
      return;
    }
    const existe = sesionesDelDia.find((s) => s.id === selectedSesionId);
    if (!existe) {
      setSelectedSesionId(sesionesDelDia[0].id);
    }
  }, [sesionesDelDia, selectedSesionId, setSelectedSesionId]);

  useEffect(() => {
    const ids = sesionesDelDia.map((s) => s.id);
    if (ids.length > 0) {
      cargarInscripciones({ sesionIds: ids });
    }
  }, [sesionesDelDia.map((s) => s.id).join(","), cargarInscripciones]);

  const sesionActual = useMemo(() => {
    return sesionesDelDia.find((s) => s.id === selectedSesionId) || sesionesDelDia[0] || null;
  }, [sesionesDelDia, selectedSesionId]);

  const inscripcionesSesion = useMemo(() => {
    if (!sesionActual) return [];
    return inscripciones.filter((i) => i.sesion_id === sesionActual.id);
  }, [inscripciones, sesionActual]);

  const perfilesPorId = useMemo(() => {
    return Object.fromEntries(perfiles.map((p) => [p.id, p]));
  }, [perfiles]);

  const asistieron = inscripcionesSesion.filter((i) => i.estado === "asistio").length;
  const totalInscritos = inscripcionesSesion.filter((i) => i.estado !== "cancelada").length;

  const feedbacks = inscripcionesSesion.filter(
    (i) => (i.feedback === "up" || i.feedback === "down") && i.comentario,
  );

  const esHoy = selectedFecha === hoyISO();

  const getBotonClase = (estado: EstadoInscripcion, actual: EstadoInscripcion) => {
    if (actual === "faltó" && estado === "faltó") {
      return "border border-danger text-danger bg-danger/10";
    }
    if (actual === "asistio" && estado === "asistio") {
      return "border border-chrome-dim text-chrome bg-chrome/10";
    }
    if (actual === "confirmada" && estado === "confirmada") {
      return "border border-border-hi text-text-hi";
    }
    if (estado === "asistio") {
      return "border border-border text-text-mid hover:border-chrome-dim hover:text-chrome";
    }
    if (estado === "faltó") {
      return "border border-border text-text-mid hover:border-danger hover:text-danger";
    }
    return "border border-border text-text-mid hover:border-border-hi hover:text-text-hi";
  };

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
                  {esHoyFecha ? "HOY" : fecha.slice(5, 10)}
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

      {sesionesDelDia.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-text-muted">
          <Calendar size={32} strokeWidth={1.5} />
          <p className="text-sm">No hay turnos para controlar este día</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto pb-[calc(5rem+env(safe-area-inset-bottom,0px))]">
          <div className="max-w-4xl mx-auto px-4 py-4 flex flex-col gap-4">
            <div className="flex gap-2 overflow-x-auto">
              {sesionesDelDia.map((s) => {
                const insc = inscripciones.filter((i) => i.sesion_id === s.id && i.estado !== "cancelada");
                const activo = s.id === sesionActual?.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => setSelectedSesionId(s.id)}
                    className={`min-h-11 px-3 rounded-lg flex flex-col shrink-0 ${
                      activo ? "bg-chrome/10 border border-chrome-dim" : "border border-border"
                    }`}
                  >
                    <span className={`text-sm font-display tracking-wide ${activo ? "text-text-hi" : "text-text-mid"}`}>
                      {s.hora}
                    </span>
                    <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider">
                      {s.actividad} · {insc.length}
                    </span>
                  </button>
                );
              })}
            </div>

            {sesionActual && (
              <>
                <div className="bg-surface border border-border rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <span className="font-display text-text-hi text-2xl tracking-wide">
                      {sesionActual.hora} · {sesionActual.actividad}
                    </span>
                    <p className="text-xs font-mono text-text-muted uppercase tracking-wider">
                      Coach {sesionActual.coach}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <PlateMeter ocupados={asistieron} total={totalInscritos || sesionActual.cupo} />
                    <span className="text-xs font-mono text-text-mid">
                      Asistieron {asistieron} de {totalInscritos}
                    </span>
                  </div>
                </div>

                <section className="flex flex-col gap-2">
                  <span className="text-xs font-mono uppercase tracking-wider text-text-muted">INSCRIPTOS</span>
                  {inscripcionesSesion.length === 0 && (
                    <div className="bg-surface border border-border rounded-xl p-6 text-center text-text-muted">
                      Todavía no se anotó nadie a este turno
                    </div>
                  )}
                  <div className="flex flex-col gap-2">
                    {inscripcionesSesion.map((inscItem) => {
                      const perfil = perfilesPorId[inscItem.alumno_id];
                      if (!perfil) return null;
                      const actual = inscItem.estado;
                      return (
                        <div
                          key={inscItem.id}
                          className="bg-surface border border-border rounded-xl p-4 flex flex-col gap-3"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex flex-col gap-1 min-w-0">
                              <span className="text-text-hi text-sm">{perfil.nombre}</span>
                              <div className="flex items-center gap-1 text-text-muted">
                                <Phone size={12} />
                                <span className="text-xs">{perfil.telefono}</span>
                              </div>
                              <span className="text-xs font-mono text-text-muted uppercase tracking-wider">
                                {perfil.plan} · {perfil.frecuencia_semana}x/semana
                              </span>
                            </div>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border border-border text-text-mid">
                              {actual === "asistio" ? "ASISTIÓ" : actual === "faltó" ? "FALTÓ" : actual === "cancelada" ? "CANCELADO" : "CONFIRMADO"}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => marcarAsistencia(inscItem.id, "asistio")}
                              className={`min-h-11 px-3 rounded-lg flex items-center gap-2 text-sm ${getBotonClase(
                                "asistio",
                                actual,
                              )}`}
                              aria-label="Marcar como asistió"
                            >
                              <CircleCheck size={16} />
                              ASISTIÓ
                            </button>
                            <button
                              onClick={() => marcarAsistencia(inscItem.id, "faltó")}
                              className={`min-h-11 px-3 rounded-lg flex items-center gap-2 text-sm ${getBotonClase(
                                "faltó",
                                actual,
                              )}`}
                              aria-label="Marcar como faltó"
                            >
                              <CircleAlert size={16} />
                              FALTÓ
                            </button>
                            <button
                              onClick={() => marcarAsistencia(inscItem.id, "confirmada")}
                              className={`min-h-11 px-3 rounded-lg flex items-center gap-2 text-sm ${getBotonClase(
                                "confirmada",
                                actual,
                              )}`}
                              aria-label="Volver a confirmado"
                            >
                              Volver a confirmado
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>

                {feedbacks.length > 0 && (
                  <section className="flex flex-col gap-2">
                    <span className="text-xs font-mono uppercase tracking-wider text-text-muted">FEEDBACK</span>
                    <div className="flex flex-col gap-2">
                      {feedbacks.map((fb) => {
                        const perfil = perfilesPorId[fb.alumno_id];
                        if (!perfil) return null;
                        return (
                          <div key={fb.id} className="bg-surface border border-border rounded-xl p-4 flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {fb.feedback === "up" ? (
                                  <ThumbsUp size={16} className="text-chrome" />
                                ) : (
                                  <ThumbsDown size={16} className="text-danger" />
                                )}
                                <span className="text-text-hi text-sm">{perfil.nombre}</span>
                              </div>
                              {fb.feedback_at && (
                                <span className="text-xs font-mono text-text-muted">
                                  {fb.feedback_at.slice(0, 10)}
                                </span>
                              )}
                            </div>
                            <p className="text-text-mid text-sm">{fb.comentario}</p>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
