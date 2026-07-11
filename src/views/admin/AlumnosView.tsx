import { useState, useMemo } from "react";
import { Search } from "lucide-react";
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
      <div className="px-6 pt-6 pb-4 border-b border-border">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-[11px] tracking-[0.2em] uppercase text-lime mb-2 block font-medium">
                Alumnos
              </span>
              <h2 className="font-display text-text-hi text-2xl tracking-wide">
                {alumnos.length} alumnos
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-2.5 px-4 py-3 bg-bg border border-border rounded-lg max-w-md">
            <Search size={16} className="text-text-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar alumno..."
              className="flex-1 outline-none text-sm bg-transparent text-text-hi placeholder:text-text-muted"
            />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-6xl mx-auto">
          {/* Table header - desktop */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-3 text-[10px] font-mono text-text-muted uppercase tracking-wider border-b border-border mb-2">
            <div className="col-span-5">Nombre</div>
            <div className="col-span-3">Email</div>
            <div className="col-span-2">Plan</div>
            <div className="col-span-2 text-right">Estado</div>
          </div>

          {/* List */}
          {filtered.map((a) => (
            <button
              key={a.id}
              onClick={() => setSelectedAlumno(a)}
              className="w-full flex items-center justify-between py-4 border-b border-border last:border-0 hover:bg-surface/50 transition-colors text-left md:grid md:grid-cols-12 md:gap-4 md:items-center px-4 rounded-lg"
            >
              <div className="col-span-5 flex items-center gap-3">
                <Avatar nombre={a.nombre} size="sm" />
                <span className="text-text-hi font-semibold text-sm">{a.nombre}</span>
              </div>
              <div className="col-span-3 text-text-muted text-sm hidden md:block">
                {a.email}
              </div>
              <div className="col-span-2 text-[10px] font-mono text-text-muted uppercase tracking-wider hidden md:block">
                {a.plan}
              </div>
              <div className="col-span-2 flex justify-end">
                <StatusChip estado={a.estado} />
              </div>
            </button>
          ))}

          {filtered.length === 0 && (
            <p className="text-text-muted text-sm text-center py-10">
              No se encontraron alumnos
            </p>
          )}
        </div>
      </div>

      <Modal open={!!selectedAlumno} onClose={() => setSelectedAlumno(null)}>
        {selectedAlumno && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <Avatar nombre={selectedAlumno.nombre} size="lg" />
              <div>
                <h3 className="font-display text-text-hi text-2xl tracking-wide">
                  {selectedAlumno.nombre}
                </h3>
                <p className="text-xs font-mono text-text-muted">{selectedAlumno.telefono}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <StatusChip estado={selectedAlumno.estado} />
              <span className="text-text-mid text-sm">Plan {selectedAlumno.plan}</span>
            </div>
            <div className="bg-surface border border-border rounded-lg p-4">
              <p className="text-text-muted text-xs">
                Historial de asistencias y estado de pago disponibles próximamente.
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
