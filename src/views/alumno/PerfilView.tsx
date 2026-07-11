import { useState, useEffect, useRef } from "react";
import { CreditCard, Clock, Upload, CheckCircle, AlertCircle, Copy, FileImage, FileText, Loader2 } from "lucide-react";
import { formatMoney, formatDate } from "@/lib/utils";
import { Avatar, StatusChip } from "@/components";
import { NotificationPrompt } from "@/components/NotificationPrompt";
import { useAuthStore } from "@/stores/authStore";
import { usePagosStore, getPrecioPlan, getMesActual, getAnioActual } from "@/stores/pagosStore";
import type { EstadoPago } from "@/types";

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

export function PerfilView() {
  const { user } = useAuthStore();
  const { 
    pagos, config, loadPagos, loadConfig, 
    getEstadoPagoAlumno, subirComprobante, getDiasRestantes,
    getPagosByAlumno
  } = usePagosStore();
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [copied, setCopied] = useState<"cvu" | "alias" | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadPagos();
    loadConfig();
  }, []);

  if (!user) return null;

  const mesActual = getMesActual();
  const anioActual = getAnioActual();
  const estadoPago = getEstadoPagoAlumno(user.id, mesActual, anioActual);
  const diasRestantes = getDiasRestantes();
  const precioPlan = getPrecioPlan(user.plan);
  const userPagos = getPagosByAlumno(user.id);
  const pagoActual = pagos.find(
    (p) => p.alumno_id === user.id && p.mes_pago === mesActual && p.anio_pago === anioActual
  );

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !pagoActual) return;

    setUploading(true);
    setUploadSuccess(false);

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      alert("El archivo no puede superar 10MB");
      setUploading(false);
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      alert("Solo se permiten imágenes (JPG, PNG, WebP) o PDF");
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
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const getEstadoColor = (estado: EstadoPago) => {
    switch (estado) {
      case "pagado": return "text-lime";
      case "pendiente": return "text-yellow-500";
      case "verificando": return "text-steel";
      case "no_registrado": return "text-danger";
    }
  };

  const getEstadoLabel = (estado: EstadoPago) => {
    switch (estado) {
      case "pagado": return "Al día";
      case "pendiente": return "Pendiente de pago";
      case "verificando": return "Verificando comprobante";
      case "no_registrado": return "No registrado";
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <span className="text-[11px] tracking-[0.2em] uppercase text-lime mb-2 block font-medium">
            Perfil
          </span>
          <h2 className="font-display text-text-hi text-2xl tracking-wide">
            Tu información
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile card */}
          <div className="lg:col-span-1">
            <div className="bg-surface border border-border rounded-xl p-6">
              <div className="flex items-center gap-4 mb-6">
                <Avatar nombre={user.nombre} size="lg" />
                <div>
                  <h3 className="font-display text-text-hi text-xl tracking-wide">
                    {user.nombre}
                  </h3>
                  <StatusChip estado={user.estado} />
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-text-muted text-sm">Email</span>
                  <span className="text-text-hi text-sm font-mono">{user.email}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-text-muted text-sm">Teléfono</span>
                  <span className="text-text-hi text-sm font-mono">{user.telefono}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-text-muted text-sm">Plan</span>
                  <span className="text-text-hi text-sm font-mono">{user.plan}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payments section */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <NotificationPrompt />

            {/* Estado de pago actual */}
            <div className={`bg-surface border rounded-xl p-6 ${
              estadoPago === "pagado" ? "border-lime/30" : 
              estadoPago === "pendiente" ? "border-yellow-500/30" : "border-border"
            }`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Clock size={18} className={getEstadoColor(estadoPago)} />
                  <span className="font-body font-semibold text-text-hi text-sm">
                    Estado de pago - {MESES[mesActual - 1]} {anioActual}
                  </span>
                </div>
                <span className={`text-sm font-semibold ${getEstadoColor(estadoPago)}`}>
                  {getEstadoLabel(estadoPago)}
                </span>
              </div>

              {estadoPago !== "pagado" && (
                <>
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-text-muted text-lg">$</span>
                    <span className="font-display text-lime text-4xl leading-none">
                      {formatMoney(precioPlan).replace("$", "")}
                    </span>
                    <span className="text-text-muted text-sm">/mes</span>
                  </div>

                  {estadoPago === "pendiente" && diasRestantes > 0 && (
                    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-4">
                      <div className="flex items-center gap-2">
                        <AlertCircle size={16} className="text-yellow-500" />
                        <span className="text-yellow-500 text-sm font-medium">
                          Quedan {diasRestantes} {diasRestantes === 1 ? "día" : "días"} para pagar
                        </span>
                      </div>
                      <p className="text-yellow-500/70 text-xs mt-1">
                        Fecha límite: {config?.dia_limite || 10} de cada mes
                      </p>
                    </div>
                  )}

                  {estadoPago === "verificando" && (
                    <div className="bg-steel/10 border border-steel/20 rounded-lg p-4 mb-4">
                      <div className="flex items-center gap-2">
                        <Loader2 size={16} className="text-steel animate-spin" />
                        <span className="text-steel text-sm font-medium">
                          Comprobante en revisión
                        </span>
                      </div>
                      <p className="text-steel/70 text-xs mt-1">
                        Tu comprobante está siendo verificado por el administrador
                      </p>
                    </div>
                  )}

                  {/* Datos bancarios */}
                  <div className="bg-bg border border-border rounded-lg p-4 mb-4">
                    <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider block mb-3">
                      Datos para transferencia
                    </span>
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-text-muted text-xs">CVU</span>
                          <p className="text-text-hi text-sm font-mono">{config?.cvu || "0000032160000007890123"}</p>
                        </div>
                        <button
                          onClick={() => copyToClipboard(config?.cvu || "0000032160000007890123", "cvu")}
                          className="p-2 rounded-lg hover:bg-surface transition-colors"
                          aria-label="Copiar CVU"
                        >
                          {copied === "cvu" ? (
                            <CheckCircle size={14} className="text-lime" />
                          ) : (
                            <Copy size={14} className="text-text-muted" />
                          )}
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-text-muted text-xs">Alias</span>
                          <p className="text-text-hi text-sm font-mono">{config?.alias || "OZENTRENAMIENTO"}</p>
                        </div>
                        <button
                          onClick={() => copyToClipboard(config?.alias || "OZENTRENAMIENTO", "alias")}
                          className="p-2 rounded-lg hover:bg-surface transition-colors"
                          aria-label="Copiar alias"
                        >
                          {copied === "alias" ? (
                            <CheckCircle size={14} className="text-lime" />
                          ) : (
                            <Copy size={14} className="text-text-muted" />
                          )}
                        </button>
                      </div>
                      <div className="pt-2 border-t border-border">
                        <span className="text-text-muted text-xs">Titular: {config?.titular || "OZ Entrenamiento S.R.L."}</span>
                        <span className="text-text-muted text-xs block">{config?.banco || "Banco Nación"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Subir comprobante */}
                  {pagoActual && (
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
                        className="w-full py-3 rounded-xl text-center font-semibold text-sm border border-lime/30 text-lime hover:bg-lime/5 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {uploading ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            Subiendo...
                          </>
                        ) : pagoActual.comprobante_url ? (
                          <>
                            <FileImage size={16} />
                            Actualizar comprobante
                          </>
                        ) : (
                          <>
                            <Upload size={16} />
                            Subir comprobante de pago
                          </>
                        )}
                      </button>
                      {uploadSuccess && (
                        <p className="text-lime text-xs mt-2 text-center">
                          Comprobante subido correctamente
                        </p>
                      )}
                      {pagoActual.comprobante_nombre && (
                        <p className="text-text-muted text-xs mt-2 text-center">
                          Archivo actual: {pagoActual.comprobante_nombre}
                        </p>
                      )}
                    </div>
                  )}
                </>
              )}

              {estadoPago === "pagado" && (
                <div className="flex items-center gap-2 text-lime">
                  <CheckCircle size={16} />
                  <span className="text-sm">Tu pago está al día. ¡Gracias!</span>
                </div>
              )}
            </div>

            {/* Historial de pagos */}
            <div className="bg-surface border border-border rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard size={18} className="text-lime" />
                <span className="font-body font-semibold text-text-hi text-sm">
                  Historial de pagos
                </span>
              </div>
              {userPagos.length === 0 ? (
                <p className="text-text-muted text-sm">
                  Sin pagos registrados
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {userPagos.slice(0, 12).map((p) => (
                    <div key={p.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col">
                          <span className="text-text-hi text-sm">{p.descripcion}</span>
                          <span className="text-[10px] font-mono text-text-muted">{formatDate(p.fecha)}</span>
                        </div>
                        {p.comprobante_url && (
                          <a
                            href={p.comprobante_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg hover:bg-bg transition-colors"
                            aria-label="Ver comprobante"
                          >
                            {p.comprobante_tipo === "pdf" ? (
                              <FileText size={14} className="text-text-muted" />
                            ) : (
                              <FileImage size={14} className="text-text-muted" />
                            )}
                          </a>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-text-hi text-sm font-mono">{formatMoney(p.monto)}</span>
                        <StatusChip estado={p.estado} size="sm" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
