import { Dumbbell, Clock, LogOut } from "lucide-react";
import { COLORS, FONTS } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";

export function Header() {
  const { user, logout } = useAuthStore();

  return (
    <div className="flex items-center justify-between px-4 sm:px-5 pt-4 sm:pt-5 pb-3">
      <div className="flex items-center gap-2">
        <Dumbbell size={20} color={COLORS.lime} />
        <span style={{ fontFamily: FONTS.display, color: COLORS.textHi, fontSize: 22, letterSpacing: 1 }}>
          TU GYM
        </span>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1" style={{ color: COLORS.textMuted }}>
          <Clock size={14} />
          <span style={{ fontFamily: FONTS.mono }} className="text-xs">Ingeniero White</span>
        </div>
        {user && (
          <button
            onClick={logout}
            aria-label="Cerrar sesión"
            className="p-1.5 rounded-lg transition-colors hover:bg-[var(--color-surface-hi)] focus:outline-none focus-visible:ring-2 focus-visible:ring-lime"
            style={{ color: COLORS.textMuted }}
            title="Cerrar sesión"
          >
            <LogOut size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
