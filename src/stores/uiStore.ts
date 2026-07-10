import { create } from "zustand";

interface UIState {
  activeTab: string;
  selectedDay: string;
  selectedTurnoId: string | null;
  isSidebarOpen: boolean;
  setActiveTab: (tab: string) => void;
  setSelectedDay: (day: string) => void;
  setSelectedTurnoId: (id: string | null) => void;
  toggleSidebar: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  activeTab: "reservar",
  selectedDay: "Lun",
  selectedTurnoId: null,
  isSidebarOpen: false,
  setActiveTab: (tab) => set({ activeTab: tab }),
  setSelectedDay: (day) => set({ selectedDay: day }),
  setSelectedTurnoId: (id) => set({ selectedTurnoId: id }),
  toggleSidebar: () => set((s) => ({ isSidebarOpen: !s.isSidebarOpen })),
}));
