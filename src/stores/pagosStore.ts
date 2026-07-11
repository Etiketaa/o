import { create } from "zustand";
import type { Pago, PagoConfig, EstadoPago } from "@/types";
import { mockPagos } from "@/lib/mock-data";
import { isMockMode, supabase } from "@/lib/supabase";

interface PagosState {
  pagos: Pago[];
  config: PagoConfig | null;
  loading: boolean;
  loadPagos: () => Promise<void>;
  loadConfig: () => Promise<void>;
  getPagosByAlumno: (alumnoId: string) => Pago[];
  getEstadoPagoAlumno: (alumnoId: string, mes: number, anio: number) => EstadoPago;
  subirComprobante: (pagoId: string, file: File) => Promise<string | null>;
  verificarPago: (pagoId: string, verificado: boolean, notas?: string) => Promise<void>;
  getDiasRestantes: () => number;
  getConfig: () => PagoConfig;
}

const DEFAULT_CONFIG: PagoConfig = {
  id: "1",
  dia_limite: 10,
  monto_base: 0,
  cvu: "0000032160000007890123",
  alias: "OZENTRENAMIENTO",
  titular: "OZ Entrenamiento S.R.L.",
  banco: "Banco Nación",
  activo: true,
  created_at: new Date().toISOString(),
};

const PRECIOS: Record<string, number> = {
  "2x semana": 12000,
  "3x semana": 14000,
  "Full": 16000,
};

export const usePagosStore = create<PagosState>((set, get) => ({
  pagos: isMockMode ? mockPagos : [],
  config: DEFAULT_CONFIG,
  loading: false,

  loadPagos: async () => {
    if (isMockMode) {
      set({ pagos: mockPagos });
      return;
    }
    set({ loading: true });
    const { data } = await supabase
      .from("pagos")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) set({ pagos: data as Pago[] });
    set({ loading: false });
  },

  loadConfig: async () => {
    if (isMockMode) {
      set({ config: DEFAULT_CONFIG });
      return;
    }
    const { data } = await supabase
      .from("pago_config")
      .select("*")
      .eq("activo", true)
      .single();
    if (data) set({ config: data as PagoConfig });
  },

  getPagosByAlumno: (alumnoId: string) => {
    const { pagos } = get();
    return pagos.filter((p) => p.alumno_id === alumnoId);
  },

  getEstadoPagoAlumno: (alumnoId: string, mes: number, anio: number): EstadoPago => {
    const { pagos } = get();
    const pago = pagos.find(
      (p) => p.alumno_id === alumnoId && p.mes_pago === mes && p.anio_pago === anio
    );
    
    if (!pago) return "no_registrado";
    if (pago.estado === "pagado") return "pagado";
    if (pago.comprobante_url) return "verificando";
    return "pendiente";
  },

  subirComprobante: async (pagoId: string, file: File): Promise<string | null> => {
    if (isMockMode) return null;

    const fileExt = file.name.split(".").pop();
    const filePath = `comprobantes/${pagoId}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("comprobantes")
      .upload(filePath, file);

    if (uploadError) {
      console.error("Error subiendo comprobante:", uploadError);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from("comprobantes")
      .getPublicUrl(filePath);

    const comprobanteUrl = urlData.publicUrl;
    const comprobanteTipo = file.type.startsWith("image/") ? "imagen" : "pdf";

    await supabase
      .from("pagos")
      .update({
        comprobante_url: comprobanteUrl,
        comprobante_tipo: comprobanteTipo,
        comprobante_nombre: file.name,
      })
      .eq("id", pagoId);

    const { pagos } = get();
    set({
      pagos: pagos.map((p) =>
        p.id === pagoId
          ? {
              ...p,
              comprobante_url: comprobanteUrl,
              comprobante_tipo: comprobanteTipo,
              comprobante_nombre: file.name,
            }
          : p
      ),
    });

    return comprobanteUrl;
  },

  verificarPago: async (pagoId: string, verificado: boolean, notas?: string) => {
    if (isMockMode) return;

    await supabase
      .from("pagos")
      .update({
        verificado,
        verificado_at: new Date().toISOString(),
        notas_admin: notas,
        estado: verificado ? "pagado" : "pendiente",
      })
      .eq("id", pagoId);

    const { pagos } = get();
    set({
      pagos: pagos.map((p) =>
        p.id === pagoId
          ? {
              ...p,
              verificado,
              verificado_at: new Date().toISOString(),
              notas_admin: notas,
              estado: verificado ? ("pagado" as const) : ("pendiente" as const),
            }
          : p
      ),
    });
  },

  getDiasRestantes: () => {
    const { config } = get();
    const hoy = new Date();
    const diaLimite = config?.dia_limite || 10;
    
    if (hoy.getDate() > diaLimite) {
      const proximoMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 1);
      const fechaLimite = new Date(proximoMes.getFullYear(), proximoMes.getMonth(), diaLimite);
      const diff = Math.ceil((fechaLimite.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
      return diff;
    }
    
    const fechaLimite = new Date(hoy.getFullYear(), hoy.getMonth(), diaLimite);
    return Math.ceil((fechaLimite.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
  },

  getConfig: () => {
    return get().config || DEFAULT_CONFIG;
  },
}));

export function getPrecioPlan(plan: string): number {
  return PRECIOS[plan] || 0;
}

export function getMesActual(): number {
  return new Date().getMonth() + 1;
}

export function getAnioActual(): number {
  return new Date().getFullYear();
}
