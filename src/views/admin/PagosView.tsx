import { useState } from "react";
import { DollarSign, Search, Filter } from "lucide-react";
import { COLORS, FONTS, formatMoney, formatDate } from "@/lib/utils";
import { StatusChip, Avatar } from "@/components";
import { useTurnosStore } from "@/stores/turnosStore";
import { mockPagos } from "@/lib/mock-data";
import type { Pago } from "@/types";

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
      <div className="px-4 pt-4 pb-3 flex flex-col gap-3" style={{ borderBottom: `1px solid ${COLORS.border}` }}>
        <div className="flex items-center gap-3">
          <div className="flex-1 rounded-lg p-3 flex items-center justify-between" style={{ backgroundColor: COLORS.lime, opacity: 0.9 }}>
            <span style={{ fontFamily: FONTS.body, color: COLORS.bg, fontWeight: 600 }} className="text-sm">Cobrado</span>
            <span style={{ fontFamily: FONTS.mono, color: COLORS.bg, fontWeight: 700 }} className="text-sm">{formatMoney(totalPagado)}</span>
          </div>
          <div className="flex-1 rounded-lg p-3 flex items-center justify-between" style={{ backgroundColor: COLORS.surface, border: `1px solid ${COLORS.border}` }}>
            <span style={{ fontFamily: FONTS.body, color: COLORS.textMuted }} className="text-sm">Pendiente</span>
            <span style={{ fontFamily: FONTS.mono, color: COLORS.steel }} className="text-sm">{formatMoney(totalPendiente)}</span>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto">
          {(["todos", "pagado", "pendiente", "vencido"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-3 py-1 rounded-full text-xs shrink-0 capitalize"
              style={{
                fontFamily: FONTS.mono,
                backgroundColor: filter === f ? COLORS.lime : "transparent",
                color: filter === f ? COLORS.bg : COLORS.textMuted,
                border: `1px solid ${filter === f ? COLORS.lime : COLORS.border}`,
                fontWeight: filter === f ? 700 : 500,
              }}
            >
              {f}
            </button>
          ))}
        </div>

        <div
          className="flex items-center gap-2 px-3 py-2 rounded-lg"
          style={{ backgroundColor: COLORS.surface, border: `1px solid ${COLORS.border}` }}
        >
          <Search size={16} color={COLORS.textMuted} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por alumno..."
            style={{ fontFamily: FONTS.body, color: COLORS.textHi, backgroundColor: "transparent" }}
            className="flex-1 outline-none text-sm placeholder-gray-500"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-2">
        {filtered.map((p) => {
          const al = alumnosById[p.alumno_id];
          return (
            <div
              key={p.id}
              className="flex items-center justify-between py-3"
              style={{ borderBottom: `1px solid ${COLORS.border}` }}
            >
              <div className="flex items-center gap-3">
                {al && <Avatar nombre={al.nombre} size="sm" />}
                <div className="flex flex-col">
                  <span style={{ fontFamily: FONTS.body, fontWeight: 600, color: COLORS.textHi }} className="text-sm">
                    {al?.nombre || "Desconocido"}
                  </span>
                  <span style={{ fontFamily: FONTS.mono, color: COLORS.textMuted }} className="text-[10px]">
                    {p.descripcion} · {formatDate(p.fecha)}
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span style={{ fontFamily: FONTS.mono, color: COLORS.textHi }} className="text-sm">
                  {formatMoney(p.monto)}
                </span>
                <StatusChip estado={p.estado} size="sm" />
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <p style={{ fontFamily: FONTS.body, color: COLORS.textMuted }} className="text-sm text-center py-10">
            No se encontraron pagos
          </p>
        )}
      </div>
    </div>
  );
}
