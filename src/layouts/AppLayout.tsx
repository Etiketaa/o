import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { Sidebar } from "@/components/Sidebar";
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
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
];

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user, loading } = useAuthStore();

  if (loading) return <LoadingScreen />;

  const navItems = user?.role === "admin" ? ADMIN_NAV : ALUMNO_NAV;

  return (
    <div className="w-full h-full flex bg-bg">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex">
        <Sidebar items={navItems} />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Mobile header */}
        <div className="lg:hidden">
          <Header />
        </div>

        <div className="flex-1 min-h-0 relative overflow-hidden">
          {children}
        </div>

        {/* Mobile bottom nav */}
        <div className="lg:hidden">
          <BottomNav items={navItems} />
        </div>
      </div>
    </div>
  );
}
