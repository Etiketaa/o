import { useState, useEffect } from "react";
import { Search, Eye, CheckCircle, XCircle, FileImage, FileText, Download, Loader2, Filter } from "lucide-react";
import { StatusChip, Avatar, Modal } from "@/components";
import { useTurnosStore } from "@/stores/turnosStore";
import { usePagosStore, getPrecioPlan } from "@/stores/pagosStore";
import { formatMoney, formatDate } from "@/lib/utils";
import type { Pago } from "@/types";

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

export function PagosView() {
  const { alumnos } = useTurnosStore();
  const { pagos, loadPagos, verificarPago, loading } = usePagosStore();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"todos" | "pagado" | "pendiente" | "verificando" | "vencido">("todos");
  const [selectedPago, setSelectedPago] = useState<Pago | null>(null);
  const [verificando, setVerificando] = useState(false);
  const [notasAdmin, setNotasAdmin] = useState("");

  useEffect(() => {
    loadPagos();
  }, []);

  const alumnosById = Object.fromEntries(alumnos.map((a) => [a.id, a]));

  const filtered = pagos
    .filter((p) => {
      if (filter !== "todos" && p.estado !== filter) return false;
      if (query) {
        const al = alumnosById[p.alumno_id];
        if (!al || !al.nombre.toLowerCase().includes(query.toLowerCase())) return false;
      }
      return true;
    })
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

  const totalPagado = filtered.filter((p) => p.estado === "pagado").reduce((s, p) => s + p.monto, 0);
  const totalPendiente = filtered.filter((p) => p.estado === "pendiente").reduce((s, p) => s + p.monto, 0);
  const totalVerificando = filtered.filter((p) => p.comprobante_url && p.estado !== "pagado").length;

  const handleVerificar = async (pago: Pago, verificado: boolean) => {
    setVerificando(true);
    await verificarPago(pago.id, verificado, notasAdmin);
    setVerificando(false);
    setSelectedPago(null);
    setNotasAdmin("");
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 pt-6 pb-4 border-b border-border">
        <div className="max-w-6xl mx-auto">
          <div className="mb-4">
            <span className="text-[11px] tracking-[0.2em] uppercase text-lime mb-2 block font-medium">
              Pagos
            </span>
            <h2 className="font-display text-text-hi text-2xl tracking-wide">
              Gestión de cobros
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-lime rounded-xl p-4 flex items-center justify-between">
              <span className="text-bg text-sm font-semibold">Cobrado</span>
              <span className="text-bg text-lg font-mono font-bold">{formatMoney(totalPagado)}</span>
            </div>
            <div className="bg-surface border border-border rounded-xl p-4 flex items-center justify-between">
              <span className="text-text-muted text-sm">Pendiente</span>
              <span className="text-yellow-500 text-lg font-mono">{formatMoney(totalPendiente)}</span>
            </div>
            <div className="bg-surface border border-border rounded-xl p-4 flex items-center justify-between">
              <span className="text-text-muted text-sm">Verificando</span>
              <span className="text-steel text-lg font-mono">{totalVerificando}</span>
            </div>
            <div className="bg-surface border border-border rounded-xl p-4 flex items-center justify-between">
              <span className="text-text-muted text-sm">Total filtrado</span>
              <span className="text-text-hi text-lg font-mono">{filtered.length} pagos</span>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex gap-2 overflow-x-auto">
              {(["todos", "pagado", "pendiente", "verificando", "vencido"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-full text-[11px] font-mono uppercase tracking-wider shrink-0 transition-all ${
                    filter === f
                      ? "bg-lime text-bg font-bold"
                      : "bg-transparent text-text-muted border border-border hover:border-text-muted"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2.5 px-4 py-2.5 bg-bg border border-border rounded-lg flex-1 max-w-sm">
              <Search size={15} className="text-text-muted" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar por alumno..."
                className="flex-1 outline-none text-sm bg-transparent text-text-hi placeholder:text-text-muted"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-6xl mx-auto">
          {/* Table header - desktop */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-3 text-[10px] font-mono text-text-muted uppercase tracking-wider border-b border-border mb-2">
            <div className="col-span-3">Alumno</div>
            <div className="col-span-2">Período</div>
            <div className="col-span-2">Descripción</div>
            <div className="col-span-1">Monto</div>
            <div className="col-span-1">Comprobante</div>
            <div className="col-span-1">Estado</div>
            <div className="col-span-2 text-right">Acciones</div>
          </div>

          {filtered.map((p) => {
            const al = alumnosById[p.alumno_id];
            return (
              <div
                key={p.id}
                className="flex items-center justify-between py-4 border-b border-border last:border-0 md:grid md:grid-cols-12 md:gap-4 md:items-center px-4 rounded-lg hover:bg-surface/50 transition-colors"
              >
                <div className="col-span-3 flex items-center gap-3">
                  {al && <Avatar nombre={al.nombre} size="sm" />}
                  <div className="flex flex-col">
                    <span className="text-text-hi font-semibold text-sm">
                      {al?.nombre || "Desconocido"}
                    </span>
                    <span className="text-[10px] font-mono text-text-muted md:hidden">
                      {p.descripcion}
                    </span>
                  </div>
                </div>
                <div className="col-span-2 text-text-muted text-sm hidden md:block">
                  {MESES[p.mes_pago - 1]} {p.anio_pago}
                </div>
                <div className="col-span-2 text-text-muted text-sm hidden md:block">
                  {p.descripcion}
                </div>
                <div className="col-span-1">
                  <span className="text-text-hi text-sm font-mono">
                    {formatMoney(p.monto)}
                  </span>
                </div>
                <div className="col-span-1 hidden md:block">
                  {p.comprobante_url ? (
                    <a
                      href={p.comprobante_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-lime hover:underline text-xs"
                    >
                      {p.comprobante_tipo === "pdf" ? (
                        <FileText size={14} />
                      ) : (
                        <FileImage size={14} />
                      )}
                      Ver
                    </a>
                  ) : (
                    <span className="text-text-muted text-xs">—</span>
                  )}
                </div>
                <div className="col-span-1">
                  <StatusChip estado={p.estado} size="sm" />
                  {p.verificado && (
                    <span className="text-[10px] text-lime block mt-1">✓ Verificado</span>
                  )}
                </div>
                <div className="col-span-2 flex justify-end gap-2">
                  <button
                    onClick={() => setSelectedPago(p)}
                    className="p-2 rounded-lg border border-border hover:border-lime/30 transition-all"
                    aria-label="Ver detalles"
                  >
                    <Eye size={14} className="text-text-muted" />
                  </button>
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <p className="text-text-muted text-sm text-center py-10">
              No se encontraron pagos
            </p>
          )}
        </div>
      </div>

      {/* Modal de detalles */}
      <Modal open={!!selectedPago} onClose={() => { setSelectedPago(null); setNotasAdmin(""); }}>
        {selectedPago && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-text-hi text-xl tracking-wide">
                Detalle de pago
              </h3>
              <StatusChip estado={selectedPago.estado} />
            </div>

            <div className="flex items-center gap-4">
              {alumnosById[selectedPago.alumno_id] && (
                <Avatar nombre={alumnosById[selectedPago.alumno_id].nombre} size="md" />
              )}
              <div>
                <p className="text-text-hi font-semibold">
                  {alumnosById[selectedPago.alumno_id]?.nombre || "Desconocido"}
                </p>
                <p className="text-text-muted text-xs">
                  {alumnosById[selectedPago.alumno_id]?.email}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-bg rounded-lg p-3">
                <span className="text-[10px] font-mono text-text-muted uppercase">Período</span>
                <p className="text-text-hi text-sm">{MESES[selectedPago.mes_pago - 1]} {selectedPago.anio_pago}</p>
              </div>
              <div className="bg-bg rounded-lg p-3">
                <span className="text-[10px] font-mono text-text-muted uppercase">Monto</span>
                <p className="text-text-hi text-sm font-mono">{formatMoney(selectedPago.monto)}</p>
              </div>
              <div className="bg-bg rounded-lg p-3">
                <span className="text-[10px] font-mono text-text-muted uppercase">Método</span>
                <p className="text-text-hi text-sm capitalize">{selectedPago.metodo}</p>
              </div>
              <div className="bg-bg rounded-lg p-3">
                <span className="text-[10px] font-mono text-text-muted uppercase">Fecha</span>
                <p className="text-text-hi text-sm">{formatDate(selectedPago.fecha)}</p>
              </div>
            </div>

            {/* Comprobante */}
            {selectedPago.comprobante_url && (
              <div className="bg-bg rounded-lg p-4">
                <span className="text-[10px] font-mono text-text-muted uppercase block mb-2">
                  Comprobante subido
                </span>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {selectedPago.comprobante_tipo === "pdf" ? (
                      <FileText size={16} className="text-lime" />
                    ) : (
                      <FileImage size={16} className="text-lime" />
                    )}
                    <span className="text-text-hi text-sm">
                      {selectedPago.comprobante_nombre || "Comprobante"}
                    </span>
                  </div>
                  <a
                    href={selectedPago.comprobante_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg hover:bg-surface transition-colors"
                    aria-label="Descargar comprobante"
                  >
                    <Download size={14} className="text-text-muted" />
                  </a>
                </div>
                {selectedPago.comprobante_tipo !== "pdf" && (
                  <img
                    src={selectedPago.comprobante_url}
                    alt="Comprobante de pago"
                    className="mt-3 rounded-lg max-h-64 object-contain w-full bg-white/5"
                  />
                )}
              </div>
            )}

            {/* Notas admin */}
            <div>
              <label className="text-[10px] font-mono text-text-muted uppercase block mb-2">
                Notas (opcional)
              </label>
              <textarea
                value={notasAdmin}
                onChange={(e) => setNotasAdmin(e.target.value)}
                placeholder="Agregar notas sobre este pago..."
                className="w-full bg-bg border border-border rounded-lg p-3 text-sm text-text-hi placeholder:text-text-muted resize-none h-20"
              />
            </div>

            {/* Acciones */}
            <div className="flex gap-3">
              {selectedPago.comprobante_url && selectedPago.estado !== "pagado" && (
                <>
                  <button
                    onClick={() => handleVerificar(selectedPago, true)}
                    disabled={verificando}
                    className="flex-1 py-3 rounded-xl text-center font-semibold text-sm bg-lime text-bg hover:shadow-[0_4px_20px_rgba(212,255,61,0.3)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {verificando ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <CheckCircle size={16} />
                    )}
                    Aprobar pago
                  </button>
                  <button
                    onClick={() => handleVerificar(selectedPago, false)}
                    disabled={verificando}
                    className="flex-1 py-3 rounded-xl text-center font-semibold text-sm border border-danger text-danger hover:bg-danger/5 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <XCircle size={16} />
                    Rechazar
                  </button>
                </>
              )}
              {selectedPago.estado === "pagado" && (
                <div className="flex-1 py-3 rounded-xl text-center text-sm text-lime bg-lime/10 border border-lime/20">
                  Pago verificado y aprobado
                </div>
              )}
              {!selectedPago.comprobante_url && selectedPago.estado !== "pagado" && (
                <div className="flex-1 py-3 rounded-xl text-center text-sm text-text-muted border border-border">
                  Esperando comprobante de pago
                </div>
              )}
            </div>

            {selectedPago.verificado && selectedPago.verificado_at && (
              <p className="text-text-muted text-xs text-center">
                Verificado el {formatDate(selectedPago.verificado_at)}
                {selectedPago.notas_admin && ` - ${selectedPago.notas_admin}`}
              </p>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
