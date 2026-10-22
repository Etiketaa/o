import { useEffect, useMemo, useRef, useState } from "react";
import type { Franja } from "@/types";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Copy,
  CreditCard,
  FileImage,
  FileText,
  Loader2,
  Save,
  Upload,
  User,
} from "lucide-react";
import { Avatar, StatusChip } from "@/components";
import { NotificationPrompt } from "@/components/NotificationPrompt";
import { useAuthStore } from "@/stores/authStore";
import { useGymStore } from "@/stores/gymStore";
import { getAnioActual, getMesActual, getPrecioPlan, usePagosStore } from "@/stores/pagosStore";
import { etiquetaFranja, NOMBRES_DIA_CORTO } from "@/lib/horarios";
import { VECES_MES_POR_FRECUENCIA } from "@/lib/semilla";

const MESES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

const FRANJAS: Array<{ clave: Franja; etiqueta: string }> = [
  { clave: "manana", etiqueta: "Mañana" },
  { clave: "tarde", etiqueta: "Tarde" },
  { clave: "ambas", etiqueta: "Ambas" },
];

const ESTADOS_PAGO = {
  pagado: { etiqueta: "Al día", clase: "text-chrome" },
  pendiente: { etiqueta: "Pendiente de pago", clase: "text-warn" },
  verificando: { etiqueta: "Verificando comprobante", clase: "text-steel" },
  no_registrado: { etiqueta: "No registrado", clase: "text-danger" },
} as const;

function formatoMoneda(monto: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
  }).format(monto);
}

