import React, { useState, useMemo } from "react";
import {
  Calendar,
  Users,
  ClipboardCheck,
  Plus,
  Search,
  X,
  Check,
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  Clock,
  UserPlus,
} from "lucide-react";

// ---------- Design tokens ----------
const FONTS = {
  display: "'Bebas Neue', 'Arial Narrow', sans-serif",
  body: "'IBM Plex Sans', sans-serif",
  mono: "'IBM Plex Mono', monospace",
};

const COLORS = {
  bg: "#101215",
  surface: "#1A1D22",
  surfaceHi: "#20242B",
  border: "#2A2E35",
  lime: "#D4FF3D",
  limeDim: "#8FA83A",
  steel: "#5B7C99",
  textHi: "#F2F3F0",
  textMid: "#B8BCC4",
  textMuted: "#7C8189",
  danger: "#FF5C5C",
};

// ---------- Mock data ----------
const DIAS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

const initialTurnos = {
  Lun: [
    { id: "t1", hora: "07:00", actividad: "Funcional", coach: "Nacho", cupo: 12, inscritos: ["a1", "a2", "a3", "a4", "a5", "a6", "a7", "a8", "a9", "a10"] },
    { id: "t2", hora: "09:00", actividad: "Pesas Libres", coach: "Vale", cupo: 8, inscritos: ["a2", "a5"] },
    { id: "t3", hora: "18:30", actividad: "CrossTraining", coach: "Nacho", cupo: 14, inscritos: ["a1","a3","a4","a6","a7","a8","a9","a10","a11","a12","a13","a14"] },
    { id: "t4", hora: "20:00", actividad: "Movilidad", coach: "Vale", cupo: 10, inscritos: ["a2","a3"] },
  ],
  Mar: [
    { id: "t5", hora: "08:00", actividad: "Funcional", coach: "Nacho", cupo: 12, inscritos: ["a1","a2","a3","a4","a5","a6"] },
    { id: "t6", hora: "19:00", actividad: "Pesas Libres", coach: "Vale", cupo: 8, inscritos: ["a5","a6","a7","a8","a9","a10","a11","a12"] },
  ],
  Mié: [
    { id: "t7", hora: "07:00", actividad: "Funcional", coach: "Nacho", cupo: 12, inscritos: ["a1","a2"] },
    { id: "t8", hora: "18:30", actividad: "CrossTraining", coach: "Nacho", cupo: 14, inscritos: ["a3","a4","a5","a6","a7","a8"] },
  ],
  Jue: [
    { id: "t9", hora: "09:00", actividad: "Movilidad", coach: "Vale", cupo: 10, inscritos: ["a1","a2","a3","a4","a5","a6","a7","a8","a9","a10"] },
  ],
  Vie: [
    { id: "t10", hora: "07:00", actividad: "Funcional", coach: "Nacho", cupo: 12, inscritos: ["a1","a2","a3"] },
    { id: "t11", hora: "18:30", actividad: "CrossTraining", coach: "Nacho", cupo: 14, inscritos: [] },
  ],
  Sáb: [
    { id: "t12", hora: "10:00", actividad: "Funcional", coach: "Vale", cupo: 12, inscritos: ["a1","a4","a9"] },
  ],
  Dom: [],
};

