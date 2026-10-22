import { describe, it, expect, beforeEach } from "vitest";
import { useUIStore } from "../uiStore";

describe("uiStore", () => {
  beforeEach(() => {
    useUIStore.setState({
      activeTab: "reservar",
      selectedFecha: "2026-10-21",
      selectedSesionId: null,
      isSidebarOpen: false,
    });
  });

  it("has correct initial state", () => {
    const state = useUIStore.getState();
    expect(state.activeTab).toBe("reservar");
    expect(state.selectedFecha).toBe("2026-10-21");
    expect(state.selectedSesionId).toBeNull();
  });

  it("setActiveTab updates tab", () => {
    useUIStore.getState().setActiveTab("mis-turnos");
    expect(useUIStore.getState().activeTab).toBe("mis-turnos");
  });

  it("setSelectedFecha updates the date", () => {
    useUIStore.getState().setSelectedFecha("2026-10-23");
    expect(useUIStore.getState().selectedFecha).toBe("2026-10-23");
  });

  it("setSelectedSesionId updates the session", () => {
    useUIStore.getState().setSelectedSesionId("s1");
    expect(useUIStore.getState().selectedSesionId).toBe("s1");
  });

  it("toggleSidebar toggles", () => {
    expect(useUIStore.getState().isSidebarOpen).toBe(false);
    useUIStore.getState().toggleSidebar();
    expect(useUIStore.getState().isSidebarOpen).toBe(true);
    useUIStore.getState().toggleSidebar();
    expect(useUIStore.getState().isSidebarOpen).toBe(false);
  });
});
