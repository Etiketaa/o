import type { Inscripcion, Profile, Sesion } from "@/types";
import { esDelMesActual, instanteSesion } from "@/lib/fechas";
import { horaAMinutos } from "@/lib/horarios";

export type Nivel = "acero" | "plata" | "platino" | "diamante";

export interface NivelInfo {
  clave: Nivel;
  nombre: string;
  minConcurrencia: number;
  descripcion: string;
}

export const NIVELES: NivelInfo[] = [
  {
    clave: "acero",
    nombre: "ACERO",
    minConcurrencia: 0,
    descripcion: "Arrancá tu racha y subí de nivel.",
  },
  { clave: "plata", nombre: "PLATA", minConcurrencia: 50, descripcion: "Vas a la mitad del camino." },
  { clave: "platino", nombre: "PLATINO", minConcurrencia: 75, descripcion: "Constante de verdad." },
  { clave: "diamante", nombre: "DIAMANTE", minConcurrencia: 90, descripcion: "Faltan dos sesiones para el nivel máximo." },
];

export type TipoInsignia = "sesiones" | "racha" | "puntaje" | "madrugador" | "nocturno" | "mes" | "semana";

export interface InsigniaDef {
  clave: string;
  nombre: string;
  descripcion: string;
  icono: string;
  tipo: TipoInsignia;
  meta: number;
}

export interface Insignia extends InsigniaDef {
  obtenida: boolean;
  progreso: number;
}

export const CATALOGO_INSIGNIAS: InsigniaDef[] = [
  {
    clave: "primera_sesion",
    nombre: "PRIMERA SESIÓN",
    descripcion: "Completaste tu primer turno.",
    icono: "Sparkles",
    tipo: "sesiones",
    meta: 1,
  },
  {
    clave: "diez_sesiones",
    nombre: "LA DECENA",
    descripcion: "10 turnos completados.",
    icono: "Medal",
    tipo: "sesiones",
    meta: 10,
  },
  {
    clave: "veinticinco_sesiones",
    nombre: "VEINTICINCO",
    descripcion: "25 turnos completados.",
    icono: "Trophy",
    tipo: "sesiones",
    meta: 25,
  },
  {
    clave: "cincuenta_sesiones",
    nombre: "MEDIO CENTENAR",
    descripcion: "50 turnos completados.",
    icono: "Crown",
    tipo: "sesiones",
    meta: 50,
  },
  {
    clave: "racha_5",
    nombre: "EN RACHA",
    descripcion: "5 turnos seguidos sin fallar.",
    icono: "Flame",
    tipo: "racha",
    meta: 5,
  },
  {
    clave: "racha_10",
    nombre: "RACHADO",
    descripcion: "10 turnos seguidos sin fallar.",
    icono: "Zap",
    tipo: "racha",
    meta: 10,
  },
  {
    clave: "puntaje_75",
    nombre: "CONSTANTE",
    descripcion: "75% de concurrencia.",
    icono: "ShieldCheck",
    tipo: "puntaje",
    meta: 75,
  },
  {
    clave: "puntaje_90",
    nombre: "MÁQUINA",
    descripcion: "90% de concurrencia.",
    icono: "Target",
    tipo: "puntaje",
    meta: 90,
  },
  {
    clave: "puntaje_100",
    nombre: "PERFECTO",
    descripcion: "100% de concurrencia.",
    icono: "Gem",
    tipo: "puntaje",
    meta: 100,
  },
  {
    clave: "madrugador",
    nombre: "MADRUGRADOR",
    descripcion: "5 turnos antes de las 9:00.",
    icono: "Sunrise",
    tipo: "madrugador",
    meta: 5,
  },
  {
    clave: "nocturno",
    nombre: "DE NOCHE",
    descripcion: "5 turnos desde las 19:00.",
    icono: "Moon",
    tipo: "nocturno",
    meta: 5,
  },
  {
    clave: "mes_cerrado",
    nombre: "MES CERRADO",
    descripcion: "12 turnos en un mismo mes.",
    icono: "CalendarCheck",
    tipo: "mes",
    meta: 12,
  },
  {
    clave: "semana_completa",
    nombre: "SEMANA COMPLETA",
    descripcion: "4 turnos en una misma semana.",
    icono: "CalendarDays",
    tipo: "semana",
    meta: 4,
  },
];

export interface ResumenAlumno {
  /** Turnos a los que fue. */
  asistidas: number;
  /** Turnos que reservó y no fue. */
  faltadas: number;
  /** Turnos que canceló antes de la sesión. */
  canceladas: number;
  /** Turnos reservados en total (confirmadas + asistidas + faltó). */
  reservadas: number;
  /** Turnos a los que fue en el mes en curso. */
  asistidasMes: number;
  /** % de concurrencia: asistidas / (asistidas + faltadas). */
  concurrencia: number;
  /** % del objetivo mensual declarado. */
  cumplimiento: number;
  /** Turnos seguidos sin fallar (al final). */
  racha: number;
  /** Mejor racha histórica. */
  rachaMax: number;
  /** Feedback favorable. */
  feedbackPositivo: number;
  /** Feedback desfavorable. */
  feedbackNegativo: number;
  nivel: Nivel;
  insignias: Insignia[];
}

export interface ParInscripcion {
  inscripcion: Inscripcion;
  sesion: Sesion;
}

