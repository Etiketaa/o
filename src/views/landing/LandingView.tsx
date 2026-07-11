import { useState, useEffect } from "react";
import {
  Dumbbell,
  Clock,
  MapPin,
  ChevronDown,
  Calendar,
  Users,
  Zap,
  Heart,
  ArrowRight,
  Menu,
  X,
  Star,
  Shield,
  Target,
} from "lucide-react";

function InstagramIcon({ size = 18, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
    </svg>
  );
}
import { COLORS, FONTS } from "@/lib/utils";
import { GlassCard } from "@/components/GlassCard";
import { useInView } from "@/hooks/useInView";
import { useToast } from "@/components/Toast";

const ACTIVITIES = [
  { name: "Funcional", desc: "Entrenamiento de alta intensidad que mejora fuerza, resistencia y coordinación.", icon: Zap, coach: "Nacho / Vale", schedule: "Lun a Vie 07:00 - 08:00" },
  { name: "Pesas Libres", desc: "Trabajo de fuerza con libre elección de peso para ganar masa muscular.", icon: Dumbbell, coach: "Vale", schedule: "Lun y Mar 09:00 / 19:00" },
  { name: "CrossTraining", desc: "Combinación de gimnástica, levantamiento de peso y cardio.", icon: Target, coach: "Nacho", schedule: "Lun, Mié y Vie 18:30" },
  { name: "Movilidad", desc: "Sesiones de estiramientos y movilidad articular para prevenir lesiones.", icon: Heart, coach: "Vale", schedule: "Lun 20:00 / Jue 09:00" },
];

const PLANS = [
  { name: "2x semana", price: "12.000", features: ["2 clases por semana", "Acceso a todas las actividades", "App de reservas"], popular: false },
  { name: "3x semana", price: "14.000", features: ["3 clases por semana", "Acceso a todas las actividades", "App de reservas", "Seguimiento mensual"], popular: false },
  { name: "Full", price: "16.000", features: ["Clases ilimitadas", "Acceso a todas las actividades", "App de reservas", "Seguimiento personalizado", "Acceso a todas las sedes"], popular: true },
];

const COACHES = [
  { name: "Nacho", specialty: "Funcional & CrossTraining", emoji: "💪" },
  { name: "Vale", specialty: "Pesas & Movilidad", emoji: "🏋️" },
];

