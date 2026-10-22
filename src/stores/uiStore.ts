import { create } from "zustand";

interface UIState {
  activeTab: string;
  /** Fecha ISO (YYYY-MM-DD) del día que se está mirando. */
  selectedFecha: string;
  /** Sesión seleccionada (para abrir el detalle). */
  selectedSesionId: string | null;
  isSidebarOpen: boolean;
  setActiveTab: (tab: string) => void;
  setSelectedFecha: (fecha: string) => void;
  setSelectedSesionId: (id: string | null) => void;
  toggleSidebar: () => void;
}

const hoy = new Date();
const hoyISO = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}-${String(hoy.getDate()).padStart(2, "0")}`;

export const useUIStore = create<UIState>((set) => ({
  activeTab: "reservar",
  selectedFecha: hoyISO,
  selectedSesionId: null,
  isSidebarOpen: false,
  setActiveTab: (tab) => set({ activeTab: tab }),
  setSelectedFecha: (fecha) => set({ selectedFecha: fecha }),
  setSelectedSesionId: (id) => set({ selectedSesionId: id }),
  toggleSidebar: () => set((s) => ({ isSidebarOpen: !s.isSidebarOpen })),
}));