function nivelPorConcurrencia(concurrencia: number, evaluadas: number): Nivel {
  if (evaluadas < 3) return "acero";
  let nivel: Nivel = "acero";
  for (const n of NIVELES) {
    if (concurrencia >= n.minConcurrencia) nivel = n.clave;
  }
  return nivel;
}

/**
 * Calcula el puntaje de concurrencia, la racha, el cumplimiento del objetivo
 * mensual y las insignias de un cliente.
 */
export function resumenAlumno(
  pares: ParInscripcion[],
  perfil: Pick<Profile, "veces_mes_objetivo">,
  ahora = new Date(),
): ResumenAlumno {
  const ordenados = [...pares].sort(
    (a, b) => instanteSesion(a.sesion.fecha, a.sesion.hora).getTime() - instanteSesion(b.sesion.fecha, b.sesion.hora).getTime(),
  );

  let asistidas = 0;
  let faltadas = 0;
  let canceladas = 0;
  let asistidasMes = 0;
  let feedbackPositivo = 0;
  let feedbackNegativo = 0;

  const finDeMes = ordenados.filter(
    (p) => p.inscripcion.estado === "asistio" && esDelMesActual(p.sesion.fecha, ahora),
  );
  asistidasMes = finDeMes.length;

  // Racha: sólo cuenta sesiones YA terminadas (asistidas o faltadas).
  const pasadas = ordenados.filter(
    (p) => p.inscripcion.estado === "asistio" || p.inscripcion.estado === "faltó",
  );

  let racha = 0;
  let rachaMax = 0;
  let rachaActual = 0;
  for (const p of pasadas) {
    if (p.inscripcion.estado === "asistio") {
      rachaActual += 1;
      racha = rachaActual;
    } else {
      rachaActual = 0;
      racha = 0;
    }
    if (rachaActual > rachaMax) rachaMax = rachaActual;
  }

  // Máximo de turnos en un mismo mes y en una misma semana.
  const porMes = new Map<string, number>();
  const porSemana = new Map<string, number>();
  const semanaDe = (fecha: string) => {
    const d = new Date(`${fecha}T00:00:00`);
    const dia = (d.getDay() + 6) % 7;
    d.setDate(d.getDate() - dia);
    return d.toISOString().slice(0, 10);
  };

  for (const p of pasadas) {
    if (p.inscripcion.estado !== "asistio") continue;
    const mes = p.sesion.fecha.slice(0, 7);
    const sem = semanaDe(p.sesion.fecha);
    porMes.set(mes, (porMes.get(mes) ?? 0) + 1);
    porSemana.set(sem, (porSemana.get(sem) ?? 0) + 1);
  }

  let madrugadores = 0;
  let nocturnos = 0;
  for (const p of ordenados) {
    if (p.inscripcion.estado !== "asistio") continue;
    const h = horaAMinutos(p.sesion.hora);
    if (h < 9 * 60) madrugadores += 1;
    if (h >= 19 * 60) nocturnos += 1;
    if (p.inscripcion.feedback === "up") feedbackPositivo += 1;
    if (p.inscripcion.feedback === "down") feedbackNegativo += 1;
  }

  for (const p of ordenados) {
    if (p.inscripcion.estado === "asistio") asistidas += 1;
    else if (p.inscripcion.estado === "faltó") faltadas += 1;
    else if (p.inscripcion.estado === "cancelada") canceladas += 1;
  }

  const reservadas = asistidas + faltadas + canceladas;
  const evaluadas = asistidas + faltadas;
  const concurrencia = evaluadas > 0 ? Math.round((asistidas / evaluadas) * 100) : 0;
  const objetivo = Math.max(1, perfil.veces_mes_objetivo || 0);
  const cumplimiento = Math.min(100, Math.round((asistidasMes / objetivo) * 100));

  const maxMes = Math.max(0, ...porMes.values());
  const maxSemana = Math.max(0, ...porSemana.values());

  const insignias: Insignia[] = CATALOGO_INSIGNIAS.map((def) => {
    let progreso = 0;
    switch (def.tipo) {
      case "sesiones":
        progreso = asistidas;
        break;
      case "racha":
        progreso = rachaMax;
        break;
      case "puntaje":
        progreso = concurrencia;
        break;
      case "madrugador":
        progreso = madrugadores;
        break;
      case "nocturno":
        progreso = nocturnos;
        break;
      case "mes":
        progreso = maxMes;
        break;
      case "semana":
        progreso = maxSemana;
        break;
    }
    return { ...def, progreso: Math.min(progreso, def.meta), obtenida: progreso >= def.meta };
  });

  return {
    asistidas,
    faltadas,
    canceladas,
    reservadas,
    asistidasMes,
    concurrencia,
    cumplimiento,
    racha,
    rachaMax,
    feedbackPositivo,
    feedbackNegativo,
    nivel: nivelPorConcurrencia(concurrencia, evaluadas),
    insignias,
  };
}

/** Nivel con su información descriptive. */
export function infoNivel(nivel: Nivel): NivelInfo {
  return NIVELES.find((n) => n.clave === nivel) ?? NIVELES[0];
}

/** Etiqueta corta para mostrar el puntaje. */
export function etiquetaPuntaje(puntaje: number): string {
  return `${puntaje}%`;
}
