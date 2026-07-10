import { create } from "zustand";
import type { TurnoConReservas, DiaSemana, Profile } from "@/types";
import { mockTurnos, mockAlumnos, mockMisReservas } from "@/lib/mock-data";
import { isMockMode, supabase } from "@/lib/supabase";

const EMPTY_TURNOS: Record<DiaSemana, TurnoConReservas[]> = {
  Lun: [], Mar: [], Mié: [], Jue: [], Vie: [], Sáb: [], Dom: [],
};

interface TurnosState {
  turnos: Record<DiaSemana, TurnoConReservas[]>;
  alumnos: Profile[];
  misReservas: Set<string>;
  loading: boolean;
  loadTurnos: () => Promise<void>;
  loadAlumnos: () => Promise<void>;
  loadMisReservas: (alumnoId: string) => Promise<void>;
  reservar: (turnoId: string, alumnoId: string) => Promise<void>;
  cancelarReserva: (turnoId: string, alumnoId: string) => Promise<void>;
  toggleAsistencia: (turnoId: string, alumnoId: string, presente: boolean) => Promise<void>;
}

export const useTurnosStore = create<TurnosState>((set, get) => ({
  turnos: isMockMode ? mockTurnos : EMPTY_TURNOS,
  alumnos: isMockMode ? mockAlumnos : [],
  misReservas: isMockMode ? new Set(mockMisReservas) : new Set<string>(),
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
        const inscritos = (reservasData || [])
          .filter((r) => r.turno_id === t.id)
          .map((r) => r.alumno_id);
        grouped[t.dia as DiaSemana].push({
          ...t,
          inscritos,
          ocupados: inscritos.length,
        });
      }
      set({ turnos: grouped });
    }
    set({ loading: false });
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

  reservar: async (turnoId, alumnoId) => {
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
      await supabase.from("reservas").insert({ turno_id: turnoId, alumno_id: alumnoId, estado: "activa" });
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
}));
