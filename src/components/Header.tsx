import { Dumbbell, Clock, LogOut } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";

export function Header() {
  const { user, logout } = useAuthStore();

  return (
    <div className="flex items-center justify-between px-5 pt-5 pb-4">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-lime flex items-center justify-center">
          <Dumbbell size={18} className="text-bg" />
        </div>
        <div className="flex flex-col leading-none">
          <span className="font-display text-text-hi text-lg tracking-[0.1em]">
            OZ
          </span>
          <span className="text-[8px] tracking-[0.2em] uppercase text-text-muted">
            ENTRENAMIENTO
          </span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-1.5 text-text-muted">
          <Clock size={12} />
          <span className="text-[10px] tracking-wider uppercase">Ingeniero White</span>
        </div>
        {user && (
          <button
            onClick={logout}
            aria-label="Cerrar sesión"
            className="p-2 rounded-lg text-text-muted hover:text-text-hi hover:bg-surface transition-all"
            title="Cerrar sesión"
          >
            <LogOut size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