export function LandingView({ onGoToApp }: { onGoToApp: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const [heroRef, heroIn] = useInView({ threshold: 0.1 });
  const [activitiesRef, activitiesIn] = useInView({ threshold: 0.15 });
  const [plansRef, plansIn] = useInView({ threshold: 0.15 });
  const [coachesRef, coachesIn] = useInView({ threshold: 0.15 });
  const [ubicacionRef, ubiIn] = useInView({ threshold: 0.15 });
  const [ctaRef, ctaIn] = useInView({ threshold: 0.15 });

  return (
    <div className="min-h-screen overflow-y-auto" style={{ backgroundColor: COLORS.bg }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap');
        .landing-fade-in { animation: fadeIn 0.6s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .landing-hero-bg { 
          background: linear-gradient(135deg, #101215 0%, #1a2a1a 50%, #101215 100%);
        }
        @media (min-width: 768px) {
          .landing-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
          .landing-grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; }
          .landing-hero-content { max-width: 600px; }
        }
        @media (min-width: 1024px) {
          .landing-grid-3 { grid-template-columns: repeat(4, 1fr); }
        }
        @media (orientation: landscape) and (max-height: 500px) {
          .landing-hero { min-height: auto; padding: 2rem 0; }
        }
      `}</style>

      {/* Navbar */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "backdrop-blur-md" : ""}`}
        style={{
          backgroundColor: scrolled ? "rgba(16,18,21,0.9)" : "transparent",
          borderBottom: scrolled ? `1px solid ${COLORS.border}` : "none",
        }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Dumbbell size={20} color={COLORS.lime} />
            <span style={{ fontFamily: FONTS.display, color: COLORS.textHi, fontSize: 20, letterSpacing: 1 }}>
              OZ ENTRENAMIENTO
            </span>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <a href="#actividades" style={{ fontFamily: FONTS.mono, color: COLORS.textMuted }} className="text-xs hover:text-white transition-colors">ACTIVIDADES</a>
            <a href="#planes" style={{ fontFamily: FONTS.mono, color: COLORS.textMuted }} className="text-xs hover:text-white transition-colors">PLANES</a>
            <a href="#coaches" style={{ fontFamily: FONTS.mono, color: COLORS.textMuted }} className="text-xs hover:text-white transition-colors">COACHES</a>
            <a href="#ubicacion" style={{ fontFamily: FONTS.mono, color: COLORS.textMuted }} className="text-xs hover:text-white transition-colors">UBICACIÓN</a>
            <button
              onClick={onGoToApp}
              className="px-4 py-2 rounded-lg text-sm font-bold transition-opacity hover:opacity-90"
              style={{ fontFamily: FONTS.body, color: COLORS.bg, backgroundColor: COLORS.lime }}
            >
              RESERVAR CLASE
            </button>
          </div>

          <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)} style={{ color: COLORS.textHi }}>
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden px-4 pb-4 flex flex-col gap-3" style={{ backgroundColor: "rgba(16,18,21,0.95)" }}>
            <a href="#actividades" onClick={() => setMenuOpen(false)} style={{ fontFamily: FONTS.mono, color: COLORS.textMuted }} className="text-sm py-2">ACTIVIDADES</a>
            <a href="#planes" onClick={() => setMenuOpen(false)} style={{ fontFamily: FONTS.mono, color: COLORS.textMuted }} className="text-sm py-2">PLANES</a>
            <a href="#coaches" onClick={() => setMenuOpen(false)} style={{ fontFamily: FONTS.mono, color: COLORS.textMuted }} className="text-sm py-2">COACHES</a>
            <a href="#ubicacion" onClick={() => setMenuOpen(false)} style={{ fontFamily: FONTS.mono, color: COLORS.textMuted }} className="text-sm py-2">UBICACIÓN</a>
            <button
              onClick={() => { setMenuOpen(false); onGoToApp(); }}
              className="w-full py-3 rounded-lg text-sm font-bold"
              style={{ fontFamily: FONTS.body, color: COLORS.bg, backgroundColor: COLORS.lime }}
            >
              RESERVAR CLASE
            </button>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section ref={heroRef} className={`landing-hero landing-hero-bg flex flex-col items-center justify-center text-center px-4 sm:px-6 pt-24 pb-16 sm:pt-32 sm:pb-24 ${heroIn ? "animate-fade" : "opacity-0"}`} style={{ minHeight: "85vh" }}>
        <div className="landing-hero-content">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-6" style={{ border: `1px solid ${COLORS.border}`, backgroundColor: COLORS.surface }}>
            <MapPin size={12} color={COLORS.lime} />
            <span style={{ fontFamily: FONTS.mono, color: COLORS.textMuted }} className="text-[10px]">Ingeniero White</span>
          </div>

          <h1 style={{ fontFamily: FONTS.display, color: COLORS.textHi, fontSize: "clamp(40px, 8vw, 80px)", letterSpacing: 2, lineHeight: 1 }}>
            ENTRENÁ<br />
            <span style={{ color: COLORS.lime }}>TU MEJOR</span><br />
            VERSIÓN
          </h1>

          <p style={{ fontFamily: FONTS.body, color: COLORS.textMid }} className="text-sm sm:text-base max-w-md mx-auto mt-4 mb-8">
            Clases de funcional, pesas, cross training y movilidad con coaches profesionales. Reservá tu turno desde la app.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onGoToApp}
              className="flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-all hover:scale-105"
              style={{ fontFamily: FONTS.body, color: COLORS.bg, backgroundColor: COLORS.lime, fontSize: 15 }}
            >
              RESERVAR MI CLASE
              <ArrowRight size={18} />
            </button>
            <a
              href="https://www.instagram.com/oz.entrenamiento/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all hover:scale-105"
              style={{ fontFamily: FONTS.body, color: COLORS.textHi, border: `1px solid ${COLORS.border}`, backgroundColor: COLORS.surface }}
            >
              <InstagramIcon size={18} />
              @oz.entrenamiento
            </a>
          </div>

          <div className="flex items-center justify-center gap-8 mt-12">
            <div className="flex flex-col items-center">
              <span style={{ fontFamily: FONTS.display, color: COLORS.lime, fontSize: 32 }}>12+</span>
              <span style={{ fontFamily: FONTS.mono, color: COLORS.textMuted }} className="text-[10px]">CLASES / SEMANA</span>
            </div>
            <div className="w-px h-8" style={{ backgroundColor: COLORS.border }} />
            <div className="flex flex-col items-center">
              <span style={{ fontFamily: FONTS.display, color: COLORS.lime, fontSize: 32 }}>2</span>
              <span style={{ fontFamily: FONTS.mono, color: COLORS.textMuted }} className="text-[10px]">COACHES</span>
            </div>
            <div className="w-px h-8" style={{ backgroundColor: COLORS.border }} />
            <div className="flex flex-col items-center">
              <span style={{ fontFamily: FONTS.display, color: COLORS.lime, fontSize: 32 }}>4</span>
              <span style={{ fontFamily: FONTS.mono, color: COLORS.textMuted }} className="text-[10px]">ACTIVIDADES</span>
            </div>
          </div>
        </div>

        <ChevronDown size={24} color={COLORS.textMuted} className="mt-12 animate-bounce" />
      </section>

      {/* Actividades */}
      <section id="actividades" ref={activitiesRef} className={`px-4 sm:px-6 py-16 sm:py-24 max-w-6xl mx-auto ${activitiesIn ? "animate-fade" : "opacity-0"}`}>
        <div className="text-center mb-12">
          <span style={{ fontFamily: FONTS.mono, color: COLORS.lime }} className="text-xs">ACTIVIDADES</span>
          <h2 style={{ fontFamily: FONTS.display, color: COLORS.textHi, fontSize: "clamp(28px, 5vw, 48px)", letterSpacing: 1 }} className="mt-2">
            ELEGÍ TU ENTRENAMIENTO
          </h2>
        </div>

        <div className="landing-grid">
          {ACTIVITIES.map((act) => {
            const Icon = act.icon;
            return (
                <GlassCard
                  key={act.name}
                  hoverable
                  className="p-6 landing-fade-in"
                >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: COLORS.surfaceHi, border: `1px solid ${COLORS.border}` }}>
                  <Icon size={22} color={COLORS.lime} />
                </div>
                <h3 style={{ fontFamily: FONTS.display, color: COLORS.textHi, fontSize: 22, letterSpacing: 1 }}>{act.name}</h3>
                <p style={{ fontFamily: FONTS.body, color: COLORS.textMid }} className="text-sm mt-2 mb-3">{act.desc}</p>
                <div className="flex flex-col gap-1">
                  <span style={{ fontFamily: FONTS.mono, color: COLORS.textMuted }} className="text-[10px]">COACH: {act.coach.toUpperCase()}</span>
                  <span style={{ fontFamily: FONTS.mono, color: COLORS.limeDim }} className="text-[10px]">{act.schedule}</span>
                </div>
              </GlassCard>
            );
          })}
        </div>
      </section>

      {/* Planes */}
      <section id="planes" ref={plansRef} className={`px-4 sm:px-6 py-16 sm:py-24 ${plansIn ? "animate-fade" : "opacity-0"}`} style={{ backgroundColor: COLORS.surface }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span style={{ fontFamily: FONTS.mono, color: COLORS.lime }} className="text-xs">PLANES</span>
            <h2 style={{ fontFamily: FONTS.display, color: COLORS.textHi, fontSize: "clamp(28px, 5vw, 48px)", letterSpacing: 1 }} className="mt-2">
              ELIGÍ TU PLAN
            </h2>
          </div>

          <div className="landing-grid-3">
            {PLANS.map((plan) => (
              <GlassCard
                key={plan.name}
                hoverable
                className="p-6 flex flex-col relative"
                style={{
                  border: `1px solid ${plan.popular ? COLORS.lime : COLORS.border}`,
                }}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px]" style={{ backgroundColor: COLORS.lime, color: COLORS.bg, fontFamily: FONTS.mono, fontWeight: 700 }}>
                    MÁS POPULAR
                  </div>
                )}
                <h3 style={{ fontFamily: FONTS.display, color: COLORS.textHi, fontSize: 24, letterSpacing: 1 }}>{plan.name}</h3>
                <div className="flex items-baseline gap-1 mt-3 mb-4">
                  <span style={{ fontFamily: FONTS.display, color: COLORS.lime, fontSize: 36 }}>${plan.price}</span>
                  <span style={{ fontFamily: FONTS.mono, color: COLORS.textMuted }} className="text-xs">/mes</span>
                </div>
                <div className="flex flex-col gap-2 mb-6 flex-1">
                  {plan.features.map((f) => (
                    <div key={f} className="flex items-center gap-2">
                      <Shield size={12} color={COLORS.lime} />
                      <span style={{ fontFamily: FONTS.body, color: COLORS.textMid }} className="text-sm">{f}</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={onGoToApp}
                  className="w-full py-3 rounded-lg text-center font-bold transition-opacity hover:opacity-90"
                  style={{
                    fontFamily: FONTS.body,
                    color: plan.popular ? COLORS.bg : COLORS.lime,
                    backgroundColor: plan.popular ? COLORS.lime : "transparent",
                    border: plan.popular ? "none" : `1px solid ${COLORS.limeDim}`,
                  }}
                >
                  EMPEZAR AHORA
                </button>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* Coaches */}
      <section id="coaches" ref={coachesRef} className={`px-4 sm:px-6 py-16 sm:py-24 max-w-6xl mx-auto ${coachesIn ? "animate-fade" : "opacity-0"}`}>
        <div className="text-center mb-12">
          <span style={{ fontFamily: FONTS.mono, color: COLORS.lime }} className="text-xs">EQUIPO</span>
          <h2 style={{ fontFamily: FONTS.display, color: COLORS.textHi, fontSize: "clamp(28px, 5vw, 48px)", letterSpacing: 1 }} className="mt-2">
            NUESTROS COACHES
          </h2>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          {COACHES.map((c) => (
              <GlassCard
                key={c.name}
                hoverable
                className="flex items-center gap-4 px-6 py-5 w-full sm:w-auto"
                style={{ border: `1px solid ${COLORS.border}` }}
              >
              <div className="text-4xl">{c.emoji}</div>
              <div>
                <h3 style={{ fontFamily: FONTS.display, color: COLORS.textHi, fontSize: 22, letterSpacing: 1 }}>{c.name}</h3>
                <p style={{ fontFamily: FONTS.mono, color: COLORS.textMuted }} className="text-xs">{c.specialty}</p>
              </div>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* Ubicación */}
      <section id="ubicacion" ref={ubicacionRef} className={`px-4 sm:px-6 py-16 sm:py-24 ${ubiIn ? "animate-fade" : "opacity-0"}`} style={{ backgroundColor: COLORS.surface }}>
        <div className="max-w-6xl mx-auto text-center">
          <span style={{ fontFamily: FONTS.mono, color: COLORS.lime }} className="text-xs">UBICACIÓN</span>
          <h2 style={{ fontFamily: FONTS.display, color: COLORS.textHi, fontSize: "clamp(28px, 5vw, 48px)", letterSpacing: 1 }} className="mt-2 mb-8">
            ENCONTRANOS
          </h2>

          <GlassCard className="p-6 sm:p-8 inline-flex flex-col items-center gap-4">
            <MapPin size={32} color={COLORS.lime} />
            <div>
              <p style={{ fontFamily: FONTS.body, color: COLORS.textHi, fontWeight: 600 }} className="text-base">OZ Entrenamiento</p>
              <p style={{ fontFamily: FONTS.mono, color: COLORS.textMuted }} className="text-sm mt-1">Ingeniero White, Buenos Aires</p>
            </div>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-1">
                <Clock size={14} color={COLORS.textMuted} />
                <span style={{ fontFamily: FONTS.mono, color: COLORS.textMuted }} className="text-xs">Lun - Vie: 07:00 a 21:00</span>
              </div>
            </div>
            <a
              href="https://www.instagram.com/oz.entrenamiento/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-opacity hover:opacity-90 mt-2"
              style={{ fontFamily: FONTS.body, color: COLORS.lime, border: `1px solid ${COLORS.limeDim}`, backgroundColor: "transparent" }}
            >
              <InstagramIcon size={16} />
              Seguinos en Instagram
            </a>
          </GlassCard>
        </div>
      </section>

      {/* CTA Final */}
      <section ref={ctaRef} className={`px-4 sm:px-6 py-16 sm:py-24 text-center ${ctaIn ? "animate-fade" : "opacity-0"}`}>
        <h2 style={{ fontFamily: FONTS.display, color: COLORS.textHi, fontSize: "clamp(28px, 5vw, 48px)", letterSpacing: 1 }}>
          ¿LISTO PARA <span style={{ color: COLORS.lime }}>ENTRENAR</span>?
        </h2>
        <p style={{ fontFamily: FONTS.body, color: COLORS.textMid }} className="text-sm sm:text-base max-w-md mx-auto mt-4 mb-8">
          Reservá tu primera clase gratis y conocé el gym.
        </p>
        <button
          onClick={onGoToApp}
          className="inline-flex items-center gap-2 px-8 py-4 rounded-lg font-bold text-lg transition-all hover:scale-105"
          style={{ fontFamily: FONTS.body, color: COLORS.bg, backgroundColor: COLORS.lime }}
        >
          RESERVAR AHORA
          <ArrowRight size={20} />
        </button>
      </section>

      {/* Footer */}
      <footer className="px-4 sm:px-6 py-8 text-center" style={{ borderTop: `1px solid ${COLORS.border}` }}>
        <div className="flex items-center justify-center gap-2 mb-4">
          <Dumbbell size={16} color={COLORS.lime} />
          <span style={{ fontFamily: FONTS.display, color: COLORS.textHi, fontSize: 16, letterSpacing: 1 }}>OZ ENTRENAMIENTO</span>
        </div>
        <p style={{ fontFamily: FONTS.mono, color: COLORS.textMuted }} className="text-xs">
          © 2025 OZ Entrenamiento · Ingeniero White
        </p>
        <div className="flex items-center justify-center gap-4 mt-4">
          <a href="https://www.instagram.com/oz.entrenamiento/" target="_blank" rel="noopener noreferrer" style={{ color: COLORS.textMuted }} className="hover:text-white transition-colors">
            <InstagramIcon size={18} />
            </a>
          </div>
      </footer>
    </div>
  );
}
