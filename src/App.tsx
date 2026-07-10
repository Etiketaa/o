import { useEffect, useState, useRef } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useUIStore } from "@/stores/uiStore";
import { useTurnosStore } from "@/stores/turnosStore";
import { AuthLayout } from "@/layouts/AuthLayout";
import { AppLayout } from "@/layouts/AppLayout";
import { LoadingScreen } from "@/components/LoadingScreen";
import { LandingView } from "@/views/landing/LandingView";
import { ReservarView } from "@/views/alumno/ReservarView";
import { MisTurnosView } from "@/views/alumno/MisTurnosView";
import { PerfilView } from "@/views/alumno/PerfilView";
import { AgendaView } from "@/views/admin/AgendaView";
import { AlumnosView } from "@/views/admin/AlumnosView";
import { ControlView } from "@/views/admin/ControlView";
import { DashboardView } from "@/views/admin/DashboardView";
import { PagosView } from "@/views/admin/PagosView";

function AppContent() {
  const { user } = useAuthStore();
  const { activeTab } = useUIStore();
  const { loadTurnos, loadAlumnos, loadMisReservas } = useTurnosStore();

  useEffect(() => {
    if (!user) return;
    loadTurnos();
    if (user.role === "alumno") {
      loadMisReservas(user.id);
    } else if (user.role === "admin") {
      loadAlumnos();
    }
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!user) return null;

  if (user.role === "admin") {
    switch (activeTab) {
      case "agenda": return <AgendaView />;
      case "alumnos": return <AlumnosView />;
      case "control": return <ControlView />;
      case "pagos": return <PagosView />;
      case "dashboard": return <DashboardView />;
      default: return <AgendaView />;
    }
  }

  switch (activeTab) {
    case "reservar": return <ReservarView />;
    case "mis-turnos": return <MisTurnosView />;
    case "perfil": return <PerfilView />;
    default: return <ReservarView />;
  }
}

type Screen = "landing" | "login";

export default function App() {
  const { isAuthenticated, loading, loadSession } = useAuthStore();
  const [screen, setScreen] = useState<Screen>("landing");
  const sessionLoaded = useRef(false);

  useEffect(() => {
    if (!sessionLoaded.current) {
      sessionLoaded.current = true;
      loadSession();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (isAuthenticated) setScreen("login");
  }, [isAuthenticated]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full" style={{ backgroundColor: "var(--color-bg)" }}>
        <LoadingScreen />
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <AppLayout>
        <AppContent />
      </AppLayout>
    );
  }

  if (screen === "login") {
    return <AuthLayout onBack={() => setScreen("landing")} />;
  }

  return <LandingView onGoToApp={() => setScreen("login")} />;
}
