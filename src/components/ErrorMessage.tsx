import React from "react";

interface ErrorMessageProps {
  message?: string | null;
  variant?: "error" | "success";
}

/**
 * Simple inline message for forms; renders nothing if no message.
 */
export function ErrorMessage({ message, variant = "error" }: ErrorMessageProps) {
  if (!message) return null;
  const color = variant === "error" ? "var(--color-danger)" : "var(--color-lime)";

  return (
    <p
      role={variant === "error" ? "alert" : "status"}
      className="text-xs text-center"
      style={{ color }}
    >
      {message}
    </p>
  );
}
