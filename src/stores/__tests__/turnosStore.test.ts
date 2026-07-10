import { describe, it, expect, beforeEach } from "vitest";
import { useTurnosStore } from "../turnosStore";
import type { DiaSemana } from "@/types";

describe("turnosStore", () => {
  beforeEach(() => {
    useTurnosStore.setState({
      turnos: {
        Lun: [
          { id: "t1", dia: "Lun" as DiaSemana, hora: "07:00", actividad: "Funcional", coach: "Nacho", cupo: 12, activo: true, created_at: "", inscritos: ["a1"], ocupados: 1 },
        ],
        Mar: [], Mié: [], Jue: [], Vie: [], Sáb: [], Dom: [],
      },
      misReservas: new Set<string>(),
    });
  });

  it("has mock turnos loaded", () => {
    const state = useTurnosStore.getState();
    expect(state.turnos.Lun.length).toBe(1);
    expect(state.turnos.Lun[0].actividad).toBe("Funcional");
  });

  it("reservar adds turno to misReservas and increments ocupados", () => {
    useTurnosStore.getState().reservar("t1", "a2");
    const state = useTurnosStore.getState();
    expect(state.misReservas.has("t1")).toBe(true);
    expect(state.turnos.Lun[0].ocupados).toBe(2);
    expect(state.turnos.Lun[0].inscritos).toContain("a2");
  });

  it("cancelarReserva removes from misReservas and decrements", () => {
    useTurnosStore.getState().reservar("t1", "a2");
    useTurnosStore.getState().cancelarReserva("t1", "a2");
    const state = useTurnosStore.getState();
    expect(state.misReservas.has("t1")).toBe(false);
    expect(state.turnos.Lun[0].ocupados).toBe(1);
    expect(state.turnos.Lun[0].inscritos).not.toContain("a2");
  });

  it("misReservas is initialized empty", () => {
    expect(useTurnosStore.getState().misReservas.size).toBe(0);
  });
});
