import React, { useState, useMemo } from "react";
import {
  Calendar,
  CalendarCheck,
  User,
  X,
  Check,
  Dumbbell,
  Clock,
  Lock,
} from "lucide-react";

// ---------- Design tokens (consistentes con la app del dueño) ----------
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
    { id: "t1", hora: "07:00", actividad: "Funcional", coach: "Nacho", cupo: 12, ocupados: 10 },
    { id: "t2", hora: "09:00", actividad: "Pesas Libres", coach: "Vale", cupo: 8, ocupados: 2 },
    { id: "t3", hora: "18:30", actividad: "CrossTraining", coach: "Nacho", cupo: 14, ocupados: 14 },
    { id: "t4", hora: "20:00", actividad: "Movilidad", coach: "Vale", cupo: 10, ocupados: 2 },
  ],
  Mar: [
    { id: "t5", hora: "08:00", actividad: "Funcional", coach: "Nacho", cupo: 12, ocupados: 6 },
    { id: "t6", hora: "19:00", actividad: "Pesas Libres", coach: "Vale", cupo: 8, ocupados: 8 },
  ],
  Mié: [
    { id: "t7", hora: "07:00", actividad: "Funcional", coach: "Nacho", cupo: 12, ocupados: 2 },
    { id: "t8", hora: "18:30", actividad: "CrossTraining", coach: "Nacho", cupo: 14, ocupados: 6 },
  ],
  Jue: [
    { id: "t9", hora: "09:00", actividad: "Movilidad", coach: "Vale", cupo: 10, ocupados: 10 },
  ],
  Vie: [
    { id: "t10", hora: "07:00", actividad: "Funcional", coach: "Nacho", cupo: 12, ocupados: 3 },
    { id: "t11", hora: "18:30", actividad: "CrossTraining", coach: "Nacho", cupo: 14, ocupados: 0 },
  ],
  Sáb: [
    { id: "t12", hora: "10:00", actividad: "Funcional", coach: "Vale", cupo: 12, ocupados: 3 },
  ],
  Dom: [],
};

const currentAlumno = {
  nombre: "Martina Suárez",
  plan: "Full",
  estado: "activo",
  turnosDisponiblesSemana: null, // null = ilimitado (plan Full)
};

// ---------- Building blocks ----------

function PlateMeter({ ocupados, total }) {
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
              backgroundColor: filled ? (full ? COLORS.danger : COLORS.steel) : "transparent",
              border: `1px solid ${filled ? "transparent" : COLORS.border}`,
              borderRadius: 1,
            }}
          />
        ))}
      </div>
      <span
        style={{ fontFamily: FONTS.mono, color: full ? COLORS.danger : COLORS.textMid }}
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
      }}
    >
      {ok ? "ACTIVO" : "VENCIDO"}
    </span>
  );
}

// ---------- Views ----------

