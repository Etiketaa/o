import { useState } from "react";
import { Search } from "lucide-react";
import { StatusChip, Avatar } from "@/components";
import { useTurnosStore } from "@/stores/turnosStore";
import { mockPagos } from "@/lib/mock-data";
import { formatMoney, formatDate } from "@/lib/utils";

export function PagosView() {
  const { alumnos } = useTurnosStore();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"todos" | "pagado" | "pendiente" | "vencido">("todos");

  const alumnosById = Object.fromEntries(alumnos.map((a) => [a.id, a]));

  const filtered = mockPagos
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-lime rounded-xl p-4 flex items-center justify-between">
              <span className="text-bg text-sm font-semibold">Cobrado</span>
              <span className="text-bg text-lg font-mono font-bold">{formatMoney(totalPagado)}</span>
            </div>
            <div className="bg-surface border border-border rounded-xl p-4 flex items-center justify-between">
              <span className="text-text-muted text-sm">Pendiente</span>
              <span className="text-steel text-lg font-mono">{formatMoney(totalPendiente)}</span>
            </div>
            <div className="bg-surface border border-border rounded-xl p-4 flex items-center justify-between">
              <span className="text-text-muted text-sm">Total filtrado</span>
              <span className="text-text-hi text-lg font-mono">{filtered.length} pagos</span>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex gap-2 overflow-x-auto">
              {(["todos", "pagado", "pendiente", "vencido"] as const).map((f) => (
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
            <div className="col-span-4">Alumno</div>
            <div className="col-span-3">Descripción</div>
            <div className="col-span-2">Fecha</div>
            <div className="col-span-2 text-right">Monto</div>
            <div className="col-span-1 text-right">Estado</div>
          </div>

          {filtered.map((p) => {
            const al = alumnosById[p.alumno_id];
            return (
              <div
                key={p.id}
                className="flex items-center justify-between py-4 border-b border-border last:border-0 md:grid md:grid-cols-12 md:gap-4 md:items-center px-4 rounded-lg hover:bg-surface/50 transition-colors"
              >
                <div className="col-span-4 flex items-center gap-3">
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
                <div className="col-span-3 text-text-muted text-sm hidden md:block">
                  {p.descripcion}
                </div>
                <div className="col-span-2 text-text-muted text-sm hidden md:block">
                  {formatDate(p.fecha)}
                </div>
                <div className="col-span-2 text-right">
                  <span className="text-text-hi text-sm font-mono">
                    {formatMoney(p.monto)}
                  </span>
                </div>
                <div className="col-span-1 flex justify-end">
                  <StatusChip estado={p.estado} size="sm" />
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
    </div>
  );
}
