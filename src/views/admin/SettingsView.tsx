import { useEffect, useMemo, useState } from "react";
import {
  Building2,
  CalendarClock,
  Check,
  Copy,
  CreditCard,
  Layers,
  Pencil,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { Modal, useToast } from "@/components";
import { useGymStore, actividadesDePlan } from "@/stores/gymStore";
import { usePagosStore, getPrecioPlan } from "@/stores/pagosStore";
import { db } from "@/lib/db";
import { generarSlots, etiquetaTramo, horaAMinutos, minutosAHora, NOMBRES_DIA_CORTO } from "@/lib/horarios";
import { formatMoney } from "@/lib/utils";
import {
  DIAS,
  type DiaSemana,
  type GymConfig,
  type PagoConfig,
  type PlanActividad,
  type PlanType,
  type TramoHorario,
  type Turno,
} from "@/types";

const PLANES: PlanType[] = ["2x semana", "3x semana", "Full"];

/** Horarios de referencia si el gym todavía no tiene franjas cargadas. */
const HORAS_FALLBACK: string[] = (() => {
  const horas: string[] = [];
  for (let m = 8 * 60; m <= 21 * 60; m += 30) horas.push(minutosAHora(m));
  return horas;
})();

const campoClase =
  "w-full bg-ink border border-border rounded-xl px-4 py-3 text-sm text-text-hi placeholder:text-text-muted focus:outline-none focus:border-chrome/50";

const etiquetaClase = "block text-xs font-mono uppercase tracking-widest text-text-muted mb-2";

/** Copia local de la config para poder editar sin tocar el store en cada tecla. */
function copiaEditable(config: GymConfig): GymConfig {
  return {
    ...config,
    dias_activos: [...config.dias_activos],
    franjas: config.franjas.map((f) => ({ ...f })),
  };
}

interface TurnoForm {
  id: string;
  dia: DiaSemana;
  hora: string;
  actividad: string;
  coach: string;
  cupo: number;
  activo: boolean;
}

function formDesdeTurno(turno: Turno): TurnoForm {
  return {
    id: turno.id,
    dia: turno.dia,
    hora: turno.hora,
    actividad: turno.actividad,
    coach: turno.coach,
    cupo: turno.cupo,
    activo: turno.activo,
  };
}

export function SettingsView() {
  const {
    config,
    turnos,
    planActividades,
    guardarConfig,
    guardarTurno,
    borrarTurno,
    cargarPlantilla,
  } = useGymStore();
  const { config: pagoConfig, loadConfig } = usePagosStore();
  const { pushToast } = useToast();

  const [form, setForm] = useState<GymConfig | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [editandoTurno, setEditandoTurno] = useState<TurnoForm | null>(null);
  const [nuevoTurno, setNuevoTurno] = useState(false);
  const [copiado, setCopiado] = useState<string | null>(null);
  const [pagoForm, setPagoForm] = useState<PagoConfig | null>(null);
  const [guardandoPago, setGuardandoPago] = useState(false);
  const [nuevaActividad, setNuevaActividad] = useState<Record<string, string>>({});

  useEffect(() => {
    void cargarPlantilla();
    void loadConfig();
  }, [cargarPlantilla, loadConfig]);

  useEffect(() => {
    if (config) setForm(copiaEditable(config));
  }, [config]);

  useEffect(() => {
    if (pagoConfig) setPagoForm({ ...pagoConfig });
  }, [pagoConfig]);

  const slots = useMemo(() => (form ? generarSlots(form) : []), [form]);

  const actividades = useMemo(
    () => [...new Set(turnos.map((t) => t.actividad))].sort(),
    [turnos],
  );

  const coaches = useMemo(() => [...new Set(turnos.map((t) => t.coach))].sort(), [turnos]);

  const turnosPorDia = useMemo(() => {
    const mapa = new Map<DiaSemana, Turno[]>();
    for (const dia of DIAS) mapa.set(dia, []);
    for (const turno of turnos) {
      mapa.get(turno.dia)?.push(turno);
    }
    for (const lista of mapa.values()) lista.sort((a, b) => a.hora.localeCompare(b.hora));
    return mapa;
  }, [turnos]);

  const alternarDia = (dia: DiaSemana) => {
    if (!form) return;
    const dias = form.dias_activos.includes(dia)
      ? form.dias_activos.filter((d) => d !== dia)
      : [...form.dias_activos, dia];
    const orden = DIAS.filter((d) => dias.includes(d));
    setForm({ ...form, dias_activos: orden });
  };

  const actualizarFranja = (indice: number, cambios: Partial<TramoHorario>) => {
    if (!form) return;
    const franjas = form.franjas.map((f, i) => (i === indice ? { ...f, ...cambios } : f));
    setForm({ ...form, franjas });
  };

  const agregarFranja = () => {
    if (!form) return;
    const ultimo = form.franjas[form.franjas.length - 1];
    const nueva: TramoHorario = ultimo
      ? { inicio: ultimo.fin, fin: minutosAHora(horaAMinutos(ultimo.fin) + 60) }
      : { inicio: "08:00", fin: "12:00" };
    setForm({ ...form, franjas: [...form.franjas, nueva] });
  };

  const quitarFranja = (indice: number) => {
    if (!form) return;
    setForm({ ...form, franjas: form.franjas.filter((_, i) => i !== indice) });
  };

  const guardar = async () => {
    if (!form) return;
    setGuardando(true);
    try {
      await guardarConfig(form);
      pushToast("Configuración guardada", "success");
    } catch (error) {
      pushToast(error instanceof Error ? error.message : "No se pudo guardar", "error");
    } finally {
      setGuardando(false);
    }
  };

  const alternarActivoTurno = async (turno: Turno) => {
    try {
      await guardarTurno({ ...turno, activo: !turno.activo });
    } catch (error) {
      pushToast(error instanceof Error ? error.message : "No se pudo actualizar", "error");
    }
  };

  const eliminarTurno = async (turno: Turno) => {
    try {
      await borrarTurno(turno.id);
      pushToast("Turno eliminado de la grilla", "success");
    } catch (error) {
      pushToast(error instanceof Error ? error.message : "No se pudo eliminar", "error");
    }
  };

  const guardarTurnoForm = async (turnoForm: TurnoForm) => {
    const esNuevo = !turnoForm.id;
    const turno: Turno = {
      id: esNuevo ? crypto.randomUUID() : turnoForm.id,
      dia: turnoForm.dia,
      hora: turnoForm.hora,
      actividad: turnoForm.actividad.trim() || "Funcional",
      coach: turnoForm.coach.trim() || "Coach",
      cupo: Math.max(1, turnoForm.cupo),
      activo: turnoForm.activo,
      created_at: new Date().toISOString(),
    };
    try {
      await guardarTurno(turno);
      pushToast(esNuevo ? "Turno agregado" : "Turno actualizado", "success");
      setEditandoTurno(null);
      setNuevoTurno(false);
    } catch (error) {
      pushToast(error instanceof Error ? error.message : "No se pudo guardar", "error");
    }
  };

  const copiar = async (texto: string, etiqueta: string) => {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(etiqueta);
      setTimeout(() => setCopiado(null), 2000);
    } catch {
      pushToast("No se pudo copiar", "error");
    }
  };

  /**
   * Guarda los datos de cobro. El store de pagos no expone un método para
   * escribirlos, así que se va directo al motor activo (`db`).
   */
  const guardarDatosCobro = async () => {
    if (!pagoForm) return;
    setGuardandoPago(true);
    try {
      await db.savePagoConfig(pagoForm);
      await loadConfig();
      pushToast("Datos de cobro guardados", "success");
    } catch (error) {
      pushToast(error instanceof Error ? error.message : "No se pudo guardar", "error");
    } finally {
      setGuardandoPago(false);
    }
  };

  /**
   * Reemplaza la lista de actividades de un plan. Como el store no expone un
   * método para escribirla, se va directo al motor activo (`db`) y después se
   * refleja el cambio en el store, que es de donde lee el filtrado del lado
   * del alumno.
   */
  const guardarActividadesDelPlan = async (plan: PlanType, lista: string[]) => {
    const filasViejas = planActividades.filter((pa) => pa.plan === plan);
    for (const fila of filasViejas) await db.deletePlanActividad(fila.id);

    const nuevas: PlanActividad[] = lista.map((actividad) => ({
      id: crypto.randomUUID(),
      plan,
      actividad,
      created_at: new Date().toISOString(),
    }));
    for (const fila of nuevas) await db.savePlanActividad(fila);

    useGymStore.setState((state) => ({
      planActividades: [...state.planActividades.filter((pa) => pa.plan !== plan), ...nuevas],
    }));
  };

  const agregarActividadAlPlan = async (plan: PlanType) => {
    const actividad = nuevaActividad[plan];
    if (!actividad) return;
    try {
      const actuales = actividadesDePlan(planActividades, plan);
      await guardarActividadesDelPlan(plan, [...actuales, actividad]);
      setNuevaActividad((prev) => ({ ...prev, [plan]: "" }));
      pushToast(`${actividad} agregada a ${plan}`, "success");
    } catch (error) {
      pushToast(error instanceof Error ? error.message : "No se pudo guardar", "error");
    }
  };

  const quitarActividadDelPlan = async (plan: PlanType, actividad: string) => {
    try {
      const actuales = actividadesDePlan(planActividades, plan);
      await guardarActividadesDelPlan(
        plan,
        actuales.filter((a) => a !== actividad),
      );
      pushToast(`${actividad} quitada de ${plan}`, "success");
    } catch (error) {
      pushToast(error instanceof Error ? error.message : "No se pudo guardar", "error");
    }
  };

  if (!form) {
    return (
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-4xl px-4 pt-6 pb-10 md:px-6">
          <p className="text-sm text-text-muted">Cargando la configuración del gym…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto w-full max-w-4xl px-4 pt-6 pb-[calc(5rem+env(safe-area-inset-bottom,0px))] md:px-6 md:pb-10 lg:px-8">
        {/* Encabezado */}
        <div className="mb-6">
          <span className="mb-2 block font-mono text-xs uppercase tracking-widest text-chrome">
            Configuración
          </span>
          <h1 className="chrome-text font-display text-4xl tracking-wide uppercase md:text-5xl">
            Ajustes
          </h1>
        </div>

        <div className="flex flex-col gap-4">
          {/* Datos del gym */}
          <section className="rounded-2xl border border-border bg-ink-2 p-4 md:p-6">
            <div className="mb-4 flex items-center gap-2">
              <Building2 size={16} className="text-chrome" aria-hidden="true" />
              <h2 className="font-display text-xl tracking-wide text-text-hi uppercase">El gym</h2>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={etiquetaClase} htmlFor="gym-nombre">
                  Nombre
                </label>
                <input
                  id="gym-nombre"
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  className={campoClase}
                />
              </div>
              <div>
                <label className={etiquetaClase} htmlFor="gym-direccion">
                  Dirección
                </label>
                <input
                  id="gym-direccion"
                  value={form.direccion}
                  onChange={(e) => setForm({ ...form, direccion: e.target.value })}
                  className={campoClase}
                />
              </div>
            </div>
          </section>

          {/* Horarios de apertura */}
          <section className="rounded-2xl border border-border bg-ink-2 p-4 md:p-6">
            <div className="mb-4 flex items-center gap-2">
              <CalendarClock size={16} className="text-chrome" aria-hidden="true" />
              <h2 className="font-display text-xl tracking-wide text-text-hi uppercase">
                Horarios de apertura
              </h2>
            </div>

            <span className={etiquetaClase}>Días activos</span>
            <div className="mb-5 flex flex-wrap gap-2">
              {DIAS.map((dia) => {
                const activo = form.dias_activos.includes(dia);
                return (
                  <button
                    key={dia}
                    onClick={() => alternarDia(dia)}
                    aria-pressed={activo}
                    className={`min-h-11 rounded-xl border px-4 py-2 font-mono text-xs uppercase tracking-widest transition-colors ${
                      activo
                        ? "border-chrome bg-chrome text-ink"
                        : "border-border text-text-muted hover:border-chrome/40 hover:text-text-hi"
                    }`}
                  >
                    {NOMBRES_DIA_CORTO[dia]}
                  </button>
                );
              })}
            </div>

            <span className={etiquetaClase}>Franjas horarias</span>
            <div className="mb-3 flex flex-col gap-2">
              {form.franjas.map((tramo, i) => (
                <div key={`${tramo.inicio}-${i}`} className="flex items-end gap-2">
                  <div className="flex-1">
                    <label className={etiquetaClase} htmlFor={`franja-inicio-${i}`}>
                      Abre
                    </label>
                    <input
                      id={`franja-inicio-${i}`}
                      type="time"
                      value={tramo.inicio}
                      onChange={(e) => actualizarFranja(i, { inicio: e.target.value })}
                      className={campoClase}
                    />
                  </div>
                  <div className="flex-1">
                    <label className={etiquetaClase} htmlFor={`franja-fin-${i}`}>
                      Cierra
                    </label>
                    <input
                      id={`franja-fin-${i}`}
                      type="time"
                      value={tramo.fin}
                      onChange={(e) => actualizarFranja(i, { fin: e.target.value })}
                      className={campoClase}
                    />
                  </div>
                  <button
                    onClick={() => quitarFranja(i)}
                    aria-label={`Quitar franja ${etiquetaTramo(tramo)}`}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border text-text-muted transition-colors hover:border-danger/50 hover:text-danger"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              {form.franjas.length === 0 && (
                <p className="text-sm text-text-muted">
                  Sin franjas: no se generan horarios posibles.
                </p>
              )}
            </div>
            <button
              onClick={agregarFranja}
              className="flex min-h-11 items-center gap-2 rounded-xl border border-chrome/40 px-4 py-2 text-sm font-semibold text-chrome transition-colors hover:bg-chrome/10"
            >
              <Plus size={16} />
              Agregar franja
            </button>

            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className={etiquetaClase} htmlFor="gym-duracion">
                  Duración (min)
                </label>
                <input
                  id="gym-duracion"
                  type="number"
                  min={15}
                  max={180}
                  step={15}
                  value={form.duracion_min}
                  onChange={(e) =>
                    setForm({ ...form, duracion_min: Math.max(15, Number(e.target.value) || 15) })
                  }
                  className={campoClase}
                />
              </div>
              <div>
                <label className={etiquetaClase} htmlFor="gym-paso">
                  Paso (min)
                </label>
                <input
                  id="gym-paso"
                  type="number"
                  min={5}
                  max={120}
                  step={5}
                  value={form.paso_min}
                  onChange={(e) =>
                    setForm({ ...form, paso_min: Math.max(5, Number(e.target.value) || 5) })
                  }
                  className={campoClase}
                />
              </div>
              <div>
                <label className={etiquetaClase} htmlFor="gym-aviso">
                  Aviso previo (min)
                </label>
                <input
                  id="gym-aviso"
                  type="number"
                  min={0}
                  max={120}
                  step={5}
                  value={form.minutos_aviso}
                  onChange={(e) =>
                    setForm({ ...form, minutos_aviso: Math.max(0, Number(e.target.value) || 0) })
                  }
                  className={campoClase}
                />
              </div>
            </div>

            <p className="mt-4 font-mono text-xs text-text-muted">
              {slots.length} horarios posibles por día · {form.dias_activos.length} días activos
            </p>

            <button
              onClick={guardar}
              disabled={guardando}
              className="plate-steel mt-4 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold uppercase tracking-widest text-chrome transition-opacity disabled:opacity-50"
            >
              <Save size={16} />
              {guardando ? "Guardando…" : "Guardar configuración"}
            </button>
          </section>

          {/* Grilla semanal */}
          <section className="rounded-2xl border border-border bg-ink-2 p-4 md:p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Layers size={16} className="text-chrome" aria-hidden="true" />
                <h2 className="font-display text-xl tracking-wide text-text-hi uppercase">
                  Grilla semanal
                </h2>
              </div>
              <button
                onClick={() => {
                  setNuevoTurno(true);
                  setEditandoTurno({
                    id: "",
                    dia: form.dias_activos[0] ?? "Lun",
                    hora: slots[0] ?? "08:00",
                    actividad: actividades[0] ?? "Funcional",
                    coach: coaches[0] ?? "Nacho",
                    cupo: 10,
                    activo: true,
                  });
                }}
                className="flex min-h-11 items-center gap-2 rounded-xl border border-chrome/40 px-4 py-2 text-sm font-semibold text-chrome transition-colors hover:bg-chrome/10"
              >
                <Plus size={16} />
                Turno
              </button>
            </div>

            <p className="mb-4 font-mono text-xs text-text-muted">
              La grilla define qué hay en cada horario. Las sesiones de cada día se generan
              automáticamente a partir de acá.
            </p>

            <div className="flex flex-col gap-4">
              {DIAS.map((dia) => {
                const lista = turnosPorDia.get(dia) ?? [];
                if (lista.length === 0) return null;
                return (
                  <div key={dia}>
                    <span className="mb-2 block font-mono text-xs uppercase tracking-widest text-chrome">
                      {NOMBRES_DIA_CORTO[dia]}
                    </span>
                    <ul className="flex flex-col gap-2">
                      {lista.map((turno) => (
                        <li
                          key={turno.id}
                          className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-ink px-3 py-2"
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <span className="font-mono text-sm text-text-hi">{turno.hora}</span>
                            <div className="min-w-0">
                              <span className="block truncate text-sm text-text-hi">
                                {turno.actividad}
                              </span>
                              <span className="block font-mono text-xs text-text-muted">
                                {turno.coach} · cupo {turno.cupo}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => alternarActivoTurno(turno)}
                              aria-pressed={turno.activo}
                              aria-label={`${turno.activo ? "Desactivar" : "Activar"} turno ${turno.dia} ${turno.hora}`}
                              className={`min-h-11 rounded-xl border px-3 py-2 font-mono text-xs uppercase tracking-widest transition-colors ${
                                turno.activo
                                  ? "border-chrome/40 text-chrome"
                                  : "border-border text-text-muted"
                              }`}
                            >
                              {turno.activo ? "Activo" : "Inactivo"}
                            </button>
                            <button
                              onClick={() => {
                                setNuevoTurno(false);
                                setEditandoTurno(formDesdeTurno(turno));
                              }}
                              aria-label={`Editar turno ${turno.dia} ${turno.hora}`}
                              className="flex h-11 w-11 items-center justify-center rounded-xl border border-border text-text-muted transition-colors hover:border-chrome/50 hover:text-chrome"
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              onClick={() => eliminarTurno(turno)}
                              aria-label={`Eliminar turno ${turno.dia} ${turno.hora}`}
                              className="flex h-11 w-11 items-center justify-center rounded-xl border border-border text-text-muted transition-colors hover:border-danger/50 hover:text-danger"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}

              {turnos.length === 0 && (
                <p className="py-6 text-center text-sm text-text-muted">
                  No hay turnos cargados en la grilla
                </p>
              )}
            </div>
          </section>

          {/* Actividades por plan */}
          <section className="rounded-2xl border border-border bg-ink-2 p-4 md:p-6">
            <div className="mb-4 flex items-center gap-2">
              <Layers size={16} className="text-chrome" aria-hidden="true" />
              <h2 className="font-display text-xl tracking-wide text-text-hi uppercase">
                Actividades por plan
              </h2>
            </div>
            <p className="mb-4 font-mono text-xs text-text-muted">
              Cada cliente sólo ve las actividades de su plan.
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {PLANES.map((plan) => {
                const incluidas = actividadesDePlan(planActividades, plan);
                const disponibles = actividades.filter((a) => !incluidas.includes(a));
                return (
                  <div key={plan} className="rounded-xl border border-border bg-ink p-4">
                    <span className="mb-2 block font-mono text-xs uppercase tracking-widest text-chrome">
                      {plan}
                    </span>
                    <ul className="flex flex-col gap-1">
                      {incluidas.map((actividad) => (
                        <li key={actividad} className="flex items-center justify-between gap-2">
                          <span className="text-sm text-text-mid">{actividad}</span>
                          <button
                            onClick={() => quitarActividadDelPlan(plan, actividad)}
                            disabled={incluidas.length <= 1}
                            aria-label={`Quitar ${actividad} de ${plan}`}
                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border text-text-muted transition-colors hover:border-danger/50 hover:text-danger disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-border disabled:hover:text-text-muted"
                          >
                            <X size={15} />
                          </button>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-3 flex items-center gap-2">
                      <select
                        aria-label={`Elegir actividad para ${plan}`}
                        value={nuevaActividad[plan] ?? ""}
                        onChange={(e) =>
                          setNuevaActividad((prev) => ({ ...prev, [plan]: e.target.value }))
                        }
                        className={campoClase}
                      >
                        <option value="">Agregar actividad…</option>
                        {disponibles.map((actividad) => (
                          <option key={actividad} value={actividad}>
                            {actividad}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => agregarActividadAlPlan(plan)}
                        disabled={!nuevaActividad[plan]}
                        aria-label={`Agregar actividad a ${plan}`}
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border text-text-muted transition-colors hover:border-chrome/50 hover:text-chrome disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-border disabled:hover:text-text-muted"
                      >
                        <Plus size={15} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Precios y cobro */}
          <section className="rounded-2xl border border-border bg-ink-2 p-4 md:p-6">
            <div className="mb-4 flex items-center gap-2">
              <CreditCard size={16} className="text-chrome" aria-hidden="true" />
              <h2 className="font-display text-xl tracking-wide text-text-hi uppercase">
                Precios y cobro
              </h2>
            </div>

            <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {PLANES.map((plan) => (
                <div key={plan} className="rounded-xl border border-border bg-ink p-4">
                  <span className="mb-2 block font-mono text-xs uppercase tracking-widest text-text-muted">
                    {plan}
                  </span>
                  <span className="font-display text-2xl tracking-wide text-chrome">
                    {formatMoney(getPrecioPlan(plan))}
                  </span>
                  <span className="ml-1 font-mono text-xs text-text-muted">/mes</span>
                </div>
              ))}
            </div>

            {pagoForm && (
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-border bg-ink p-4">
                    <label className={etiquetaClase} htmlFor="pago-cvu">
                      CBU / CVU
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        id="pago-cvu"
                        value={pagoForm.cvu}
                        onChange={(e) => setPagoForm({ ...pagoForm, cvu: e.target.value })}
                        className={campoClase}
                      />
                      <button
                        onClick={() => copiar(pagoForm.cvu, "cbu")}
                        aria-label="Copiar CBU"
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border text-text-muted transition-colors hover:border-chrome/50 hover:text-chrome"
                      >
                        {copiado === "cbu" ? <Check size={15} /> : <Copy size={15} />}
                      </button>
                    </div>
                  </div>
                  <div className="rounded-xl border border-border bg-ink p-4">
                    <label className={etiquetaClase} htmlFor="pago-alias">
                      Alias
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        id="pago-alias"
                        value={pagoForm.alias}
                        onChange={(e) => setPagoForm({ ...pagoForm, alias: e.target.value })}
                        className={campoClase}
                      />
                      <button
                        onClick={() => copiar(pagoForm.alias, "alias")}
                        aria-label="Copiar alias"
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border text-text-muted transition-colors hover:border-chrome/50 hover:text-chrome"
                      >
                        {copiado === "alias" ? <Check size={15} /> : <Copy size={15} />}
                      </button>
                    </div>
                  </div>
                  <div className="rounded-xl border border-border bg-ink p-4">
                    <label className={etiquetaClase} htmlFor="pago-titular">
                      Titular
                    </label>
                    <input
                      id="pago-titular"
                      value={pagoForm.titular}
                      onChange={(e) => setPagoForm({ ...pagoForm, titular: e.target.value })}
                      className={campoClase}
                    />
                  </div>
                  <div className="rounded-xl border border-border bg-ink p-4">
                    <label className={etiquetaClase} htmlFor="pago-banco">
                      Banco
                    </label>
                    <input
                      id="pago-banco"
                      value={pagoForm.banco}
                      onChange={(e) => setPagoForm({ ...pagoForm, banco: e.target.value })}
                      className={campoClase}
                    />
                  </div>
                  <div className="rounded-xl border border-border bg-ink p-4">
                    <label className={etiquetaClase} htmlFor="pago-dia-limite">
                      Día límite de pago
                    </label>
                    <input
                      id="pago-dia-limite"
                      type="number"
                      min={1}
                      max={31}
                      value={pagoForm.dia_limite}
                      onChange={(e) =>
                        setPagoForm({
                          ...pagoForm,
                          dia_limite: Math.min(31, Math.max(1, Number(e.target.value) || 1)),
                        })
                      }
                      className={campoClase}
                    />
                  </div>
                </div>

                <button
                  onClick={guardarDatosCobro}
                  disabled={guardandoPago}
                  className="plate-steel flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold uppercase tracking-widest text-chrome transition-opacity disabled:opacity-50"
                >
                  <Save size={16} />
                  {guardandoPago ? "Guardando…" : "Guardar datos de cobro"}
                </button>
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Modal de turno */}
      <Modal open={!!editandoTurno} onClose={() => setEditandoTurno(null)}>
        {editandoTurno && (
          <TurnoFormModal
            form={editandoTurno}
            nuevo={nuevoTurno}
            horas={slots.length > 0 ? slots : HORAS_FALLBACK}
            actividades={actividades}
            coaches={coaches}
            onChange={setEditandoTurno}
            onClose={() => {
              setEditandoTurno(null);
              setNuevoTurno(false);
            }}
            onSave={guardarTurnoForm}
          />
        )}
      </Modal>
    </div>
  );
}

interface TurnoFormModalProps {
  form: TurnoForm;
  nuevo: boolean;
  horas: string[];
  actividades: string[];
  coaches: string[];
  onChange: (form: TurnoForm) => void;
  onClose: () => void;
  onSave: (form: TurnoForm) => void;
}

function TurnoFormModal({
  form,
  nuevo,
  horas,
  actividades,
  coaches,
  onChange,
  onClose,
  onSave,
}: TurnoFormModalProps) {
  return (
    <div className="flex flex-col gap-4">
      <h3 className="font-display text-2xl tracking-wide text-text-hi uppercase">
        {nuevo ? "Nuevo turno" : "Editar turno"}
      </h3>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={etiquetaClase} htmlFor="turno-dia">
            Día
          </label>
          <select
            id="turno-dia"
            value={form.dia}
            onChange={(e) => onChange({ ...form, dia: e.target.value as DiaSemana })}
            className={campoClase}
          >
            {DIAS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={etiquetaClase} htmlFor="turno-hora">
            Hora
          </label>
          <select
            id="turno-hora"
            value={form.hora}
            onChange={(e) => onChange({ ...form, hora: e.target.value })}
            className={campoClase}
          >
            {horas.map((h) => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </select>
        </div>
        <div className="col-span-2">
          <label className={etiquetaClase} htmlFor="turno-actividad">
            Actividad
          </label>
          <input
            id="turno-actividad"
            list="actividades-turno"
            value={form.actividad}
            onChange={(e) => onChange({ ...form, actividad: e.target.value })}
            className={campoClase}
          />
          <datalist id="actividades-turno">
            {actividades.map((a) => (
              <option key={a} value={a} />
            ))}
          </datalist>
        </div>
        <div>
          <label className={etiquetaClase} htmlFor="turno-coach">
            Coach
          </label>
          <input
            id="turno-coach"
            list="coaches-turno"
            value={form.coach}
            onChange={(e) => onChange({ ...form, coach: e.target.value })}
            className={campoClase}
          />
          <datalist id="coaches-turno">
            {coaches.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </div>
        <div>
          <label className={etiquetaClase} htmlFor="turno-cupo">
            Cupo
          </label>
          <input
            id="turno-cupo"
            type="number"
            min={1}
            max={60}
            value={form.cupo}
            onChange={(e) => onChange({ ...form, cupo: Math.max(1, Number(e.target.value) || 1) })}
            className={campoClase}
          />
        </div>
      </div>

      <label className="flex items-center gap-3 text-sm text-text-mid">
        <input
          type="checkbox"
          checked={form.activo}
          onChange={(e) => onChange({ ...form, activo: e.target.checked })}
          className="h-5 w-5 accent-chrome"
        />
        Turno activo
      </label>

      <div className="flex gap-2">
        <button
          onClick={() => onSave(form)}
          className="plate-steel flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold uppercase tracking-widest text-chrome"
        >
          <Save size={16} />
          Guardar
        </button>
        <button
          onClick={onClose}
          className="min-h-11 rounded-xl border border-border px-4 py-3 text-sm font-semibold text-text-mid transition-colors hover:border-chrome/40 hover:text-text-hi"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
