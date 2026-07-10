import { describe, it, expect, beforeEach } from "vitest";
import { useUIStore } from "../uiStore";

describe("uiStore", () => {
  beforeEach(() => {
    useUIStore.setState({
      activeTab: "reservar",
      selectedDay: "Lun",
      selectedTurnoId: null,
      isSidebarOpen: false,
    });
  });

  it("has correct initial state", () => {
    const state = useUIStore.getState();
    expect(state.activeTab).toBe("reservar");
    expect(state.selectedDay).toBe("Lun");
    expect(state.selectedTurnoId).toBeNull();
  });

  it("setActiveTab updates tab", () => {
    useUIStore.getState().setActiveTab("mis-turnos");
    expect(useUIStore.getState().activeTab).toBe("mis-turnos");
  });

  it("setSelectedDay updates day", () => {
    useUIStore.getState().setSelectedDay("Mar");
    expect(useUIStore.getState().selectedDay).toBe("Mar");
  });

  it("setSelectedTurnoId updates turno", () => {
    useUIStore.getState().setSelectedTurnoId("t1");
    expect(useUIStore.getState().selectedTurnoId).toBe("t1");
  });

  it("toggleSidebar toggles", () => {
    expect(useUIStore.getState().isSidebarOpen).toBe(false);
    useUIStore.getState().toggleSidebar();
    expect(useUIStore.getState().isSidebarOpen).toBe(true);
    useUIStore.getState().toggleSidebar();
    expect(useUIStore.getState().isSidebarOpen).toBe(false);
  });
});
