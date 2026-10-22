import { useEffect, useMemo } from "react";
import type { Inscripcion, Sesion } from "@/types";
import { Flame, Target, ThumbsDown, ThumbsUp, TrendingUp } from "lucide-react";
import { InsigniaIcon } from "@/components";
import { useGymStore } from "@/stores/gymStore";
import { useAuthStore } from "@/stores/authStore";
import { useUIStore } from "@/stores/uiStore";
import { useReloj } from "@/hooks/useTurnoAlerta";
import { hoyISO, sumarDias } from "@/lib/fechas";
import { CATALOGO_INSIGNIAS, infoNivel, resumenAlumno, type Nivel } from "@/lib/puntaje";

const CLASE_NIVEL: Record<Nivel, string> = {
  acero: "text-nivel-acero",
  plata: "text-nivel-plata",
  platino: "text-nivel-platino",
  diamante: "text-nivel-diamante",
};

/**
 * Anchos de barra en pasos de 5%.
 * Son clases fijas (no estilos inline) para que Tailwind las detecte al compilar.
 */
const CLASES_ANCHO = [
  "w-0",
  "w-[5%]",
  "w-[10%]",
  "w-[15%]",
  "w-[20%]",
  "w-[25%]",
  "w-[30%]",
  "w-[35%]",
  "w-[40%]",
  "w-[45%]",
  "w-[50%]",
  "w-[55%]",
  "w-[60%]",
  "w-[65%]",
  "w-[70%]",
  "w-[75%]",
  "w-[80%]",
  "w-[85%]",
  "w-[90%]",
  "w-[95%]",
  "w-full",
];

function claseAncho(porcentaje: number): string {
  const indice = Math.round(Math.max(0, Math.min(100, porcentaje)) / 5);
  return CLASES_ANCHO[indice];
}

function Barra({ porcentaje, tono = "cromado" }: { porcentaje: number; tono?: "cromado" | "acero" }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-ink-4">
      <div
        className={`h-full rounded-full ${tono === "cromado" ? "bg-chrome" : "bg-steel"} ${claseAncho(porcentaje)}`}
      />
    </div>
  );
}

