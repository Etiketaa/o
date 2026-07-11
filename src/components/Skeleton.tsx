import React from "react";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: string | number;
  height?: string | number;
  radius?: string;
}

/**
 * Lightweight placeholder with animated gradient.
 *
 * Example:
 *   <Skeleton height={40} className="mb-2" />
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  width = "100%",
  height = 16,
  radius = "8px",
  className = "",
  style,
  ...rest
}) => (
  <div
    className={`skeleton ${className}`}
    style={{
      width,
      height,
      borderRadius: radius,
      ...style,
    }}
    aria-hidden
    {...rest}
  />
);
