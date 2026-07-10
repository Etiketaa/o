import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { LoadingScreen } from "@/components/LoadingScreen";
import { useAuthStore } from "@/stores/authStore";
import { Calendar, CalendarCheck, User, Users, ClipboardCheck, LayoutDashboard, Wallet } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

const ALUMNO_NAV: NavItem[] = [
  { id: "reservar", label: "Reservar", icon: Calendar },
  { id: "mis-turnos", label: "Mis turnos", icon: CalendarCheck },
  { id: "perfil", label: "Perfil", icon: User },
];

const ADMIN_NAV: NavItem[] = [
  { id: "agenda", label: "Agenda", icon: Calendar },
  { id: "alumnos", label: "Alumnos", icon: Users },
  { id: "control", label: "Control", icon: ClipboardCheck },
  { id: "pagos", label: "Pagos", icon: Wallet },
  { id: "dashboard", label: "Stats", icon: LayoutDashboard },
];

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user, loading } = useAuthStore();

  if (loading) return <LoadingScreen />;

  const navItems = user?.role === "admin" ? ADMIN_NAV : ALUMNO_NAV;

  return (
    <div
      className="w-full h-full flex flex-col mx-auto overflow-hidden"
      style={{
        maxWidth: 480,
        backgroundColor: "var(--color-bg)",
        fontFamily: "var(--font-body)",
      }}
    >
      <Header />
      <div className="flex-1 min-h-0 relative overflow-hidden">
        {children}
      </div>
      <BottomNav items={navItems} />
    </div>
  );
}
