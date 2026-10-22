import { create } from "zustand";
import type { Pago, PagoConfig, EstadoPago } from "@/types";
import { db, getMotor } from "@/lib/db";
import { supabase } from "@/lib/supabase";

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

export const DEFAULT_CONFIG_PAGO: PagoConfig = {
  id: "unica",
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
  Full: 16000,
};

/** Convierte un archivo en data URL para guardarlo junto al pago (modo local). */
function leerComoDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const lector = new FileReader();
    lector.onload = () => resolve(String(lector.result));
    lector.onerror = () => reject(lector.error);
    lector.readAsDataURL(file);
  });
}

export const usePagosStore = create<PagosState>((set, get) => ({
  pagos: [],
  config: DEFAULT_CONFIG_PAGO,
  loading: false,

  loadPagos: async () => {
    set({ loading: true });
    try {
      const [pagos, config] = await Promise.all([db.listPagos(), db.getPagoConfig()]);
      set({ pagos, config: config ?? DEFAULT_CONFIG_PAGO });
    } finally {
      set({ loading: false });
    }
  },

  loadConfig: async () => {
    const config = await db.getPagoConfig();
    set({ config: config ?? DEFAULT_CONFIG_PAGO });
  },

  getPagosByAlumno: (alumnoId) => get().pagos.filter((p) => p.alumno_id === alumnoId),

  getEstadoPagoAlumno: (alumnoId, mes, anio) => {
    const pago = get().pagos.find(
      (p) => p.alumno_id === alumnoId && p.mes_pago === mes && p.anio_pago === anio,
    );
    if (!pago) return "no_registrado";
    if (pago.estado === "pagado") return "pagado";
    if (pago.comprobante_url) return "verificando";
    return "pendiente";
  },

  subirComprobante: async (pagoId, file) => {
    const tipo = file.type.startsWith("image/") ? "imagen" : "pdf";
    let comprobanteUrl: string;

    if (getMotor() === "supabase") {
      const extension = file.name.split(".").pop();
      const ruta = `comprobantes/${pagoId}/${Date.now()}.${extension}`;
      const { error } = await supabase.storage.from("comprobantes").upload(ruta, file);
      if (error) {
        console.error("Error subiendo comprobante:", error);
        return null;
      }
      comprobanteUrl = supabase.storage.from("comprobantes").getPublicUrl(ruta).data.publicUrl;
    } else {
      try {
        comprobanteUrl = await leerComoDataURL(file);
      } catch (error) {
        console.error("Error leyendo comprobante:", error);
        return null;
      }
    }

    const pago = get().pagos.find((p) => p.id === pagoId);
    if (!pago) return comprobanteUrl;

    const actualizado: Pago = {
      ...pago,
      comprobante_url: comprobanteUrl,
      comprobante_tipo: tipo,
      comprobante_nombre: file.name,
    };
    await db.savePago(actualizado);
    set((state) => ({ pagos: state.pagos.map((p) => (p.id === pagoId ? actualizado : p)) }));

    return comprobanteUrl;
  },

  verificarPago: async (pagoId, verificado, notas) => {
    const pago = get().pagos.find((p) => p.id === pagoId);
    if (!pago) return;

    const actualizado: Pago = {
      ...pago,
      verificado,
      verificado_at: new Date().toISOString(),
      notas_admin: notas,
      estado: verificado ? "pagado" : "pendiente",
    };
    await db.savePago(actualizado);
    set((state) => ({ pagos: state.pagos.map((p) => (p.id === pagoId ? actualizado : p)) }));
  },

  getDiasRestantes: () => {
    const diaLimite = get().config?.dia_limite || 10;
    const hoy = new Date();
    if (hoy.getDate() > diaLimite) {
      const proximoMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 1);
      const limite = new Date(proximoMes.getFullYear(), proximoMes.getMonth(), diaLimite);
      return Math.ceil((limite.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
    }
    const limite = new Date(hoy.getFullYear(), hoy.getMonth(), diaLimite);
    return Math.ceil((limite.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
  },

  getConfig: () => get().config ?? DEFAULT_CONFIG_PAGO,
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
