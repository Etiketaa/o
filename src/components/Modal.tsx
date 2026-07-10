import { X } from "lucide-react";
import { COLORS, FONTS } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export function Modal({ open, onClose, title, children }: ModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.6)" }}>
      <div
        className="w-full max-w-md rounded-t-2xl sm:rounded-2xl p-5 flex flex-col gap-4 max-h-[85vh] overflow-y-auto"
        style={{ backgroundColor: COLORS.surface, border: `1px solid ${COLORS.border}` }}
      >
        <div className="flex items-center justify-between">
          {title && (
            <h3 style={{ fontFamily: FONTS.display, color: COLORS.textHi, fontSize: 22, letterSpacing: 1 }}>
              {title}
            </h3>
          )}
          <button onClick={onClose} style={{ color: COLORS.textMuted }} className="ml-auto">
            <X size={22} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
