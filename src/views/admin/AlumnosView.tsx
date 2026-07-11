import { useState, useMemo, useEffect } from "react";
import { Search, Repeat, Users } from "lucide-react";
import { StatusChip, Modal, Avatar } from "@/components";
import { useTurnosStore } from "@/stores/turnosStore";
import type { Profile } from "@/types";

type Tab = "alumnos" | "fijos";

export function AlumnosView() {
  const { alumnos, turnosFijos, loadTurnosFijos } = useTurnosStore();
  const [query, setQuery] = useState("");
  const [selectedAlumno, setSelectedAlumno] = useState<Profile | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("alumnos");

  useEffect(() => {
    loadTurnosFijos();
  }, []);

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
                {activeTab === "alumnos" ? `${alumnos.length} alumnos` : `${turnosFijos.length} turnos fijos`}
              </h2>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-4">
            <button
              onClick={() => setActiveTab("alumnos")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                activeTab === "alumnos"
                  ? "bg-lime/10 text-lime border border-lime/20"
                  : "text-text-muted hover:text-text-hi border border-transparent"
              }`}
            >
              <Users size={14} />
              Alumnos
            </button>
            <button
              onClick={() => setActiveTab("fijos")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                activeTab === "fijos"
                  ? "bg-lime/10 text-lime border border-lime/20"
                  : "text-text-muted hover:text-text-hi border border-transparent"
              }`}
            >
              <Repeat size={14} />
              Turnos Fijos
            </button>
          </div>

          {activeTab === "alumnos" && (
            <div className="flex items-center gap-2.5 px-4 py-3 bg-bg border border-border rounded-lg max-w-md">
              <Search size={16} className="text-text-muted" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar alumno..."
                className="flex-1 outline-none text-sm bg-transparent text-text-hi placeholder:text-text-muted"
              />
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-6xl mx-auto">
          {activeTab === "alumnos" ? (
            <>
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
            </>
          ) : (
            <>
              {/* Turnos Fijos */}
              {turnosFijos.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3 text-text-muted">
                  <Repeat size={32} strokeWidth={1.5} />
                  <p className="text-sm">No hay turnos fijos configurados</p>
                  <p className="text-xs text-text-muted">Los alumnos pueden marcar reservas como "fijos" desde la app</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {turnosFijos.map((tf) => (
                    <div
                      key={tf.turno.id}
                      className="bg-surface border border-border rounded-xl p-5 hover:border-lime/20 transition-all"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <span className="text-[10px] font-mono text-lime uppercase tracking-wider">
                            {tf.turno.dia}
                          </span>
                          <span className="font-display text-text-hi text-2xl tracking-wide block">
                            {tf.turno.hora}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Repeat size={14} className="text-lime" />
                          <span className="text-xs text-text-muted">Fijo</span>
                        </div>
                      </div>
                      <div className="mb-4">
                        <span className="font-body font-bold text-text-hi text-sm">
                          {tf.turno.actividad}
                        </span>
                        <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider block mt-1">
                          Coach {tf.turno.coach}
                        </span>
                      </div>
                      <div className="pt-4 border-t border-border">
                        <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider block mb-3">
                          Alumnos fijos ({tf.alumnos.length})
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {tf.alumnos.map((a) => (
                            <div
                              key={a.id}
                              className="flex items-center gap-2 px-3 py-1.5 bg-bg rounded-lg border border-border"
                            >
                              <Avatar nombre={a.nombre} size="sm" />
                              <span className="text-xs text-text-hi">{a.nombre}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
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
