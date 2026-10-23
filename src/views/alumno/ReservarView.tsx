import { useEffect, useMemo, useState } from "react";
import type { Inscripcion, Sesion } from "@/types";
import { ChevronLeft, ChevronRight, CalendarX, User } from "lucide-react";
import { Modal, PlateMeter, useToast } from "@/components";
import { actividadesDePlan, useGymStore } from "@/stores/gymStore";
import { useAuthStore } from "@/stores/authStore";
import { useUIStore } from "@/stores/uiStore";
import {
  diaSemanaDe,
  etiquetaSemana,
  fechaLarga,
  hoyISO,
  semanaDe,
  sumarDias,
} from "@/lib/fechas";
import { NOMBRES_DIA_CORTO, turnosSeSolapan } from "@/lib/horarios";
import { frecuenciaDePlan } from "@/lib/semilla";

/** Número de día de una fecha ISO ("2026-10-21" → 21). */
function numeroDia(fechaISO: string): number {
  const [, , d] = fechaISO.split("-").map(Number);
  return d || 1;
}

/** ¿El turno ya arrancó? No se puede reservar algo que ya empezó. */
function yaTermino(sesion: Sesion, hoy: string): boolean {
  if (sesion.fecha < hoy) return true;
  if (sesion.fecha > hoy) return false;
  const ahora = new Date();
  const horaAhora = `${String(ahora.getHours()).padStart(2, "0")}:${String(ahora.getMinutes()).padStart(2, "0")}`;
  return sesion.hora <= horaAhora;
}

