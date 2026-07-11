import { Dumbbell, LogOut } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { useUIStore } from "@/stores/uiStore";
import type { LucideIcon } from "lucide-react";

interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface SidebarProps {
  items: NavItem[];
}

export function Sidebar({ items }: SidebarProps) {
  const { user, logout } = useAuthStore();
  const { activeTab, setActiveTab } = useUIStore();

  return (
    <div className="w-64 h-full bg-surface border-r border-border flex flex-col">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-lime flex items-center justify-center">
            <Dumbbell size={20} className="text-bg" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-display text-text-hi text-xl tracking-[0.1em]">
              OZ
            </span>
            <span className="text-[9px] tracking-[0.25em] uppercase text-text-muted">
              ENTRENAMIENTO
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {items.map((item) => {
          const Icon = item.icon;
          const active = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-left ${
                active
                  ? "bg-lime/10 text-lime"
                  : "text-text-muted hover:text-text-hi hover:bg-surface-hi"
              }`}
            >
              <Icon size={18} strokeWidth={active ? 2.2 : 1.8} />
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* User info */}
      <div className="px-4 py-4 border-t border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-full bg-lime/20 flex items-center justify-center shrink-0">
              <span className="text-lime text-xs font-bold">
                {user?.nombre?.charAt(0) || "U"}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-text-hi text-sm font-medium truncate">
                {user?.nombre || "Usuario"}
              </p>
              <p className="text-text-muted text-[10px] uppercase tracking-wider">
                {user?.role === "admin" ? "Admin" : "Alumno"}
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            aria-label="Cerrar sesión"
            className="p-2 rounded-lg text-text-muted hover:text-text-hi hover:bg-surface-hi transition-all"
            title="Cerrar sesión"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