const initialAlumnos = [
  { id: "a1", nombre: "Martina Suárez", plan: "Full", estado: "activo", telefono: "291 400-1122" },
  { id: "a2", nombre: "Bruno Ferreyra", plan: "3x semana", estado: "activo", telefono: "291 400-1133" },
  { id: "a3", nombre: "Camila Ortiz", plan: "Full", estado: "activo", telefono: "291 400-1144" },
  { id: "a4", nombre: "Tomás Ledesma", plan: "2x semana", estado: "activo", telefono: "291 400-1155" },
  { id: "a5", nombre: "Julieta Paz", plan: "Full", estado: "vencido", telefono: "291 400-1166" },
  { id: "a6", nombre: "Ramiro Godoy", plan: "3x semana", estado: "activo", telefono: "291 400-1177" },
  { id: "a7", nombre: "Sofía Aguirre", plan: "Full", estado: "activo", telefono: "291 400-1188" },
  { id: "a8", nombre: "Lucas Benítez", plan: "2x semana", estado: "activo", telefono: "291 400-1199" },
  { id: "a9", nombre: "Agustina Roldán", plan: "Full", estado: "vencido", telefono: "291 400-1200" },
  { id: "a10", nombre: "Ezequiel Ríos", plan: "3x semana", estado: "activo", telefono: "291 400-1211" },
  { id: "a11", nombre: "Valentina Cano", plan: "Full", estado: "activo", telefono: "291 400-1222" },
  { id: "a12", nombre: "Franco Molina", plan: "2x semana", estado: "activo", telefono: "291 400-1233" },
  { id: "a13", nombre: "Delfina Acosta", plan: "Full", estado: "activo", telefono: "291 400-1244" },
  { id: "a14", nombre: "Ian Domínguez", plan: "3x semana", estado: "activo", telefono: "291 400-1255" },
];

// ---------- Small building blocks ----------

function PlateMeter({ ocupados, total }) {
  // signature element: occupancy shown as a loaded bar, like weight plates
  const segments = Array.from({ length: total }, (_, i) => i < ocupados);
  const full = ocupados >= total;
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-[2px]">
        {segments.map((filled, i) => (
          <div
            key={i}
            style={{
              width: 5,
              height: 16,
              backgroundColor: filled ? (full ? COLORS.lime : COLORS.steel) : "transparent",
              border: `1px solid ${filled ? "transparent" : COLORS.border}`,
              borderRadius: 1,
            }}
          />
        ))}
      </div>
      <span
        style={{ fontFamily: FONTS.mono, color: full ? COLORS.lime : COLORS.textMid }}
        className="text-xs"
      >
        {ocupados}/{total}
      </span>
    </div>
  );
}

function Pill({ active, children, onClick }) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1.5 rounded-full text-sm transition-colors shrink-0"
      style={{
        fontFamily: FONTS.body,
        backgroundColor: active ? COLORS.lime : "transparent",
        color: active ? "#101215" : COLORS.textMid,
        border: `1px solid ${active ? COLORS.lime : COLORS.border}`,
        fontWeight: active ? 700 : 500,
      }}
    >
      {children}
    </button>
  );
}

function StatusChip({ estado }) {
  const ok = estado === "activo";
  return (
    <span
      className="text-xs px-2 py-0.5 rounded-full"
      style={{
        fontFamily: FONTS.mono,
        color: ok ? COLORS.lime : COLORS.danger,
        border: `1px solid ${ok ? COLORS.limeDim : COLORS.danger}`,
        backgroundColor: "transparent",
      }}
    >
      {ok ? "ACTIVO" : "VENCIDO"}
    </span>
  );
}

// ---------- Main views ----------

