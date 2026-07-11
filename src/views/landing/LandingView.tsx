import { useState, useEffect } from "react";
import {
  Dumbbell,
  Clock,
  MapPin,
  ChevronDown,
  Zap,
  Heart,
  ArrowRight,
  Menu,
  X,
  Shield,
  Target,
  Check,
} from "lucide-react";

function InstagramIcon({ size = 18, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
    </svg>
  );
}
import { COLORS, FONTS } from "@/lib/utils";
import { GlassCard } from "@/components/GlassCard";
import { useInView } from "@/hooks/useInView";

const ACTIVITIES = [
  { name: "Funcional", desc: "Alta intensidad que mejora fuerza, resistencia y coordinación.", icon: Zap, coach: "Nacho / Vale", schedule: "Lun a Vie 07:00 - 08:00" },
  { name: "Pesas Libres", desc: "Trabajo de fuerza con libre elección de peso para ganar masa muscular.", icon: Dumbbell, coach: "Vale", schedule: "Lun y Mar 09:00 / 19:00" },
  { name: "CrossTraining", desc: "Combinación de gimnástica, levantamiento de peso y cardio.", icon: Target, coach: "Nacho", schedule: "Lun, Mié y Vie 18:30" },
  { name: "Movilidad", desc: "Estiramientos y movilidad articular para prevenir lesiones.", icon: Heart, coach: "Vale", schedule: "Lun 20:00 / Jue 09:00" },
];

const PLANS = [
  { name: "2x semana", price: "12.000", features: ["2 clases por semana", "Acceso a todas las actividades", "App de reservas"], popular: false },
  { name: "3x semana", price: "14.000", features: ["3 clases por semana", "Acceso a todas las actividades", "App de reservas", "Seguimiento mensual"], popular: false },
  { name: "Full", price: "16.000", features: ["Clases ilimitadas", "Acceso a todas las actividades", "App de reservas", "Seguimiento personalizado", "Acceso a todas las sedes"], popular: true },
];

