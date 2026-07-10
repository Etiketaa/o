import { Bell, BellOff } from "lucide-react";
import { COLORS, FONTS } from "@/lib/utils";
import { useNotifications } from "@/hooks/useNotifications";
import { useAuthStore } from "@/stores/authStore";

export function NotificationPrompt() {
  const { user } = useAuthStore();
  const { supported, permission, subscribe, unsubscribe } = useNotifications(user?.id);

  if (!supported || !user) return null;

  if (permission === "granted") {
    return (
      <button
        onClick={unsubscribe}
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-colors"
        style={{
          fontFamily: FONTS.mono,
          color: COLORS.lime,
          border: `1px solid ${COLORS.limeDim}`,
          backgroundColor: "transparent",
        }}
      >
        <BellOff size={14} />
        NOTIFICACIONES ACTIVAS
      </button>
    );
  }

  if (permission === "denied") return null;

  return (
    <button
      onClick={subscribe}
      className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-colors"
      style={{
        fontFamily: FONTS.mono,
        color: COLORS.textMuted,
        border: `1px solid ${COLORS.border}`,
        backgroundColor: COLORS.surface,
      }}
    >
      <Bell size={14} />
      ACTIVAR NOTIFICACIONES
    </button>
  );
}