function AgendaView({ turnos, dia, setDia, onOpenTurno }) {
  const list = turnos[dia] || [];
  return (
    <div className="flex flex-col h-full">
      <div className="flex gap-2 overflow-x-auto px-4 pt-4 pb-3" style={{ borderBottom: `1px solid ${COLORS.border}` }}>
        {DIAS.map((d) => (
          <Pill key={d} active={d === dia} onClick={() => setDia(d)}>
            {d}
          </Pill>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
        {list.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-2" style={{ color: COLORS.textMuted }}>
            <Calendar size={28} strokeWidth={1.5} />
            <p style={{ fontFamily: FONTS.body }} className="text-sm">Sin turnos cargados este día</p>
          </div>
        )}
        {list
          .slice()
          .sort((a, b) => a.hora.localeCompare(b.hora))
          .map((t) => (
            <button
              key={t.id}
              onClick={() => onOpenTurno(t)}
              className="text-left rounded-lg p-4 flex items-center justify-between"
              style={{ backgroundColor: COLORS.surface, border: `1px solid ${COLORS.border}` }}
            >
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-center justify-center" style={{ width: 52 }}>
                  <span style={{ fontFamily: FONTS.display, fontSize: 22, color: COLORS.textHi, letterSpacing: 1 }}>
                    {t.hora}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span style={{ fontFamily: FONTS.body, fontWeight: 700, color: COLORS.textHi }}>{t.actividad}</span>
                  <span style={{ fontFamily: FONTS.body, color: COLORS.textMuted }} className="text-xs">
                    Coach {t.coach}
                  </span>
                </div>
              </div>
              <PlateMeter ocupados={t.inscritos.length} total={t.cupo} />
            </button>
          ))}
      </div>
    </div>
  );
}

function TurnoDetail({ turno, alumnosById, onClose }) {
  if (!turno) return null;
  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center" style={{ backgroundColor: "rgba(0,0,0,0.6)" }}>
      <div
        className="w-full max-w-md rounded-t-2xl p-5 flex flex-col gap-4"
        style={{ backgroundColor: COLORS.surface, border: `1px solid ${COLORS.border}`, maxHeight: "80vh" }}
      >
        <div className="flex items-start justify-between">
          <div>
            <p style={{ fontFamily: FONTS.mono, color: COLORS.limeDim }} className="text-xs">{turno.hora} · Coach {turno.coach}</p>
            <h3 style={{ fontFamily: FONTS.display, color: COLORS.textHi, fontSize: 26, letterSpacing: 1 }}>{turno.actividad}</h3>
          </div>
          <button onClick={onClose} style={{ color: COLORS.textMuted }}>
            <X size={22} />
          </button>
        </div>
        <PlateMeter ocupados={turno.inscritos.length} total={turno.cupo} />
        <div className="flex-1 overflow-y-auto flex flex-col gap-2">
          {turno.inscritos.length === 0 && (
            <p style={{ fontFamily: FONTS.body, color: COLORS.textMuted }} className="text-sm py-4 text-center">
              Nadie anotado todavía
            </p>
          )}
          {turno.inscritos.map((id) => {
            const al = alumnosById[id];
            if (!al) return null;
            return (
              <div key={id} className="flex items-center justify-between py-2" style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                <span style={{ fontFamily: FONTS.body, color: COLORS.textHi }} className="text-sm">{al.nombre}</span>
                <StatusChip estado={al.estado} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function AlumnosView({ alumnos, onOpenAlumno }) {
  const [query, setQuery] = useState("");
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
            onClick={() => onOpenAlumno(a)}
            className="w-full flex items-center justify-between py-3"
            style={{ borderBottom: `1px solid ${COLORS.border}`, textAlign: "left" }}
          >
            <div className="flex flex-col">
              <span style={{ fontFamily: FONTS.body, fontWeight: 600, color: COLORS.textHi }} className="text-sm">
                {a.nombre}
              </span>
              <span style={{ fontFamily: FONTS.mono, color: COLORS.textMuted }} className="text-xs">
                Plan {a.plan}
              </span>
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
    </div>
  );
}

function AlumnoDetail({ alumno, onClose }) {
  if (!alumno) return null;
  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center" style={{ backgroundColor: "rgba(0,0,0,0.6)" }}>
      <div
        className="w-full max-w-md rounded-t-2xl p-5 flex flex-col gap-4"
        style={{ backgroundColor: COLORS.surface, border: `1px solid ${COLORS.border}` }}
      >
        <div className="flex items-start justify-between">
          <div>
            <h3 style={{ fontFamily: FONTS.display, color: COLORS.textHi, fontSize: 26, letterSpacing: 1 }}>
              {alumno.nombre}
            </h3>
            <p style={{ fontFamily: FONTS.mono, color: COLORS.textMuted }} className="text-xs">{alumno.telefono}</p>
          </div>
          <button onClick={onClose} style={{ color: COLORS.textMuted }}>
            <X size={22} />
          </button>
        </div>
        <div className="flex items-center gap-3">
          <StatusChip estado={alumno.estado} />
          <span style={{ fontFamily: FONTS.body, color: COLORS.textMid }} className="text-sm">Plan {alumno.plan}</span>
        </div>
        <div className="rounded-lg p-4" style={{ backgroundColor: COLORS.surfaceHi, border: `1px solid ${COLORS.border}` }}>
          <p style={{ fontFamily: FONTS.body, color: COLORS.textMuted }} className="text-xs">
            Acá va el historial de asistencias y estado de pago una vez conectado a Supabase.
          </p>
        </div>
      </div>
    </div>
  );
}

function ControlView({ turnos, dia, setDia, alumnosById, asistencias, toggleAsistencia }) {
  const list = (turnos[dia] || []).slice().sort((a, b) => a.hora.localeCompare(b.hora));
  const [selectedId, setSelectedId] = useState(list[0]?.id || null);
  const selected = list.find((t) => t.id === selectedId) || list[0];

  const key = selected ? `${dia}-${selected.id}` : null;
  const presentSet = key ? asistencias[key] || new Set() : new Set();

  return (
    <div className="flex flex-col h-full">
      <div className="flex gap-2 overflow-x-auto px-4 pt-4 pb-3" style={{ borderBottom: `1px solid ${COLORS.border}` }}>
        {DIAS.map((d) => (
          <Pill
            key={d}
            active={d === dia}
            onClick={() => {
              setDia(d);
              setSelectedId(null);
            }}
          >
            {d}
          </Pill>
        ))}
      </div>

      {list.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-2" style={{ color: COLORS.textMuted }}>
          <ClipboardCheck size={28} strokeWidth={1.5} />
          <p style={{ fontFamily: FONTS.body }} className="text-sm">No hay turnos para controlar este día</p>
        </div>
      ) : (
        <>
          <div className="flex gap-2 overflow-x-auto px-4 py-3">
            {list.map((t) => (
              <Pill key={t.id} active={t.id === (selected && selected.id)} onClick={() => setSelectedId(t.id)}>
                {t.hora} {t.actividad}
              </Pill>
            ))}
          </div>

          {selected && (
            <>
              <div className="px-4 pb-2 flex items-center justify-between">
                <span style={{ fontFamily: FONTS.mono, color: COLORS.textMuted }} className="text-xs">
                  PRESENTES
                </span>
                <span style={{ fontFamily: FONTS.mono, color: COLORS.lime }} className="text-sm">
                  {presentSet.size}/{selected.inscritos.length}
                </span>
              </div>
              <div className="flex-1 overflow-y-auto px-4 pb-4 flex flex-col gap-2">
                {selected.inscritos.map((id) => {
                  const al = alumnosById[id];
                  if (!al) return null;
                  const present = presentSet.has(id);
                  return (
                    <button
                      key={id}
                      onClick={() => toggleAsistencia(dia, selected.id, id)}
                      className="w-full flex items-center justify-between rounded-lg px-4 py-3"
                      style={{
                        backgroundColor: present ? "rgba(212,255,61,0.08)" : COLORS.surface,
                        border: `1px solid ${present ? COLORS.limeDim : COLORS.border}`,
                      }}
                    >
                      <span style={{ fontFamily: FONTS.body, color: COLORS.textHi }} className="text-sm">
                        {al.nombre}
                      </span>
                      <div
                        className="flex items-center justify-center rounded-full"
                        style={{
                          width: 24,
                          height: 24,
                          backgroundColor: present ? COLORS.lime : "transparent",
                          border: `1px solid ${present ? COLORS.lime : COLORS.border}`,
                        }}
                      >
                        {present && <Check size={14} color="#101215" strokeWidth={3} />}
                      </div>
                    </button>
                  );
                })}
                {selected.inscritos.length === 0 && (
                  <p style={{ fontFamily: FONTS.body, color: COLORS.textMuted }} className="text-sm text-center py-8">
                    Nadie anotado en este turno
                  </p>
                )}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

// ---------- App shell ----------

export default function GymTurnosApp() {
  const [tab, setTab] = useState("agenda");
  const [dia, setDia] = useState("Lun");
  const [turnos] = useState(initialTurnos);
  const [alumnos] = useState(initialAlumnos);
  const [openTurno, setOpenTurno] = useState(null);
  const [openAlumno, setOpenAlumno] = useState(null);
  const [asistencias, setAsistencias] = useState({});

  const alumnosById = useMemo(() => {
    const map = {};
    alumnos.forEach((a) => (map[a.id] = a));
    return map;
  }, [alumnos]);

  const toggleAsistencia = (dia, turnoId, alumnoId) => {
    const key = `${dia}-${turnoId}`;
    setAsistencias((prev) => {
      const current = new Set(prev[key] || []);
      if (current.has(alumnoId)) current.delete(alumnoId);
      else current.add(alumnoId);
      return { ...prev, [key]: current };
    });
  };

  const tabs = [
    { id: "agenda", label: "Agenda", icon: Calendar },
    { id: "alumnos", label: "Alumnos", icon: Users },
    { id: "control", label: "Control", icon: ClipboardCheck },
  ];

  return (
    <div
      className="w-full flex flex-col mx-auto"
      style={{
        height: 720,
        maxWidth: 420,
        backgroundColor: COLORS.bg,
        fontFamily: FONTS.body,
        borderRadius: 20,
        overflow: "hidden",
        border: `1px solid ${COLORS.border}`,
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap');
      `}</style>

      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <div className="flex items-center gap-2">
          <Dumbbell size={20} color={COLORS.lime} />
          <span style={{ fontFamily: FONTS.display, color: COLORS.textHi, fontSize: 22, letterSpacing: 1 }}>
            TU GYM
          </span>
        </div>
        <div className="flex items-center gap-1" style={{ color: COLORS.textMuted }}>
          <Clock size={14} />
          <span style={{ fontFamily: FONTS.mono }} className="text-xs">Bahía Blanca</span>
        </div>
      </div>

      {/* Views */}
      <div className="flex-1 min-h-0 relative">
        {tab === "agenda" && (
          <AgendaView turnos={turnos} dia={dia} setDia={setDia} onOpenTurno={setOpenTurno} />
        )}
        {tab === "alumnos" && <AlumnosView alumnos={alumnos} onOpenAlumno={setOpenAlumno} />}
        {tab === "control" && (
          <ControlView
            turnos={turnos}
            dia={dia}
            setDia={setDia}
            alumnosById={alumnosById}
            asistencias={asistencias}
            toggleAsistencia={toggleAsistencia}
          />
        )}

        {/* Floating action button */}
        <button
          className="absolute rounded-full flex items-center justify-center"
          style={{
            right: 16,
            bottom: 16,
            width: 48,
            height: 48,
            backgroundColor: COLORS.lime,
            boxShadow: "0 4px 14px rgba(212,255,61,0.3)",
          }}
        >
          {tab === "alumnos" ? (
            <UserPlus size={20} color="#101215" strokeWidth={2.5} />
          ) : (
            <Plus size={22} color="#101215" strokeWidth={2.5} />
          )}
        </button>
      </div>

      {/* Bottom nav */}
      <div
        className="flex items-center justify-around px-2 py-2"
        style={{ borderTop: `1px solid ${COLORS.border}`, backgroundColor: COLORS.surface }}
      >
        {tabs.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="flex flex-col items-center gap-1 px-4 py-1.5 rounded-lg"
            >
              <Icon size={20} color={active ? COLORS.lime : COLORS.textMuted} strokeWidth={active ? 2.5 : 2} />
              <span
                style={{
                  fontFamily: FONTS.mono,
                  color: active ? COLORS.lime : COLORS.textMuted,
                  fontSize: 10,
                  letterSpacing: 0.5,
                }}
              >
                {t.label.toUpperCase()}
              </span>
            </button>
          );
        })}
      </div>

      <TurnoDetail turno={openTurno} alumnosById={alumnosById} onClose={() => setOpenTurno(null)} />
      <AlumnoDetail alumno={openAlumno} onClose={() => setOpenAlumno(null)} />
    </div>
  );
}
