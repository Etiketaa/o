import { User, CreditCard, Calendar, ChevronRight } from "lucide-react";
import { COLORS, FONTS, formatMoney, formatDate } from "@/lib/utils";
import { Avatar, StatusChip } from "@/components";
import { NotificationPrompt } from "@/components/NotificationPrompt";
import { useAuthStore } from "@/stores/authStore";
import { mockPagos } from "@/lib/mock-data";

export function PerfilView() {
  const { user } = useAuthStore();
  if (!user) return null;

  const userPagos = mockPagos.filter((p) => p.alumno_id === user.id);

  return (
    <div className="flex-1 overflow-y-auto px-5 py-6 flex flex-col gap-5">
      <div className="flex items-center gap-4">
        <Avatar nombre={user.nombre} size="lg" />
        <div>
          <h3 style={{ fontFamily: FONTS.display, color: COLORS.textHi, fontSize: 24, letterSpacing: 1 }}>
            {user.nombre}
          </h3>
          <StatusChip estado={user.estado} />
        </div>
      </div>

      <div className="rounded-lg p-4 flex flex-col gap-3" style={{ backgroundColor: COLORS.surface, border: `1px solid ${COLORS.border}` }}>
        <div className="flex items-center justify-between">
          <span style={{ fontFamily: FONTS.body, color: COLORS.textMuted }} className="text-sm">Email</span>
          <span style={{ fontFamily: FONTS.mono, color: COLORS.textHi }} className="text-xs">{user.email}</span>
        </div>
        <div className="flex items-center justify-between">
          <span style={{ fontFamily: FONTS.body, color: COLORS.textMuted }} className="text-sm">Teléfono</span>
          <span style={{ fontFamily: FONTS.mono, color: COLORS.textHi }} className="text-xs">{user.telefono}</span>
        </div>
        <div className="flex items-center justify-between">
          <span style={{ fontFamily: FONTS.body, color: COLORS.textMuted }} className="text-sm">Plan</span>
          <span style={{ fontFamily: FONTS.mono, color: COLORS.textHi }} className="text-xs">{user.plan}</span>
        </div>
      </div>

      <NotificationPrompt />

      <div className="rounded-lg p-4" style={{ backgroundColor: COLORS.surfaceHi, border: `1px solid ${COLORS.border}` }}>
        <div className="flex items-center gap-2 mb-3">
          <CreditCard size={16} color={COLORS.lime} />
          <span style={{ fontFamily: FONTS.body, fontWeight: 600, color: COLORS.textHi }} className="text-sm">
            Últimos pagos
          </span>
        </div>
        {userPagos.length === 0 ? (
          <p style={{ fontFamily: FONTS.body, color: COLORS.textMuted }} className="text-xs">
            Sin pagos registrados
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {userPagos.slice(0, 3).map((p) => (
              <div key={p.id} className="flex items-center justify-between py-2" style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                <div className="flex flex-col">
                  <span style={{ fontFamily: FONTS.body, color: COLORS.textHi }} className="text-xs">{p.descripcion}</span>
                  <span style={{ fontFamily: FONTS.mono, color: COLORS.textMuted }} className="text-[10px]">{formatDate(p.fecha)}</span>
                </div>
                <StatusChip estado={p.estado} size="sm" />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-lg p-4" style={{ backgroundColor: COLORS.surfaceHi, border: `1px solid ${COLORS.border}` }}>
        <p style={{ fontFamily: FONTS.body, color: COLORS.textMuted }} className="text-xs">
          Historial completo de asistencias y pagos disponible próximamente.
        </p>
      </div>
    </div>
  );
}