function ReservarView({ turnos, dia, setDia, misReservas, onOpenTurno }) {
  const list = (turnos[dia] || []).slice().sort((a, b) => a.hora.localeCompare(b.hora));
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
            <p style={{ fontFamily: FONTS.body }} className="text-sm">No hay turnos este día</p>
          </div>
        )}
        {list.map((t) => {
          const lleno = t.ocupados >= t.cupo;
          const reservado = misReservas.has(t.id);
          return (
            <button
              key={t.id}
              onClick={() => onOpenTurno(t)}
              className="text-left rounded-lg p-4 flex items-center justify-between"
              style={{
                backgroundColor: reservado ? "rgba(212,255,61,0.06)" : COLORS.surface,
                border: `1px solid ${reservado ? COLORS.limeDim : COLORS.border}`,
                opacity: lleno && !reservado ? 0.55 : 1,
              }}
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
                  {reservado && (
                    <span style={{ fontFamily: FONTS.mono, color: COLORS.lime }} className="text-xs">
                      RESERVADO
                    </span>
                  )}
                  {lleno && !reservado && (
                    <span style={{ fontFamily: FONTS.mono, color: COLORS.danger }} className="text-xs">
                      SIN CUPO
                    </span>
                  )}
                </div>
              </div>
              <PlateMeter ocupados={t.ocupados} total={t.cupo} />
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TurnoSheet({ turno, reservado, lleno, onClose, onReservar, onCancelar }) {
  if (!turno) return null;
  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center" style={{ backgroundColor: "rgba(0,0,0,0.6)" }}>
      <div
        className="w-full max-w-md rounded-t-2xl p-5 flex flex-col gap-4"
        style={{ backgroundColor: COLORS.surface, border: `1px solid ${COLORS.border}` }}
      >
        <div className="flex items-start justify-between">
          <div>
            <p style={{ fontFamily: FONTS.mono, color: COLORS.limeDim }} className="text-xs">
              {turno.hora} · Coach {turno.coach}
            </p>
            <h3 style={{ fontFamily: FONTS.display, color: COLORS.textHi, fontSize: 26, letterSpacing: 1 }}>
              {turno.actividad}
            </h3>
          </div>
          <button onClick={onClose} style={{ color: COLORS.textMuted }}>
            <X size={22} />
          </button>
        </div>

        <PlateMeter ocupados={turno.ocupados} total={turno.cupo} />

        {reservado ? (
          <button
            onClick={onCancelar}
            className="w-full py-3 rounded-lg text-center"
            style={{
              fontFamily: FONTS.body,
              fontWeight: 700,
              color: COLORS.danger,
              border: `1px solid ${COLORS.danger}`,
              backgroundColor: "transparent",
            }}
          >
            Cancelar mi reserva
          </button>
        ) : lleno ? (
          <div
            className="w-full py-3 rounded-lg text-center flex items-center justify-center gap-2"
            style={{ fontFamily: FONTS.body, color: COLORS.textMuted, border: `1px solid ${COLORS.border}` }}
          >
            <Lock size={14} /> Sin cupo disponible
          </div>
        ) : (
          <button
            onClick={onReservar}
            className="w-full py-3 rounded-lg text-center"
            style={{
              fontFamily: FONTS.body,
              fontWeight: 700,
              color: "#101215",
              backgroundColor: COLORS.lime,
            }}
          >
            Reservar mi lugar
          </button>
        )}
      </div>
    </div>
  );
}

function MisTurnosView({ turnos, misReservas, onCancelar }) {
  const items = [];
  DIAS.forEach((dia) => {
    (turnos[dia] || []).forEach((t) => {
      if (misReservas.has(t.id)) items.push({ ...t, dia });
    });
  });

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
      {items.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 gap-2" style={{ color: COLORS.textMuted }}>
          <CalendarCheck size={28} strokeWidth={1.5} />
          <p style={{ fontFamily: FONTS.body }} className="text-sm">Todavía no reservaste ningún turno</p>
        </div>
      )}
      {items.map((t) => (
        <div
          key={t.id}
          className="rounded-lg p-4 flex items-center justify-between"
          style={{ backgroundColor: COLORS.surface, border: `1px solid ${COLORS.limeDim}` }}
        >
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-center justify-center" style={{ width: 56 }}>
              <span style={{ fontFamily: FONTS.mono, color: COLORS.lime, fontSize: 11 }}>{t.dia.toUpperCase()}</span>
              <span style={{ fontFamily: FONTS.display, fontSize: 20, color: COLORS.textHi, letterSpacing: 1 }}>
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
          <button
            onClick={() => onCancelar(t.id)}
            className="flex items-center justify-center rounded-full"
            style={{ width: 30, height: 30, border: `1px solid ${COLORS.border}`, color: COLORS.textMuted }}
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}

function PerfilView({ alumno }) {
  return (
    <div className="flex-1 overflow-y-auto px-5 py-6 flex flex-col gap-5">
      <div className="flex items-center gap-4">
        <div
          className="flex items-center justify-center rounded-full"
          style={{ width: 56, height: 56, backgroundColor: COLORS.surfaceHi, border: `1px solid ${COLORS.border}` }}
        >
          <User size={24} color={COLORS.lime} />
        </div>
        <div>
          <h3 style={{ fontFamily: FONTS.display, color: COLORS.textHi, fontSize: 24, letterSpacing: 1 }}>
            {alumno.nombre}
          </h3>
          <StatusChip estado={alumno.estado} />
        </div>
      </div>

      <div className="rounded-lg p-4 flex flex-col gap-3" style={{ backgroundColor: COLORS.surface, border: `1px solid ${COLORS.border}` }}>
        <div className="flex items-center justify-between">
          <span style={{ fontFamily: FONTS.body, color: COLORS.textMuted }} className="text-sm">Plan</span>
          <span style={{ fontFamily: FONTS.mono, color: COLORS.textHi }} className="text-sm">{alumno.plan}</span>
        </div>
        <div className="flex items-center justify-between">
          <span style={{ fontFamily: FONTS.body, color: COLORS.textMuted }} className="text-sm">Próximo vencimiento</span>
          <span style={{ fontFamily: FONTS.mono, color: COLORS.textHi }} className="text-sm">05/08</span>
        </div>
      </div>

      <div className="rounded-lg p-4" style={{ backgroundColor: COLORS.surfaceHi, border: `1px solid ${COLORS.border}` }}>
        <p style={{ fontFamily: FONTS.body, color: COLORS.textMuted }} className="text-xs">
          Acá va el historial de asistencias y el estado de pago una vez conectado a Supabase.
        </p>
      </div>
    </div>
  );
}

// ---------- App shell ----------

export default function GymTurnosAppAlumno() {
  const [tab, setTab] = useState("reservar");
  const [dia, setDia] = useState("Lun");
  const [turnos, setTurnos] = useState(initialTurnos);
  const [misReservas, setMisReservas] = useState(new Set(["t2"]));
  const [openTurno, setOpenTurno] = useState(null);

  const ajustarOcupados = (turnoId, delta) => {
    setTurnos((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((d) => {
        next[d] = next[d].map((t) => (t.id === turnoId ? { ...t, ocupados: t.ocupados + delta } : t));
      });
      return next;
    });
  };

  const reservar = (turnoId) => {
    setMisReservas((prev) => new Set(prev).add(turnoId));
    ajustarOcupados(turnoId, 1);
    setOpenTurno(null);
  };

  const cancelar = (turnoId) => {
    setMisReservas((prev) => {
      const next = new Set(prev);
      next.delete(turnoId);
      return next;
    });
    ajustarOcupados(turnoId, -1);
    setOpenTurno(null);
  };

  const tabs = [
    { id: "reservar", label: "Reservar", icon: Calendar },
    { id: "mis-turnos", label: "Mis turnos", icon: CalendarCheck },
    { id: "perfil", label: "Perfil", icon: User },
  ];

  const openTurnoLive = useMemo(() => {
    if (!openTurno) return null;
    for (const d of DIAS) {
      const found = (turnos[d] || []).find((t) => t.id === openTurno.id);
      if (found) return found;
    }
    return openTurno;
  }, [turnos, openTurno]);

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
        {tab === "reservar" && (
          <ReservarView turnos={turnos} dia={dia} setDia={setDia} misReservas={misReservas} onOpenTurno={setOpenTurno} />
        )}
        {tab === "mis-turnos" && (
          <MisTurnosView turnos={turnos} misReservas={misReservas} onCancelar={cancelar} />
        )}
        {tab === "perfil" && <PerfilView alumno={currentAlumno} />}
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

      <TurnoSheet
        turno={openTurnoLive}
        reservado={openTurnoLive ? misReservas.has(openTurnoLive.id) : false}
        lleno={openTurnoLive ? openTurnoLive.ocupados >= openTurnoLive.cupo : false}
        onClose={() => setOpenTurno(null)}
        onReservar={() => openTurnoLive && reservar(openTurnoLive.id)}
        onCancelar={() => openTurnoLive && cancelar(openTurnoLive.id)}
      />
    </div>
  );
}
