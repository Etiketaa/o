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

import { COLORS } from "@/lib/utils";
import { GlassCard } from "@/components/GlassCard";
import { useInView } from "@/hooks/useInView";

const ACTIVITIES = [
  {
    name: "Funcional",
    desc: "Alta intensidad que mejora fuerza, resistencia y coordinación.",
    icon: Zap,
    coach: "Nacho / Vale",
    schedule: "Lun a Vie 07:00 - 08:00",
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=400&fit=crop&q=80",
  },
  {
    name: "Pesas Libres",
    desc: "Trabajo de fuerza con libre elección de peso para ganar masa muscular.",
    icon: Dumbbell,
    coach: "Vale",
    schedule: "Lun y Mar 09:00 / 19:00",
    image: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&h=400&fit=crop&q=80",
  },
  {
    name: "CrossTraining",
    desc: "Combinación de gimnástica, levantamiento de peso y cardio.",
    icon: Target,
    coach: "Nacho",
    schedule: "Lun, Mié y Vie 18:30",
    image: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=600&h=400&fit=crop&q=80",
  },
  {
    name: "Movilidad",
    desc: "Estiramientos y movilidad articular para prevenir lesiones.",
    icon: Heart,
    coach: "Vale",
    schedule: "Lun 20:00 / Jue 09:00",
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&h=400&fit=crop&q=80",
  },
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
  const [activitiesRef, activitiesIn] = useInView({ threshold: 0.1 });
  const [plansRef, plansIn] = useInView({ threshold: 0.1 });
  const [coachesRef, coachesIn] = useInView({ threshold: 0.1 });
  const [ctaRef, ctaIn] = useInView({ threshold: 0.1 });

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
        className={`hero-gradient flex flex-col items-center justify-center text-center px-4 sm:px-6 pt-28 pb-20 sm:pt-40 sm:pb-28 ${heroIn ? "animate-slide-up" : "opacity-0"}`}
        style={{ minHeight: "100vh" }}
      >
        <div className="max-w-3xl mx-auto">
          {/* Location badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border bg-surface/60 backdrop-blur-sm mb-10 animate-scale-in">
            <MapPin size={13} className="text-lime" />
            <span className="text-xs font-mono text-text-muted tracking-wide">INGENIERO WHITE, BS. AS.</span>
          </div>

          {/* Headline */}
          <h1
            className="font-display text-text-hi leading-none mb-8"
            style={{ fontSize: "clamp(52px, 10vw, 100px)", letterSpacing: "0.04em" }}
          >
            ENTRENÁ<br />
            <span className="text-lime">TU MEJOR</span><br />
            VERSIÓN
          </h1>

          {/* Glowing line */}
          <div className="glow-line w-32 mx-auto my-8" />

          {/* Subtitle */}
          <p className="font-body text-text-mid text-base sm:text-lg max-w-lg mx-auto mb-12 leading-relaxed">
            Clases de funcional, pesas, cross training y movilidad con coaches profesionales. Reservá tu turno desde la app.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onGoToApp}
              className="flex items-center gap-2.5 px-8 py-4 rounded-xl font-bold bg-lime text-bg hover:shadow-glow-lime transition-all hover:scale-105 text-sm"
            >
              RESERVAR MI CLASE
              <ArrowRight size={18} />
            </button>
            <a
              href="https://www.instagram.com/oz.entrenamiento/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 px-8 py-4 rounded-xl font-semibold text-text-hi border border-border bg-surface/60 backdrop-blur-sm hover:border-text-muted transition-all hover:scale-105 text-sm"
            >
              <InstagramIcon size={18} />
              @oz.entrenamiento
            </a>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center gap-12 mt-20">
            {[
              { value: "12+", label: "CLASES / SEMANA" },
              { value: "2", label: "COACHES" },
              { value: "4", label: "ACTIVIDADES" },
            ].map((stat, i) => (
              <div key={i} className="flex flex-col items-center">
                <span className="font-display text-lime stat-glow" style={{ fontSize: "clamp(36px, 5vw, 52px)" }}>
                  {stat.value}
                </span>
                <span className="text-[10px] font-mono text-text-muted tracking-wider mt-1.5">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50">
          <span className="text-[10px] font-mono text-text-muted tracking-widest">SCROLL</span>
          <ChevronDown size={16} className="text-text-muted animate-bounce" />
        </div>
      </section>

      {/* Actividades */}
      <section id="actividades" ref={activitiesRef} className={`px-4 sm:px-6 py-24 sm:py-32 max-w-6xl mx-auto ${activitiesIn ? "animate-fade" : "opacity-0"}`}>
        <div className="text-center mb-16">
          <SectionLabel>ACTIVIDADES</SectionLabel>
          <SectionTitle>ELEGÍ TU ENTRENAMIENTO</SectionTitle>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {ACTIVITIES.map((act) => {
            const Icon = act.icon;
            return (
              <GlassCard key={act.name} hoverable className="overflow-hidden">
                {/* Activity image */}
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={act.image}
                    alt={act.name}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-bg/90 via-bg/40 to-transparent" />
                  <div className="absolute bottom-4 left-5 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-lime/20 border border-lime/30 flex items-center justify-center backdrop-blur-sm">
                      <Icon size={20} className="text-lime" />
                    </div>
                    <h3 className="font-display text-text-hi text-2xl tracking-wide">{act.name}</h3>
                  </div>
                </div>
                {/* Content */}
                <div className="p-5">
                  <p className="font-body text-text-mid text-sm leading-relaxed">{act.desc}</p>
                  <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border">
                    <span className="text-[11px] font-mono text-text-muted">COACH: {act.coach.toUpperCase()}</span>
                    <span className="text-[11px] font-mono text-lime-dim">{act.schedule}</span>
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-6xl mx-auto px-4"><div className="glow-line" /></div>

      {/* Planes */}
      <section id="planes" ref={plansRef} className={`px-4 sm:px-6 py-24 sm:py-32 section-alt ${plansIn ? "animate-fade" : "opacity-0"}`}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <SectionLabel>PLANES</SectionLabel>
            <SectionTitle>ELIGÍ TU PLAN</SectionTitle>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
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

      {/* Divider */}
      <div className="max-w-6xl mx-auto px-4"><div className="glow-line" /></div>

      {/* Coaches */}
      <section id="coaches" ref={coachesRef} className={`px-4 sm:px-6 py-24 sm:py-32 max-w-6xl mx-auto ${coachesIn ? "animate-fade" : "opacity-0"}`}>
        <div className="text-center mb-16">
          <SectionLabel>EQUIPO</SectionLabel>
          <SectionTitle>NUESTROS COACHES</SectionTitle>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 max-w-2xl mx-auto">
          {COACHES.map((c) => (
            <GlassCard key={c.name} hoverable className="flex items-center gap-5 px-8 py-6 w-full sm:w-auto">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center font-display text-2xl text-bg shrink-0"
                style={{ backgroundColor: c.color }}
              >
                {c.initials}
              </div>
              <div>
                <h3 className="font-display text-text-hi text-xl tracking-wide">{c.name}</h3>
                <p className="text-xs font-mono text-text-muted mt-1">{c.specialty}</p>
              </div>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* CTA Final */}
      <section ref={ctaRef} className={`px-4 sm:px-6 py-24 sm:py-32 text-center hero-gradient ${ctaIn ? "animate-fade" : "opacity-0"}`}>
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

      {/* Footer con Ubicación integrada */}
      <footer className="border-t border-border">
        {/* Location info */}
        <div className="px-4 sm:px-6 py-12 section-alt">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              {/* Left: Info */}
              <div className="text-center md:text-left">
                <div className="flex items-center gap-3 justify-center md:justify-start mb-4">
                  <div className="w-10 h-10 rounded-xl bg-lime/10 border border-lime/20 flex items-center justify-center">
                    <MapPin size={20} className="text-lime" />
                  </div>
                  <div>
                    <p className="font-body text-text-hi font-semibold">OZ Entrenamiento</p>
                    <p className="font-mono text-text-muted text-xs">Ingeniero White, Buenos Aires</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-text-muted justify-center md:justify-start mb-4">
                  <Clock size={14} />
                  <span className="text-xs font-mono">Lun - Vie: 07:00 a 21:00</span>
                </div>
                <a
                  href="https://www.google.com/maps/place/OZ+Entrenamiento/@-38.7793,-62.2585,17z"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-lime border border-lime-dim hover:bg-lime/10 transition-all"
                >
                  <MapPin size={14} />
                  Cómo llegar
                </a>
              </div>

              {/* Right: Map embed */}
              <div className="rounded-xl overflow-hidden border border-border h-48 md:h-56">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3110.0!2d-62.2585!3d-38.7793!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzfCsDQ2JzQ1LjQiUyA2MsKwMTUnMzAuNiJX!5e0!3m2!1ses!2sar!4v1"
                  width="100%"
                  height="100%"
                  style={{ border: 0, filter: "grayscale(0.6) contrast(1.1) brightness(0.8)" }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Ubicación OZ Entrenamiento"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="px-4 sm:px-6 py-6 bg-bg">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-md bg-lime flex items-center justify-center">
                <Dumbbell size={12} className="text-bg" />
              </div>
              <span className="font-display text-text-hi text-sm tracking-wider">OZ ENTRENAMIENTO</span>
            </div>
            <p className="text-[11px] font-mono text-text-muted">
              &copy; {new Date().getFullYear()} OZ Entrenamiento &middot; Ingeniero White
            </p>
            <a
              href="https://www.instagram.com/oz.entrenamiento/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-muted hover:text-lime transition-colors"
              aria-label="Instagram"
            >
              <InstagramIcon size={18} />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
