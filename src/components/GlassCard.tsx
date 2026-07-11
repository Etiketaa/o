import React from "react";
import { COLORS } from "@/lib/utils";

type GlassCardProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Optional Tailwind utility classes to extend layout */
  className?: string;
  /** Show subtle hover effect */
  hoverable?: boolean;
};

/**
 * Reusable card with glassmorphism background, border and blur.
 *
 * Usage:
 *   <GlassCard className="p-6">...content...</GlassCard>
 */
export const GlassCard: React.FC<GlassCardProps> = ({
  className = "",
  hoverable = false,
  children,
  style,
  ...rest
}) => {
  const baseStyles = {
    backgroundColor: "rgba(255,255,255,0.08)",
    border: `1px solid ${COLORS.border}`,
  };
  const hoverStyles = hoverable
    ? "transition-transform hover:scale-[1.02] hover:shadow-lg"
    : "";

  return (
    <div
      className={`rounded-xl bg-white/10 backdrop-blur-md ${hoverStyles} ${className}`}
      style={{ ...baseStyles, ...style }}
      {...rest}
    >
      {children}
    </div>
  );
};