const COACHES = [
  { name: "Nacho", specialty: "Funcional & CrossTraining", initials: "NA", color: "#D4FF3D" },
  { name: "Vale", specialty: "Pesas & Movilidad", initials: "VA", color: "#8FA83A" },
];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-xs font-mono tracking-widest text-lime uppercase">{children}</span>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="font-display text-text-hi tracking-wide mt-2"
      style={{ fontSize: "clamp(32px, 5vw, 52px)" }}
    >
      {children}
    </h2>
  );
}

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
    <div className="min-h-screen overflow-y-auto bg-bg">
      {/* Navbar */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-bg/90 backdrop-blur-xl border-b border-border" : "bg-transparent"}`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <a href="#" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-lime flex items-center justify-center transition-transform group-hover:scale-105">
              <Dumbbell size={18} className="text-bg" />
            </div>
            <span className="font-display text-text-hi text-xl tracking-wider hidden sm:block">
              OZ ENTRENAMIENTO
            </span>
          </a>

          <div className="hidden md:flex items-center gap-8">
            <a href="#actividades" className="text-xs font-mono text-text-muted hover:text-text-hi transition-colors">ACTIVIDADES</a>
            <a href="#planes" className="text-xs font-mono text-text-muted hover:text-text-hi transition-colors">PLANES</a>
            <a href="#coaches" className="text-xs font-mono text-text-muted hover:text-text-hi transition-colors">COACHES</a>
            <a href="#ubicacion" className="text-xs font-mono text-text-muted hover:text-text-hi transition-colors">UBICACIÓN</a>
            <button
              onClick={onGoToApp}
              className="px-5 py-2 rounded-lg text-sm font-bold bg-lime text-bg hover:shadow-glow-lime transition-all hover:scale-105"
            >
              RESERVAR CLASE
            </button>
          </div>

          <button
            className="md:hidden p-2 text-text-hi"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden px-4 pb-6 pt-2 flex flex-col gap-1 bg-bg/95 backdrop-blur-xl border-b border-border animate-slide-up">
            {[
              { href: "#actividades", label: "ACTIVIDADES" },
              { href: "#planes", label: "PLANES" },
              { href: "#coaches", label: "COACHES" },
              { href: "#ubicacion", label: "UBICACIÓN" },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="text-sm font-mono text-text-muted hover:text-text-hi py-3 px-3 rounded-lg hover:bg-surface transition-colors"
              >
                {item.label}
              </a>
            ))}
            <button
              onClick={() => { setMenuOpen(false); onGoToApp(); }}
              className="w-full py-3 mt-2 rounded-lg text-sm font-bold bg-lime text-bg hover:shadow-glow-lime transition-all"
            >
              RESERVAR CLASE
            </button>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section
        ref={heroRef}
        className={`hero-gradient flex flex-col items-center justify-center text-center px-4 sm:px-6 pt-24 pb-16 sm:pt-32 sm:pb-24 ${heroIn ? "animate-slide-up" : "opacity-0"}`}
        style={{ minHeight: "90vh" }}
      >
        <div className="max-w-3xl mx-auto">
          {/* Location badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border bg-surface/60 backdrop-blur-sm mb-8 animate-scale-in">
            <MapPin size={13} className="text-lime" />
            <span className="text-xs font-mono text-text-muted tracking-wide">INGENIERO WHITE, BS. AS.</span>
          </div>

          {/* Headline */}
          <h1
            className="font-display text-text-hi leading-none mb-6"
            style={{ fontSize: "clamp(48px, 10vw, 96px)", letterSpacing: "0.04em" }}
          >
            ENTRENÁ<br />
            <span className="text-lime">TU MEJOR</span><br />
            VERSIÓN
          </h1>

          {/* Glowing line */}
          <div className="glow-line w-24 mx-auto my-6" />

          {/* Subtitle */}
          <p className="font-body text-text-mid text-base sm:text-lg max-w-lg mx-auto mb-10 leading-relaxed">
            Clases de funcional, pesas, cross training y movilidad con coaches profesionales. Reservá tu turno desde la app.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onGoToApp}
              className="flex items-center gap-2.5 px-8 py-3.5 rounded-xl font-bold bg-lime text-bg hover:shadow-glow-lime transition-all hover:scale-105 text-sm"
            >
              RESERVAR MI CLASE
              <ArrowRight size={18} />
            </button>
            <a
              href="https://www.instagram.com/oz.entrenamiento/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 px-8 py-3.5 rounded-xl font-semibold text-text-hi border border-border bg-surface/60 backdrop-blur-sm hover:border-text-muted transition-all hover:scale-105 text-sm"
            >
              <InstagramIcon size={18} />
              @oz.entrenamiento
            </a>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center gap-10 mt-16">
            {[
              { value: "12+", label: "CLASES / SEMANA" },
              { value: "2", label: "COACHES" },
              { value: "4", label: "ACTIVIDADES" },
            ].map((stat, i) => (
              <div key={i} className="flex flex-col items-center">
                <span className="font-display text-lime stat-glow" style={{ fontSize: "clamp(32px, 5vw, 48px)" }}>
                  {stat.value}
                </span>
                <span className="text-[10px] font-mono text-text-muted tracking-wider mt-1">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50">
          <span className="text-[10px] font-mono text-text-muted tracking-widest">SCROLL</span>
          <ChevronDown size={16} className="text-text-muted animate-bounce" />
        </div>
      </section>

      {/* Actividades */}
      <section id="actividades" ref={activitiesRef} className={`px-4 sm:px-6 py-20 sm:py-28 max-w-6xl mx-auto ${activitiesIn ? "animate-fade" : "opacity-0"}`}>
        <div className="text-center mb-14">
          <SectionLabel>ACTIVIDADES</SectionLabel>
          <SectionTitle>ELEGÍ TU ENTRENAMIENTO</SectionTitle>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {ACTIVITIES.map((act) => {
            const Icon = act.icon;
            return (
              <GlassCard key={act.name} hoverable className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-surface-hi border border-border flex items-center justify-center shrink-0">
                    <Icon size={22} className="text-lime" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display text-text-hi text-xl tracking-wide">{act.name}</h3>
                    <p className="font-body text-text-mid text-sm mt-1.5 leading-relaxed">{act.desc}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border">
                  <span className="text-[11px] font-mono text-text-muted">COACH: {act.coach.toUpperCase()}</span>
                  <span className="text-[11px] font-mono text-lime-dim">{act.schedule}</span>
                </div>
              </GlassCard>
            );
          })}
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-6xl mx-auto px-4"><div className="glow-line" /></div>

      {/* Planes */}
      <section id="planes" ref={plansRef} className={`px-4 sm:px-6 py-20 sm:py-28 section-alt ${plansIn ? "animate-fade" : "opacity-0"}`}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <SectionLabel>PLANES</SectionLabel>
            <SectionTitle>ELIGÍ TU PLAN</SectionTitle>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {PLANS.map((plan) => (
              <GlassCard
                key={plan.name}
                hoverable
                glow={plan.popular}
                className={`p-7 flex flex-col relative ${plan.popular ? "ring-1 ring-lime/30" : ""}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-lime text-bg text-[10px] font-mono font-bold tracking-wider">
                    MÁS POPULAR
                  </div>
                )}
                <h3 className="font-display text-text-hi text-2xl tracking-wide">{plan.name}</h3>
                <div className="flex items-baseline gap-1.5 mt-4 mb-5">
                  <span className="font-display text-lime" style={{ fontSize: "clamp(36px, 4vw, 48px)" }}>
                    ${plan.price}
                  </span>
                  <span className="text-xs font-mono text-text-muted">/mes</span>
                </div>
                <div className="flex flex-col gap-2.5 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <div key={f} className="flex items-center gap-2.5">
                      <Check size={14} className="text-lime shrink-0" />
                      <span className="font-body text-text-mid text-sm">{f}</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={onGoToApp}
                  className={`w-full py-3.5 rounded-xl text-center font-bold transition-all hover:scale-[1.02] text-sm ${
                    plan.popular
                      ? "bg-lime text-bg hover:shadow-glow-lime"
                      : "border border-lime-dim text-lime hover:bg-lime/10"
                  }`}
                >
                  EMPEZAR AHORA
                </button>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* Coaches */}
      <section id="coaches" ref={coachesRef} className={`px-4 sm:px-6 py-20 sm:py-28 max-w-6xl mx-auto ${coachesIn ? "animate-fade" : "opacity-0"}`}>
        <div className="text-center mb-14">
          <SectionLabel>EQUIPO</SectionLabel>
          <SectionTitle>NUESTROS COACHES</SectionTitle>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          {COACHES.map((c) => (
            <GlassCard key={c.name} hoverable className="flex items-center gap-5 px-8 py-6 w-full sm:w-auto">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center font-display text-xl text-bg shrink-0"
                style={{ backgroundColor: c.color }}
              >
                {c.initials}
              </div>
              <div>
                <h3 className="font-display text-text-hi text-xl tracking-wide">{c.name}</h3>
                <p className="text-xs font-mono text-text-muted mt-0.5">{c.specialty}</p>
              </div>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-6xl mx-auto px-4"><div className="glow-line" /></div>

      {/* Ubicación */}
      <section id="ubicacion" ref={ubicacionRef} className={`px-4 sm:px-6 py-20 sm:py-28 section-alt ${ubiIn ? "animate-fade" : "opacity-0"}`}>
        <div className="max-w-6xl mx-auto text-center">
          <SectionLabel>UBICACIÓN</SectionLabel>
          <SectionTitle>ENCONTRANOS</SectionTitle>

          <GlassCard className="p-8 sm:p-10 inline-flex flex-col items-center gap-5 mt-10 mx-auto">
            <div className="w-14 h-14 rounded-full bg-lime/10 border border-lime/20 flex items-center justify-center">
              <MapPin size={28} className="text-lime" />
            </div>
            <div>
              <p className="font-body text-text-hi font-semibold text-lg">OZ Entrenamiento</p>
              <p className="font-mono text-text-muted text-sm mt-1">Ingeniero White, Buenos Aires</p>
            </div>
            <div className="flex items-center gap-2 text-text-muted">
              <Clock size={14} />
              <span className="text-xs font-mono">Lun - Vie: 07:00 a 21:00</span>
            </div>
            <a
              href="https://www.instagram.com/oz.entrenamiento/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-lime border border-lime-dim hover:bg-lime/10 transition-all mt-1"
            >
              <InstagramIcon size={16} />
              Seguinos en Instagram
            </a>
          </GlassCard>
        </div>
      </section>

      {/* CTA Final */}
      <section ref={ctaRef} className={`px-4 sm:px-6 py-20 sm:py-28 text-center hero-gradient ${ctaIn ? "animate-fade" : "opacity-0"}`}>
        <h2
          className="font-display text-text-hi tracking-wide"
          style={{ fontSize: "clamp(32px, 5vw, 56px)" }}
        >
          ¿LISTO PARA <span className="text-lime">ENTRENAR</span>?
        </h2>
        <p className="font-body text-text-mid text-base sm:text-lg max-w-md mx-auto mt-5 mb-10 leading-relaxed">
          Reservá tu primera clase gratis y conocé el gym.
        </p>
        <button
          onClick={onGoToApp}
          className="inline-flex items-center gap-2.5 px-10 py-4 rounded-xl font-bold bg-lime text-bg hover:shadow-glow-lime transition-all hover:scale-105"
        >
          RESERVAR AHORA
          <ArrowRight size={20} />
        </button>
      </section>

      {/* Footer */}
      <footer className="px-4 sm:px-6 py-10 border-t border-border">
        <div className="max-w-6xl mx-auto flex flex-col items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-lime flex items-center justify-center">
              <Dumbbell size={14} className="text-bg" />
            </div>
            <span className="font-display text-text-hi text-base tracking-wider">OZ ENTRENAMIENTO</span>
          </div>
          <p className="text-xs font-mono text-text-muted">
            &copy; {new Date().getFullYear()} OZ Entrenamiento &middot; Ingeniero White
          </p>
          <a
            href="https://www.instagram.com/oz.entrenamiento/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-text-muted hover:text-lime transition-colors"
            aria-label="Instagram"
          >
            <InstagramIcon size={20} />
          </a>
        </div>
      </footer>
    </div>
  );
}
