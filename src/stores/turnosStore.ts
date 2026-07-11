import { create } from "zustand";
import type { TurnoConReservas, DiaSemana, Profile, PlanActividad, PlanType, Reserva } from "@/types";
import { mockTurnos, mockAlumnos, mockMisReservas } from "@/lib/mock-data";
import { isMockMode, supabase } from "@/lib/supabase";

const EMPTY_TURNOS: Record<DiaSemana, TurnoConReservas[]> = {
  Lun: [], Mar: [], Mié: [], Jue: [], Vie: [], Sáb: [], Dom: [],
};

interface TurnoFijo {
  turno: TurnoConReservas;
  alumnos: Profile[];
}

interface TurnosState {
  turnos: Record<DiaSemana, TurnoConReservas[]>;
  actividadesPorPlan: Record<PlanType, string[]>;
  alumnos: Profile[];
  misReservas: Set<string>;
  turnosFijos: TurnoFijo[];
  loading: boolean;
  loadTurnos: () => Promise<void>;
  loadActividadesPorPlan: () => Promise<void>;
  loadAlumnos: () => Promise<void>;
  loadMisReservas: (alumnoId: string) => Promise<void>;
  loadTurnosFijos: () => Promise<void>;
  reservar: (turnoId: string, alumnoId: string, esFijo?: boolean) => Promise<void>;
  cancelarReserva: (turnoId: string, alumnoId: string) => Promise<void>;
  toggleAsistencia: (turnoId: string, alumnoId: string, presente: boolean) => Promise<void>;
  getTurnosPorPlan: (plan: PlanType) => Record<DiaSemana, TurnoConReservas[]>;
}

