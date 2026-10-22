import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  CalendarClock,
  ChevronDown,
  Flame,
  Mail,
  Pencil,
  Phone,
  Plus,
  Search,
  Target,
  ThumbsDown,
  ThumbsUp,
  Trash2,
  Users,
} from "lucide-react";
import { Avatar, Modal, StatusChip, useToast } from "@/components";
import { useGymStore } from "@/stores/gymStore";
import { infoNivel, resumenAlumno, type Nivel, type ParInscripcion, type ResumenAlumno } from "@/lib/puntaje";
import { etiquetaFranja, generarSlots, minutosAHora, NOMBRES_DIA_CORTO } from "@/lib/horarios";
import { hoyISO, sumarDias } from "@/lib/fechas";
import { DIAS, type DiaSemana, type Franja, type PlanType, type Profile, type SlotPreferido } from "@/types";

type FiltroPlan = PlanType | "todos";
type Tab = "clientes" | "pedidos";

/** Ventana de historial con la que se calcula el puntaje de cada cliente. */
const DIAS_DE_HISTORIAL = 60;

const PLAN_FILTROS: Array<{ clave: FiltroPlan; etiqueta: string }> = [
  { clave: "todos", etiqueta: "TODOS" },
  { clave: "2x semana", etiqueta: "2×" },
  { clave: "3x semana", etiqueta: "3×" },
  { clave: "Full", etiqueta: "FULL" },
];

/** Colores de nivel: la escala de plata del tema. */
const CLASE_NIVEL: Record<Nivel, string> = {
  acero: "text-nivel-acero border-nivel-acero/40 bg-nivel-acero/10",
  plata: "text-nivel-plata border-nivel-plata/40 bg-nivel-plata/10",
  platino: "text-nivel-platino border-nivel-platino/40 bg-nivel-platino/10",
  diamante: "text-nivel-diamante border-nivel-diamante/40 bg-nivel-diamante/10",
};

/** Horarios de referencia si todavía no hay configuración cargada. */
const HORAS_FALLBACK: string[] = (() => {
  const horas: string[] = [];
  for (let m = 8 * 60; m <= 21 * 60; m += 30) horas.push(minutosAHora(m));
  return horas;
})();

function etiquetaPlan(plan: PlanType): string {
  if (plan === "Full") return "FULL";
  if (plan === "3x semana") return "3× SEMANA";
  return "2× SEMANA";
}

/** "mar 08:00, jue 18:00" */
function etiquetaSlots(slots: SlotPreferido[]): string {
  return slots
    .map((s) => `${NOMBRES_DIA_CORTO[s.dia].toLowerCase()} ${s.hora}`)
    .join(", ");
}

interface FilaDatoProps {
  icono: React.ElementType;
  etiqueta: string;
  valor: React.ReactNode;
}

function FilaDato({ icono: Icono, etiqueta, valor }: FilaDatoProps) {
  return (
    <div className="flex items-start gap-2">
      <Icono size={14} className="text-chrome-dim mt-1 shrink-0" aria-hidden="true" />
      <div className="min-w-0">
        <span className="block text-xs font-mono uppercase tracking-widest text-text-muted">{etiqueta}</span>
        <span className="block text-sm text-text-hi break-words">{valor}</span>
      </div>
    </div>
  );
}

interface EditarClienteProps {
  perfil: Profile;
  horas: string[];
  onClose: () => void;
}

/**
 * Edición de una ficha de cliente. El profesor puede ajustar plan, contacto,
 * frecuencia, franja y los horarios que el cliente pidió al registrarse.
 */