export function PerfilView() {
  const { user } = useAuthStore();
  const { guardarPerfil } = useGymStore();
  const {
    pagos,
    config,
    loadPagos,
    loadConfig,
    getEstadoPagoAlumno,
    subirComprobante,
    getDiasRestantes,
    getPagosByAlumno,
  } = usePagosStore();

  const [telefono, setTelefono] = useState("");
  const [frecuencia, setFrecuencia] = useState(2);
  const [franja, setFranja] = useState<Franja>("ambas");
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);

  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [copied, setCopied] = useState<"cvu" | "alias" | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cargamos los datos del cliente en el formulario.
  useEffect(() => {
    if (!user) return;
    setTelefono(user.telefono ?? "");
    setFrecuencia(user.frecuencia_semana ?? 2);
    setFranja(user.franja ?? "ambas");
  }, [user?.id, user?.telefono, user?.frecuencia_semana, user?.franja]);

  useEffect(() => {
    void loadPagos();
    void loadConfig();
  }, [loadPagos, loadConfig]);

  const userPagos = useMemo(
    () => (user ? getPagosByAlumno(user.id) : []),
    [getPagosByAlumno, user, pagos],
  );

  if (!user) return null;

  const mesActual = getMesActual();
  const anioActual = getAnioActual();
  const estadoPago = getEstadoPagoAlumno(user.id, mesActual, anioActual);
  const diasRestantes = getDiasRestantes();
  const precioPlan = getPrecioPlan(user.plan);
  const pagoActual = pagos.find(
    (p) => p.alumno_id === user.id && p.mes_pago === mesActual && p.anio_pago === anioActual,
  );
  const infoEstado = ESTADOS_PAGO[estadoPago];

  const handleGuardarPerfil = async () => {
    setGuardando(true);
    const perfilActualizado = {
      ...user,
      telefono: telefono.trim(),
      frecuencia_semana: frecuencia,
      veces_mes_objetivo: VECES_MES_POR_FRECUENCIA[frecuencia] ?? user.veces_mes_objetivo,
      franja,
    };
    try {
      await guardarPerfil(perfilActualizado);
      // El perfil vive también en el store de auth: lo refrescamos ahí.
      useAuthStore.setState({ user: perfilActualizado });
      setGuardado(true);
      setTimeout(() => setGuardado(false), 2500);
    } finally {
      setGuardando(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !pagoActual) return;

    setUploading(true);
    setUploadSuccess(false);

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setUploading(false);
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      setUploading(false);
      return;
    }

    const result = await subirComprobante(pagoActual.id, file);
    if (result) {
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const copyToClipboard = (text: string, type: "cvu" | "alias") => {
    void navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="h-full overflow-y-auto px-4 pb-[calc(5rem+env(safe-area-inset-bottom,0px))] pt-5">
      <div className="mx-auto max-w-4xl">
        <span className="block text-[11px] font-medium uppercase tracking-[0.2em] text-chrome">
          Perfil
        </span>
        <h1 className="chrome-text font-display text-2xl tracking-wide">Tu información</h1>

        {/* Identidad */}
        <div className="mt-4 rounded-xl border border-border bg-ink-2 px-4 py-4">
          <div className="flex items-center gap-4">
            <Avatar nombre={user.nombre} size="lg" />
            <div className="min-w-0">
              <h2 className="truncate font-display text-xl tracking-wide text-text-hi">
                {user.nombre}
              </h2>
              <StatusChip estado={user.estado} />
            </div>
          </div>

          <div className="mt-4 flex flex-col">
            <div className="flex items-center justify-between gap-3 border-b border-border py-2.5">
              <span className="shrink-0 text-sm text-text-muted">Email</span>
              <span className="truncate text-right font-mono text-sm text-text-hi">
                {user.email}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3 border-b border-border py-2.5">
              <span className="shrink-0 text-sm text-text-muted">Plan</span>
              <span className="truncate text-right font-mono text-sm text-text-hi">{user.plan}</span>
            </div>
            <div className="flex items-center justify-between gap-3 border-b border-border py-2.5">
              <span className="shrink-0 text-sm text-text-muted">Objetivo mensual</span>
              <span className="truncate text-right font-mono text-sm text-text-hi">
                {user.veces_mes_objetivo} turnos
              </span>
            </div>
            <div className="flex items-center justify-between gap-3 py-2.5">
              <span className="shrink-0 text-sm text-text-muted">Franja</span>
              <span className="truncate text-right font-mono text-sm text-text-hi">
                {etiquetaFranja(user.franja)}
              </span>
            </div>
          </div>
        </div>

        {/* Editable */}
        <div className="mt-4 rounded-xl border border-border bg-ink-2 px-4 py-4">
          <h2 className="font-display text-lg uppercase tracking-[0.2em] text-chrome-dim">
            Editar datos
          </h2>

          {/* Teléfono */}
          <label className="mt-4 block">
            <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.2em] text-text-muted">
              Teléfono
            </span>
            <input
              type="tel"
              inputMode="tel"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              placeholder="Ej: 2954 11 2233"
              className="min-h-11 w-full rounded-lg border border-border bg-ink px-3 font-mono text-sm text-text-hi outline-none placeholder:text-text-muted focus:border-chrome"
            />
          </label>

          {/* Frecuencia semanal */}
          <div className="mt-4">
            <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.2em] text-text-muted">
              Frecuencia semanal
            </span>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  onClick={() => setFrecuencia(n)}
                  aria-pressed={frecuencia === n}
                  className={`min-h-11 flex-1 rounded-lg border font-display text-lg tracking-wide transition-colors ${
                    frecuencia === n
                      ? "border-chrome bg-chrome/10 text-chrome"
                      : "border-border bg-ink text-text-mid hover:border-border-hi"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
            <p className="mt-1.5 text-xs text-text-muted">
              {frecuencia} {frecuencia === 1 ? "vez" : "veces"} por semana ·{" "}
              {VECES_MES_POR_FRECUENCIA[frecuencia] ?? frecuencia * 4} turnos al mes
            </p>
          </div>

          {/* Franja */}
          <div className="mt-4">
            <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.2em] text-text-muted">
              Franja preferida
            </span>
            <div className="flex gap-2">
              {FRANJAS.map((f) => (
                <button
                  key={f.clave}
                  onClick={() => setFranja(f.clave)}
                  aria-pressed={franja === f.clave}
                  className={`min-h-11 flex-1 rounded-lg border text-sm font-semibold transition-colors ${
                    franja === f.clave
                      ? "border-chrome bg-chrome/10 text-chrome"
                      : "border-border bg-ink text-text-mid hover:border-border-hi"
                  }`}
                >
                  {f.etiqueta}
                </button>
              ))}
            </div>
          </div>

          {/* Horarios preferidos */}
          <div className="mt-4">
            <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.2em] text-text-muted">
              Horarios preferidos
            </span>
            {user.slots_preferidos.length === 0 ? (
              <p className="text-xs text-text-muted">
                No definiste horarios preferidos. El profesor los carga a mano.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {user.slots_preferidos.map((slot) => (
                  <span
                    key={`${slot.dia}-${slot.hora}`}
                    className="rounded-lg border border-border bg-ink px-2.5 py-1.5 font-mono text-[11px] uppercase tracking-wider text-text-mid"
                  >
                    {NOMBRES_DIA_CORTO[slot.dia]} {slot.hora}
                  </span>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={handleGuardarPerfil}
            disabled={guardando}
            className="mt-5 flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-chrome text-sm font-bold text-ink transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            {guardando ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Guardando...
              </>
            ) : guardado ? (
              <>
                <CheckCircle size={16} /> Guardado
              </>
            ) : (
              <>
                <Save size={16} /> Guardar cambios
              </>
            )}
          </button>
        </div>

        {/* Pagos */}
        <div className="mt-4 rounded-xl border border-border bg-ink-2 px-4 py-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Clock size={16} className={infoEstado.clase} />
              <span className="font-body text-sm font-semibold text-text-hi">
                Pago de {MESES[mesActual - 1]} {anioActual}
              </span>
            </div>
            <span className={`font-mono text-[11px] uppercase tracking-wider ${infoEstado.clase}`}>
              {infoEstado.etiqueta}
            </span>
          </div>

          {estadoPago !== "pagado" && (
            <>
              <div className="mb-4 flex items-baseline gap-2">
                <span className="font-display text-4xl leading-none text-chrome">
                  {formatoMoneda(precioPlan).replace("$", "")}
                </span>
                <span className="text-sm text-text-muted">/mes</span>
              </div>

              {estadoPago === "pendiente" && diasRestantes > 0 && (
                <div className="mb-4 rounded-lg border border-warn/30 bg-warn/10 px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <AlertCircle size={14} className="text-warn" />
                    <span className="text-xs font-medium text-warn">
                      Quedan {diasRestantes} {diasRestantes === 1 ? "día" : "días"} para pagar
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-warn/70">
                    Fecha límite: {config?.dia_limite || 10} de cada mes
                  </p>
                </div>
              )}

              {estadoPago === "verificando" && (
                <div className="mb-4 rounded-lg border border-steel/30 bg-steel/10 px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <Loader2 size={14} className="animate-spin text-steel" />
                    <span className="text-xs font-medium text-steel">Comprobante en revisión</span>
                  </div>
                  <p className="mt-1 text-[11px] text-steel/70">
                    Tu comprobante está siendo verificado por el administrador
                  </p>
                </div>
              )}

              {/* Datos bancarios */}
              <div className="mb-4 rounded-lg border border-border bg-ink px-3 py-3">
                <span className="mb-3 block font-mono text-[10px] uppercase tracking-wider text-text-muted">
                  Datos para transferencia
                </span>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <span className="text-xs text-text-muted">CVU</span>
                      <p className="truncate font-mono text-sm text-text-hi">
                        {config?.cvu || "0000032160000007890123"}
                      </p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(config?.cvu || "0000032160000007890123", "cvu")}
                      aria-label="Copiar CVU"
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-ink-3 hover:text-text-hi"
                    >
                      {copied === "cvu" ? (
                        <CheckCircle size={16} className="text-chrome" />
                      ) : (
                        <Copy size={16} />
                      )}
                    </button>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <span className="text-xs text-text-muted">Alias</span>
                      <p className="truncate font-mono text-sm text-text-hi">
                        {config?.alias || "OZENTRENAMIENTO"}
                      </p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(config?.alias || "OZENTRENAMIENTO", "alias")}
                      aria-label="Copiar alias"
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-ink-3 hover:text-text-hi"
                    >
                      {copied === "alias" ? (
                        <CheckCircle size={16} className="text-chrome" />
                      ) : (
                        <Copy size={16} />
                      )}
                    </button>
                  </div>
                  <div className="border-t border-border pt-2">
                    <span className="text-xs text-text-muted">
                      Titular: {config?.titular || "OZ Entrenamiento S.R.L."}
                    </span>
                    <span className="block text-xs text-text-muted">
                      {config?.banco || "Banco Nación"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Subir comprobante */}
              {pagoActual ? (
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,application/pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                    aria-label="Subir comprobante de pago"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-chrome/40 py-3 text-sm font-semibold text-chrome transition-colors hover:bg-chrome/10 disabled:opacity-50"
                  >
                    {uploading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" /> Subiendo...
                      </>
                    ) : pagoActual.comprobante_url ? (
                      <>
                        <FileImage size={16} /> Actualizar comprobante
                      </>
                    ) : (
                      <>
                        <Upload size={16} /> Subir comprobante de pago
                      </>
                    )}
                  </button>
                  {uploadSuccess && (
                    <p className="mt-2 text-center text-xs text-chrome">
                      Comprobante subido correctamente
                    </p>
                  )}
                  {pagoActual.comprobante_nombre && (
                    <p className="mt-2 text-center text-xs text-text-muted">
                      Archivo actual: {pagoActual.comprobante_nombre}
                    </p>
                  )}
                </div>
              ) : (
                <p className="rounded-lg border border-border bg-ink px-3 py-2.5 text-xs text-text-muted">
                  Todavía no hay un pago registrado para este mes. Hacé la transferencia y
                  avisale al profesor para que lo registre.
                </p>
              )}
            </>
          )}

          {estadoPago === "pagado" && (
            <div className="flex items-center gap-2 text-chrome">
              <CheckCircle size={16} />
              <span className="text-sm">Tu pago está al día. ¡Gracias!</span>
            </div>
          )}

          <div className="mt-4 border-t border-border pt-3">
            <NotificationPrompt />
          </div>
        </div>

        {/* Historial de pagos */}
        <div className="mt-4 rounded-xl border border-border bg-ink-2 px-4 py-4">
          <div className="mb-3 flex items-center gap-2">
            <CreditCard size={16} className="text-chrome" />
            <span className="font-body text-sm font-semibold text-text-hi">
              Historial de pagos
            </span>
          </div>
          {userPagos.length === 0 ? (
            <p className="text-sm text-text-muted">Sin pagos registrados</p>
          ) : (
            <div className="flex flex-col">
              {userPagos.slice(0, 12).map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between gap-3 border-b border-border py-3 last:border-0"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate text-sm text-text-hi">{p.descripcion}</span>
                      <span className="font-mono text-[10px] text-text-muted">
                        {MESES[p.mes_pago - 1]} {p.anio_pago}
                      </span>
                    </div>
                    {p.comprobante_url && (
                      <a
                        href={p.comprobante_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Ver comprobante"
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors hover:bg-ink-3"
                      >
                        {p.comprobante_tipo === "pdf" ? (
                          <FileText size={14} className="text-text-muted" />
                        ) : (
                          <FileImage size={14} className="text-text-muted" />
                        )}
                      </a>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="font-mono text-sm text-text-hi">{formatoMoneda(p.monto)}</span>
                    <StatusChip estado={p.estado} size="sm" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <p className="mt-4 flex items-center justify-center gap-2 pb-2 text-center text-xs text-text-muted">
          <User size={12} /> Tu plan lo define el profesor. Si necesitás cambiarlo, escribile.
        </p>
      </div>
    </div>
  );
}
