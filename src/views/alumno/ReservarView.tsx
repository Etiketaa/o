import { useEffect, useMemo, useRef } from "react";
import type { Inscripcion, Sesion } from "@/types";
import { CalendarX, Check, ChevronLeft, ChevronRight, Clock, Lock, Star, User } from "lucide-react";
import { Modal, PlateMeter, useToast } from "@/components";
import { actividadesDePlan, useGymStore } from "@/stores/gymStore";
import { useAuthStore } from "@/stores/authStore";
import { useUIStore } from "@/stores/uiStore";
import { diaSemanaDe, etiquetaSemana, fechaLarga, hoyISO, semanaDe, sumarDias } from "@/lib/fechas";
import { franjaDeHora, NOMBRES_DIA_CORTO, turnosSeSolapan } from "@/lib/horarios";
import { frecuenciaDePlan } from "@/lib/semilla";

/** Número de día de una fecha ISO ("2026-10-21" → 21). */
function numeroDia(fechaISO: string): number {
  const [, , d] = fechaISO.split("-").map(Number);
  return d || 1;
}

/** El mismo horario en un día de la semana: sirve para marcar los preferidos. */
function esHorarioPreferido(
  sesion: Sesion,
  slots: Array<{ dia: string; hora: string }>,
): boolean {
  const dia = diaSemanaDe(sesion.fecha);
  return slots.some((s) => s.dia === dia && s.hora === sesion.hora);
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
    config,
    loading,
    initialized,
    asegurarSesiones,
    inscribir,
    cancelarInscripcion,
  } = useGymStore();
  const { selectedFecha, setSelectedFecha, selectedSesionId, setSelectedSesionId } = useUIStore();
  const { pushToast } = useToast();

  const duracion = config?.duracion_min ?? 60;
  const hoy = hoyISO();
  const semanaHoy = semanaDe(hoy);
  const semanaSeleccionada = semanaDe(selectedFecha);

  const StripRef = useRef<HTMLDivElement>(null);
  const botonesDia = useRef<Record<string, HTMLButtonElement | null>>({});

  // --- datos derivados ---------------------------------------------------

  const actividadesPermitidas = useMemo(
    () => new Set(user ? actividadesDePlan(planActividades, user.plan) : []),
    [planActividades, user],
  );

  const sesionPorId = useMemo(() => new Map(sesiones.map((s) => [s.id, s])), [sesiones]);

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

  const diasSemana = useMemo(
    () => Array.from({ length: 7 }, (_, i) => sumarDias(semanaSeleccionada.inicio, i)),
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

  const franjas = useMemo(
    () => [
      { clave: "manana" as const, titulo: "MAÑANA", lista: sesionesDelDia.filter((s) => franjaDeHora(s.hora) === "manana") },
      { clave: "tarde" as const, titulo: "TARDE", lista: sesionesDelDia.filter((s) => franjaDeHora(s.hora) === "tarde") },
    ],
    [sesionesDelDia],
  );

  const sesionModal = useMemo(
    () => (selectedSesionId ? (sesionPorId.get(selectedSesionId) ?? null) : null),
    [selectedSesionId, sesionPorId],
  );

  /** Otro turno del cliente que se pisa con el que se está por reservar. */
  const choque = useMemo(() => {
    if (!sesionModal || !user) return null;
    for (const i of inscripciones) {
      if (i.alumno_id !== user.id) continue;
      if (i.estado !== "confirmada") continue;
      if (i.sesion_id === sesionModal.id) continue;
      const otra = sesionPorId.get(i.sesion_id);
      if (!otra) continue;
      if (otra.fecha !== sesionModal.fecha) continue;
      if (!turnosSeSolapan(sesionModal.hora, otra.hora, duracion)) continue;
      return otra;
    }
    return null;
  }, [sesionModal, inscripciones, user, sesionPorId, duracion]);

  // --- efectos -----------------------------------------------------------

  // Materializamos las sesiones de la semana que se está mirando.
  useEffect(() => {
    if (loading || !initialized) return;
    void asegurarSesiones(diasSemana);
  }, [diasSemana, loading, initialized, asegurarSesiones]);

  // Que el día elegido quede siempre a la vista en el strip.
  useEffect(() => {
    const boton = botonesDia.current[selectedFecha];
    if (!boton) return;
    boton.scrollIntoView({ inline: "center", block: "nearest" });
  }, [selectedFecha, diasSemana]);

  // --- acciones ----------------------------------------------------------

  const handleReservar = async () => {
    if (!user || !sesionModal) return;
    try {
      await inscribir(sesionModal.id, user.id);
      pushToast("Turno reservado", "success");
    } catch (error) {
      pushToast(error instanceof Error ? error.message : "No se pudo reservar", "error");
    }
    setSelectedSesionId(null);
  };

  const handleCancelar = async () => {
    if (!sesionModal) return;
    const inscripcion = miInscripcionPor.get(sesionModal.id);
    if (!inscripcion) return;
    try {
      await cancelarInscripcion(inscripcion.id);
      pushToast("Reserva cancelada", "success");
    } catch (error) {
      pushToast(error instanceof Error ? error.message : "No se pudo cancelar", "error");
    }
    setSelectedSesionId(null);
  };

  // --- render ------------------------------------------------------------

  const actividadesIncluidas = user ? actividadesDePlan(planActividades, user.plan) : [];
  const esSemanaActual = semanaSeleccionada.inicio === semanaHoy.inicio;
  const yaEstaInscrito = sesionModal ? miInscripcionPor.has(sesionModal.id) : false;
  const ocupadosModal = sesionModal ? (ocupadosPor.get(sesionModal.id) ?? 0) : 0;
  const completaModal = sesionModal ? ocupadosModal >= sesionModal.cupo : false;
  const terminadaModal = sesionModal ? yaTermino(sesionModal, hoy) : false;

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Cabecera fija: título, semana y strip de días */}
      <div className="shrink-0 border-b border-border bg-ink">
        <div className="flex items-start justify-between gap-3 px-4 pt-5">
          <div className="min-w-0">
            <span className="block text-[11px] font-medium uppercase tracking-[0.2em] text-chrome">
              Reservar
            </span>
            <h1 className="chrome-text font-display text-2xl tracking-wide">Elegí tu turno</h1>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <button
              onClick={() => setSelectedFecha(sumarDias(semanaSeleccionada.inicio, -7))}
              disabled={esSemanaActual}
              aria-label="Semana anterior"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-text-muted transition-colors hover:text-text-hi disabled:opacity-30"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="min-w-[84px] text-center font-mono text-[11px] uppercase tracking-wider text-text-mid">
              {etiquetaSemana(selectedFecha)}
            </span>
            <button
              onClick={() => setSelectedFecha(sumarDias(semanaSeleccionada.inicio, 7))}
              aria-label="Semana siguiente"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-text-muted transition-colors hover:text-text-hi"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Strip de 7 días con scroll-snap */}
        <div
          ref={StripRef}
          className="flex snap-x snap-mandatory gap-2 overflow-x-auto px-4 pb-3 pt-3"
        >
          {diasSemana.map((fecha) => {
            const activa = fecha === selectedFecha;
            const esHoy = fecha === hoy;
            return (
              <button
                key={fecha}
                ref={(el) => {
                  botonesDia.current[fecha] = el;
                }}
                onClick={() => setSelectedFecha(fecha)}
                aria-current={activa ? "date" : undefined}
                aria-label={`${NOMBRES_DIA_CORTO[diaSemanaDe(fecha)]} ${numeroDia(fecha)}`}
                className={`flex min-h-[72px] w-[62px] shrink-0 snap-start flex-col items-center justify-center gap-0.5 rounded-xl border transition-colors ${
                  activa
                    ? "border-chrome bg-chrome/10"
                    : "border-border bg-ink-2 hover:border-border-hi"
                }`}
              >
                <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-text-muted">
                  {NOMBRES_DIA_CORTO[diaSemanaDe(fecha)]}
                </span>
                <span
                  className={`font-display text-2xl leading-none tracking-wide ${
                    activa ? "chrome-text" : "text-text-hi"
                  }`}
                >
                  {numeroDia(fecha)}
                </span>
                <span
                  className={`font-mono text-[9px] uppercase tracking-wider ${
                    esHoy ? "text-chrome" : "text-transparent"
                  }`}
                >
                  Hoy
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Contenido */}
      <div className="flex-1 overflow-y-auto px-4 pb-[calc(5rem+env(safe-area-inset-bottom,0px))] pt-4">
        {/* Resumen del plan */}
        {user && (
          <div className="plate-steel mb-4 rounded-xl px-4 py-3">
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

        {/* Encabezado del día */}
        <div className="mb-3 flex items-baseline justify-between gap-3">
          <h2 className="font-display text-xl uppercase tracking-wide text-text-hi">
            {fechaLarga(selectedFecha)}
          </h2>
          <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
            {sesionesDelDia.length} turnos
          </span>
        </div>

        {loading && sesionesDelDia.length === 0 && (
          <div className="flex flex-col gap-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="skeleton h-24 rounded-xl" />
            ))}
          </div>
        )}

        {!loading && sesionesDelDia.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-text-muted">
            <CalendarX size={30} strokeWidth={1.5} />
            <p className="text-center text-sm">No hay turnos este día</p>
            <p className="max-w-[16rem] text-center text-xs text-text-muted">
              Probá con otro día de la semana o con la semana siguiente.
            </p>
          </div>
        )}

        {/* Turnos por franja */}
        {franjas.map(
          (franja) =>
            franja.lista.length > 0 && (
              <section key={franja.clave} className="mb-6">
                <div className="mb-2 flex items-center gap-3">
                  <h3 className="font-display text-sm uppercase tracking-[0.2em] text-chrome-dim">
                    {franja.titulo}
                  </h3>
                  <span className="h-px flex-1 bg-border" />
                </div>
                <div className="flex flex-col gap-2">
                  {franja.lista.map((sesion) => {
                    const ocupados = ocupadosPor.get(sesion.id) ?? 0;
                    const lugares = Math.max(0, sesion.cupo - ocupados);
                    const completo = lugares === 0;
                    const ultimo = lugares === 1;
                    const inscrita = miInscripcionPor.has(sesion.id);
                    const preferida = user
                      ? esHorarioPreferido(sesion, user.slots_preferidos)
                      : false;
                    const terminada = yaTermino(sesion, hoy);

                    return (
                      <button
                        key={sesion.id}
                        onClick={() => setSelectedSesionId(sesion.id)}
                        className={`flex w-full items-center gap-4 rounded-xl border px-4 py-3 text-left transition-colors ${
                          inscrita
                            ? "border-chrome/40 bg-chrome/5"
                            : "border-border bg-ink-2 hover:border-border-hi"
                        } ${(completo || terminada) && !inscrita ? "opacity-55" : ""}`}
                      >
                        <div className="flex w-[64px] shrink-0 flex-col">
                          <span className="font-display text-2xl leading-none tracking-wide text-text-hi">
                            {sesion.hora}
                          </span>
                          {preferida && (
                            <span className="mt-1 flex items-center gap-1 font-mono text-[9px] uppercase tracking-wider text-chrome">
                              <Star size={9} /> Favorito
                            </span>
                          )}
                        </div>

                        <div className="flex min-w-0 flex-1 flex-col gap-1">
                          <span className="truncate font-body text-sm font-bold text-text-hi">
                            {sesion.actividad}
                          </span>
                          <span className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-text-muted">
                            <User size={10} /> {sesion.coach}
                          </span>
                        </div>

                        <div className="flex shrink-0 flex-col items-end gap-1">
                          <PlateMeter ocupados={ocupados} total={sesion.cupo} size="sm" />
                          {inscrita ? (
                            <span className="flex items-center gap-1 font-mono text-[9px] uppercase tracking-wider text-chrome">
                              <Check size={10} /> Inscripto
                            </span>
                          ) : terminada ? (
                            <span className="font-mono text-[9px] uppercase tracking-wider text-text-muted">
                              Terminado
                            </span>
                          ) : ultimo ? (
                            <span className="font-mono text-[9px] uppercase tracking-wider text-warn">
                              Último lugar
                            </span>
                          ) : completo ? (
                            <span className="flex items-center gap-1 font-mono text-[9px] uppercase tracking-wider text-danger">
                              <Lock size={10} /> Completo
                            </span>
                          ) : (
                            <span className="font-mono text-[9px] uppercase tracking-wider text-text-muted">
                              {lugares} lugares
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>
            ),
        )}
      </div>

      {/* Modal de confirmación */}
      <Modal
        open={!!sesionModal}
        onClose={() => setSelectedSesionId(null)}
        title={yaEstaInscrito ? "Cancelar reserva" : "Reservar turno"}
      >
        {sesionModal && (
          <div className="flex flex-col gap-4">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-wider text-chrome-dim">
                {fechaLarga(sesionModal.fecha)}
              </p>
              <h3 className="chrome-text font-display text-3xl tracking-wide">
                {sesionModal.hora}
              </h3>
              <p className="mt-1 font-body text-sm font-bold text-text-hi">
                {sesionModal.actividad}
              </p>
              <p className="font-mono text-[11px] uppercase tracking-wider text-text-muted">
                Coach {sesionModal.coach}
              </p>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border bg-ink-2 px-3 py-2">
              <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
                Cupo
              </span>
              <PlateMeter ocupados={ocupadosModal} total={sesionModal.cupo} />
            </div>

            {choque && (
              <div className="flex items-start gap-2 rounded-lg border border-warn/40 bg-warn/10 px-3 py-2">
                <Clock size={14} className="mt-0.5 shrink-0 text-warn" />
                <p className="text-xs leading-relaxed text-warn">
                  Se pisa con otro turno tuyo: {choque.actividad} de las {choque.hora}.
                </p>
              </div>
            )}

            {yaEstaInscrito ? (
              <>
                <p className="text-xs text-text-muted">
                  Si cancelás, el lugar queda disponible para otro alumno.
                </p>
                <button
                  onClick={handleCancelar}
                  className="w-full rounded-xl border border-danger py-3 text-center text-sm font-semibold text-danger transition-colors hover:bg-danger/10"
                >
                  Cancelar reserva
                </button>
              </>
            ) : completaModal ? (
              <div className="flex w-full items-center justify-center gap-2 rounded-xl border border-border py-3 text-sm text-text-muted">
                <Lock size={14} /> Sin cupo disponible
              </div>
            ) : terminadaModal ? (
              <div className="flex w-full items-center justify-center gap-2 rounded-xl border border-border py-3 text-sm text-text-muted">
                <Clock size={14} /> Este turno ya pasó
              </div>
            ) : (
              <button
                onClick={handleReservar}
                className="w-full rounded-xl bg-chrome py-3 text-center text-sm font-bold text-ink transition-opacity hover:opacity-90"
              >
                Reservar
              </button>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
