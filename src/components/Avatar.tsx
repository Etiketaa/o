import { getInitials } from "@/lib/utils";

interface AvatarProps {
  nombre: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZES = { sm: "w-8 h-8 text-xs", md: "w-10 h-10 text-sm", lg: "w-14 h-14 text-lg" };

export function Avatar({ nombre, size = "md", className = "" }: AvatarProps) {
  return (
    <div
      className={`${SIZES[size]} rounded-full flex items-center justify-center font-bold ${className}`}
      style={{
        backgroundColor: "var(--color-surface-hi)",
        border: "1px solid var(--color-border)",
        color: "var(--color-lime)",
        fontFamily: "var(--font-mono)",
      }}
    >
      {getInitials(nombre)}
    </div>
  );
}
