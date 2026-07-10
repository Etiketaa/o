import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { COLORS, FONTS } from "@/lib/utils";
import { StatusChip, Modal, Avatar } from "@/components";
import { useTurnosStore } from "@/stores/turnosStore";
import type { Profile } from "@/types";

export function AlumnosView() {
  const { alumnos } = useTurnosStore();
  const [query, setQuery] = useState("");
  const [selectedAlumno, setSelectedAlumno] = useState<Profile | null>(null);

  const filtered = useMemo(
    () => alumnos.filter((a) => a.nombre.toLowerCase().includes(query.toLowerCase())),
    [alumnos, query]
  );

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-4 pb-3" style={{ borderBottom: `1px solid ${COLORS.border}` }}>
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-lg"
          style={{ backgroundColor: COLORS.surface, border: `1px solid ${COLORS.border}` }}
        >
          <Search size={16} color={COLORS.textMuted} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar alumno..."
            style={{ fontFamily: FONTS.body, color: COLORS.textHi, backgroundColor: "transparent" }}
            className="flex-1 outline-none text-sm placeholder-gray-500"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-2">
        {filtered.map((a) => (
          <button
            key={a.id}
            onClick={() => setSelectedAlumno(a)}
            className="w-full flex items-center justify-between py-3 transition-opacity hover:opacity-80"
            style={{ borderBottom: `1px solid ${COLORS.border}`, textAlign: "left" }}
          >
            <div className="flex items-center gap-3">
              <Avatar nombre={a.nombre} size="sm" />
              <div className="flex flex-col">
                <span style={{ fontFamily: FONTS.body, fontWeight: 600, color: COLORS.textHi }} className="text-sm">
                  {a.nombre}
                </span>
                <span style={{ fontFamily: FONTS.mono, color: COLORS.textMuted }} className="text-xs">
                  Plan {a.plan}
                </span>
              </div>
            </div>
            <StatusChip estado={a.estado} />
          </button>
        ))}
        {filtered.length === 0 && (
          <p style={{ fontFamily: FONTS.body, color: COLORS.textMuted }} className="text-sm text-center py-10">
            No se encontraron alumnos
          </p>
        )}
      </div>

      <Modal open={!!selectedAlumno} onClose={() => setSelectedAlumno(null)}>
        {selectedAlumno && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <Avatar nombre={selectedAlumno.nombre} size="lg" />
              <div>
                <h3 style={{ fontFamily: FONTS.display, color: COLORS.textHi, fontSize: 26, letterSpacing: 1 }}>
                  {selectedAlumno.nombre}
                </h3>
                <p style={{ fontFamily: FONTS.mono, color: COLORS.textMuted }} className="text-xs">{selectedAlumno.telefono}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <StatusChip estado={selectedAlumno.estado} />
              <span style={{ fontFamily: FONTS.body, color: COLORS.textMid }} className="text-sm">Plan {selectedAlumno.plan}</span>
            </div>
            <div className="rounded-lg p-4" style={{ backgroundColor: COLORS.surfaceHi, border: `1px solid ${COLORS.border}` }}>
              <p style={{ fontFamily: FONTS.body, color: COLORS.textMuted }} className="text-xs">
                Historial de asistencias y estado de pago disponibles próximamente.
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