export const useTurnosStore = create<TurnosState>((set, get) => ({
  turnos: isMockMode ? mockTurnos : EMPTY_TURNOS,
  actividadesPorPlan: {
    "Full": ["Funcional", "Pesas Libres", "CrossTraining", "Movilidad"],
    "3x semana": ["Funcional", "Pesas Libres", "Movilidad"],
    "2x semana": ["Pesas Libres", "Movilidad"],
  },
  alumnos: isMockMode ? mockAlumnos : [],
  misReservas: isMockMode ? new Set(mockMisReservas) : new Set<string>(),
  turnosFijos: [],
  loading: false,

  loadTurnos: async () => {
    if (isMockMode) {
      set({ turnos: mockTurnos });
      return;
    }
    set({ loading: true });
    const { data: turnosData } = await supabase.from("turnos").select("*").eq("activo", true);
    const { data: reservasData } = await supabase.from("reservas").select("*").eq("estado", "activa");

    if (turnosData) {
      const grouped: Record<DiaSemana, TurnoConReservas[]> = { ...EMPTY_TURNOS };
      for (const t of turnosData) {
        const inscritosReservas = (reservasData || [])
          .filter((r) => r.turno_id === t.id);
        const inscritos = inscritosReservas.map((r) => r.alumno_id);
        const fijos = inscritosReservas.filter((r) => r.es_fijo).map((r) => r.alumno_id);
        grouped[t.dia as DiaSemana].push({
          ...t,
          inscritos,
          ocupados: inscritos.length,
          fijos,
        });
      }
      set({ turnos: grouped });
    }
    set({ loading: false });
  },

  loadActividadesPorPlan: async () => {
    if (isMockMode) return;
    
    const { data } = await supabase.from("plan_actividades").select("*");
    if (data) {
      const grouped: Record<PlanType, string[]> = {
        "Full": [],
        "3x semana": [],
        "2x semana": [],
      };
      for (const pa of data as PlanActividad[]) {
        if (grouped[pa.plan]) {
          grouped[pa.plan].push(pa.actividad);
        }
      }
      set({ actividadesPorPlan: grouped });
    }
  },

  loadAlumnos: async () => {
    if (isMockMode) {
      set({ alumnos: mockAlumnos });
      return;
    }
    const { data } = await supabase.from("profiles").select("*").eq("role", "alumno");
    if (data) set({ alumnos: data as Profile[] });
  },

  loadMisReservas: async (alumnoId: string) => {
    if (isMockMode) {
      set({ misReservas: new Set(mockMisReservas) });
      return;
    }
    const { data } = await supabase
      .from("reservas")
      .select("turno_id")
      .eq("alumno_id", alumnoId)
      .eq("estado", "activa");
    if (data) {
      set({ misReservas: new Set(data.map((r) => r.turno_id)) });
    }
  },

  loadTurnosFijos: async () => {
    if (isMockMode) {
      set({ turnosFijos: [] });
      return;
    }

    const { data: reservasFijas } = await supabase
      .from("reservas")
      .select("*")
      .eq("es_fijo", true)
      .eq("estado", "activa");

    if (!reservasFijas || reservasFijas.length === 0) {
      set({ turnosFijos: [] });
      return;
    }

    const turnoIds = [...new Set(reservasFijas.map((r: Reserva) => r.turno_id))];
    const { data: turnosData } = await supabase
      .from("turnos")
      .select("*")
      .in("id", turnoIds);

    const alumnoIds = [...new Set(reservasFijas.map((r: Reserva) => r.alumno_id))];
    const { data: alumnosData } = await supabase
      .from("profiles")
      .select("*")
      .in("id", alumnoIds);

    const alumnosMap = new Map((alumnosData || []).map((a: Profile) => [a.id, a]));
    const turnosMap = new Map((turnosData || []).map((t) => [t.id, t]));

    const grouped: Record<string, TurnoFijo> = {};
    for (const r of reservasFijas as Reserva[]) {
      if (!grouped[r.turno_id]) {
        const turno = turnosMap.get(r.turno_id);
        if (turno) {
          grouped[r.turno_id] = {
            turno: { ...turno, inscritos: [], ocupados: 0 },
            alumnos: [],
          };
        }
      }
      if (grouped[r.turno_id]) {
        const alumno = alumnosMap.get(r.alumno_id);
        if (alumno) {
          grouped[r.turno_id].alumnos.push(alumno);
          grouped[r.turno_id].turno.inscritos.push(r.alumno_id);
          grouped[r.turno_id].turno.ocupados++;
        }
      }
    }

    set({ turnosFijos: Object.values(grouped) });
  },

  reservar: async (turnoId, alumnoId, esFijo = false) => {
    const { misReservas, turnos } = get();
    const newMisReservas = new Set(misReservas);
    newMisReservas.add(turnoId);

    const newTurnos = { ...turnos };
    for (const dia of Object.keys(newTurnos) as DiaSemana[]) {
      newTurnos[dia] = newTurnos[dia].map((t) =>
        t.id === turnoId ? { ...t, inscritos: [...t.inscritos, alumnoId], ocupados: t.ocupados + 1 } : t
      );
    }

    set({ misReservas: newMisReservas, turnos: newTurnos });

    if (!isMockMode) {
      await supabase.from("reservas").insert({ 
        turno_id: turnoId, 
        alumno_id: alumnoId, 
        estado: "activa",
        es_fijo: esFijo
      });
    }
  },

  cancelarReserva: async (turnoId, alumnoId) => {
    const { misReservas, turnos } = get();
    const newMisReservas = new Set(misReservas);
    newMisReservas.delete(turnoId);

    const newTurnos = { ...turnos };
    for (const dia of Object.keys(newTurnos) as DiaSemana[]) {
      newTurnos[dia] = newTurnos[dia].map((t) =>
        t.id === turnoId
          ? { ...t, inscritos: t.inscritos.filter((id) => id !== alumnoId), ocupados: t.ocupados - 1 }
          : t
      );
    }

    set({ misReservas: newMisReservas, turnos: newTurnos });

    if (!isMockMode) {
      await supabase
        .from("reservas")
        .update({ estado: "cancelada" })
        .eq("turno_id", turnoId)
        .eq("alumno_id", alumnoId);
    }
  },

  toggleAsistencia: async (turnoId, alumnoId, presente) => {
    if (!isMockMode) {
      await supabase.from("asistencias").upsert(
        { turno_id: turnoId, alumno_id: alumnoId, fecha: new Date().toISOString(), presente },
        { onConflict: "turno_id,alumno_id" }
      );
    }
  },

  getTurnosPorPlan: (plan: PlanType) => {
    const { turnos, actividadesPorPlan } = get();
    const actividadesPermitidas = actividadesPorPlan[plan] || [];
    
    const filtered: Record<DiaSemana, TurnoConReservas[]> = {
      Lun: [], Mar: [], Mié: [], Jue: [], Vie: [], Sáb: [], Dom: [],
    };
    
    for (const dia of Object.keys(turnos) as DiaSemana[]) {
      filtered[dia] = turnos[dia].filter((t) => 
        actividadesPermitidas.includes(t.actividad)
      );
    }
    
    return filtered;
  },
}));
