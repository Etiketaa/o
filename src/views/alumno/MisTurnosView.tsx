import { useEffect, useMemo, useState } from "react";
import type { Feedback, Inscripcion, Sesion } from "@/types";
import { CalendarCheck, Flame, MessageSquare, ThumbsDown, ThumbsUp, X } from "lucide-react";
import { Modal, useToast } from "@/components";
import { useGymStore } from "@/stores/gymStore";
import { useAuthStore } from "@/stores/authStore";
import { useUIStore } from "@/stores/uiStore";
import { formatearCuentaRegresiva, useReloj } from "@/hooks/useTurnoAlerta";
import { fechaCorta, fechaLarga, hoyISO, minutosParaEmpezar, sesionTermino, sumarDias } from "@/lib/fechas";
import { infoNivel, resumenAlumno, type Nivel } from "@/lib/puntaje";

const CLASE_NIVEL: Record<Nivel, string> = {
  acero: "text-nivel-acero",
  plata: "text-nivel-plata",
  platino: "text-nivel-platino",
  diamante: "text-nivel-diamante",
};

interface FeedbackBloqueProps {
  inscripcion: Inscripcion;
  sesion: Sesion;
  onGuardar: (feedback: Feedback, comentario: string) => Promise<void>;
}

function FeedbackBloque({ inscripcion, sesion, onGuardar }: FeedbackBloqueProps) {
  const [seleccion, setSeleccion] = useState<Feedback | null>(inscripcion.feedback ?? null);
  const [comentario, setComentario] = useState(inscripcion.comentario ?? "");
  const [editando, setEditando] = useState(!inscripcion.feedback);
  const [guardando, setGuardando] = useState(false);

  const yaRespondio = Boolean(inscripcion.feedback) && !editando;

  const handleGuardar = async () => {
    if (!seleccion) return;
    setGuardando(true);
    await onGuardar(seleccion, comentario.trim());
    setGuardando(false);
    setEditando(false);
  };

  return (
    <div className="mt-3 rounded-lg border border-border bg-ink px-3 py-3">
      {yaRespondio ? (
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            {inscripcion.feedback === "up" ? (
              <ThumbsUp size={14} className="shrink-0 text-chrome" />
            ) : (
              <ThumbsDown size={14} className="shrink-0 text-danger" />
            )}
            <span className="truncate text-xs text-text-mid">Gracias por responder</span>
          </div>
          <button
            onClick={() => setEditando(true)}
            className="shrink-0 rounded-lg border border-border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-text-muted transition-colors hover:text-text-hi"
          >
            Cambiar
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <p className="text-xs font-semibold text-text-hi">¿Cómo fue tu turno?</p>

          <div className="flex gap-2">
            <button
              onClick={() => setSeleccion("up")}
              aria-label="Turno bueno"
              aria-pressed={seleccion === "up"}
              className={`flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg border text-sm font-semibold transition-colors ${
                seleccion === "up"
                  ? "border-chrome bg-chrome/10 text-chrome"
                  : "border-border bg-ink-2 text-text-mid hover:border-border-hi"
              }`}
            >
              <ThumbsUp size={18} />
              Bien
            </button>
            <button
              onClick={() => setSeleccion("down")}
              aria-label="Turno malo"
              aria-pressed={seleccion === "down"}
              className={`flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg border text-sm font-semibold transition-colors ${
                seleccion === "down"
                  ? "border-danger bg-danger/10 text-danger"
                  : "border-border bg-ink-2 text-text-mid hover:border-border-hi"
              }`}
            >
              <ThumbsDown size={18} />
              Mal
            </button>
          </div>

          <div className="flex items-center gap-2 rounded-lg border border-border bg-ink-2 px-3">
            <MessageSquare size={14} className="shrink-0 text-text-muted" />
            <input
              type="text"
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              placeholder="Comentario (opcional)"
              aria-label={`Comentario sobre ${sesion.actividad}`}
              className="min-h-11 w-full bg-transparent text-sm text-text-hi outline-none placeholder:text-text-muted"
            />
          </div>

          <button
            onClick={handleGuardar}
            disabled={!seleccion || guardando}
            className="min-h-11 rounded-lg bg-chrome text-sm font-bold text-ink transition-opacity hover:opacity-90 disabled:opacity-30"
          >
            {guardando ? "Guardando..." : "Guardar"}
          </button>
        </div>
      )}
    </div>
  );
}

