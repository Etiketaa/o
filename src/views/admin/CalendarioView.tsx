import { useEffect, useMemo, useState } from "react";
import {
  CalendarCheck,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Check,
  Clock,
  Users,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  parseISO,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { es } from "date-fns/locale";
import { Avatar, Modal, PlateMeter, useToast } from "@/components";
import { useGymStore } from "@/stores/gymStore";
import { useUIStore } from "@/stores/uiStore";
import { aISO, diaSemanaDe, etiquetaDiaRelativo, fechaLarga, hoyISO } from "@/lib/fechas";
import { NOMBRES_DIA_CORTO } from "@/lib/horarios";
import type { Inscripcion, Sesion } from "@/types";

/**
 * Colores de los 4 segmentos de la barra de ocupación.
 * El índice es el nivel de ocupación (0 = vacía, 4 = llena).
 */
const SEGMENTOS_OCUPACION = [
  "bg-ink-4",
  "bg-chrome/40",
  "bg-chrome/60",
  "bg-chrome/80",
  "bg-chrome",
] as const;

/** Barra de 4 segmentos que muestra cuán llena está la celda. */
function BarraOcupacion({ nivel }: { nivel: number }) {
  const relleno = SEGMENTOS_OCUPACION[nivel] ?? SEGMENTOS_OCUPACION[0];
  return (
    <span className="flex w-full gap-0.5" aria-hidden="true">
      {[0, 1, 2, 3].map((i) => (
        <span
          key={i}
          className={`h-1 flex-1 rounded-full ${i < nivel ? relleno : "bg-ink-4"}`}
        />
      ))}
    </span>
  );
}

/** Cuadro de estadística de la barra de resumen del mes. */
function ResumenStat({
  icono: Icono,
  valor,
  etiqueta,
}: {
  icono: LucideIcon;
  valor: number;
  etiqueta: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-xl border border-border bg-ink-2 px-2 py-3">
      <Icono size={14} className="text-chrome" aria-hidden="true" />
      <span className="font-display text-2xl leading-none tracking-wide text-text-hi">{valor}</span>
      <span className="font-mono text-[10px] uppercase tracking-widest text-text-muted">
        {etiqueta}
      </span>
    </div>
  );
}

export function CalendarioView() {
  const {
    sesiones,
    inscripciones,
    perfiles,
    asegurarSesiones,
    cargarSesiones,
    cargarInscripciones,
    marcarAsistencia,
  } = useGymStore();
  const {
    selectedFecha,
    setSelectedFecha,
    selectedSesionId,
    setSelectedSesionId,
    setActiveTab,
  } = useUIStore();
  const { pushToast } = useToast();

  const [mes, setMes] = useState(() => startOfMonth(parseISO(hoyISO())));
  const [cargando, setCargando] = useState(true);

  /** Días de la grilla: de lunes a domingo, con los días de los meses vecinos. */
  const diasDelMes = useMemo(() => {
    const inicio = startOfWeek(startOfMonth(mes), { weekStartsOn: 1 });
    const fin = endOfWeek(endOfMonth(mes), { weekStartsOn: 1 });
    return eachDayOfInterval({ start: inicio, end: fin });
  }, [mes]);

  useEffect(() => {
    const fechas = diasDelMes.map(aISO);
    if (fechas.length === 0) return;
    let vigente = true;
    setCargando(true);
    void (async () => {
      try {
        // Primero se materializan las sesiones del rango; después se relee del storage.
        await asegurarSesiones(fechas);
        await cargarSesiones(fechas[0], fechas[fechas.length - 1]);
        await cargarInscripciones();
      } catch (error) {
        pushToast(
          error instanceof Error ? error.message : "No se pudieron cargar los turnos",
          "error",
        );
      } finally {
        if (vigente) setCargando(false);
      }
    })();
    return () => {
      vigente = false;
    };
  }, [diasDelMes, asegurarSesiones, cargarSesiones, cargarInscripciones, pushToast]);

  const sesionesPorFecha = useMemo(() => {
    const mapa = new Map<string, Sesion[]>();
    for (const sesion of sesiones) {
      const lista = mapa.get(sesion.fecha) ?? [];
      lista.push(sesion);
      mapa.set(sesion.fecha, lista);
    }
    for (const lista of mapa.values()) lista.sort((a, b) => a.hora.localeCompare(b.hora));
    return mapa;
  }, [sesiones]);

  const inscripcionesPorSesion = useMemo(() => {
    const mapa = new Map<string, Inscripcion[]>();
    for (const inscripcion of inscripciones) {
      const lista = mapa.get(inscripcion.sesion_id) ?? [];
      lista.push(inscripcion);
      mapa.set(inscripcion.sesion_id, lista);
    }
    return mapa;
  }, [inscripciones]);

  /** Inscriptos que ocupan cupo (los cancelados no cuentan). */
  const ocupadosPorSesion = useMemo(() => {
    const mapa = new Map<string, number>();
    for (const [sesionId, lista] of inscripcionesPorSesion) {
      mapa.set(
        sesionId,
        lista.filter((i) => i.estado !== "cancelada").length,
      );
    }
    return mapa;
  }, [inscripcionesPorSesion]);

  const ocupadosDe = (sesion: Sesion) => ocupadosPorSesion.get(sesion.id) ?? 0;

  /** Turnos e inscriptos del mes visible (los días vecinos no cuentan). */
  const porDia = useMemo(() => {
    const mapa = new Map<string, { turnos: number; ocupados: number }>();
    for (const sesion of sesiones) {
      if (!isSameMonth(parseISO(sesion.fecha), mes)) continue;
      const actual = mapa.get(sesion.fecha) ?? { turnos: 0, ocupados: 0 };
      actual.turnos += 1;
      actual.ocupados += ocupadosPorSesion.get(sesion.id) ?? 0;
      mapa.set(sesion.fecha, actual);
    }
    return mapa;
  }, [sesiones, mes, ocupadosPorSesion]);

  const resumenMes = useMemo(() => {
    let turnos = 0;
    let inscriptos = 0;
    for (const dato of porDia.values()) {
      turnos += dato.turnos;
      inscriptos += dato.ocupados;
    }
    return { turnos, inscriptos, diasConTurnos: porDia.size };
  }, [porDia]);

  /** Mayor cantidad de inscriptos de un día de la grilla: base de la barra de ocupación. */
  const maxOcupados = useMemo(() => {
    let max = 0;
    for (const dia of diasDelMes) {
      const lista = sesionesPorFecha.get(aISO(dia)) ?? [];
      const total = lista.reduce((suma, s) => suma + ocupadosDe(s), 0);
      if (total > max) max = total;
    }
    return max;
  }, [diasDelMes, sesionesPorFecha, ocupadosPorSesion]);

  const clientes = useMemo(
    () => perfiles.filter((p) => p.role === "alumno"),
    [perfiles],
  );

  const nombreDe = (id: string) => clientes.find((c) => c.id === id)?.nombre ?? "Cliente";

  const sesionSeleccionada = sesiones.find((s) => s.id === selectedSesionId) ?? null;

  const sesionesDelDia = sesionesPorFecha.get(selectedFecha) ?? [];

  /** Clientes que pidieron este día y hora al registrarse. */
  const pidenEsteHorario = (sesion: Sesion) => {
    const dia = diaSemanaDe(sesion.fecha);
    return clientes.filter((cliente) =>
      (cliente.slots_preferidos ?? []).some((s) => s.dia === dia && s.hora === sesion.hora),
    );
  };

  const marcar = async (inscripcion: Inscripcion, estado: "asistio" | "faltó") => {
    try {
      await marcarAsistencia(inscripcion.id, estado);
    } catch (error) {
      pushToast(error instanceof Error ? error.message : "No se pudo marcar", "error");
    }
  };

  /** Cambia de mes y lleva la selección al mes nuevo (así siempre hay turnos cargados). */
  const irAMes = (nuevo: Date) => {
    setMes(nuevo);
    const esElMesActual = isSameMonth(nuevo, parseISO(hoyISO()));
    setSelectedFecha(esElMesActual ? hoyISO() : aISO(startOfMonth(nuevo)));
  };

  /** Salta a la agenda con el día elegido ya seleccionado. */
  const irAAgenda = (iso: string) => {
    setSelectedFecha(iso);
    setActiveTab("agenda");
  };

  const hoy = hoyISO();

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto w-full max-w-5xl px-4 pt-6 pb-[calc(6rem+env(safe-area-inset-bottom,0px))] md:px-6 md:pb-10 lg:px-8">
        {/* Encabezado */}
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="mb-2 block font-mono text-xs uppercase tracking-widest text-chrome">
              Calendario
            </span>
            <h1 className="chrome-text font-display text-4xl tracking-wide uppercase md:text-5xl">
              {format(mes, "MMMM", { locale: es })}
              <span className="text-chrome-dim"> {format(mes, "yyyy")}</span>
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => irAMes(subMonths(mes, 1))}
              aria-label="Mes anterior"
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-border text-text-muted transition-colors hover:border-chrome/50 hover:text-text-hi"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => irAMes(startOfMonth(parseISO(hoyISO())))}
              className="min-h-11 rounded-xl border border-border px-4 py-2 font-mono text-xs uppercase tracking-widest text-text-mid transition-colors hover:border-chrome/50 hover:text-text-hi"
            >
              Hoy
            </button>
            <button
              onClick={() => irAMes(addMonths(mes, 1))}
              aria-label="Mes siguiente"
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-border text-text-muted transition-colors hover:border-chrome/50 hover:text-text-hi"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Resumen del mes */}
        <div className="mb-4 grid grid-cols-3 gap-2">
          <ResumenStat icono={CalendarDays} valor={resumenMes.turnos} etiqueta="Turnos" />
          <ResumenStat icono={Users} valor={resumenMes.inscriptos} etiqueta="Inscriptos" />
          <ResumenStat icono={CalendarCheck} valor={resumenMes.diasConTurnos} etiqueta="Días" />
        </div>

        {cargando && (
          <span className="mb-4 block font-mono text-xs uppercase tracking-widest text-text-muted">
            Cargando turnos…
          </span>
        )}

        {/* Grilla */}
        {!cargando && resumenMes.turnos === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-ink-2 px-4 py-16 text-center">
            <CalendarDays size={30} strokeWidth={1.5} className="text-chrome" aria-hidden="true" />
            <p className="font-display text-xl tracking-wide text-text-hi uppercase">
              No hay turnos programados este mes
            </p>
            <p className="max-w-sm text-sm text-text-muted">
              Cargá la plantilla semanal en Config para que las clases se materialicen solas.
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-ink-2 p-3 md:p-4">
            <div className="mb-2 grid grid-cols-7 gap-1">
              {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((d) => (
                <div
                  key={d}
                  className="py-2 text-center font-mono text-[10px] uppercase tracking-widest text-text-muted md:text-xs"
                >
                  {d}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {diasDelMes.map((dia) => {
                const iso = aISO(dia);
                const delMes = isSameMonth(dia, mes);
                const esHoy = iso === hoy;
                const esSeleccionado = iso === selectedFecha;
                const lista = sesionesPorFecha.get(iso) ?? [];
                const ocupados = lista.reduce((suma, s) => suma + ocupadosDe(s), 0);
                const nivel =
                  ocupados > 0 && maxOcupados > 0
                    ? Math.max(1, Math.min(4, Math.round((ocupados / maxOcupados) * 4)))
                    : 0;

                return (
                  <button
                    key={iso}
                    onClick={() => setSelectedFecha(iso)}
                    aria-pressed={esSeleccionado}
                    aria-label={`${fechaLarga(iso)}, ${lista.length} turnos, ${ocupados} inscriptos`}
                    className={`flex min-h-16 flex-col items-center justify-center gap-1 rounded-xl border p-1 transition-colors md:min-h-20 ${
                      esSeleccionado
                        ? "border-chrome bg-chrome/15"
                        : esHoy
                          ? "border-chrome/40 bg-ink-3"
                          : delMes
                            ? "border-border bg-ink hover:border-chrome/30"
                            : "border-transparent bg-ink/40 opacity-40"
                    }`}
                  >
                    <span
                      className={`font-mono text-sm leading-none ${
                        esHoy ? "font-bold text-chrome" : delMes ? "text-text-hi" : "text-text-muted"
                      }`}
                    >
                      {format(dia, "d")}
                    </span>
                    {lista.length > 0 && (
                      <>
                        <BarraOcupacion nivel={nivel} />
                        <span className="font-mono text-[10px] leading-none text-text-muted md:text-xs">
                          {ocupados}
                        </span>
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Detalle del día */}
        <section className="mt-4 rounded-2xl border border-border bg-ink-2 p-4 md:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-xl tracking-wide text-text-hi uppercase">
                {fechaLarga(selectedFecha)}
              </h2>
              <span className="font-mono text-xs uppercase tracking-widest text-chrome">
                {NOMBRES_DIA_CORTO[diaSemanaDe(selectedFecha)]}
                {etiquetaDiaRelativo(selectedFecha) && ` · ${etiquetaDiaRelativo(selectedFecha)}`}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 font-mono text-xs text-text-muted">
                <Users size={14} aria-hidden="true" />
                {sesionesDelDia.length} clases ·{" "}
                {sesionesDelDia.reduce((suma, s) => suma + ocupadosDe(s), 0)} inscritos
              </span>
              <button
                onClick={() => irAAgenda(selectedFecha)}
                className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-chrome px-4 font-mono text-xs uppercase tracking-widest text-ink transition-colors hover:bg-silver-200"
              >
                <CalendarDays size={14} aria-hidden="true" />
                Agendar
              </button>
            </div>
          </div>

          {sesionesDelDia.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-10 text-text-muted">
              <CalendarDays size={28} strokeWidth={1.5} aria-hidden="true" />
              <p className="text-sm">Sin clases programadas para este día</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {sesionesDelDia.map((sesion) => {
                const ocupados = ocupadosDe(sesion);
                const activos = (inscripcionesPorSesion.get(sesion.id) ?? []).filter(
                  (i) => i.estado !== "cancelada",
                );
                const pedidos = pidenEsteHorario(sesion);
                return (
                  <button
                    key={sesion.id}
                    onClick={() => setSelectedSesionId(sesion.id)}
                    className="flex flex-col gap-3 rounded-xl border border-border bg-ink p-4 text-left transition-colors hover:border-chrome/40"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-display text-2xl tracking-wide text-text-hi">
                        {sesion.hora}
                      </span>
                      <PlateMeter ocupados={ocupados} total={sesion.cupo} />
                    </div>
                    <div>
                      <span className="block font-semibold text-text-hi">{sesion.actividad}</span>
                      <span className="block font-mono text-xs text-text-muted">
                        Coach {sesion.coach}
                      </span>
                    </div>
                    {activos.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {activos.slice(0, 3).map((inscripcion) => (
                          <span
                            key={inscripcion.id}
                            className="max-w-full truncate rounded-full border border-border px-2 py-0.5 text-xs text-text-mid"
                          >
                            {nombreDe(inscripcion.alumno_id)}
                          </span>
                        ))}
                        {activos.length > 3 && (
                          <span className="rounded-full border border-border px-2 py-0.5 font-mono text-xs text-text-muted">
                            +{activos.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                    {pedidos.length > 0 && (
                      <span className="rounded-full border border-chrome/40 px-2 py-0.5 font-mono text-xs uppercase tracking-widest text-chrome">
                        {pedidos.length} lo pidieron
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* Detalle de la sesión */}
      <Modal open={!!sesionSeleccionada} onClose={() => setSelectedSesionId(null)}>
        {sesionSeleccionada && (
          <SesionModal
            sesion={sesionSeleccionada}
            lista={inscripcionesPorSesion.get(sesionSeleccionada.id) ?? []}
            nombreDe={nombreDe}
            piden={pidenEsteHorario(sesionSeleccionada)}
            onMarcar={marcar}
          />
        )}
      </Modal>
    </div>
  );
}

interface SesionModalProps {
  sesion: Sesion;
  lista: Inscripcion[];
  nombreDe: (id: string) => string;
  piden: Array<{ id: string; nombre: string; telefono: string }>;
  onMarcar: (inscripcion: Inscripcion, estado: "asistio" | "faltó") => void;
}

function SesionModal({ sesion, lista, nombreDe, piden, onMarcar }: SesionModalProps) {
  const activos = lista.filter((i) => i.estado !== "cancelada");

  return (
    <div className="flex flex-col gap-4">
      <div>
        <span className="mb-1 block font-mono text-xs uppercase tracking-widest text-chrome-dim">
          {fechaLarga(sesion.fecha)} · {sesion.hora}
        </span>
        <h3 className="font-display text-2xl tracking-wide text-text-hi uppercase">
          {sesion.actividad}
        </h3>
        <span className="font-mono text-xs text-text-muted">Coach {sesion.coach}</span>
      </div>

      <PlateMeter ocupados={activos.length} total={sesion.cupo} />

      <div className="flex flex-col gap-2">
        {activos.length === 0 ? (
          <p className="py-4 text-center text-sm text-text-muted">Nadie anotado todavía</p>
        ) : (
          activos.map((inscripcion) => {
            const nombre = nombreDe(inscripcion.alumno_id);
            const asistio = inscripcion.estado === "asistio";
            const falto = inscripcion.estado === "faltó";
            return (
              <div
                key={inscripcion.id}
                className="flex items-center justify-between gap-2 rounded-lg border border-border bg-ink px-3 py-2"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <Avatar nombre={nombre} size="sm" />
                  <span className="truncate text-sm text-text-hi">{nombre}</span>
                </div>
                <div className="flex items-center gap-2">
                  {asistio && (
                    <span className="font-mono text-xs uppercase tracking-widest text-chrome">
                      Asistió
                    </span>
                  )}
                  {falto && (
                    <span className="font-mono text-xs uppercase tracking-widest text-danger">
                      Faltó
                    </span>
                  )}
                  {!asistio && !falto && (
                    <>
                      <button
                        onClick={() => onMarcar(inscripcion, "asistio")}
                        aria-label={`Marcar asistencia de ${nombre}`}
                        className="flex h-11 w-11 items-center justify-center rounded-xl border border-border text-text-muted transition-colors hover:border-chrome/50 hover:text-chrome"
                      >
                        <Check size={15} />
                      </button>
                      <button
                        onClick={() => onMarcar(inscripcion, "faltó")}
                        aria-label={`Marcar ausencia de ${nombre}`}
                        className="flex h-11 w-11 items-center justify-center rounded-xl border border-border text-text-muted transition-colors hover:border-danger/50 hover:text-danger"
                      >
                        <X size={15} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {piden.length > 0 && (
        <div className="border-t border-border pt-4">
          <span className="mb-2 flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-chrome">
            <Clock size={13} aria-hidden="true" />
            Pidieron este horario
          </span>
          <ul className="flex flex-col gap-2">
            {piden.map((cliente) => (
              <li key={cliente.id} className="flex items-center justify-between gap-2">
                <span className="text-sm text-text-hi">{cliente.nombre}</span>
                {cliente.telefono && (
                  <a
                    href={`tel:${cliente.telefono.replace(/\s+/g, "")}`}
                    aria-label={`Llamar a ${cliente.nombre}`}
                    className="font-mono text-xs text-chrome transition-colors hover:text-text-hi"
                  >
                    {cliente.telefono}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
