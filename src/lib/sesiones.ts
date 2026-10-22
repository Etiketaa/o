import type { Sesion, Turno } from "@/types";
import { diaSemanaDe } from "@/lib/fechas";

/** Clave única de una sesión dentro de una fecha. */
export function claveSesion(fecha: string, hora: string, actividad: string): string {
  return `${fecha}|${hora}|${actividad}`;
}

/**
 * A partir de la plantilla semanal (`turnos`) arma las sesiones concretas de
 * las fechas pedidas. Sólo devuelve las que todavía no existen.
 *
 * La plantilla es la grilla del profesor: (día de la semana, hora) → actividad,
 * coach y cupo. Las fechas reales se materializan sobre esa grilla.
 */
export function generarSesionesFaltantes(
  fechas: string[],
  turnos: Turno[],
  existentes: Sesion[],
): Sesion[] {
  const yaExisten = new Set(existentes.map((s) => claveSesion(s.fecha, s.hora, s.actividad)));
  const nuevos: Sesion[] = [];

  for (const fecha of fechas) {
    const dia = diaSemanaDe(fecha);
    for (const turno of turnos) {
      if (!turno.activo || turno.dia !== dia) continue;
      const clave = claveSesion(fecha, turno.hora, turno.actividad);
      if (yaExisten.has(clave)) continue;
      yaExisten.add(clave);
      nuevos.push({
        id: crypto.randomUUID(),
        fecha,
        hora: turno.hora,
        actividad: turno.actividad,
        coach: turno.coach,
        cupo: turno.cupo,
        turno_id: turno.id,
        created_at: new Date().toISOString(),
      });
    }
  }

  return nuevos;
}

/** Ordena sesiones por fecha y hora ascendente. */
export function ordenarSesiones(sesiones: Sesion[]): Sesion[] {
  return [...sesiones].sort((a, b) =>
    a.fecha === b.fecha ? a.hora.localeCompare(b.hora) : a.fecha.localeCompare(b.fecha),
  );
}

/** Agrupa sesiones por fecha. */
export function agruparPorFecha(sesiones: Sesion[]): Map<string, Sesion[]> {
  const mapa = new Map<string, Sesion[]>();
  for (const sesion of ordenarSesiones(sesiones)) {
    const lista = mapa.get(sesion.fecha) ?? [];
    lista.push(sesion);
    mapa.set(sesion.fecha, lista);
  }
  return mapa;
}