export function MisTurnosView() {
  const { user } = useAuthStore();
  const {
    inscripciones,
    sesiones,
    config,
    loading,
    initialized,
    asegurarSesiones,
    cancelarInscripcion,
    guardarFeedback,
  } = useGymStore();
  const { setActiveTab } = useUIStore();
  const { pushToast } = useToast();
  const ahora = useReloj();

  const duracion = config?.duracion_min ?? 60;

  const misInscripciones = useMemo(
    () => (user ? inscripciones.filter((i) => i.alumno_id === user.id) : []),
    [inscripciones, user],
  );

  const sesionPorId = useMemo(() => new Map(sesiones.map((s) => [s.id, s])), [sesiones]);

  /** Inscripción + sesión, sólo las que encontramos cargadas. */
  const pares = useMemo(
    () =>
      misInscripciones
        .map((inscripcion) => {
          const sesion = sesionPorId.get(inscripcion.sesion_id);
          return sesion ? { inscripcion, sesion } : null;
        })
        .filter((p): p is { inscripcion: Inscripcion; sesion: Sesion } => p !== null),
    [misInscripciones, sesionPorId],
  );

  const resumen = useMemo(
    () => (user ? resumenAlumno(pares, user, ahora) : null),
    [pares, user, ahora],
  );

  const proximos = useMemo(
    () =>
      pares
        .filter(
          (p) =>
            p.inscripcion.estado === "confirmada" &&
            !sesionTermino(p.sesion.fecha, p.sesion.hora, duracion, ahora),
        )
        .sort((a, b) =>
          `${a.sesion.fecha}${a.sesion.hora}`.localeCompare(`${b.sesion.fecha}${b.sesion.hora}`),
        ),
    [pares, duracion, ahora],
  );

  const pasados = useMemo(
    () =>
      pares
        .filter(
          (p) =>
            p.inscripcion.estado !== "cancelada" &&
            sesionTermino(p.sesion.fecha, p.sesion.hora, duracion, ahora),
        )
        .sort((a, b) =>
          `${b.sesion.fecha}${b.sesion.hora}`.localeCompare(`${a.sesion.fecha}${a.sesion.hora}`),
        ),
    [pares, duracion, ahora],
  );

  const [cancelTarget, setCancelTarget] = useState<{
    inscripcion: Inscripcion;
    sesion: Sesion;
  } | null>(null);

  // Las sesiones de los turnos del cliente (pasados y futuros) tienen que estar cargadas.
  useEffect(() => {
    if (loading || !initialized) return;
    const hoy = hoyISO();
    const fechas = [
      ...Array.from({ length: 28 }, (_, i) => sumarDias(hoy, i)),
      ...Array.from({ length: 60 }, (_, i) => sumarDias(hoy, -i)),
    ];
    void asegurarSesiones(fechas);
  }, [loading, initialized, asegurarSesiones]);

  const handleCancelar = async () => {
    if (!cancelTarget) return;
    try {
      await cancelarInscripcion(cancelTarget.inscripcion.id);
      pushToast("Reserva cancelada", "success");
    } catch (error) {
      pushToast(error instanceof Error ? error.message : "No se pudo cancelar", "error");
    }
    setCancelTarget(null);
  };

  const handleFeedback = async (inscripcion: Inscripcion, feedback: Feedback, comentario: string) => {
    try {
      await guardarFeedback(inscripcion.id, feedback, comentario);
      pushToast("¡Gracias por responder!", "success");
    } catch (error) {
      pushToast(error instanceof Error ? error.message : "No se pudo guardar", "error");
    }
  };

  const nivel = resumen ? infoNivel(resumen.nivel) : null;

  return (
    <div className="h-full overflow-y-auto px-4 pb-[calc(5rem+env(safe-area-inset-bottom,0px))] pt-5">
      <div className="mx-auto max-w-4xl">
        <span className="block text-[11px] font-medium uppercase tracking-[0.2em] text-chrome">
          Mis turnos
        </span>
        <h1 className="chrome-text font-display text-2xl tracking-wide">Tus reservas</h1>

        {/* Resumen de puntaje */}
        {resumen && nivel && (
          <div className="plate-steel mt-4 rounded-xl px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-muted">
                  Nivel
                </span>
                <p
                  className={`font-display text-xl uppercase leading-tight tracking-wide ${CLASE_NIVEL[resumen.nivel]}`}
                >
                  {nivel.nombre}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <Flame size={16} className="text-warn" />
                  <span className="font-display text-lg leading-none text-text-hi">
                    {resumen.racha}
                  </span>
                </div>
                <div className="text-right">
                  <span className="block font-mono text-[10px] uppercase tracking-[0.2em] text-text-muted">
                    Concurrencia
                  </span>
                  <span className="font-display text-lg leading-none text-text-hi">
                    {resumen.concurrencia}%
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setActiveTab("progreso")}
              className="mt-3 min-h-11 w-full rounded-lg border border-chrome/40 py-2 font-mono text-[11px] uppercase tracking-[0.2em] text-chrome transition-colors hover:bg-chrome/10"
            >
              Ver progreso y recompensas
            </button>
          </div>
        )}

        {/* Próximos */}
        <section className="mt-7">
          <div className="mb-3 flex items-center gap-3">
            <h2 className="font-display text-lg uppercase tracking-[0.2em] text-chrome-dim">
              Próximos
            </h2>
            <span className="h-px flex-1 bg-border" />
            <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
              {proximos.length}
            </span>
          </div>

          {loading && proximos.length === 0 && (
            <div className="flex flex-col gap-3">
              {[0, 1].map((i) => (
                <div key={i} className="skeleton h-28 rounded-xl" />
              ))}
            </div>
          )}

          {!loading && proximos.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-border bg-ink-2 py-10 text-text-muted">
              <CalendarCheck size={28} strokeWidth={1.5} />
              <p className="text-sm">No tenés turnos reservados</p>
              <button
                onClick={() => setActiveTab("reservar")}
                className="min-h-11 rounded-lg border border-chrome/40 px-4 font-mono text-[11px] uppercase tracking-[0.2em] text-chrome transition-colors hover:bg-chrome/10"
              >
                Reservar un turno
              </button>
            </div>
          )}

          <div className="flex flex-col gap-3">
            {proximos.map(({ inscripcion, sesion }) => {
              const minutos = minutosParaEmpezar(sesion.fecha, sesion.hora, ahora);
              const empezó = minutos <= 0;
              return (
                <article
                  key={inscripcion.id}
                  className="rounded-xl border border-chrome/30 bg-ink-2 px-4 py-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex w-[58px] shrink-0 flex-col">
                        <span className="font-mono text-[10px] uppercase tracking-wider text-chrome-dim">
                          {fechaCorta(sesion.fecha)}
                        </span>
                        <span className="font-display text-2xl leading-none tracking-wide text-text-hi">
                          {sesion.hora}
                        </span>
                      </div>
                      <div className="flex min-w-0 flex-col gap-1">
                        <span className="truncate font-body text-sm font-bold text-text-hi">
                          {sesion.actividad}
                        </span>
                        <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
                          Coach {sesion.coach}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => setCancelTarget({ inscripcion, sesion })}
                      aria-label="Cancelar reserva"
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border text-text-muted transition-colors hover:border-danger hover:text-danger"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <p
                    className={`mt-2 font-mono text-[11px] uppercase tracking-wider ${
                      empezó ? "text-warn" : "text-chrome"
                    }`}
                  >
                    {empezó ? "En curso" : formatearCuentaRegresiva(minutos)}
                  </p>
                </article>
              );
            })}
          </div>
        </section>

        {/* Pasados */}
        <section className="mt-8">
          <div className="mb-3 flex items-center gap-3">
            <h2 className="font-display text-lg uppercase tracking-[0.2em] text-chrome-dim">
              Pasados
            </h2>
            <span className="h-px flex-1 bg-border" />
            <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
              {pasados.length}
            </span>
          </div>

          {!loading && pasados.length === 0 && (
            <p className="rounded-xl border border-border bg-ink-2 px-4 py-6 text-center text-sm text-text-muted">
              Todavía no hay turnos pasados.
            </p>
          )}

          <div className="flex flex-col gap-3">
            {pasados.map(({ inscripcion, sesion }) => (
              <article key={inscripcion.id} className="rounded-xl border border-border bg-ink-2 px-4 py-3">
                <div className="flex items-start gap-3">
                  <div className="flex w-[58px] shrink-0 flex-col">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
                      {fechaCorta(sesion.fecha)}
                    </span>
                    <span className="font-display text-2xl leading-none tracking-wide text-text-hi">
                      {sesion.hora}
                    </span>
                  </div>
                  <div className="flex min-w-0 flex-col gap-1">
                    <span className="truncate font-body text-sm font-bold text-text-hi">
                      {sesion.actividad}
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
                      Coach {sesion.coach}
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
                      {inscripcion.estado === "asistio"
                        ? "Asististe"
                        : inscripcion.estado === "faltó"
                          ? "No assististe"
                          : "Sin marcar"}
                    </span>
                  </div>
                </div>

                <FeedbackBloque
                  inscripcion={inscripcion}
                  sesion={sesion}
                  onGuardar={(feedback, comentario) =>
                    handleFeedback(inscripcion, feedback, comentario)
                  }
                />
              </article>
            ))}
          </div>
        </section>
      </div>

      {/* Confirmación de cancelación */}
      <Modal
        open={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        title="Cancelar reserva"
      >
        {cancelTarget && (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-text-mid">
              ¿Seguro que querés cancelar tu reserva de{" "}
              <span className="font-semibold text-chrome">{cancelTarget.sesion.actividad}</span>?
            </p>
            <p className="font-mono text-[11px] uppercase tracking-wider text-text-muted">
              {fechaLarga(cancelTarget.sesion.fecha)} · {cancelTarget.sesion.hora}
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleCancelar}
                className="min-h-11 flex-1 rounded-xl border border-danger py-3 text-center text-sm font-semibold text-danger transition-colors hover:bg-danger/10"
              >
                Sí, cancelar
              </button>
              <button
                onClick={() => setCancelTarget(null)}
                className="min-h-11 flex-1 rounded-xl border border-border py-3 text-center text-sm font-semibold text-text-hi transition-colors hover:bg-ink-3"
              >
                No, mantener
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
