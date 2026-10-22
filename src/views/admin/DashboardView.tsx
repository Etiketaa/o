import { useCallback, useEffect, useMemo } from "react";
import {
  CalendarClock,
  Check,
  Clock,
  DollarSign,
  Phone,
  TrendingUp,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { Avatar, PlateMeter, useToast } from "@/components";
import { useGymStore } from "@/stores/gymStore";
import { usePagosStore } from "@/stores/pagosStore";
import { hoyISO, diaSemanaDe, semanaDe, sumarDias } from "@/lib/fechas";
import { NOMBRES_DIA_CORTO } from "@/lib/horarios";
import { formatMoney } from "@/lib/utils";
import { DIAS, type DiaSemana, type Inscripcion, type Sesion } from "@/types";

interface KpiProps {
  etiqueta: string;
  valor: string | number;
  icono: React.ElementType;
  destacado?: boolean;
}

function Kpi({ etiqueta, valor, icono: Icono, destacado }: KpiProps) {
  return (
    <div
      className={`flex flex-col gap-2 rounded-2xl border p-4 ${
        destacado ? "border-chrome/40 bg-chrome/10" : "border-border bg-ink-2"
      }`}
    >
      <span className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-text-muted">
        <Icono size={14} className={destacado ? "text-chrome" : "text-chrome-dim"} aria-hidden="true" />
        {etiqueta}
      </span>
      <span
        className={`font-display text-3xl tracking-wide ${
          destacado ? "text-chrome" : "text-text-hi"
        }`}
      >
        {valor}
      </span>
    </div>
  );
}

interface SeccionProps {
  titulo: string;
  children: React.ReactNode;
  extra?: React.ReactNode;
}

function Seccion({ titulo, children, extra }: SeccionProps) {
  return (
    <section className="rounded-2xl border border-border bg-ink-2 p-4 md:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="font-display text-xl tracking-wide text-text-hi uppercase">{titulo}</h2>
        {extra}
      </div>
      {children}
    </section>
  );
}

export function DashboardView() {
  const {
    perfiles,
    sesiones,
    inscripciones,
    asegurarSesiones,
    cargarSesiones,
    cargarInscripciones,
    marcarAsistencia,
  } = useGymStore();
  const { pagos, loadPagos } = usePagosStore();
  const { pushToast } = useToast();

  const hoy = hoyISO();

  useEffect(() => {
    loadPagos();
    cargarInscripciones();
    // La semana en curso se materializa a partir de la grilla semanal.
    const { inicio, fin } = semanaDe(hoy);
    const fechas = Array.from({ length: 7 }, (_, i) => sumarDias(inicio, i));
    void (async () => {
      await asegurarSesiones(fechas);
      await cargarSesiones(inicio, fin);
    })();
  }, [hoy, asegurarSesiones, cargarSesiones, cargarInscripciones, loadPagos]);

  const clientes = useMemo(() => perfiles.filter((p) => p.role === "alumno"), [perfiles]);

  const sesionesHoy = useMemo(
    () => sesiones.filter((s) => s.fecha === hoy).sort((a, b) => a.hora.localeCompare(b.hora)),
    [sesiones, hoy],
  );

  const sesionesPorId = useMemo(() => new Map(sesiones.map((s) => [s.id, s])), [sesiones]);

  const inscripcionesPorSesion = useMemo(() => {
    const mapa = new Map<string, Inscripcion[]>();
    for (const inscripcion of inscripciones) {
      const lista = mapa.get(inscripcion.sesion_id) ?? [];
      lista.push(inscripcion);
      mapa.set(inscripcion.sesion_id, lista);
    }
    return mapa;
  }, [inscripciones]);

  const ocupadosDe = useCallback(
    (sesion: Sesion) =>
      (inscripcionesPorSesion.get(sesion.id) ?? []).filter((i) => i.estado !== "cancelada").length,
    [inscripcionesPorSesion],
  );

  const asistenciaHoy = useMemo(
    () =>
      inscripciones.filter((i) => {
        const sesion = sesionesPorId.get(i.sesion_id);
        return sesion?.fecha === hoy && i.estado === "asistio";
      }).length,
    [inscripciones, sesionesPorId, hoy],
  );

  const confirmadosHoy = useMemo(
    () =>
      inscripciones.filter((i) => {
        const sesion = sesionesPorId.get(i.sesion_id);
        return sesion?.fecha === hoy && i.estado === "confirmada";
      }).length,
    [inscripciones, sesionesPorId, hoy],
  );

  const ingresosMes = useMemo(() => {
    const ahora = new Date();
    const mes = ahora.getMonth() + 1;
    const anio = ahora.getFullYear();
    return pagos
      .filter((p) => p.estado === "pagado" && p.mes_pago === mes && p.anio_pago === anio)
      .reduce((suma, p) => suma + p.monto, 0);
  }, [pagos]);

  const nuevosDelMes = useMemo(() => {
    const prefijo = hoy.slice(0, 7);
    return clientes
      .filter((c) => (c.created_at ?? "").startsWith(prefijo))
      .sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? ""));
  }, [clientes, hoy]);

  const vencidos = useMemo(
    () => clientes.filter((c) => c.estado === "vencido").sort((a, b) => a.nombre.localeCompare(b.nombre)),
    [clientes],
  );

  const conPedidos = useMemo(
    () =>
      clientes
        .filter((c) => (c.slots_preferidos ?? []).length > 0)
        .sort((a, b) => a.nombre.localeCompare(b.nombre)),
    [clientes],
  );

  const marcar = async (inscripcion: Inscripcion, estado: "asistio" | "faltó") => {
    try {
      await marcarAsistencia(inscripcion.id, estado);
    } catch (error) {
      pushToast(error instanceof Error ? error.message : "No se pudo marcar", "error");
    }
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto w-full max-w-6xl px-4 pt-6 pb-[calc(5rem+env(safe-area-inset-bottom,0px))] md:px-6 md:pb-10 lg:px-8">
        {/* Encabezado */}
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <span className="mb-2 block font-mono text-xs uppercase tracking-widest text-chrome">
              Vista general
            </span>
            <h1 className="chrome-text font-display text-4xl tracking-wide uppercase md:text-5xl">
              Dashboard
            </h1>
          </div>
          <span className="hidden items-center gap-2 font-mono text-xs text-text-muted md:flex">
            <Clock size={14} aria-hidden="true" />
            {sesionesHoy.length} sesiones hoy
          </span>
        </div>

        {/* KPIs */}
        <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          <Kpi etiqueta="Clientes activos" valor={clientes.filter((c) => c.estado === "activo").length} icono={Users} />
          <Kpi etiqueta="Total clientes" valor={clientes.length} icono={Users} />
          <Kpi etiqueta="Turnos de hoy" valor={sesionesHoy.length} icono={CalendarClock} />
          <Kpi etiqueta="Asistencia hoy" valor={asistenciaHoy} icono={TrendingUp} />
          <Kpi etiqueta="Ingresos del mes" valor={formatMoney(ingresosMes)} icono={DollarSign} destacado />
          <Kpi etiqueta="Clientes nuevos" valor={nuevosDelMes.length} icono={UserPlus} />
        </div>

        <div className="flex flex-col gap-4">
          {/* Asistencia de hoy */}
          <Seccion
            titulo="Asistencia de hoy"
            extra={
              <span className="font-mono text-xs text-text-muted">
                {asistenciaHoy} asistieron · {confirmadosHoy} sin marcar
              </span>
            }
          >
            {sesionesHoy.length === 0 ? (
              <p className="py-8 text-center text-sm text-text-muted">
                Hoy no hay clases programadas
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {sesionesHoy.map((sesion) => {
                  const lista = (inscripcionesPorSesion.get(sesion.id) ?? []).filter(
                    (i) => i.estado !== "cancelada",
                  );
                  const ocupados = ocupadosDe(sesion);

                  return (
                    <div
                      key={sesion.id}
                      className="rounded-xl border border-border bg-ink p-4"
                    >
                      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span className="font-display text-2xl tracking-wide text-text-hi">
                            {sesion.hora}
                          </span>
                          <div>
                            <span className="block font-semibold text-text-hi">{sesion.actividad}</span>
                            <span className="block font-mono text-xs text-text-muted">
                              Coach {sesion.coach}
                            </span>
                          </div>
                        </div>
                        <PlateMeter ocupados={ocupados} total={sesion.cupo} />
                      </div>

                      {lista.length === 0 ? (
                        <p className="font-mono text-xs text-text-muted">Nadie anotado</p>
                      ) : (
                        <ul className="flex flex-col gap-2">
                          {lista.map((inscripcion) => {
                            const cliente = clientes.find((c) => c.id === inscripcion.alumno_id);
                            const nombre = cliente?.nombre ?? "Cliente";
                            const asistio = inscripcion.estado === "asistio";
                            const falto = inscripcion.estado === "faltó";

                            return (
                              <li
                                key={inscripcion.id}
                                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-ink-2 px-3 py-2"
                              >
                                <div className="flex min-w-0 items-center gap-2">
                                  <Avatar nombre={nombre} size="sm" />
                                  <span className="truncate text-sm text-text-hi">{nombre}</span>
                                  {inscripcion.feedback === "up" && (
                                    <span className="font-mono text-xs text-chrome">+</span>
                                  )}
                                  {inscripcion.feedback === "down" && (
                                    <span className="font-mono text-xs text-danger">−</span>
                                  )}
                                </div>

                                <div className="flex items-center gap-2">
                                  {asistio && (
                                    <span className="rounded-full border border-chrome/40 px-2 py-0.5 font-mono text-xs uppercase tracking-widest text-chrome">
                                      Asistió
                                    </span>
                                  )}
                                  {falto && (
                                    <span className="rounded-full border border-danger/40 px-2 py-0.5 font-mono text-xs uppercase tracking-widest text-danger">
                                      Faltó
                                    </span>
                                  )}
                                  {!asistio && !falto && (
                                    <>
                                      <button
                                        onClick={() => marcar(inscripcion, "asistio")}
                                        aria-label={`Marcar asistencia de ${nombre}`}
                                        className="flex h-11 w-11 items-center justify-center rounded-xl border border-border text-text-muted transition-colors hover:border-chrome/50 hover:text-chrome"
                                      >
                                        <Check size={16} />
                                      </button>
                                      <button
                                        onClick={() => marcar(inscripcion, "faltó")}
                                        aria-label={`Marcar ausencia de ${nombre}`}
                                        className="flex h-11 w-11 items-center justify-center rounded-xl border border-border text-text-muted transition-colors hover:border-danger/50 hover:text-danger"
                                      >
                                        <X size={16} />
                                      </button>
                                    </>
                                  )}
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </Seccion>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {/* Horarios pedidos */}
            <Seccion
              titulo="Horarios pedidos"
              extra={<span className="font-mono text-xs text-text-muted">{conPedidos.length}</span>}
            >
              {conPedidos.length === 0 ? (
                <p className="py-6 text-center text-sm text-text-muted">
                  Ningún cliente pidió horarios
                </p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {conPedidos.slice(0, 8).map((cliente) => (
                    <li
                      key={cliente.id}
                      className="flex items-center justify-between gap-3 rounded-lg border border-border bg-ink px-3 py-2"
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        <Avatar nombre={cliente.nombre} size="sm" />
                        <div className="min-w-0">
                          <span className="block truncate text-sm text-text-hi">{cliente.nombre}</span>
                          <span className="block font-mono text-xs text-text-muted">
                            {(cliente.slots_preferidos ?? [])
                              .map((s) => `${NOMBRES_DIA_CORTO[s.dia].toLowerCase()} ${s.hora}`)
                              .join(", ")}
                          </span>
                        </div>
                      </div>
                      {cliente.telefono && (
                        <a
                          href={`tel:${cliente.telefono.replace(/\s+/g, "")}`}
                          aria-label={`Llamar a ${cliente.nombre}`}
                          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border text-text-muted transition-colors hover:border-chrome/50 hover:text-chrome"
                        >
                          <Phone size={15} />
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </Seccion>

            {/* Clientes nuevos del mes */}
            <Seccion
              titulo="Clientes nuevos del mes"
              extra={<span className="font-mono text-xs text-text-muted">{nuevosDelMes.length}</span>}
            >
              {nuevosDelMes.length === 0 ? (
                <p className="py-6 text-center text-sm text-text-muted">
                  Nadie se dio de alta este mes
                </p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {nuevosDelMes.slice(0, 8).map((cliente) => (
                    <li
                      key={cliente.id}
                      className="flex items-center justify-between gap-3 rounded-lg border border-border bg-ink px-3 py-2"
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        <Avatar nombre={cliente.nombre} size="sm" />
                        <div className="min-w-0">
                          <span className="block truncate text-sm text-text-hi">{cliente.nombre}</span>
                          <span className="block font-mono text-xs text-text-muted">
                            {cliente.plan}
                          </span>
                        </div>
                      </div>
                      <span className="shrink-0 font-mono text-xs text-text-muted">
                        {cliente.created_at.slice(0, 10)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </Seccion>

            {/* Planes vencidos */}
            <Seccion
              titulo="Planes vencidos"
              extra={<span className="font-mono text-xs text-danger">{vencidos.length}</span>}
            >
              {vencidos.length === 0 ? (
                <p className="py-6 text-center text-sm text-text-muted">
                  Todos los planes están al día
                </p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {vencidos.slice(0, 8).map((cliente) => (
                    <li
                      key={cliente.id}
                      className="flex items-center justify-between gap-3 rounded-lg border border-border bg-ink px-3 py-2"
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        <Avatar nombre={cliente.nombre} size="sm" />
                        <div className="min-w-0">
                          <span className="block truncate text-sm text-text-hi">{cliente.nombre}</span>
                          <span className="block font-mono text-xs text-text-muted">
                            {cliente.plan}
                          </span>
                        </div>
                      </div>
                      {cliente.telefono && (
                        <a
                          href={`tel:${cliente.telefono.replace(/\s+/g, "")}`}
                          aria-label={`Llamar a ${cliente.nombre}`}
                          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border text-text-muted transition-colors hover:border-chrome/50 hover:text-chrome"
                        >
                          <Phone size={15} />
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </Seccion>

            {/* Ocupación de la semana */}
            <Seccion titulo="Ocupación de la semana">
              <ul className="flex flex-col gap-2">
                {resumenSemana(sesiones, inscripciones).map((fila) => (
                  <li
                    key={fila.dia}
                    className="flex items-center justify-between gap-3 rounded-lg border border-border bg-ink px-3 py-2"
                  >
                    <span className="font-mono text-xs uppercase tracking-widest text-text-mid">
                      {NOMBRES_DIA_CORTO[fila.dia]}
                    </span>
                    <div className="flex flex-1 items-center justify-end gap-3">
                      <span className="font-mono text-xs text-text-muted">
                        {fila.porcentaje}% ocupado
                      </span>
                      <PlateMeter ocupados={fila.ocupados} total={fila.cupo} />
                    </div>
                  </li>
                ))}
              </ul>
            </Seccion>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Ocupación por día de la semana: cuántas plazas se ocuparon sobre el total.
 * Sólo cuenta las sesiones cargadas en el rango activo.
 */
function resumenSemana(sesiones: Sesion[], inscripciones: Inscripcion[]) {
  const porDia = new Map<DiaSemana, { ocupados: number; cupo: number }>();
  for (const dia of DIAS) porDia.set(dia, { ocupados: 0, cupo: 0 });

  for (const sesion of sesiones) {
    const fila = porDia.get(diaSemanaDe(sesion.fecha));
    if (!fila) continue;
    fila.cupo += sesion.cupo;
    fila.ocupados += inscripciones.filter(
      (i) => i.sesion_id === sesion.id && i.estado !== "cancelada",
    ).length;
  }

  return DIAS.map((dia) => {
    const fila = porDia.get(dia) ?? { ocupados: 0, cupo: 0 };
    return {
      dia,
      ocupados: fila.ocupados,
      cupo: fila.cupo,
      porcentaje: fila.cupo > 0 ? Math.round((fila.ocupados / fila.cupo) * 100) : 0,
    };
  });
}
