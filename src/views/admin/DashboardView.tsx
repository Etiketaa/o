import { useMemo, useEffect } from "react";
import { Users, Calendar, TrendingUp, DollarSign, ArrowUpRight, ArrowDownRight, Clock, Zap, Activity, Award } from "lucide-react";
import { formatMoney } from "@/lib/utils";
import { useTurnosStore } from "@/stores/turnosStore";
import { usePagosStore } from "@/stores/pagosStore";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip } from "recharts";

function StatCard({ label, value, icon: Icon, trend, trendLabel, accent }: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  trend?: "up" | "down";
  trendLabel?: string;
  accent?: boolean;
}) {
  return (
    <div className={`relative rounded-2xl p-5 overflow-hidden transition-all hover:scale-[1.02] ${
      accent ? "bg-lime text-bg" : "bg-surface border border-border"
    }`}>
      {accent && <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-8 translate-x-8" />}
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            accent ? "bg-bg/20" : "bg-lime/10"
          }`}>
            <Icon size={18} className={accent ? "text-bg" : "text-lime"} />
          </div>
          {trend && trendLabel && (
            <div className={`flex items-center gap-1 text-xs font-medium ${
              trend === "up" ? "text-lime" : "text-danger"
            }`}>
              {trend === "up" ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              {trendLabel}
            </div>
          )}
        </div>
        <div className={`font-display text-3xl sm:text-4xl tracking-wide mb-1 overflow-hidden ${accent ? "text-bg" : "text-text-hi"}`}>
          {value}
        </div>
        <div className={`text-[11px] font-mono uppercase tracking-wider ${
          accent ? "text-bg/70" : "text-text-muted"
        }`}>
          {label}
        </div>
      </div>
    </div>
  );
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-bg border border-border rounded-lg px-3 py-2 shadow-xl">
      <p className="text-text-hi text-sm font-medium">{label}</p>
      <p className="text-lime text-xs font-mono">{payload[0].value} asistentes</p>
    </div>
  );
}

export function DashboardView() {
  const { turnos, alumnos } = useTurnosStore();
  const { pagos, loadPagos } = usePagosStore();

  useEffect(() => {
    loadPagos();
  }, []);

  const stats = useMemo(() => {
    const alumnosActivos = alumnos.filter((a) => a.estado === "activo").length;
    const alumnosVencidos = alumnos.filter((a) => a.estado === "vencido").length;

    const hoy = new Date();
    const mesActual = hoy.getMonth() + 1;
    const anioActual = hoy.getFullYear();

    const ingresosMes = pagos
      .filter((p) => p.estado === "pagado" && p.mes_pago === mesActual && p.anio_pago === anioActual)
      .reduce((s, p) => s + p.monto, 0);
    const ingresosPendientes = pagos
      .filter((p) => p.estado === "pendiente" && p.mes_pago === mesActual && p.anio_pago === anioActual)
      .reduce((s, p) => s + p.monto, 0);

    let turnosSemana = 0;
    let asistentesSemana = 0;
    for (const dia of Object.values(turnos)) {
      for (const t of dia) {
        turnosSemana++;
        asistentesSemana += t.ocupados;
      }
    }

    const capacidadTotal = Object.values(turnos).flat().reduce((s, t) => s + t.cupo, 0);
    const ocupacionPromedio = capacidadTotal > 0 ? Math.round((asistentesSemana / capacidadTotal) * 100) : 0;

    return { alumnosActivos, alumnosVencidos, totalAlumnos: alumnos.length, turnosSemana, asistentesSemana, ingresosMes, ingresosPendientes, ocupacionPromedio };
  }, [turnos, alumnos, pagos]);

  const chartData = useMemo(() => {
    return ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((dia) => {
      const dayTurnos = turnos[dia as keyof typeof turnos] || [];
      return {
        name: dia,
        asistentes: dayTurnos.reduce((s, t) => s + t.ocupados, 0),
        capacidad: dayTurnos.reduce((s, t) => s + t.cupo, 0),
      };
    });
  }, [turnos]);

  const topActividades = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const dia of Object.values(turnos)) {
      for (const t of dia) {
        counts[t.actividad] = (counts[t.actividad] || 0) + t.ocupados;
      }
    }
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4);
  }, [turnos]);

  const topAlumnos = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const dia of Object.values(turnos)) {
      for (const t of dia) {
        for (const id of t.inscritos) {
          counts[id] = (counts[id] || 0) + 1;
        }
      }
    }
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [turnos]);

  const alumnosById = Object.fromEntries(alumnos.map((a) => [a.id, a]));

  const proximosTurnos = useMemo(() => {
    const todos = Object.values(turnos).flat();
    return todos.slice(0, 5).sort((a, b) => a.hora.localeCompare(b.hora));
  }, [turnos]);

  const ultimosPagos = pagos
    .filter((p) => p.estado === "pagado")
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
    .slice(0, 4);

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-lime animate-pulse" />
              <span className="text-[11px] tracking-[0.2em] uppercase text-lime font-medium">
                Vista general
              </span>
            </div>
            <h1 className="font-display text-text-hi text-3xl md:text-4xl lg:text-5xl tracking-wide">
              Dashboard
            </h1>
          </div>
          <div className="flex items-center gap-2 text-text-muted text-sm">
            <Clock size={14} />
            <span className="font-mono text-xs">Última actualización: ahora</span>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Alumnos activos"
            value={stats.alumnosActivos}
            icon={Users}
            trend="up"
            trendLabel={`+${stats.totalAlumnos} total`}
          />
          <StatCard
            label="Turnos / semana"
            value={stats.turnosSemana}
            icon={Calendar}
          />
          <StatCard
            label="Asistentes / semana"
            value={stats.asistentesSemana}
            icon={TrendingUp}
            trend="up"
            trendLabel={`${stats.ocupacionPromedio}% ocupación`}
          />
          <StatCard
            label="Ingresos mes"
            value={formatMoney(stats.ingresosMes)}
            icon={DollarSign}
            accent
          />
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart - 2 columns */}
          <div className="lg:col-span-2 bg-surface border border-border rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-text-hi font-semibold text-sm mb-1">Asistencia semanal</h3>
                <p className="text-text-muted text-xs">Asistentes por día de la semana</p>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-lime" />
                  <span className="text-text-muted">Asistentes</span>
                </div>
              </div>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} barSize={32} barGap={8}>
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "var(--color-text-muted)", fontSize: 11, fontFamily: "var(--font-mono)" }}
                    dy={8}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "var(--color-text-muted)", fontSize: 10, fontFamily: "var(--font-mono)" }}
                    width={35}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={false} />
                  <Bar dataKey="asistentes" radius={[6, 6, 0, 0]}>
                    {chartData.map((_, i) => (
                      <Cell key={i} fill={i % 2 === 0 ? "var(--color-lime)" : "var(--color-lime-dim)"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Right sidebar */}
          <div className="flex flex-col gap-6">
            {/* Quick stats */}
            <div className="bg-surface border border-border rounded-2xl p-6">
              <h3 className="text-text-hi font-semibold text-sm mb-4">Resumen rápido</h3>
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between py-3 border-b border-border">
                  <span className="text-text-muted text-sm">Alumnos activos</span>
                  <span className="text-lime font-mono font-bold text-sm">{stats.alumnosActivos}</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-border">
                  <span className="text-text-muted text-sm">Planes vencidos</span>
                  <span className="text-danger font-mono font-bold text-sm">{stats.alumnosVencidos}</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-border">
                  <span className="text-text-muted text-sm">Ocupación promedio</span>
                  <span className="text-lime font-mono font-bold text-sm">{stats.ocupacionPromedio}%</span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-text-muted text-sm">Pendiente cobro</span>
                  <span className="text-steel font-mono font-bold text-sm">{formatMoney(stats.ingresosPendientes)}</span>
                </div>
              </div>
            </div>

            {/* Top actividades */}
            <div className="bg-surface border border-border rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Activity size={14} className="text-lime" />
                <h3 className="text-text-hi font-semibold text-sm">Top actividades</h3>
              </div>
              <div className="flex flex-col gap-2">
                {topActividades.map(([actividad, count], i) => (
                  <div key={actividad} className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-bg border border-border">
                    <div className="flex items-center gap-3">
                      <span className="text-lime font-mono text-xs font-bold w-4">{i + 1}</span>
                      <span className="text-text-hi text-xs font-medium">{actividad}</span>
                    </div>
                    <span className="text-text-muted text-[10px] font-mono">{count} inscritos</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top alumnos */}
            <div className="bg-surface border border-border rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Award size={14} className="text-lime" />
                <h3 className="text-text-hi font-semibold text-sm">Top alumnos</h3>
              </div>
              <div className="flex flex-col gap-2">
                {topAlumnos.map(([id, count], i) => {
                  const al = alumnosById[id];
                  if (!al) return null;
                  return (
                    <div key={id} className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-bg border border-border">
                      <div className="flex items-center gap-3">
                        <span className="text-lime font-mono text-xs font-bold w-4">{i + 1}</span>
                        <span className="text-text-hi text-xs font-medium">{al.nombre}</span>
                      </div>
                      <span className="text-text-muted text-[10px] font-mono">{count} turnos</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Últimos pagos */}
          <div className="bg-surface border border-border rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-text-hi font-semibold text-sm">Últimos pagos</h3>
              <span className="text-lime text-xs font-mono">{ultimosPagos.length} registros</span>
            </div>
            <div className="flex flex-col gap-2">
              {ultimosPagos.map((p) => {
                const al = alumnosById[p.alumno_id];
                return (
                  <div key={p.id} className="flex items-center justify-between py-3 px-3 rounded-lg bg-bg border border-border">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-lime/20 flex items-center justify-center">
                        <span className="text-lime text-xs font-bold">{al?.nombre?.charAt(0) || "?"}</span>
                      </div>
                      <div>
                        <span className="text-text-hi text-sm font-medium block">{al?.nombre || "N/A"}</span>
                        <span className="text-text-muted text-[10px] font-mono">{p.descripcion}</span>
                      </div>
                    </div>
                    <span className="text-text-hi text-sm font-mono font-bold">{formatMoney(p.monto)}</span>
                  </div>
                );
              })}
              {ultimosPagos.length === 0 && (
                <p className="text-text-muted text-sm text-center py-4">Sin pagos registrados</p>
              )}
            </div>
          </div>

          {/* Alumnos con plan vencido */}
          <div className="bg-surface border border-border rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-text-hi font-semibold text-sm">Planes vencidos</h3>
              <span className="text-danger text-xs font-mono">{stats.alumnosVencidos} alumnos</span>
            </div>
            <div className="flex flex-col gap-2">
              {alumnos.filter((a) => a.estado === "vencido").slice(0, 5).map((al) => (
                <div key={al.id} className="flex items-center justify-between py-3 px-3 rounded-lg bg-bg border border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-danger/20 flex items-center justify-center">
                      <span className="text-danger text-xs font-bold">{al.nombre.charAt(0)}</span>
                    </div>
                    <div>
                      <span className="text-text-hi text-sm font-medium block">{al.nombre}</span>
                      <span className="text-text-muted text-[10px] font-mono">Plan {al.plan}</span>
                    </div>
                  </div>
                  <span className="text-danger text-[10px] font-mono px-2 py-1 rounded-full border border-danger/30">
                    VENCIDO
                  </span>
                </div>
              ))}
              {alumnos.filter((a) => a.estado === "vencido").length === 0 && (
                <p className="text-text-muted text-sm text-center py-4">Sin planes vencidos</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
