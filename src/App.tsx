import { useEffect, useState, useRef } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useUIStore } from "@/stores/uiStore";
import { useGymStore } from "@/stores/gymStore";
import { AuthLayout } from "@/layouts/AuthLayout";
import { AppLayout } from "@/layouts/AppLayout";
import { LoadingScreen } from "@/components/LoadingScreen";
import { LandingView } from "@/views/landing/LandingView";
import { ReservarView } from "@/views/alumno/ReservarView";
import { MisTurnosView } from "@/views/alumno/MisTurnosView";
import { PerfilView } from "@/views/alumno/PerfilView";
import { ProgresoView } from "@/views/alumno/ProgresoView";
import { AgendaView } from "@/views/admin/AgendaView";
import { AlumnosView } from "@/views/admin/AlumnosView";
import { ControlView } from "@/views/admin/ControlView";
import { DashboardView } from "@/views/admin/DashboardView";
import { PagosView } from "@/views/admin/PagosView";
import { CalendarioView } from "@/views/admin/CalendarioView";
import { SettingsView } from "@/views/admin/SettingsView";

function AppContent() {
  const { user } = useAuthStore();
  const { activeTab } = useUIStore();
  const { init } = useGymStore();

  useEffect(() => {
    // El store principal detecta el motor, siembra la configuración y materializa
    // las sesiones de la semana. Es idempotente: si ya inicializó, no hace nada.
    void init();
  }, [init]);

  // Atajo de teclado global: Esc cierra el modal abierto (ReservarView, MisTurnosView, etc.).
  // App no tiene acceso directo a los estados de cada modal, así que al presionar Esc busca
  // el diálogo abierto en el DOM y activa su botón de cierre (aria-label="Cerrar modal").
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      const dialog = document.querySelector('[role="dialog"]');
      if (!dialog) return;
      const closeButton = dialog.querySelector(
        'button[aria-label="Cerrar modal"]',
      ) as HTMLElement | null;
      if (closeButton) closeButton.click();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!user) return null;

  if (user.role === "admin") {
    switch (activeTab) {
      case "agenda": return <AgendaView />;
      case "calendario": return <CalendarioView />;
      case "alumnos": return <AlumnosView />;
      case "control": return <ControlView />;
      case "pagos": return <PagosView />;
      case "dashboard": return <DashboardView />;
      case "config": return <SettingsView />;
      default: return <AgendaView />;
    }
  }

  switch (activeTab) {
    case "reservar": return <ReservarView />;
    case "mis-turnos": return <MisTurnosView />;
    case "progreso": return <ProgresoView />;
    case "perfil": return <PerfilView />;
    default: return <ReservarView />;
  }
}

type Screen = "landing" | "login" | "setup";

export default function App() {
  const { isAuthenticated, loading, loadSession, necesitaSetup } = useAuthStore();
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

  if (screen === "setup") {
    return <AuthLayout setup onBack={() => setScreen("landing")} />;
  }

  if (screen === "login") {
    return <AuthLayout onBack={() => setScreen("landing")} />;
  }

  return (
    <LandingView
      onGoToApp={() => setScreen("login")}
      onGoToSetup={necesitaSetup ? () => setScreen("setup") : undefined}
    />
  );
}
