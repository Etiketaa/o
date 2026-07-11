import { CreditCard } from "lucide-react";
import { formatMoney, formatDate } from "@/lib/utils";
import { Avatar, StatusChip } from "@/components";
import { NotificationPrompt } from "@/components/NotificationPrompt";
import { useAuthStore } from "@/stores/authStore";
import { mockPagos } from "@/lib/mock-data";

export function PerfilView() {
  const { user } = useAuthStore();
  if (!user) return null;

  const userPagos = mockPagos.filter((p) => p.alumno_id === user.id);

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <span className="text-[11px] tracking-[0.2em] uppercase text-lime mb-2 block font-medium">
            Perfil
          </span>
          <h2 className="font-display text-text-hi text-2xl tracking-wide">
            Tu información
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile card */}
          <div className="lg:col-span-1">
            <div className="bg-surface border border-border rounded-xl p-6">
              <div className="flex items-center gap-4 mb-6">
                <Avatar nombre={user.nombre} size="lg" />
                <div>
                  <h3 className="font-display text-text-hi text-xl tracking-wide">
                    {user.nombre}
                  </h3>
                  <StatusChip estado={user.estado} />
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-text-muted text-sm">Email</span>
                  <span className="text-text-hi text-sm font-mono">{user.email}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-text-muted text-sm">Teléfono</span>
                  <span className="text-text-hi text-sm font-mono">{user.telefono}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-text-muted text-sm">Plan</span>
                  <span className="text-text-hi text-sm font-mono">{user.plan}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notifications + Payments */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <NotificationPrompt />

            <div className="bg-surface border border-border rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard size={18} className="text-lime" />
                <span className="font-body font-semibold text-text-hi text-sm">
                  Últimos pagos
                </span>
              </div>
              {userPagos.length === 0 ? (
                <p className="text-text-muted text-sm">
                  Sin pagos registrados
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {userPagos.slice(0, 5).map((p) => (
                    <div key={p.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                      <div className="flex flex-col">
                        <span className="text-text-hi text-sm">{p.descripcion}</span>
                        <span className="text-[10px] font-mono text-text-muted">{formatDate(p.fecha)}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-text-hi text-sm font-mono">{formatMoney(p.monto)}</span>
                        <StatusChip estado={p.estado} size="sm" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
