import React, { createContext, useCallback, useContext, useState } from "react";
import { X } from "lucide-react";

type ToastVariant = "success" | "error" | "info";
interface ToastItem {
  id: string;
  message: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  pushToast: (message: string, variant?: ToastVariant) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const pushToast = useCallback((message: string, variant: ToastVariant = "info") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, variant }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ pushToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            aria-live="polite"
            className="flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg"
            style={{
              backgroundColor:
                toast.variant === "error" ? "rgba(255,92,92,0.9)" :
                toast.variant === "success" ? "rgba(212,255,61,0.9)" :
                "rgba(184,188,196,0.9)",
              color: "#101215",
              fontFamily: "IBM Plex Sans, sans-serif",
              minWidth: "200px",
            }}
          >
            <span className="flex-1 text-sm">{toast.message}</span>
            <button
              aria-label="Cerrar notificación"
              onClick={() => removeToast(toast.id)}
              className="ml-2"
            >
              <X size={16} color="#101215" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // Return noop fallback if used outside provider (e.g. in tests)
    return {
      pushToast: () => {},
    } as ToastContextValue;
  }
  return ctx;
}