function EditarCliente({ perfil, horas, onClose }: EditarClienteProps) {
  const { guardarPerfil } = useGymStore();
  const { pushToast } = useToast();

  const [nombre, setNombre] = useState(perfil.nombre);
  const [telefono, setTelefono] = useState(perfil.telefono);
  const [email, setEmail] = useState(perfil.email);
  const [plan, setPlan] = useState<PlanType>(perfil.plan);
  const [estado, setEstado] = useState<"activo" | "vencido">(perfil.estado);
  const [frecuencia, setFrecuencia] = useState(perfil.frecuencia_semana);
  const [objetivo, setObjetivo] = useState(perfil.veces_mes_objetivo);
  const [franja, setFranja] = useState<Franja>(perfil.franja);
  const [slots, setSlots] = useState<SlotPreferido[]>(perfil.slots_preferidos ?? []);
  const [slotDia, setSlotDia] = useState<DiaSemana>("Lun");
  const [slotHora, setSlotHora] = useState(horas[0] ?? "08:00");
  const [guardando, setGuardando] = useState(false);

  const agregarSlot = () => {
    if (slots.some((s) => s.dia === slotDia && s.hora === slotHora)) {
      pushToast("Ese horario ya está pedido", "info");
      return;
    }
    setSlots([...slots, { dia: slotDia, hora: slotHora }]);
  };

  const quitarSlot = (indice: number) => {
    setSlots(slots.filter((_, i) => i !== indice));
  };

  const guardar = async () => {
    setGuardando(true);
    try {
      await guardarPerfil({
        ...perfil,
        nombre: nombre.trim() || perfil.nombre,
        telefono: telefono.trim(),
        email: email.trim(),
        plan,
        estado,
        frecuencia_semana: frecuencia,
        veces_mes_objetivo: objetivo,
        franja,
        slots_preferidos: slots,
      });
      pushToast("Cliente actualizado", "success");
      onClose();
    } catch (error) {
      pushToast(error instanceof Error ? error.message : "No se pudo guardar", "error");
    } finally {
      setGuardando(false);
    }
  };

  const campoClase =
    "w-full bg-ink border border-border rounded-xl px-4 py-3 text-sm text-text-hi placeholder:text-text-muted focus:outline-none focus:border-chrome/50";

  const etiquetaClase = "block text-xs font-mono uppercase tracking-widest text-text-muted mb-2";

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <Avatar nombre={perfil.nombre} size="lg" />
        <div className="min-w-0">
          <h3 className="font-display text-2xl tracking-wide text-text-hi truncate">{perfil.nombre}</h3>
          <span className="text-xs font-mono uppercase tracking-widest text-chrome">
            {etiquetaPlan(perfil.plan)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={etiquetaClase} htmlFor="cli-nombre">
            Nombre
          </label>
          <input
            id="cli-nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className={campoClase}
          />
        </div>
        <div>
          <label className={etiquetaClase} htmlFor="cli-tel">
            Teléfono
          </label>
          <input
            id="cli-tel"
            value={telefono}
            inputMode="tel"
            onChange={(e) => setTelefono(e.target.value)}
            className={campoClase}
            placeholder="249 000 0000"
          />
        </div>
        <div className="sm:col-span-2">
          <label className={etiquetaClase} htmlFor="cli-email">
            Email
          </label>
          <input
            id="cli-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={campoClase}
          />
        </div>
        <div>
          <label className={etiquetaClase} htmlFor="cli-plan">
            Plan
          </label>
          <select
            id="cli-plan"
            value={plan}
            onChange={(e) => setPlan(e.target.value as PlanType)}
            className={campoClase}
          >
            <option value="2x semana">2× semana</option>
            <option value="3x semana">3× semana</option>
            <option value="Full">Full</option>
          </select>
        </div>
        <div>
          <label className={etiquetaClase} htmlFor="cli-estado">
            Estado
          </label>
          <select
            id="cli-estado"
            value={estado}
            onChange={(e) => setEstado(e.target.value as "activo" | "vencido")}
            className={campoClase}
          >
            <option value="activo">Activo</option>
            <option value="vencido">Vencido</option>
          </select>
        </div>
        <div>
          <label className={etiquetaClase} htmlFor="cli-frec">
            Frecuencia semanal
          </label>
          <input
            id="cli-frec"
            type="number"
            min={1}
            max={5}
            value={frecuencia}
            onChange={(e) => setFrecuencia(Math.max(1, Math.min(5, Number(e.target.value) || 1)))}
            className={campoClase}
          />
        </div>
        <div>
          <label className={etiquetaClase} htmlFor="cli-obj">
            Objetivo mensual
          </label>
          <input
            id="cli-obj"
            type="number"
            min={1}
            max={30}
            value={objetivo}
            onChange={(e) => setObjetivo(Math.max(1, Number(e.target.value) || 1))}
            className={campoClase}
          />
        </div>
        <div>
          <label className={etiquetaClase} htmlFor="cli-franja">
            Franja preferida
          </label>
          <select
            id="cli-franja"
            value={franja}
            onChange={(e) => setFranja(e.target.value as Franja)}
            className={campoClase}
          >
            <option value="manana">Mañana</option>
            <option value="tarde">Tarde</option>
            <option value="ambas">Ambas</option>
          </select>
        </div>
      </div>

      <div>
        <span className={etiquetaClase}>Horarios que pidió</span>
        <div className="flex flex-col gap-2">
          {slots.length === 0 && (
            <p className="text-sm text-text-muted">Todavía no pidió ningún horario.</p>
          )}
          {slots.map((slot, i) => (
            <div
              key={`${slot.dia}-${slot.hora}-${i}`}
              className="flex items-center justify-between rounded-xl border border-border bg-ink px-3 py-2"
            >
              <span className="font-mono text-sm text-text-hi">
                {NOMBRES_DIA_CORTO[slot.dia].toLowerCase()} {slot.hora}
              </span>
              <button
                onClick={() => quitarSlot(i)}
                aria-label={`Quitar ${slot.dia} ${slot.hora}`}
                className="flex h-11 w-11 items-center justify-center rounded-xl text-text-muted transition-colors hover:text-danger"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-[1fr_1fr_auto]">
          <select
            value={slotDia}
            onChange={(e) => setSlotDia(e.target.value as DiaSemana)}
            aria-label="Día del horario pedido"
            className={campoClase}
          >
            {DIAS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          <select
            value={slotHora}
            onChange={(e) => setSlotHora(e.target.value)}
            aria-label="Hora del horario pedido"
            className={campoClase}
          >
            {horas.map((h) => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </select>
          <button
            onClick={agregarSlot}
            className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-chrome/40 px-4 py-3 text-sm font-semibold text-chrome transition-colors hover:bg-chrome/10"
          >
            <Plus size={16} />
            Agregar
          </button>
        </div>
      </div>

      <button
        onClick={guardar}
        disabled={guardando}
        className="plate-steel flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold uppercase tracking-widest text-chrome transition-opacity disabled:opacity-50"
      >
        {guardando ? "Guardando…" : "Guardar cambios"}
      </button>
    </div>
  );
}

export function AlumnosView() {
  const {
    perfiles,
    sesiones,
    inscripciones,
    config,
    initialized,
    loading,
    cargarSesiones,
    cargarInscripciones,
  } = useGymStore();

  const [query, setQuery] = useState("");
  const [plan, setPlan] = useState<FiltroPlan>("todos");
  const [tab, setTab] = useState<Tab>("clientes");
  const [abiertoId, setAbiertoId] = useState<string | null>(null);
  const [editando, setEditando] = useState<Profile | null>(null);

  /**
   * El puntaje necesita historial: `resumenAlumno` empareja cada inscripción con
   * su sesión, así que sin las sesiones viejas la concurrencia y la racha dan 0.
   * Se carga recién cuando el store terminó de inicializar, porque `init()`
   * deja la semana en curso y pisaría el rango.
   */
  useEffect(() => {
    if (!initialized || loading) return;
    const hasta = hoyISO();
    const desde = sumarDias(hasta, -DIAS_DE_HISTORIAL);
    void cargarSesiones(desde, hasta);
    void cargarInscripciones();
  }, [initialized, loading, cargarSesiones, cargarInscripciones]);

  const clientes = useMemo(() => perfiles.filter((p) => p.role === "alumno"), [perfiles]);

  const sesionesById = useMemo(() => new Map(sesiones.map((s) => [s.id, s])), [sesiones]);

  /** Inscripciones del cliente emparejadas con su sesión. */
  const paresPorAlumno = useMemo(() => {
    const mapa = new Map<string, ParInscripcion[]>();
    for (const inscripcion of inscripciones) {
      const sesion = sesionesById.get(inscripcion.sesion_id);
      if (!sesion) continue;
      const lista = mapa.get(inscripcion.alumno_id) ?? [];
      lista.push({ inscripcion, sesion });
      mapa.set(inscripcion.alumno_id, lista);
    }
    return mapa;
  }, [inscripciones, sesionesById]);

  const resumenes = useMemo(() => {
    const mapa = new Map<string, ResumenAlumno>();
    for (const cliente of clientes) {
      mapa.set(cliente.id, resumenAlumno(paresPorAlumno.get(cliente.id) ?? [], cliente));
    }
    return mapa;
  }, [clientes, paresPorAlumno]);

  const filtrados = useMemo(() => {
    const q = query.trim().toLowerCase();
    return clientes
      .filter((c) => (plan === "todos" ? true : c.plan === plan))
      .filter((c) => {
        if (!q) return true;
        return (
          c.nombre.toLowerCase().includes(q) || c.telefono.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [clientes, plan, query]);

  const conPedidos = useMemo(
    () =>
      clientes
        .filter((c) => (c.slots_preferidos ?? []).length > 0)
        .sort((a, b) => a.nombre.localeCompare(b.nombre)),
    [clientes],
  );

  const slotsDisponibles = useMemo(
    () => (config ? generarSlots(config) : HORAS_FALLBACK),
    [config],
  );

  const activos = clientes.filter((c) => c.estado === "activo").length;
  const vencidos = clientes.length - activos;

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto w-full max-w-5xl px-4 pt-6 pb-[calc(5rem+env(safe-area-inset-bottom,0px))] md:px-6 md:pb-10 lg:px-8">
        {/* Encabezado */}
        <div className="mb-6">
          <span className="mb-2 block font-mono text-xs uppercase tracking-widest text-chrome">
            Clientes
          </span>
          <h1 className="chrome-text font-display text-4xl tracking-wide uppercase md:text-5xl">
            Alumnos
          </h1>
          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-border bg-ink-2 px-3 py-2">
              <span className="block font-mono text-xs uppercase tracking-widest text-text-muted">
                Total
              </span>
              <span className="font-display text-2xl tracking-wide text-text-hi">{clientes.length}</span>
            </div>
            <div className="rounded-xl border border-border bg-ink-2 px-3 py-2">
              <span className="block font-mono text-xs uppercase tracking-widest text-text-muted">
                Activos
              </span>
              <span className="font-display text-2xl tracking-wide text-chrome">{activos}</span>
            </div>
            <div className="rounded-xl border border-border bg-ink-2 px-3 py-2">
              <span className="block font-mono text-xs uppercase tracking-widest text-text-muted">
                Vencidos
              </span>
              <span className="font-display text-2xl tracking-wide text-danger">{vencidos}</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setTab("clientes")}
            aria-current={tab === "clientes" ? "page" : undefined}
            className={`flex min-h-11 shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
              tab === "clientes"
                ? "border-chrome bg-chrome text-ink"
                : "border-border text-text-mid hover:border-chrome/40 hover:text-text-hi"
            }`}
          >
            <Users size={16} />
            Clientes
          </button>
          <button
            onClick={() => setTab("pedidos")}
            aria-current={tab === "pedidos" ? "page" : undefined}
            className={`flex min-h-11 shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
              tab === "pedidos"
                ? "border-chrome bg-chrome text-ink"
                : "border-border text-text-mid hover:border-chrome/40 hover:text-text-hi"
            }`}
          >
            <CalendarClock size={16} />
            Horarios pedidos
            <span className="font-mono text-xs opacity-70">{conPedidos.length}</span>
          </button>
        </div>

        {tab === "clientes" ? (
          <>
            {/* Buscador + filtro por plan */}
            <div className="mb-5 flex flex-col gap-3">
              <div className="flex items-center gap-2 rounded-xl border border-border bg-ink-2 px-4 py-3">
                <Search size={16} className="text-text-muted" aria-hidden="true" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar por nombre o teléfono"
                  aria-label="Buscar cliente por nombre o teléfono"
                  className="flex-1 bg-transparent text-sm text-text-hi outline-none placeholder:text-text-muted"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {PLAN_FILTROS.map((f) => (
                  <button
                    key={f.clave}
                    onClick={() => setPlan(f.clave)}
                    aria-pressed={plan === f.clave}
                    className={`min-h-11 shrink-0 rounded-full border px-4 py-2 font-mono text-xs uppercase tracking-widest transition-colors ${
                      plan === f.clave
                        ? "border-chrome bg-chrome text-ink"
                        : "border-border text-text-mid hover:border-chrome/40 hover:text-text-hi"
                    }`}
                  >
                    {f.etiqueta}
                  </button>
                ))}
              </div>
            </div>

            {/* Lista de clientes */}
            <div className="flex flex-col gap-3">
              {filtrados.map((cliente) => {
                const resumen = resumenes.get(cliente.id);
                const abierto = abiertoId === cliente.id;
                const nivel = resumen?.nivel ?? "acero";
                const telefono = cliente.telefono.replace(/\s+/g, "");

                return (
                  <article
                    key={cliente.id}
                    className="overflow-hidden rounded-2xl border border-border bg-ink-2 transition-colors hover:border-chrome/30"
                  >
                    <div className="flex items-start gap-3 p-4">
                      <Avatar nombre={cliente.nombre} />

                      <div className="min-w-0 flex-1">
                        <button
                          onClick={() => setAbiertoId(abierto ? null : cliente.id)}
                          aria-expanded={abierto}
                          className="flex w-full items-start justify-between gap-2 text-left"
                        >
                          <span className="min-w-0">
                            <span className="block truncate font-display text-xl tracking-wide text-text-hi">
                              {cliente.nombre}
                            </span>
                          </span>
                          <span className="flex shrink-0 items-center gap-2">
                            <StatusChip estado={cliente.estado} size="sm" />
                            <ChevronDown
                              size={18}
                              className={`text-text-muted transition-transform ${abierto ? "rotate-180" : ""}`}
                              aria-hidden="true"
                            />
                          </span>
                        </button>

                        {telefono ? (
                          <a
                            href={`tel:${telefono}`}
                            className="mt-1 inline-flex items-center gap-1.5 font-mono text-xs text-chrome transition-colors hover:text-text-hi"
                          >
                            <Phone size={12} aria-hidden="true" />
                            {cliente.telefono}
                          </a>
                        ) : (
                          <span className="mt-1 block font-mono text-xs text-text-muted">
                            Sin teléfono
                          </span>
                        )}

                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <span className="rounded-full border border-chrome/40 bg-chrome/10 px-2 py-0.5 font-mono text-xs uppercase tracking-widest text-chrome">
                            {etiquetaPlan(cliente.plan)}
                          </span>
                          <span className="font-mono text-xs text-text-muted">
                            {cliente.frecuencia_semana}× semana
                          </span>
                        </div>

                        {/* Puntaje */}
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-full border px-2 py-0.5 font-mono text-xs uppercase tracking-widest ${CLASE_NIVEL[nivel]}`}
                            title={infoNivel(nivel).descripcion}
                          >
                            {infoNivel(nivel).nombre}
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-full border border-border bg-ink px-2 py-0.5 font-mono text-xs text-text-mid">
                            <Target size={12} aria-hidden="true" />
                            {resumen?.concurrencia ?? 0}% concurrencia
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-full border border-border bg-ink px-2 py-0.5 font-mono text-xs text-text-mid">
                            <Flame size={12} aria-hidden="true" />
                            racha {resumen?.racha ?? 0}
                          </span>
                        </div>
                      </div>
                    </div>

                    {abierto && (
                      <div className="border-t border-border bg-ink px-4 py-4">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <FilaDato icono={Mail} etiqueta="Email" valor={cliente.email || "—"} />
                          <FilaDato
                            icono={Activity}
                            etiqueta="Objetivo mensual"
                            valor={`${cliente.veces_mes_objetivo} turnos al mes`}
                          />
                          <FilaDato
                            icono={Target}
                            etiqueta="Franja"
                            valor={etiquetaFranja(cliente.franja)}
                          />
                          <FilaDato
                            icono={CalendarClock}
                            etiqueta="Horarios que pidió"
                            valor={
                              (cliente.slots_preferidos ?? []).length > 0
                                ? etiquetaSlots(cliente.slots_preferidos)
                                : "No pidió horarios"
                            }
                          />
                          <FilaDato
                            icono={Users}
                            etiqueta="Turnos totales"
                            valor={`${resumen?.reservadas ?? 0} reservados`}
                          />
                          <FilaDato
                            icono={Target}
                            etiqueta="Asistencia"
                            valor={`${resumen?.asistidas ?? 0} fue · ${resumen?.faltadas ?? 0} faltó`}
                          />
                          <FilaDato
                            icono={ThumbsUp}
                            etiqueta="Feedback"
                            valor={
                              <span className="inline-flex items-center gap-3">
                                <span className="inline-flex items-center gap-1 font-mono text-xs text-text-hi">
                                  <ThumbsUp size={12} aria-hidden="true" />
                                  {resumen?.feedbackPositivo ?? 0}
                                </span>
                                <span className="inline-flex items-center gap-1 font-mono text-xs text-text-muted">
                                  <ThumbsDown size={12} aria-hidden="true" />
                                  {resumen?.feedbackNegativo ?? 0}
                                </span>
                              </span>
                            }
                          />
                          <FilaDato
                            icono={Flame}
                            etiqueta="Cumplimiento del mes"
                            valor={`${resumen?.cumplimiento ?? 0}% · mejor racha ${resumen?.rachaMax ?? 0}`}
                          />
                        </div>

                        <div className="mt-5 flex flex-wrap gap-2">
                          <button
                            onClick={() => setEditando(cliente)}
                            className="flex min-h-11 items-center gap-2 rounded-xl border border-chrome/40 px-4 py-2 text-sm font-semibold text-chrome transition-colors hover:bg-chrome/10"
                          >
                            <Pencil size={16} />
                            Editar
                          </button>
                          {telefono && (
                            <a
                              href={`tel:${telefono}`}
                              className="flex min-h-11 items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-semibold text-text-mid transition-colors hover:border-chrome/40 hover:text-text-hi"
                            >
                              <Phone size={16} />
                              Llamar
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}

              {filtrados.length === 0 && (
                <div className="flex flex-col items-center gap-3 py-16 text-text-muted">
                  <Users size={32} strokeWidth={1.5} aria-hidden="true" />
                  <p className="text-sm">No hay clientes que coincidan con la búsqueda</p>
                </div>
              )}
            </div>
          </>
        ) : (
          /* HORARIOS PEDIDOS: lo que cada cliente pidió al registrarse */
          <div className="flex flex-col gap-3">
            <p className="font-mono text-xs uppercase tracking-widest text-text-muted">
              Turno fijo · pedidos de los clientes
            </p>

            {conPedidos.length === 0 && (
              <div className="flex flex-col items-center gap-3 py-16 text-text-muted">
                <CalendarClock size={32} strokeWidth={1.5} aria-hidden="true" />
                <p className="text-sm">Ningún cliente pidió horarios todavía</p>
                <p className="text-xs text-text-muted">
                  Cuando un alumno se registra, deja sus horarios preferidos y aparecen acá
                </p>
              </div>
            )}

            {conPedidos.map((cliente) => (
              <article
                key={cliente.id}
                className="flex flex-col gap-3 rounded-2xl border border-border bg-ink-2 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-3">
                  <Avatar nombre={cliente.nombre} size="sm" />
                  <div className="min-w-0">
                    <span className="block truncate font-display text-lg tracking-wide text-text-hi">
                      {cliente.nombre}
                    </span>
                    <span className="block text-sm text-text-mid">
                      Quiere estos horarios: {etiquetaSlots(cliente.slots_preferidos)}
                    </span>
                    <span className="mt-1 block font-mono text-xs uppercase tracking-widest text-text-muted">
                      {etiquetaPlan(cliente.plan)} · {cliente.frecuencia_semana}× semana
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {cliente.telefono && (
                    <a
                      href={`tel:${cliente.telefono.replace(/\s+/g, "")}`}
                      className="flex min-h-11 items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm text-text-mid transition-colors hover:border-chrome/40 hover:text-text-hi"
                    >
                      <Phone size={15} />
                      Llamar
                    </a>
                  )}
                  <button
                    onClick={() => setEditando(cliente)}
                    aria-label={`Editar horarios de ${cliente.nombre}`}
                    className="flex min-h-11 items-center gap-2 rounded-xl border border-chrome/40 px-3 py-2 text-sm font-semibold text-chrome transition-colors hover:bg-chrome/10"
                  >
                    <Pencil size={15} />
                    Ajustar
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <Modal open={!!editando} onClose={() => setEditando(null)}>
        {editando && (
          <EditarCliente
            key={editando.id}
            perfil={editando}
            horas={slotsDisponibles}
            onClose={() => setEditando(null)}
          />
        )}
      </Modal>
    </div>
  );
}
