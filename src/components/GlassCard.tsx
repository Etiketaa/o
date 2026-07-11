import React from "react";

type GlassCardProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
  hoverable?: boolean;
  glow?: boolean;
};

export const GlassCard: React.FC<GlassCardProps> = ({
  className = "",
  hoverable = false,
  glow = false,
  children,
  style,
  ...rest
}) => {
  return (
    <div
      className={`glass-card ${hoverable ? "glass-card-hover cursor-pointer" : ""} ${glow ? "ring-1 ring-lime/20" : ""} ${className}`}
      style={style}
      {...rest}
    >
      {children}
    </div>
  );
};
