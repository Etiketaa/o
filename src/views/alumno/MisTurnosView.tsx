import { useEffect, useMemo, useState } from "react";
import type { Feedback, Inscripcion, Sesion } from "@/types";
import { CalendarCheck, MessageSquare, ThumbsDown, ThumbsUp, X } from "lucide-react";
import { Modal, useToast } from "@/components";
import { useGymStore } from "@/stores/gymStore";
import { useAuthStore } from "@/stores/authStore";
import { useUIStore } from "@/stores/uiStore";
import { formatearCuentaRegresiva, useReloj } from "@/hooks/useTurnoAlerta";
import { db } from "@/lib/db";
import {
  fechaCorta,
  fechaLarga,
  hoyISO,
  minutosParaEmpezar,
  sesionTermino,
  sumarDias,
  etiquetaDiaRelativo,
} from "@/lib/fechas";
import { infoNivel, resumenAlumno, type Nivel } from "@/lib/puntaje";

const CLASE_NIVEL: Record<Nivel, string> = {
  acero: "text-nivel-acero",
  plata: "text-nivel-plata",
  platino: "text-nivel-platino",
  diamante: "text-nivel-diamante",
};

/* ------------------------------------------------------------------ */
/*  FeedbackBloque — se conserva igual: Bien / Mal + comentario + Guardar */
/* ------------------------------------------------------------------ */

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
    <div className="mt-3 rounded-lg border-2 border-border bg-ink-2 px-3 py-3">
      {yaRespondio ? (
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            {inscripcion.feedback === "up" ? (
              <ThumbsUp size={14} className="shrink-0 text-chrome" aria-hidden="true" />
            ) : (
              <ThumbsDown size={14} className="shrink-0 text-danger" aria-hidden="true" />
            )}
            <span className="truncate text-xs text-text-mid">
              Gracias por responder
            </span>
          </div>
          <button
            onClick={() => setEditando(true)}
            aria-label="Cambiar tu respuesta de feedback"
            className="shrink-0 min-h-11 min-w-11 rounded-lg border-2 border-border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-text-hi transition-colors hover:text-chrome focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chrome"
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
              aria-pressed={seleccion === "up" ? "true" : "false"}
              className={`flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg border-2 text-sm font-semibold transition-colors ${
                seleccion === "up"
                  ? "border-chrome bg-chrome/10 text-chrome"
                  : "border-border bg-ink-2 text-text-mid hover:border-border-hi"
              } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chrome`}
            >
              <ThumbsUp size={18} aria-hidden="true" />
              Bien
            </button>
            <button
              onClick={() => setSeleccion("down")}
              aria-label="Turno malo"
              aria-pressed={seleccion === "down" ? "true" : "false"}
              className={`flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg border-2 text-sm font-semibold transition-colors ${
                seleccion === "down"
                  ? "border-danger bg-danger/10 text-danger"
                  : "border-border bg-ink-2 text-text-mid hover:border-border-hi"
              } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger`}
            >
              <ThumbsDown size={18} aria-hidden="true" />
              Mal
            </button>
          </div>

          <div className="flex items-center gap-2 rounded-lg border-2 border-border bg-ink-2 px-3">
            <MessageSquare size={14} className="shrink-0 text-text-muted" aria-hidden="true" />
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
            className="min-h-11 rounded-lg bg-chrome text-sm font-bold text-ink transition-opacity hover:opacity-90 disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chrome"
          >
            {guardando ? "Guardando..." : "Guardar"}
          </button>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Héroe: turno más próximo (o en curso)                             */
/* ------------------------------------------------------------------ */

interface HeroTurnProps {
  inscripcion: Inscripcion;
  sesion: Sesion;
  minutos: number;
  onCancelar: () => void;
}

function HeroTurn({ sesion, minutos, onCancelar }: HeroTurnProps) {
  const empezó = minutos <= 0;
  const etiquetaDia = etiquetaDiaRelativo(sesion.fecha) || fechaCorta(sesion.fecha);

  return (
    <article
      className={`brutal-card relative overflow-hidden ${empezó ? "brutal-card-neon" : ""}`}
    >
      <div className="px-5 py-5">
        {/* Fecha + hora */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div className="flex flex-col gap-1">
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-text-muted">
              {etiquetaDia}
            </span>
            <span className="font-display text-5xl leading-none tracking-wide text-text-hi">
              {sesion.hora}
            </span>
          </div>
          <div className="flex min-w-0 flex-col gap-1 sm:flex-1 sm:items-end sm:justify-between">
            <span className="truncate font-body text-lg font-bold text-text-hi">
              {sesion.actividad}
            </span>
            <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
              Coach {sesion.coach}
            </span>
          </div>
        </div>

        {/* Cuenta regresiva + botón cancelar */}
        <div className="mt-5 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:justify-between">
          <div className="flex items-center gap-2">
            <span
              className={`font-mono text-[11px] uppercase tracking-[0.2em] ${
                empezó ? "text-neon" : "text-chrome"
              }`}
            >
              {empezó ? "EN CURSO" : formatearCuentaRegresiva(minutos)}
            </span>
            {empezó && (
              <span className="inline-flex items-center gap-1 rounded-lg border-2 border-neon bg-neon/10 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-neon">
                En curso
              </span>
            )}
          </div>
          <button
            onClick={onCancelar}
            aria-label={`Cancelar reserva de ${sesion.actividad}`}
            className="min-h-11 shrink-0 flex items-center justify-center rounded-lg border-2 border-danger px-3 font-mono text-[10px] uppercase tracking-[0.2em] text-danger transition-colors hover:bg-danger/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger"
          >
            <X size={16} aria-hidden="true" />
            Cancelar
          </button>
        </div>
      </div>
    </article>
  );
}

/* ------------------------------------------------------------------ */
/*  Próximo restante: item compacto de la lista secundaria            */
/* ------------------------------------------------------------------ */

interface ProximoItemProps {
  inscripcion: Inscripcion;
  sesion: Sesion;
  minutos: number;
  onCancelar: () => void;
}

function ProximoItem({ sesion, minutos, onCancelar }: ProximoItemProps) {
  const empezó = minutos <= 0;

  return (
    <article className="rounded-xl border-2 border-border bg-ink-2 px-4 py-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex w-[56px] shrink-0 flex-col">
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
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <p className={`font-mono text-[10px] uppercase tracking-wider ${
            empezó ? "text-warn" : "text-chrome-dim"
          }`}>
            {empezó ? "En curso" : formatearCuentaRegresiva(minutos)}
          </p>
          <button
            onClick={onCancelar}
            aria-label={`Cancelar reserva de ${sesion.actividad}`}
            className="min-h-11 min-w-11 shrink-0 flex items-center justify-center rounded-lg border-2 border-border text-text-muted transition-colors hover:border-danger hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>
      </div>
    </article>
  );
}

/* ------------------------------------------------------------------ */
/*  Vista principal                                                   */
/* ------------------------------------------------------------------ */

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
    cargarInscripciones,
    marcarAsistencia,
    guardarFeedback,
  } = useGymStore();
  const { setActiveTab } = useUIStore();
  const { pushToast } = useToast();
  const ahora = useReloj();

  // Toast deshacer: se muestra tras cancelar una reserva o guardar feedback.
  // Auto-descarta a los 5 segundos si el usuario no hace clic en "Deshacer".
  const [undoToast, setUndoToast] = useState<{
    tipo: "cancelar" | "feedback";
    id: string;
    mensaje: string;
    feedback?: Feedback | null;
    comentario?: string;
  } | null>(null);

  useEffect(() => {
    if (!undoToast) return;
    const timer = setTimeout(() => setUndoToast(null), 5000);
    return () => clearTimeout(timer);
  }, [undoToast]);

  const deshacerUndo = async () => {
    if (!undoToast) return;
    try {
      if (undoToast.tipo === "cancelar") {
        // Re-activar la inscripción (vuelve a "confirmada").
        await marcarAsistencia(undoToast.id, "confirmada");
        pushToast("Reserva reactivada", "info");
      } else {
        const previo = undoToast.feedback;
        if (previo) {
          // Había feedback previo: lo restauramos por la tienda (db + zustand).
          await guardarFeedback(undoToast.id, previo, undoToast.comentario ?? "");
        } else {
          // Era feedback nuevo (no había previo): lo borramos directamente y
          // recargamos las inscripciones para que zustand se sincronice.
          await db.actualizarInscripcion(undoToast.id, {
            feedback: null,
            comentario: "",
            feedback_at: null,
          });
          await cargarInscripciones();
        }
        pushToast("Feedback deshecho", "info");
      }
    } catch (error) {
      pushToast(
        error instanceof Error ? error.message : "No se pudo deshacer",
        "error",
      );
    }
    setUndoToast(null);
  };

  const duracion = config?.duracion_min ?? 60;

  const misInscripciones = useMemo(
    () => (user ? inscripciones.filter((i) => i.alumno_id === user.id) : []),
    [inscripciones, user],
  );

  const sesionPorId = useMemo(() => new Map(sesiones.map((s) => [s.id, s])), [sesiones]);

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

  // Solo pasados que aún no tienen feedback (ya respondidos no se muestran).
  const pasadosSinFeedback = useMemo(
    () => pasados.filter((p) => p.inscripcion.feedback === null),
    [pasados],
  );

  const proximo = proximos[0];
  const restantes = proximos.slice(1);

  const [cancelTarget, setCancelTarget] = useState<{
    inscripcion: Inscripcion;
    sesion: Sesion;
  } | null>(null);

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
      setUndoToast({
        tipo: "cancelar",
        id: cancelTarget.inscripcion.id,
        mensaje: "Reserva cancelada",
      });
      pushToast("Reserva cancelada", "success");
    } catch (error) {
      pushToast(error instanceof Error ? error.message : "No se pudo cancelar", "error");
    }
    setCancelTarget(null);
  };

  const handleFeedback = async (
    inscripcion: Inscripcion,
    feedback: Feedback,
    comentario: string,
  ) => {
    try {
      await guardarFeedback(inscripcion.id, feedback, comentario);
      setUndoToast({
        tipo: "feedback",
        id: inscripcion.id,
        mensaje: "¡Gracias por responder!",
        feedback: inscripcion.feedback ?? null,
        comentario: inscripcion.comentario ?? "",
      });
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

        {/* Toast deshacer: aparece tras cancelar una reserva o guardar feedback. */}
        {undoToast && (
          <div className="mt-3 rounded-lg border-2 border-border bg-ink-2 px-4 py-3 flex items-center justify-between gap-3 shadow-lg">
            <p className="text-sm text-text-hi">{undoToast.mensaje}</p>
            <button
              onClick={deshacerUndo}
              aria-label="Deshacer"
              className="text-xs font-mono text-chrome underline decoration-chrome/40 hover:text-chrome hover:decoration-chrome focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chrome"
            >
              Deshacer
            </button>
          </div>
        )}

        {/* Esqueleto mientras carga y no hay datos aún */}
        {loading && proximos.length === 0 && (
          <div className="mt-6 flex flex-col gap-3">
            {[0, 1].map((i) => (
              <div key={i} className="skeleton h-28 rounded-xl" />
            ))}
          </div>
        )}

        {/* Estado vacío: sin turnos próximos */}
        {!loading && proximos.length === 0 && (
          <section className="mt-6 flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-border bg-ink-2 py-16 text-center">
            <CalendarCheck size={32} strokeWidth={1.5} aria-hidden="true" />
            <p className="text-sm font-semibold text-text-hi">No tenés turnos reservados</p>
            <button
              onClick={() => setActiveTab("reservar")}
              className="min-h-11 rounded-lg border-2 border-neon bg-transparent px-6 font-mono text-[10px] uppercase tracking-[0.2em] text-neon transition-colors hover:bg-neon hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon"
            >
              Reservar un turno
            </button>
          </section>
        )}

        {proximo && (
          <>
            {/* 1. HÉROE: próximo turno (o en curso) */}
            <section className="mt-6">
              <HeroTurn
                inscripcion={proximo.inscripcion}
                sesion={proximo.sesion}
                minutos={minutosParaEmpezar(proximo.sesion.fecha, proximo.sesion.hora, ahora)}
                onCancelar={() =>
                  setCancelTarget({ inscripcion: proximo.inscripcion, sesion: proximo.sesion })
                }
              />
            </section>

            {/* 2. PRÓXIMOS RESTANTES (lista compacta, sin repetir el héroe) */}
            {restantes.length > 0 && (
              <section className="mt-6">
                <h2 className="font-display text-lg uppercase tracking-[0.2em] text-chrome-dim">
                  Próximos
                </h2>
                <div className="mt-3 flex flex-col gap-3">
                  {restantes.map(({ inscripcion, sesion }) => (
                    <ProximoItem
                      key={inscripcion.id}
                      inscripcion={inscripcion}
                      sesion={sesion}
                      minutos={minutosParaEmpezar(sesion.fecha, sesion.hora, ahora)}
                      onCancelar={() => setCancelTarget({ inscripcion, sesion })}
                    />
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        {/* 3. PASADOS — solo los que necesitan feedback */}
        {pasadosSinFeedback.length > 0 && (
          <section className="mt-8">
            <h2 className="font-display text-lg uppercase tracking-[0.2em] text-chrome-dim">
              Pasados — tu opinión
            </h2>
            <p className="mt-2 text-xs text-text-muted">
              Calificá los turnos que ya terminaron.
            </p>
            <div className="mt-3 flex flex-col gap-3">
              {pasadosSinFeedback.map(({ inscripcion, sesion }) => (
                <article key={inscripcion.id} className="rounded-xl border-2 border-border bg-ink-2 px-4 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 flex-col gap-1">
                      <span className="truncate font-body text-sm font-bold text-text-hi">
                        {sesion.actividad}
                      </span>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
                          {fechaCorta(sesion.fecha)}
                        </span>
                        <span className="w-px h-3 bg-border" />
                        <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
                          {sesion.hora}
                        </span>
                        <span className="w-px h-3 bg-border" />
                        <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
                          Coach {sesion.coach}
                        </span>
                      </div>
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
        )}

        {/* 4. PROGRESO — chip discreto al final */}
        {resumen && nivel && (
          <section className="mt-8">
            <div className="flex flex-wrap items-center gap-3">
              <span className={`rounded-lg border-2 border-border px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider ${CLASE_NIVEL[resumen.nivel]}`}>
                Nivel {nivel.nombre}
              </span>
              <span className="rounded-lg border-2 border-border px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-text-hi">
                Concurrencia {resumen.concurrencia}%
              </span>
              <button
                onClick={() => setActiveTab("progreso")}
                className="min-h-11 rounded-lg border-2 border-chrome/40 px-4 font-mono text-[11px] uppercase tracking-[0.2em] text-chrome transition-colors hover:bg-chrome/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chrome"
              >
                Ver progreso y recompensas
              </button>
            </div>
          </section>
        )}

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
                  className="min-h-11 flex-1 rounded-xl border-2 border-danger py-3 text-center text-sm font-semibold text-danger transition-colors hover:bg-danger/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger"
                >
                  Sí, cancelar
                </button>
                <button
                  onClick={() => setCancelTarget(null)}
                  className="min-h-11 flex-1 rounded-xl border-2 border-border py-3 text-center text-sm font-semibold text-text-hi transition-colors hover:bg-ink-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chrome"
                >
                  No, mantener
                </button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}