export function ReservarView() {
  const { user } = useAuthStore();
  const {
    sesiones,
    inscripciones,
    planActividades,
    loading,
    initialized,
    config,
    asegurarSesiones,
    inscribir,
    cancelarInscripcion,
  } = useGymStore();
  const { selectedFecha, setSelectedFecha } = useUIStore();
  const { pushToast } = useToast();

  const [dayModalOpen, setDayModalOpen] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState<Sesion | null>(null);

  const hoy = hoyISO();
  const semanaHoy = semanaDe(hoy);
  const semanaSeleccionada = semanaDe(selectedFecha);
  const esSemanaActual = semanaSeleccionada.inicio === semanaHoy.inicio;

  // --- datos derivados ---------------------------------------------------

  const actividadesPermitidas = useMemo(
    () => new Set(user ? actividadesDePlan(planActividades, user.plan) : []),
    [planActividades, user],
  );

  /** Inscripciones vivas del cliente, por sesión. */
  const miInscripcionPor = useMemo(() => {
    const mapa = new Map<string, Inscripcion>();
    if (!user) return mapa;
    for (const i of inscripciones) {
      if (i.alumno_id !== user.id) continue;
      if (i.estado === "cancelada") continue;
      mapa.set(i.sesion_id, i);
    }
    return mapa;
  }, [inscripciones, user]);

  /** Ocupados por sesión (las canceladas no ocupan lugar). */
  const ocupadosPor = useMemo(() => {
    const mapa = new Map<string, number>();
    for (const i of inscripciones) {
      if (i.estado === "cancelada") continue;
      mapa.set(i.sesion_id, (mapa.get(i.sesion_id) ?? 0) + 1);
    }
    return mapa;
  }, [inscripciones]);

  /** Días hábiles (Lun a Vie) de la semana que se está mirando. */
  const diasSemana = useMemo(
    () => Array.from({ length: 5 }, (_, i) => sumarDias(semanaSeleccionada.inicio, i)),
    [semanaSeleccionada.inicio],
  );

  const sesionesDelDia = useMemo(
    () =>
      sesiones
        .filter((s) => s.fecha === selectedFecha)
        .filter((s) => actividadesPermitidas.has(s.actividad))
        .sort((a, b) => a.hora.localeCompare(b.hora)),
    [sesiones, selectedFecha, actividadesPermitidas],
  );

  const duracionMin = config?.duracion_min ?? 60;

  /** Sesión ya inscripta que se solapa con la candidata (para advertencia). */
  const solapamiento = useMemo(() => {
    if (!confirmTarget) return null;
    for (const [sesionId] of miInscripcionPor) {
      const s = sesiones.find((x) => x.id === sesionId);
      if (!s || s.fecha !== confirmTarget.fecha || s.id === confirmTarget.id) continue;
      if (turnosSeSolapan(s.hora, confirmTarget.hora, duracionMin)) return s;
    }
    return null;
  }, [confirmTarget, miInscripcionPor, sesiones, duracionMin]);

  // --- efectos -----------------------------------------------------------

  useEffect(() => {
    if (loading || !initialized) return;
    void asegurarSesiones(diasSemana);
  }, [diasSemana, loading, initialized, asegurarSesiones]);

  // --- acciones ----------------------------------------------------------

  const handleReservar = (sesion: Sesion) => {
    setDayModalOpen(false);
    setConfirmTarget(sesion);
  };

  const handleConfirmar = async () => {
    if (!confirmTarget || !user) return;
    try {
      await inscribir(confirmTarget.id, user.id);
      pushToast("Turno reservado", "success");
    } catch (error) {
      pushToast(error instanceof Error ? error.message : "No se pudo reservar", "error");
    }
    setConfirmTarget(null);
  };

  const handleCancelar = async (sesion: Sesion) => {
    const inscripcion = miInscripcionPor.get(sesion.id);
    if (!inscripcion) return;
    try {
      await cancelarInscripcion(inscripcion.id);
      pushToast("Reserva cancelada", "success");
    } catch (error) {
      pushToast(error instanceof Error ? error.message : "No se pudo cancelar", "error");
    }
    setDayModalOpen(false);
  };

  // --- render ------------------------------------------------------------

  const actividadesIncluidas = user ? actividadesDePlan(planActividades, user.plan) : [];

  const tituloDiaCapitalizado = fechaLarga(selectedFecha).charAt(0).toUpperCase() + fechaLarga(selectedFecha).slice(1);

  return (
    <div className="flex flex-col h-full min-h-0 gap-4">
      {/* Cabecera: título y navegación de semana */}
      <div className="shrink-0 flex items-start justify-between gap-3 px-4 pt-5">
        <div className="min-w-0">
          <span className="block text-[11px] font-medium uppercase tracking-[0.2em] text-chrome">
            Reservar
          </span>
          <h1 className="chrome-text font-display text-2xl tracking-wide">
            Elegí tu turno
          </h1>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            onClick={() => {
              setDayModalOpen(false);
              setConfirmTarget(null);
              setSelectedFecha(sumarDias(semanaSeleccionada.inicio, -7));
            }}
            disabled={esSemanaActual}
            aria-label="Semana anterior"
            className="flex min-h-11 min-w-11 items-center justify-center rounded-xl border-2 border-border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon hover:border-neon/50 disabled:opacity-30"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="min-w-[84px] text-center font-mono text-[11px] uppercase tracking-wider text-text-mid">
            {etiquetaSemana(selectedFecha)}
          </span>
          <button
            onClick={() => {
              setDayModalOpen(false);
              setConfirmTarget(null);
              setSelectedFecha(sumarDias(semanaSeleccionada.inicio, 7));
            }}
            aria-label="Semana siguiente"
            className="flex min-h-11 min-w-11 items-center justify-center rounded-xl border-2 border-border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon hover:border-neon/50"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Resumen del plan */}
      {user && (
        <div className="plate-steel mx-4 rounded-xl border-2 border-neon px-4 py-3">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <span className="font-display text-lg tracking-wide text-chrome">
              {user.plan.toUpperCase()}
            </span>
            <span className="text-xs text-text-mid">
              · {frecuenciaDePlan(user.plan)} turnos por semana
            </span>
            <span className="text-xs text-text-muted">
              · {user.veces_mes_objetivo} al mes
            </span>
          </div>
          <p className="mt-1 font-mono text-[11px] leading-relaxed text-text-muted">
            {actividadesIncluidas.join(" · ")}
          </p>
        </div>
      )}

      {/* Cards de días */}
      <div className="grid grid-cols-2 gap-3 px-4 sm:grid-cols-5">
        {diasSemana.map((fecha) => {
          const dia = diaSemanaDe(fecha);
          const esHoy = fecha === hoy;
          const pasado = fecha < hoy;
          const sesionesDelDiaCard = sesiones.filter(
            (s) => s.fecha === fecha && actividadesPermitidas.has(s.actividad),
          );
          const disponibles = sesionesDelDiaCard.filter((s) => {
            const ocupados = ocupadosPor.get(s.id) ?? 0;
            const lugares = Math.max(0, s.cupo - ocupados);
            return lugares > 0 && !yaTermino(s, hoy);
          }).length;

          return (
            <button
              key={fecha}
              onClick={() => {
                setSelectedFecha(fecha);
                setDayModalOpen(true);
              }}
              aria-label={`${NOMBRES_DIA_CORTO[dia]} ${numeroDia(fecha)}`}
              className={`flex min-h-[80px] flex-col items-center justify-center gap-1 rounded-xl border-2 border-border bg-ink-2 p-2 text-center transition-colors hover:border-neon/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon cursor-pointer ${
                pasado ? "opacity-50" : ""
              }`}
            >
              <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-text-muted">
                {NOMBRES_DIA_CORTO[dia]}
              </span>
              <span
                className={`font-display text-3xl leading-none tracking-wide ${
                  esHoy ? "text-neon" : "text-text-hi"
                }`}
              >
                {numeroDia(fecha)}
              </span>
              {esHoy && (
                <span className="rounded border border-neon bg-neon/10 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-neon">
                  HOY
                </span>
              )}
              <span className="font-mono text-[10px] text-text-muted">
                {disponibles > 0 ? `${disponibles} turnos` : "Sin turnos"}
              </span>
            </button>
          );
        })}
      </div>

      {/* Modal con los horarios del día seleccionado */}
      <Modal
        open={dayModalOpen}
        onClose={() => setDayModalOpen(false)}
        title={tituloDiaCapitalizado}
      >
        {sesionesDelDia.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-text-muted">
            <CalendarX size={30} strokeWidth={1.5} />
            <p className="text-center text-sm text-text-hi">No hay turnos este día</p>
            <p className="max-w-[16rem] text-center text-xs text-text-muted">
              Probá con otro día de la semana o con la semana siguiente.
            </p>
            <button
              onClick={() => {
                setDayModalOpen(false);
                setSelectedFecha(sumarDias(semanaSeleccionada.inicio, 7));
              }}
              className="min-h-11 rounded-xl border-2 border-neon px-4 py-2 text-sm font-bold text-neon transition-colors hover:bg-neon/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon"
            >
              Ver semana siguiente
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {sesionesDelDia.map((sesion) => {
              const ocupados = ocupadosPor.get(sesion.id) ?? 0;
              const lugares = Math.max(0, sesion.cupo - ocupados);
              const completo = lugares === 0;
              const ultimo = lugares === 1;
              const inscrita = miInscripcionPor.has(sesion.id);
              const terminada = yaTermino(sesion, hoy);

              let estadoTexto: string;
              let estadoClase: string;
              if (inscrita) {
                estadoTexto = "Inscripto";
                estadoClase = "font-mono text-[9px] uppercase tracking-wider text-chrome";
              } else if (terminada) {
                estadoTexto = "Terminado";
                estadoClase = "font-mono text-[9px] uppercase tracking-wider text-text-muted";
              } else if (completo) {
                estadoTexto = "Completo";
                estadoClase = "font-mono text-[9px] uppercase tracking-wider text-danger";
              } else if (ultimo) {
                estadoTexto = "Último lugar";
                estadoClase = "font-mono text-[9px] uppercase tracking-wider text-warn";
              } else {
                estadoTexto = `${lugares} lugares`;
                estadoClase = "font-mono text-[9px] uppercase tracking-wider text-text-muted";
              }

              return (
                <div
                  key={sesion.id}
                  className="flex items-center justify-between gap-3 rounded-xl border-2 border-border bg-ink-2 p-3 py-3 transition-colors hover:border-neon/50 min-h-11"
                >
                  <div className="flex w-[64px] shrink-0 flex-col">
                    <span className="font-display text-2xl leading-none tracking-wide text-text-hi">
                      {sesion.hora}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1 flex flex-col gap-1">
                    <span className="truncate font-body text-sm font-bold text-text-hi">
                      {sesion.actividad}
                    </span>
                    <span className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-text-muted">
                      <User size={10} /> Coach {sesion.coach}
                    </span>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <PlateMeter ocupados={ocupados} total={sesion.cupo} size="sm" />
                    <span className={estadoClase}>{estadoTexto}</span>
                  </div>

                  <div className="shrink-0">
                    {inscrita ? (
                      <button
                        onClick={() => handleCancelar(sesion)}
                        aria-label="Cancelar esta reserva"
                        className="min-h-11 min-w-11 rounded-xl border border-danger bg-transparent px-3 py-2 text-center text-sm font-semibold text-danger transition-colors hover:bg-danger/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger"
                      >
                        Cancelar reserva
                      </button>
                    ) : terminada || completo ? (
                      <div className="min-h-11 min-w-11 flex items-center justify-center rounded-xl border-2 border-border px-3 py-2 text-center text-sm text-text-muted">
                        {estadoTexto}
                      </div>
                    ) : (
                      <button
                        onClick={() => handleReservar(sesion)}
                        aria-label="Reservar este turno"
                        className="min-h-11 min-w-11 rounded-xl border-2 border-neon bg-neon/10 px-3 py-2 text-center text-sm font-bold text-neon transition-colors hover:bg-neon/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon"
                      >
                        Reservar
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Modal>

      {/* Modal de confirmación de reserva */}
      <Modal
        open={!!confirmTarget}
        onClose={() => setConfirmTarget(null)}
        title="Confirmar reserva"
      >
        {confirmTarget && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <span className="font-display text-2xl tracking-wide text-text-hi">
                {confirmTarget.actividad}
              </span>
              <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
                Coach {confirmTarget.coach}
              </span>
            </div>
            <p className="font-mono text-[11px] uppercase tracking-wider text-text-mid">
              {fechaLarga(confirmTarget.fecha).charAt(0).toUpperCase() + fechaLarga(confirmTarget.fecha).slice(1)} · {confirmTarget.hora}
            </p>
            <div className="flex items-center gap-2">
              <PlateMeter
                ocupados={ocupadosPor.get(confirmTarget.id) ?? 0}
                total={confirmTarget.cupo}
                size="sm"
              />
              <span className="font-mono text-[10px] text-text-muted">
                {Math.max(0, confirmTarget.cupo - (ocupadosPor.get(confirmTarget.id) ?? 0))} lugares
              </span>
            </div>
            {solapamiento && (
              <div className="rounded-xl border-2 border-warn bg-warn/10 p-3 text-xs text-warn">
                Ya tenés un turno que se superpone: {solapamiento.actividad} a las {solapamiento.hora}. Reservar igual puede generar conflicto.
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={handleConfirmar}
                className="min-h-11 flex-1 rounded-xl border-2 border-neon bg-neon/10 py-3 text-center text-sm font-bold text-neon transition-colors hover:bg-neon/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon"
              >
                Confirmar
              </button>
              <button
                onClick={() => setConfirmTarget(null)}
                className="min-h-11 flex-1 rounded-xl border-2 border-border py-3 text-center text-sm font-semibold text-text-hi transition-colors hover:bg-ink-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chrome"
              >
                Volver
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
