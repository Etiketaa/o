import {
  CalendarCheck,
  CalendarDays,
  Crown,
  Flame,
  Gem,
  Medal,
  Moon,
  ShieldCheck,
  Sparkles,
  Sunrise,
  Target,
  Trophy,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

/**
 * Mapa explícito de los iconos de insignia.
 * El catálogo (`@/lib/puntaje`) guarda el nombre como string para poder
 * serializarlo; acá se resuelve al componente real.
 */
const ICONOS: Record<string, LucideIcon> = {
  CalendarCheck,
  CalendarDays,
  Crown,
  Flame,
  Gem,
  Medal,
  Moon,
  ShieldCheck,
  Sparkles,
  Sunrise,
  Target,
  Trophy,
  Zap,
};

interface InsigniaIconProps {
  /** Nombre del icono, tal cual figura en `CATALOGO_INSIGNIAS`. */
  nombre: string;
  size?: number;
  className?: string;
}

export function InsigniaIcon({ nombre, size = 20, className }: InsigniaIconProps) {
  const Icono = ICONOS[nombre] ?? Sparkles;
  return <Icono size={size} strokeWidth={1.8} className={className} aria-hidden="true" />;
}
