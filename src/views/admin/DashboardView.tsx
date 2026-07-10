import { useMemo } from "react";
import { Users, Calendar, TrendingUp, DollarSign } from "lucide-react";
import { COLORS, FONTS, formatMoney } from "@/lib/utils";
import { useTurnosStore } from "@/stores/turnosStore";
import { mockPagos } from "@/lib/mock-data";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from "recharts";

export function DashboardView() {
  const { turnos, alumnos } = useTurnosStore();

  const stats = useMemo(() => {
    const alumnosActivos = alumnos.filter((a) => a.estado === "activo").length;
    const ingresosMes = mockPagos.filter((p) => p.estado === "pagado").reduce((s, p) => s + p.monto, 0);

    let turnosHoy = 0;
    let asistentesHoy = 0;
    for (const dia of Object.values(turnos)) {
      for (const t of dia) {
        turnosHoy++;
        asistentesHoy += t.ocupados;
      }
    }

    return { alumnosActivos, totalAlumnos: alumnos.length, turnosHoy, asistentesHoy, ingresosMes };
  }, [turnos, alumnos]);

  const chartData = useMemo(() => {
    return ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((dia) => {
      const dayTurnos = turnos[dia as keyof typeof turnos] || [];
      return {
        name: dia,
        turnos: dayTurnos.length,
        asistentes: dayTurnos.reduce((s, t) => s + t.ocupados, 0),
      };
    });
  }, [turnos]);

  const cards = [
    { label: "Alumnos activos", value: stats.alumnosActivos, icon: Users, color: COLORS.lime },
    { label: "Turnos / semana", value: stats.turnosHoy, icon: Calendar, color: COLORS.steel },
    { label: "Asistentes / semana", value: stats.asistentesHoy, icon: TrendingUp, color: COLORS.lime },
    { label: "Ingresos mes", value: formatMoney(stats.ingresosMes), icon: DollarSign, color: COLORS.lime },
  ];

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div
              key={c.label}
              className="rounded-lg p-4 flex flex-col gap-2"
              style={{ backgroundColor: COLORS.surface, border: `1px solid ${COLORS.border}` }}
            >
              <Icon size={18} color={c.color} />
              <span style={{ fontFamily: FONTS.display, color: COLORS.textHi, fontSize: 28, letterSpacing: 1 }}>
                {c.value}
              </span>
              <span style={{ fontFamily: FONTS.mono, color: COLORS.textMuted }} className="text-[10px] uppercase">
                {c.label}
              </span>
            </div>
          );
        })}
      </div>

      <div className="rounded-lg p-4" style={{ backgroundColor: COLORS.surface, border: `1px solid ${COLORS.border}` }}>
        <span style={{ fontFamily: FONTS.mono, color: COLORS.textMuted }} className="text-xs uppercase block mb-3">
          Asistencia semanal
        </span>
        <div style={{ height: 180 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barSize={20}>
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: COLORS.textMuted, fontSize: 11, fontFamily: FONTS.mono }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: COLORS.textMuted, fontSize: 10, fontFamily: FONTS.mono }}
                width={30}
              />
              <Bar dataKey="asistentes" radius={[4, 4, 0, 0]}>
                {chartData.map((_, i) => (
                  <Cell key={i} fill={i % 2 === 0 ? COLORS.lime : COLORS.limeDim} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-lg p-4" style={{ backgroundColor: COLORS.surfaceHi, border: `1px solid ${COLORS.border}` }}>
        <p style={{ fontFamily: FONTS.body, color: COLORS.textMuted }} className="text-xs">
          {stats.totalAlumnos - stats.alumnosActivos} alumnos con plan vencido. Dashboard completo con métricas avanzadas disponible próximamente.
        </p>
      </div>
    </div>
  );
}
