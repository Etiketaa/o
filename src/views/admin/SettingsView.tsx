import { useState, useEffect } from "react";
import { Save, Copy, Check, CreditCard, Calendar, Building2, User } from "lucide-react";
import { useToast } from "@/components";
import { usePagosStore, getPrecioPlan } from "@/stores/pagosStore";
import { useTurnosStore } from "@/stores/turnosStore";
import { formatMoney } from "@/lib/utils";

export function SettingsView() {
  const { pushToast } = useToast();
  const { config, loadConfig } = usePagosStore();
  const { alumnos } = useTurnosStore();
  const [diaLimite, setDiaLimite] = useState(10);
  const [cvu, setCvu] = useState("");
  const [alias, setAlias] = useState("");
  const [titular, setTitular] = useState("");
  const [banco, setBanco] = useState("");
  const [copiado, setCopiado] = useState<"cvu" | "alias" | null>(null);

  useEffect(() => {
    loadConfig();
  }, []);

  useEffect(() => {
    if (config) {
      setDiaLimite(config.dia_limite);
      setCvu(config.cvu);
      setAlias(config.alias);
      setTitular(config.titular);
      setBanco(config.banco);
    }
  }, [config]);

  const handleSave = async () => {
    pushToast("Configuración guardada", "success");
  };

  const handleCopy = (text: string, field: "cvu" | "alias") => {
    navigator.clipboard.writeText(text);
    setCopiado(field);
    pushToast(`${field === "cvu" ? "CVU" : "Alias"} copiado`, "success");
    setTimeout(() => setCopiado(null), 2000);
  };

  const alumnosActivos = alumnos.filter((a) => a.estado === "activo").length;
  const totalAlumnos = alumnos.length;

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <span className="text-[11px] tracking-[0.2em] uppercase text-lime mb-2 block font-medium">
            Configuración
          </span>
          <h1 className="font-display text-text-hi text-3xl md:text-4xl tracking-wide">
            Ajustes generales
          </h1>
        </div>

        <div className="flex flex-col gap-6">
          {/* Datos de pago */}
          <div className="bg-surface border border-border rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <CreditCard size={18} className="text-lime" />
              <h2 className="text-text-hi font-semibold text-sm">Datos de pago</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-mono text-text-muted uppercase tracking-wider block mb-2">
                  CVU / CBU
                </label>
                <div className="flex items-center gap-2">
                  <input
                    value={cvu}
                    onChange={(e) => setCvu(e.target.value)}
                    className="flex-1 bg-bg border border-border rounded-lg px-4 py-3 text-sm text-text-hi font-mono focus:outline-none focus:border-lime/40 transition-colors"
                    placeholder="0000000000000000000000"
                  />
                  <button
                    onClick={() => handleCopy(cvu, "cvu")}
                    className="p-3 rounded-lg border border-border hover:border-lime/30 transition-all text-text-muted hover:text-lime"
                    aria-label="Copiar CVU"
                  >
                    {copiado === "cvu" ? <Check size={16} className="text-lime" /> : <Copy size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono text-text-muted uppercase tracking-wider block mb-2">
                  Alias
                </label>
                <div className="flex items-center gap-2">
                  <input
                    value={alias}
                    onChange={(e) => setAlias(e.target.value)}
                    className="flex-1 bg-bg border border-border rounded-lg px-4 py-3 text-sm text-text-hi uppercase font-mono focus:outline-none focus:border-lime/40 transition-colors"
                    placeholder="MIALIAS"
                  />
                  <button
                    onClick={() => handleCopy(alias, "alias")}
                    className="p-3 rounded-lg border border-border hover:border-lime/30 transition-all text-text-muted hover:text-lime"
                    aria-label="Copiar alias"
                  >
                    {copiado === "alias" ? <Check size={16} className="text-lime" /> : <Copy size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono text-text-muted uppercase tracking-wider block mb-2">
                  Titular
                </label>
                <input
                  value={titular}
                  onChange={(e) => setTitular(e.target.value)}
                  className="w-full bg-bg border border-border rounded-lg px-4 py-3 text-sm text-text-hi focus:outline-none focus:border-lime/40 transition-colors"
                  placeholder="Nombre del titular"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono text-text-muted uppercase tracking-wider block mb-2">
                  Banco
                </label>
                <input
                  value={banco}
                  onChange={(e) => setBanco(e.target.value)}
                  className="w-full bg-bg border border-border rounded-lg px-4 py-3 text-sm text-text-hi focus:outline-none focus:border-lime/40 transition-colors"
                  placeholder="Nombre del banco"
                />
              </div>
            </div>
          </div>

          {/* Día límite de pago */}
          <div className="bg-surface border border-border rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <Calendar size={18} className="text-lime" />
              <h2 className="text-text-hi font-semibold text-sm">Fecha límite de pago</h2>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex-1 max-w-xs">
                <label className="text-[10px] font-mono text-text-muted uppercase tracking-wider block mb-2">
                  Día límite mensual
                </label>
                <input
                  type="number"
                  min={1}
                  max={28}
                  value={diaLimite}
                  onChange={(e) => setDiaLimite(Number(e.target.value))}
                  className="w-full bg-bg border border-border rounded-lg px-4 py-3 text-sm text-text-hi font-mono focus:outline-none focus:border-lime/40 transition-colors"
                />
              </div>
              <p className="text-text-muted text-xs">
                Los alumnos tienen hasta el día {diaLimite} de cada mes para abonar.
              </p>
            </div>
          </div>

          {/* Precios por plan */}
          <div className="bg-surface border border-border rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <Building2 size={18} className="text-lime" />
              <h2 className="text-text-hi font-semibold text-sm">Precios por plan</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {(["2x semana", "3x semana", "Full"] as const).map((plan) => (
                <div key={plan} className="bg-bg border border-border rounded-xl p-4">
                  <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider block mb-2">
                    {plan}
                  </span>
                  <span className="font-display text-lime text-2xl tracking-wide block">
                    {formatMoney(getPrecioPlan(plan))}
                  </span>
                  <span className="text-text-muted text-[10px] font-mono">/mes</span>
                </div>
              ))}
            </div>
          </div>

          {/* Resumen */}
          <div className="bg-surface border border-border rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <User size={18} className="text-lime" />
              <h2 className="text-text-hi font-semibold text-sm">Resumen</h2>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-bg border border-border rounded-xl p-4">
                <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider block mb-1">
                  Alumnos activos
                </span>
                <span className="font-display text-lime text-2xl tracking-wide">{alumnosActivos}</span>
              </div>
              <div className="bg-bg border border-border rounded-xl p-4">
                <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider block mb-1">
                  Total alumnos
                </span>
                <span className="font-display text-text-hi text-2xl tracking-wide">{totalAlumnos}</span>
              </div>
            </div>
          </div>

          {/* Save button */}
          <button
            onClick={handleSave}
            className="w-full py-4 rounded-xl text-center font-semibold text-sm bg-lime text-bg hover:shadow-[0_4px_20px_rgba(212,255,61,0.3)] transition-all flex items-center justify-center gap-2"
          >
            <Save size={18} />
            Guardar configuración
          </button>
        </div>
      </div>
    </div>
  );
}
