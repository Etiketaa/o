import { useState, useEffect } from "react";
import { ArrowRight, Calendar, UserRound, ThumbsUp } from "lucide-react";

const ONBOARDING_KEY = "oz_onboarding_visto";

const STEPS = [
  {
    id: "reservar",
    title: "Reservá tu primer turno",
    description:
      "Un turno es tu lugar en una clase (Funcional, Pesas Libres, CrossTraining o Movilidad). Elegís el día y el horario que te convenga y lo reservás para ese momento.",
    Icon: Calendar,
    action: "Ir a reservar",
  },
  {
    id: "asistencia",
    title: "El profesor marca tu asistencia",
    description:
      "Cuando llegás al gym, el profesor confirma que asististe. Eso suma a tu puntaje y hace subir tu nivel (Acero → Plata → Platino → Diamante).",
    Icon: UserRound,
    action: "Entendido",
  },
  {
    id: "feedback",
    title: "Respondé el feedback",
    description:
      "Después de cada turno podés calificar con 👍 o 👎 cómo fue la clase. Ayuda al profesor a mejorar cada sesión.",
    Icon: ThumbsUp,
    action: "Finalizar",
  },
];

export function OnboardingGuide({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (open && localStorage.getItem(ONBOARDING_KEY) === "1") {
      onClose();
    }
  }, [open, onClose]);

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;
  const Icon = current.Icon;

  const handleNext = () => {
    if (isLast) {
      localStorage.setItem(ONBOARDING_KEY, "1");
      onClose();
    } else {
      setStep((s) => s + 1);
    }
  };

  const handleSkip = () => {
    localStorage.setItem(ONBOARDING_KEY, "1");
    onClose();
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
    >
      <div className="absolute inset-0 bg-black/80" />

      <div className="brutal-card-neon w-full max-w-sm p-6 flex flex-col gap-4">
        {/* Barra superior: progreso + saltar */}
        <div className="flex items-center justify-between">
          <span
            className="font-mono text-[10px] uppercase tracking-wider text-neon"
          >
            Paso {step + 1} de {STEPS.length}
          </span>
          <button
            onClick={handleSkip}
            className="brutal-btn"
            aria-label="Saltar guía de bienvenida"
          >
            Saltar
          </button>
        </div>

        {/* Contenido del paso */}
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-12 h-12 rounded-full flex items-center justify-center border-4 border-neon">
            <span className="text-neon">
              <Icon size={24} />
            </span>
          </div>
          <h3
            id="onboarding-title"
            className="font-display text-xl tracking-wide text-text-hi"
          >
            {current.title}
          </h3>
          <p className="font-body text-sm text-text-mid leading-relaxed">
            {current.description}
          </p>
        </div>

        {/* Pie: botón de acción */}
        <div className="flex gap-3 pt-4 border-t border-border/50">
          <button
            onClick={handleNext}
            className="brutal-btn-neon flex-1 min-h-11"
            aria-label={isLast ? "Finalizar guía de bienvenida" : "Siguiente paso"}
          >
            {isLast ? "¡Listo!" : "Siguiente"} <ArrowRight size={16} className="ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
}
