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

export function LandingView({ onGoToApp }: { onGoToApp: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen overflow-y-auto bg-bg">
      {/* Navbar */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "bg-bg/95 backdrop-blur-xl border-b border-border" : "bg-bg/80 backdrop-blur-md"
        }`}
      >
        <div className="max-w-[1200px] mx-auto px-6 md:px-8 flex items-center justify-between h-16 md:h-20">
          <a href="#" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-lg bg-lime flex items-center justify-center transition-transform group-hover:scale-105">
              <Dumbbell size={20} className="text-bg" />
            </div>
            <div className="hidden sm:block">
              <span className="font-display text-text-hi text-xl tracking-[0.1em] block leading-none">
                OZ
              </span>
              <span className="text-[9px] tracking-[0.25em] uppercase text-text-muted block">
                ENTRENAMIENTO
              </span>
            </div>
          </a>

          <div className="hidden md:flex items-center gap-10">
            {[
              { href: "#actividades", label: "Actividades" },
              { href: "#planes", label: "Planes" },
              { href: "#coaches", label: "Coaches" },
              { href: "#ubicacion", label: "Ubicación" },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-[13px] tracking-[0.06em] text-text-muted hover:text-text-hi transition-colors duration-300"
              >
                {item.label}
              </a>
            ))}
            <button
              onClick={onGoToApp}
              className="px-6 py-3 text-[12px] font-semibold tracking-[0.08em] uppercase bg-lime text-bg rounded-[3px] hover:shadow-[0_4px_20px_rgba(212,255,61,0.3)] transition-all duration-300 hover:-translate-y-0.5"
            >
              Reservar
            </button>
          </div>

          <button
            className="md:hidden p-2 text-text-hi"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden px-6 pb-6 pt-2 flex flex-col gap-1 bg-bg/98 backdrop-blur-xl border-b border-border">
            {[
              { href: "#actividades", label: "Actividades" },
              { href: "#planes", label: "Planes" },
              { href: "#coaches", label: "Coaches" },
              { href: "#ubicacion", label: "Ubicación" },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="text-sm text-text-muted hover:text-text-hi py-3 px-2 transition-colors"
              >
                {item.label}
              </a>
            ))}
            <button
              onClick={() => { setMenuOpen(false); onGoToApp(); }}
              className="w-full py-3.5 mt-2 text-[12px] font-semibold tracking-[0.08em] uppercase bg-lime text-bg rounded-[3px]"
            >
              Reservar Clase
            </button>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="relative min-h-[90vh] md:min-h-screen flex items-center">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: "url(https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1920&auto=format&fit=crop)",
            backgroundSize: "cover",
            backgroundPosition: "center 30%",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-bg via-bg/90 to-bg/60" />

        <div className="relative z-10 w-full max-w-[1200px] mx-auto px-6 md:px-8 pt-24 pb-16 md:pt-0">
          <div className="max-w-[600px]">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-[1px] bg-lime" />
              <span className="text-[11px] tracking-[0.2em] uppercase text-lime font-medium">
                Ingeniero White, Buenos Aires
              </span>
            </div>

            <h1 className="font-display text-text-hi text-[clamp(44px,8vw,88px)] leading-[0.95] uppercase tracking-[0.02em] mb-6">
              ENTRENÁ<br />
              <span className="text-lime">TU MEJOR</span><br />
              VERSIÓN
            </h1>

            <p className="text-text-muted text-base md:text-lg max-w-[420px] mb-10 leading-relaxed">
              Clases de funcional, pesas, cross training y movilidad. Reservá tu turno desde la app.
            </p>

            <div className="flex flex-wrap gap-4">
              <button
                onClick={onGoToApp}
                className="inline-flex items-center gap-2 px-8 py-4 text-[12px] font-semibold tracking-[0.08em] uppercase bg-lime text-bg rounded-[3px] hover:shadow-[0_4px_20px_rgba(212,255,61,0.3)] transition-all duration-300 hover:-translate-y-0.5"
              >
                Reservar mi clase
                <ArrowRight size={16} />
              </button>
              <a
                href="https://www.instagram.com/oz.entrenamiento/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-4 text-[12px] font-semibold tracking-[0.08em] uppercase border border-border text-text-hi rounded-[3px] hover:border-text-muted transition-all duration-300"
              >
                <InstagramIcon size={16} />
                Instagram
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Actividades */}
      <section id="actividades" className="py-20 md:py-32 bg-surface">
        <div className="max-w-[1200px] mx-auto px-6 md:px-8">
          <div className="mb-12 md:mb-16">
            <span className="text-[11px] tracking-[0.2em] uppercase text-lime mb-3 block font-medium">
              Actividades
            </span>
            <h2 className="font-display text-text-hi text-[clamp(28px,4vw,44px)] uppercase tracking-[0.02em]">
              Nuestros servicios
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {ACTIVITIES.map((act) => {
              const Icon = act.icon;
              return (
                <div
                  key={act.name}
                  className="group bg-bg border border-border rounded-lg overflow-hidden hover:border-lime/40 transition-all duration-500"
                >
                  <div className="relative h-44 overflow-hidden">
                    <img
                      src={act.image}
                      alt={act.name}
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-bg/80 via-transparent to-transparent" />
                    <div className="absolute top-4 left-4">
                      <div className="w-9 h-9 rounded bg-bg/80 backdrop-blur-sm border border-border flex items-center justify-center">
                        <Icon size={16} className="text-lime" />
                      </div>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-display text-text-hi text-xl uppercase tracking-wide mb-2">
                      {act.name}
                    </h3>
                    <p className="text-text-muted text-sm leading-relaxed mb-4">
                      {act.desc}
                    </p>
                    <div className="flex items-center justify-between text-[10px] tracking-wider uppercase text-text-muted pt-3 border-t border-border">
                      <span>{act.coach}</span>
                      <span className="text-lime-dim">{act.schedule.split(" ").slice(0, 3).join(" ")}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Planes */}
      <section id="planes" className="py-20 md:py-32">
        <div className="max-w-[1200px] mx-auto px-6 md:px-8">
          <div className="mb-12 md:mb-16">
            <span className="text-[11px] tracking-[0.2em] uppercase text-lime mb-3 block font-medium">
              Planes
            </span>
            <h2 className="font-display text-text-hi text-[clamp(28px,4vw,44px)] uppercase tracking-[0.02em]">
              Elegí tu plan
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`relative bg-bg border rounded-lg p-6 md:p-8 flex flex-col ${
                  plan.popular
                    ? "border-lime/50 shadow-[0_0_30px_rgba(212,255,61,0.08)]"
                    : "border-border hover:border-border/80"
                } transition-all duration-500`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-6 px-3 py-1 bg-lime text-bg text-[10px] font-semibold tracking-wider uppercase rounded-[2px]">
                    Popular
                  </div>
                )}
                <h3 className="font-display text-text-hi text-2xl uppercase tracking-wide">
                  {plan.name}
                </h3>
                <div className="flex items-baseline gap-1 mt-4 mb-6">
                  <span className="text-text-muted text-lg">$</span>
                  <span className="font-display text-lime text-[clamp(32px,4vw,44px)] leading-none">
                    {plan.price}
                  </span>
                  <span className="text-text-muted text-sm">/mes</span>
                </div>
                <div className="flex flex-col gap-3 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <div key={f} className="flex items-center gap-3">
                      <Check size={14} className="text-lime shrink-0" />
                      <span className="text-text-mid text-sm">{f}</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={onGoToApp}
                  className={`w-full py-3.5 text-[12px] font-semibold tracking-[0.08em] uppercase rounded-[3px] transition-all duration-300 ${
                    plan.popular
                      ? "bg-lime text-bg hover:shadow-[0_4px_20px_rgba(212,255,61,0.3)]"
                      : "border border-lime-dim text-lime hover:bg-lime/5"
                  }`}
                >
                  Empezar ahora
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Coaches */}
      <section id="coaches" className="py-20 md:py-32 bg-surface">
        <div className="max-w-[1200px] mx-auto px-6 md:px-8">
          <div className="mb-12 md:mb-16">
            <span className="text-[11px] tracking-[0.2em] uppercase text-lime mb-3 block font-medium">
              Equipo
            </span>
            <h2 className="font-display text-text-hi text-[clamp(28px,4vw,44px)] uppercase tracking-[0.02em]">
              Nuestros coaches
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl">
            {COACHES.map((c) => (
              <div
                key={c.name}
                className="bg-bg border border-border rounded-lg p-6 flex items-center gap-5 hover:border-lime/30 transition-all duration-500"
              >
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center font-display text-xl text-bg shrink-0"
                  style={{ backgroundColor: c.color }}
                >
                  {c.initials}
                </div>
                <div>
                  <h3 className="font-display text-text-hi text-xl uppercase tracking-wide">
                    {c.name}
                  </h3>
                  <p className="text-text-muted text-xs tracking-wider uppercase mt-1">
                    {c.specialty}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 text-center">
        <div className="max-w-[1200px] mx-auto px-6 md:px-8">
          <span className="text-[11px] tracking-[0.2em] uppercase text-lime mb-4 block font-medium">
            Reservá en segundos
          </span>
          <h2 className="font-display text-text-hi text-[clamp(28px,5vw,48px)] uppercase tracking-[0.02em] mb-4">
            ¿Listo para <span className="text-lime">entrenar</span>?
          </h2>
          <p className="text-text-muted max-w-[400px] mx-auto mb-8 text-sm md:text-base">
            Primera clase gratis. Confirmación inmediata por la app.
          </p>
          <button
            onClick={onGoToApp}
            className="inline-flex items-center gap-2 px-8 py-4 text-[12px] font-semibold tracking-[0.08em] uppercase bg-lime text-bg rounded-[3px] hover:shadow-[0_4px_20px_rgba(212,255,61,0.3)] transition-all duration-300 hover:-translate-y-0.5"
          >
            Reservar ahora
            <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* Ubicación */}
      <section id="ubicacion" className="py-16 md:py-24 bg-surface border-t border-border">
        <div className="max-w-[1200px] mx-auto px-6 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div>
              <span className="text-[11px] tracking-[0.2em] uppercase text-lime mb-3 block font-medium">
                Ubicación
              </span>
              <h2 className="font-display text-text-hi text-[clamp(24px,3vw,36px)] uppercase tracking-[0.02em] mb-6">
                Encontranos en
              </h2>
              <div className="flex items-start gap-3 mb-4">
                <MapPin size={16} className="text-lime mt-1 shrink-0" />
                <div>
                  <p className="text-text-hi font-medium">OZ Entrenamiento</p>
                  <p className="text-text-muted text-sm">Ingeniero White, Buenos Aires</p>
                </div>
              </div>
              <div className="flex items-center gap-3 mb-6">
                <Clock size={16} className="text-lime shrink-0" />
                <span className="text-text-muted text-sm">Lun - Vie: 07:00 a 21:00</span>
              </div>
              <a
                href="https://www.google.com/maps/place/OZ+Entrenamiento/@-38.782176,-62.278327,17z"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 text-[12px] font-semibold tracking-[0.06em] uppercase border border-lime-dim text-lime rounded-[3px] hover:bg-lime/5 transition-all duration-300"
              >
                Cómo llegar
                <ArrowRight size={14} />
              </a>
            </div>
            <div className="rounded-lg overflow-hidden border border-border h-64 md:h-80">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d10189.126371122411!2d-62.278326847718574!3d-38.78217602091141!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95edbd00060bd291%3A0xb0ebdf63b216010e!2sOz%20Entrenamiento!5e1!3m2!1ses-419!2sar!4v1783733895894!5m2!1ses-419!2sar"
                width="100%"
                height="100%"
                style={{ border: 0, filter: "grayscale(0.7) contrast(1.05) brightness(0.85)" }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Ubicación OZ Entrenamiento"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 md:py-14 border-t border-border">
        <div className="max-w-[1200px] mx-auto px-6 md:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start gap-8 pb-8 border-b border-border">
            <div className="max-w-[280px]">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-7 h-7 rounded bg-lime flex items-center justify-center">
                  <Dumbbell size={14} className="text-bg" />
                </div>
                <span className="font-display text-text-hi text-sm tracking-[0.1em]">
                  OZ ENTRENAMIENTO
                </span>
              </div>
              <p className="text-text-muted text-[13px] leading-relaxed">
                Funcional, pesas y cross training en Ingeniero White.
              </p>
            </div>
            <div className="flex gap-8">
              <a href="#actividades" className="text-[12px] text-text-muted hover:text-text-hi transition-colors uppercase tracking-wider">
                Actividades
              </a>
              <a href="#planes" className="text-[12px] text-text-muted hover:text-text-hi transition-colors uppercase tracking-wider">
                Planes
              </a>
              <a
                href="https://www.instagram.com/oz.entrenamiento/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[12px] text-text-muted hover:text-text-hi transition-colors uppercase tracking-wider"
              >
                Instagram
              </a>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center gap-3 pt-6 text-[11px] text-text-muted">
            <span>© {new Date().getFullYear()} OZ Entrenamiento</span>
            <span>Ingeniero White, Buenos Aires</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