export function ProgresoView() {
  const { user } = useAuthStore();
  const { inscripciones, sesiones, loading, initialized, asegurarSesiones } = useGymStore();
  const { setActiveTab } = useUIStore();
  const ahora = useReloj();

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

  // Historial + próximas sesiones para poder armar los pares de inscripción.
  useEffect(() => {
    if (loading || !initialized) return;
    const hoy = hoyISO();
    const fechas = [
      ...Array.from({ length: 28 }, (_, i) => sumarDias(hoy, i)),
      ...Array.from({ length: 180 }, (_, i) => sumarDias(hoy, -i)),
    ];
    void asegurarSesiones(fechas);
  }, [loading, initialized, asegurarSesiones]);

  if (!user || !resumen) {
    return (
      <div className="h-full overflow-y-auto px-4 pb-[calc(5rem+env(safe-area-inset-bottom,0px))] pt-5">
        <span className="block text-[11px] font-medium uppercase tracking-[0.2em] text-chrome">
          Progreso
        </span>
        <h1 className="chrome-text font-display text-2xl tracking-wide">Tu rendimiento</h1>
        <div className="mt-6 flex flex-col gap-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="skeleton h-24 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const nivel = infoNivel(resumen.nivel);
  const objetivo = Math.max(1, user.veces_mes_objetivo || 0);

  return (
    <div className="h-full overflow-y-auto px-4 pb-[calc(5rem+env(safe-area-inset-bottom,0px))] pt-5">
      <div className="mx-auto max-w-4xl">
        <span className="block text-[11px] font-medium uppercase tracking-[0.2em] text-chrome">
          Progreso
        </span>
        <h1 className="chrome-text font-display text-2xl tracking-wide">Tu rendimiento</h1>

        {/* Cabecera: nivel, concurrencia y rachas */}
        <div className="plate-steel mt-4 rounded-xl px-4 py-4">
          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-muted">
                Nivel
              </span>
              <p
                className={`font-display text-3xl uppercase leading-none tracking-wide ${CLASE_NIVEL[resumen.nivel]}`}
              >
                {nivel.nombre}
              </p>
              <p className="mt-1 text-xs text-text-muted">{nivel.descripcion}</p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-muted">
                Concurrencia
              </span>
              <span className="font-display text-3xl leading-none text-text-hi">
                {resumen.concurrencia}%
              </span>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border-hi pt-3">
            <div className="flex items-center gap-2">
              <Flame size={16} className="shrink-0 text-warn" />
              <div className="flex flex-col">
                <span className="font-display text-xl leading-none text-text-hi">
                  {resumen.racha}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
                  Racha actual
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="shrink-0 text-chrome" />
              <div className="flex flex-col">
                <span className="font-display text-xl leading-none text-text-hi">
                  {resumen.rachaMax}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
                  Mejor racha
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Barras de progreso */}
        <section className="mt-6">
          <h2 className="font-display text-lg uppercase tracking-[0.2em] text-chrome-dim">
            Cumplimiento
          </h2>

          <div className="mt-3 flex flex-col gap-3">
            <div className="rounded-xl border border-border bg-ink-2 px-4 py-3">
              <div className="mb-2 flex items-baseline justify-between gap-2">
                <span className="text-xs font-semibold text-text-hi">
                  Turnos este mes: {resumen.asistidasMes} / {objetivo}
                </span>
                <span className="font-mono text-[11px] uppercase tracking-wider text-chrome">
                  {resumen.cumplimiento}%
                </span>
              </div>
              <Barra porcentaje={resumen.cumplimiento} />
            </div>

            <div className="rounded-xl border border-border bg-ink-2 px-4 py-3">
              <div className="mb-2 flex items-baseline justify-between gap-2">
                <span className="text-xs font-semibold text-text-hi">
                  Concurrencia: {resumen.concurrencia}%
                </span>
                <span className="font-mono text-[11px] uppercase tracking-wider text-text-mid">
                  {resumen.asistidas} de {resumen.asistidas + resumen.faltadas}
                </span>
              </div>
              <Barra porcentaje={resumen.concurrencia} tono="acero" />
            </div>
          </div>
        </section>

        {/* Feedback */}
        <section className="mt-6">
          <h2 className="font-display text-lg uppercase tracking-[0.2em] text-chrome-dim">
            Tu feedback
          </h2>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div className="flex items-center gap-3 rounded-xl border border-border bg-ink-2 px-4 py-3">
              <ThumbsUp size={18} className="shrink-0 text-chrome" />
              <div className="flex flex-col">
                <span className="font-display text-xl leading-none text-text-hi">
                  {resumen.feedbackPositivo}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
                  Favorables
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-border bg-ink-2 px-4 py-3">
              <ThumbsDown size={18} className="shrink-0 text-danger" />
              <div className="flex flex-col">
                <span className="font-display text-xl leading-none text-text-hi">
                  {resumen.feedbackNegativo}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
                  Desfavorables
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Insignias */}
        <section className="mt-6">
          <div className="mb-3 flex items-center gap-3">
            <h2 className="font-display text-lg uppercase tracking-[0.2em] text-chrome-dim">
              Insignias
            </h2>
            <span className="h-px flex-1 bg-border" />
            <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
              {resumen.insignias.filter((i) => i.obtenida).length}/
              {resumen.insignias.length}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {CATALOGO_INSIGNIAS.map((def) => {
              const info = resumen.insignias.find((i) => i.clave === def.clave);
              const obtenida = info?.obtenida ?? false;
              const progreso = info?.progreso ?? 0;
              const porcentaje = def.meta > 0 ? (progreso / def.meta) * 100 : 0;

              return (
                <div
                  key={def.clave}
                  className={
                    obtenida
                      ? "plate-steel flex flex-col items-center gap-2 rounded-xl px-3 py-4 text-center"
                      : "flex flex-col items-center gap-2 rounded-xl border border-border bg-ink-2 px-3 py-4 text-center opacity-60"
                  }
                >
                  <InsigniaIcon
                    nombre={def.icono}
                    size={26}
                    className={obtenida ? "text-chrome" : "text-text-muted"}
                  />
                  <span
                    className={`font-display text-sm uppercase leading-tight tracking-wide ${
                      obtenida ? "chrome-text" : "text-text-mid"
                    }`}
                  >
                    {def.nombre}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
                    {obtenida ? "Obtenida" : `${progreso} / ${def.meta}`}
                  </span>
                  {!obtenida && <Barra porcentaje={porcentaje} tono="acero" />}
                  <p className="text-[11px] leading-snug text-text-muted">{def.descripcion}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Números fines */}
        <section className="mt-6 grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-border bg-ink-2 px-3 py-3 text-center">
            <span className="font-display text-2xl leading-none text-text-hi">
              {resumen.asistidas}
            </span>
            <span className="mt-1 block font-mono text-[10px] uppercase tracking-wider text-text-muted">
              Asistidas
            </span>
          </div>
          <div className="rounded-xl border border-border bg-ink-2 px-3 py-3 text-center">
            <span className="font-display text-2xl leading-none text-text-hi">
              {resumen.faltadas}
            </span>
            <span className="mt-1 block font-mono text-[10px] uppercase tracking-wider text-text-muted">
              Faltadas
            </span>
          </div>
          <div className="rounded-xl border border-border bg-ink-2 px-3 py-3 text-center">
            <span className="font-display text-2xl leading-none text-text-hi">
              {resumen.canceladas}
            </span>
            <span className="mt-1 block font-mono text-[10px] uppercase tracking-wider text-text-muted">
              Canceladas
            </span>
          </div>
        </section>

        <button
          onClick={() => setActiveTab("mis-turnos")}
          className="mt-6 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-chrome/40 py-3 font-mono text-[11px] uppercase tracking-[0.2em] text-chrome transition-colors hover:bg-chrome/10"
        >
          <Target size={14} /> Volver a mis turnos
        </button>
      </div>
    </div>
  );
}
