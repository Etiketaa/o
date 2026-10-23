import { useState, useEffect, type ReactNode } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import {
  Dumbbell,
  Zap,
  Heart,
  ArrowRight,
  Menu,
  X,
  Target,
  Check,
  ArrowDown,
  Share,
  Apple,
  Smartphone,
  MoreVertical,
  Plus,
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
    coach: "Kathy",
    schedule: "Lun a Vie 07:00 - 08:00",
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=400&fit=crop&q=80",
  },
  {
    name: "Pesas Libres",
    desc: "Trabajo de fuerza con libre elección de peso para ganar masa muscular.",
    icon: Dumbbell,
    coach: "Kathy",
    schedule: "Lun y Mar 09:00 / 19:00",
    image: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&h=400&fit=crop&q=80",
  },
  {
    name: "CrossTraining",
    desc: "Combinación de gimnástica, levantamiento de peso y cardio.",
    icon: Target,
    coach: "Kathy",
    schedule: "Lun, Mié y Vie 18:30",
    image: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=600&h=400&fit=crop&q=80",
  },
  {
    name: "Movilidad",
    desc: "Estiramientos y movilidad articular para prevenir lesiones.",
    icon: Heart,
    coach: "Kathy",
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
  { name: "Kathy", specialty: "Funcional & CrossTraining", initials: "KA", color: "#D4FF3D" },
];

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
};

const fadeInLeft = {
  hidden: { opacity: 0, x: -30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
};

const APP_URL = "https://turnero-gym-hazel.vercel.app";

const IPHONE_STEPS: ReactNode[] = [
  <>Abrí <strong className="text-neon font-semibold">Safari</strong> en tu iPhone.</>,
  <>Entrá a la URL de la app: <code className="text-neon font-mono text-xs break-all">{APP_URL}</code></>,
  <>Tocá el botón <strong className="text-neon font-semibold">Compartir</strong> (el cuadrado con la flecha hacia arriba, en la barra inferior).</>,
  <>Buscá y tocá <strong className="text-neon font-semibold">"Agregar a pantalla de inicio"</strong>.</>,
  <>Tocá <strong className="text-neon font-semibold">"Agregar"</strong> en la esquina superior derecha.</>,
  <>La app aparece en tu pantalla de inicio como un ícono.</>,
];

const ANDROID_STEPS: ReactNode[] = [
  <>Abrí <strong className="text-neon font-semibold">Chrome</strong> en tu Android.</>,
  <>Entrá a la URL de la app: <code className="text-neon font-mono text-xs break-all">{APP_URL}</code></>,
  <>Tocá los <strong className="text-neon font-semibold">3 puntos</strong> (menú) en la esquina superior derecha.</>,
  <>Tocá <strong className="text-neon font-semibold">"Instalar app"</strong> o <strong className="text-neon font-semibold">"Agregar a pantalla de inicio"</strong>.</>,
  <>Tocá <strong className="text-neon font-semibold">"Instalar"</strong> en el diálogo que aparece.</>,
  <>La app aparece en tu pantalla de inicio como un ícono.</>,
];

export function LandingView({ onGoToApp }: { onGoToApp: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0.8]);
  const heroScale = useTransform(scrollY, [0, 300], [1, 1.05]);
  const scrollIndicatorOpacity = useTransform(scrollY, [0, 100], [1, 0]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen overflow-y-auto bg-bg">
      {/* Navbar */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-bg/80 backdrop-blur-2xl border-b border-white/[0.06] shadow-[0_4px_30px_rgba(0,0,0,0.3)] py-3"
            : "bg-transparent py-5"
        }`}
      >
        <div className="max-w-[1280px] mx-auto px-6 md:px-10 flex items-center justify-between">
          <a href="#" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-chrome flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(212,255,61,0.4)]">
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
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="relative text-[13px] tracking-[0.06em] text-text-muted hover:text-text-hi transition-colors duration-300 group"
              >
                {item.label}
                <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-chrome transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(212,255,61,0.3)" }}
              whileTap={{ scale: 0.98 }}
              onClick={onGoToApp}
              className="px-7 py-3 text-[12px] font-semibold tracking-[0.08em] uppercase bg-chrome text-bg rounded-xl hover:-translate-y-0.5 transition-all duration-300"
            >
              Reservar
            </motion.button>
          </div>

          <button
            className="md:hidden p-2 text-text-hi hover:text-chrome transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden overflow-hidden bg-bg/95 backdrop-blur-2xl border-b border-white/[0.06]"
            >
              <div className="px-6 pb-8 pt-4 flex flex-col gap-2">
                {[
                  { href: "#actividades", label: "Actividades" },
                  { href: "#planes", label: "Planes" },
                  { href: "#coaches", label: "Coaches" },
                ].map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className="text-sm text-text-muted hover:text-text-hi py-3 px-2 transition-colors border-b border-white/[0.04]"
                  >
                    {item.label}
                  </a>
                ))}
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { setMenuOpen(false); onGoToApp(); }}
                  className="w-full py-4 mt-3 text-[12px] font-semibold tracking-[0.08em] uppercase bg-chrome text-bg rounded-xl"
                >
                  Reservar Clase
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Hero */}
      <motion.section
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="relative min-h-[100vh] md:min-h-screen flex items-center overflow-hidden"
      >
        {/* Background layers */}
        <div className="absolute inset-0">
          <div
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage: "url(https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1920&auto=format&fit=crop)",
              backgroundSize: "cover",
              backgroundPosition: "center 30%",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-bg via-bg/85 to-bg/50" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-bg" />
        </div>

        {/* Glow effect */}
        <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-chrome/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-chrome/3 rounded-full blur-[100px] pointer-events-none" />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(212,255,61,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(212,255,61,0.1) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />

        <div className="relative z-10 w-full max-w-[1280px] mx-auto px-6 md:px-10 pt-32 pb-20 md:pt-0 md:pb-0">
          <div className="max-w-[680px]">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              <motion.div variants={fadeInLeft} className="flex items-center gap-4 mb-8">
                <div className="w-12 h-[1px] bg-gradient-to-r from-chrome to-transparent" />
                <span className="text-[11px] tracking-[0.25em] uppercase text-chrome font-medium">
                  Ingeniero White, Buenos Aires
                </span>
              </motion.div>

              <motion.h1
                variants={fadeInUp}
                className="font-display text-text-hi text-[clamp(36px,8vw,96px)] leading-[0.92] uppercase tracking-[0.02em] mb-8"
              >
                ENTRENÁ<br />
                <span className="text-chrome drop-shadow-[0_0_30px_rgba(212,255,61,0.3)]">TU MEJOR</span><br />
                VERSIÓN
              </motion.h1>

              <motion.p
                variants={fadeInUp}
                className="text-text-mid text-lg md:text-xl max-w-[460px] mb-12 leading-relaxed"
              >
                Clases de funcional, pesas, cross training y movilidad. Reservá tu turno desde la app.
              </motion.p>

              <motion.div variants={fadeInUp} className="flex flex-wrap gap-5">
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(212,255,61,0.35)" }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onGoToApp}
                  className="group inline-flex items-center gap-3 px-10 py-5 text-[13px] font-semibold tracking-[0.08em] uppercase bg-chrome text-bg rounded-xl transition-all duration-300"
                >
                  Reservar mi clase
                  <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
                </motion.button>
                <motion.a
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  href="https://www.instagram.com/oz.entrenamiento/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 px-10 py-5 text-[13px] font-semibold tracking-[0.08em] uppercase border border-white/10 text-text-hi rounded-xl hover:border-white/20 hover:bg-white/[0.03] transition-all duration-300"
                >
                  <InstagramIcon size={18} />
                  Instagram
                </motion.a>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          style={{ opacity: scrollIndicatorOpacity }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-[10px] tracking-[0.2em] uppercase text-text-muted">Scroll</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <ArrowDown size={16} className="text-chrome/60" />
          </motion.div>
        </motion.div>
      </motion.section>

      {/* Actividades */}
      <section id="actividades" className="py-16 md:py-24 lg:py-40 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-bg via-surface/50 to-bg pointer-events-none" />
        <div className="relative z-10 max-w-[1280px] mx-auto px-6 md:px-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="mb-16 md:mb-20"
          >
            <motion.span variants={fadeInUp} className="text-[11px] tracking-[0.25em] uppercase text-chrome mb-4 block font-medium">
              Actividades
            </motion.span>
            <motion.h2 variants={fadeInUp} className="font-display text-text-hi text-[clamp(32px,5vw,52px)] uppercase tracking-[0.02em]">
              Nuestros servicios
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {ACTIVITIES.map((act) => {
              const Icon = act.icon;
              return (
                <motion.div
                  key={act.name}
                  variants={fadeInUp}
                  whileHover={{ y: -8, transition: { duration: 0.3 } }}
                  className="group relative bg-surface/50 border border-white/[0.06] rounded-2xl overflow-hidden hover:border-chrome/30 transition-all duration-500 hover:shadow-[0_20px_60px_rgba(0,0,0,0.4)]"
                >
                  <div className="relative h-52 overflow-hidden">
                    <img
                      src={act.image}
                      alt={act.name}
                      className="w-full h-full object-cover opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/20 to-transparent" />
                    <div className="absolute top-4 left-4">
                      <div className="w-10 h-10 rounded-xl bg-bg/60 backdrop-blur-xl border border-white/[0.08] flex items-center justify-center">
                        <Icon size={18} className="text-chrome" />
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="font-display text-text-hi text-2xl uppercase tracking-wide mb-3">
                      {act.name}
                    </h3>
                    <p className="text-text-muted text-sm leading-relaxed mb-5">
                      {act.desc}
                    </p>
                    <div className="flex items-center justify-between text-[10px] tracking-wider uppercase text-text-muted pt-4 border-t border-white/[0.06]">
                      <span>{act.coach}</span>
                      <span className="text-chrome-dim">{act.schedule.split(" ").slice(0, 3).join(" ")}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Planes */}
      <section id="planes" className="py-16 md:py-24 lg:py-40 relative">
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-chrome/[0.02] rounded-full blur-[150px] pointer-events-none" />
        </div>
        <div className="relative z-10 max-w-[1280px] mx-auto px-6 md:px-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="mb-16 md:mb-20 text-center"
          >
            <motion.span variants={fadeInUp} className="text-[11px] tracking-[0.25em] uppercase text-chrome mb-4 block font-medium">
              Planes
            </motion.span>
            <motion.h2 variants={fadeInUp} className="font-display text-text-hi text-[clamp(32px,5vw,52px)] uppercase tracking-[0.02em]">
              Elegí tu plan
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto"
          >
            {PLANS.map((plan) => (
              <motion.div
                key={plan.name}
                variants={fadeInUp}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                className={`relative bg-surface/50 border rounded-3xl p-8 md:p-10 flex flex-col ${
                  plan.popular
                    ? "border-chrome/40 shadow-[0_0_60px_rgba(212,255,61,0.1)]"
                    : "border-white/[0.06] hover:border-white/[0.12]"
                } transition-all duration-500`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-8 px-4 py-1.5 bg-chrome text-bg text-[10px] font-bold tracking-[0.15em] uppercase rounded-lg shadow-[0_4px_20px_rgba(212,255,61,0.3)]">
                    Popular
                  </div>
                )}
                <h3 className="font-display text-text-hi text-3xl uppercase tracking-wide">
                  {plan.name}
                </h3>
                <div className="flex items-baseline gap-1.5 mt-6 mb-8">
                  <span className="text-text-muted text-xl">$</span>
                  <span className="font-display text-chrome text-[clamp(40px,5vw,56px)] leading-none drop-shadow-[0_0_20px_rgba(212,255,61,0.2)]">
                    {plan.price}
                  </span>
                  <span className="text-text-muted text-base">/mes</span>
                </div>
                <div className="flex flex-col gap-4 mb-10 flex-1">
                  {plan.features.map((f) => (
                    <div key={f} className="flex items-center gap-4">
                      <div className="w-5 h-5 rounded-full bg-chrome/10 flex items-center justify-center shrink-0">
                        <Check size={12} className="text-chrome" />
                      </div>
                      <span className="text-text-mid text-sm leading-relaxed">{f}</span>
                    </div>
                  ))}
                </div>
                <motion.button
                  whileHover={{ scale: 1.02, boxShadow: plan.popular ? "0 0 40px rgba(212,255,61,0.3)" : "0 0 20px rgba(212,255,61,0.1)" }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onGoToApp}
                  className={`w-full py-4 text-[12px] font-semibold tracking-[0.08em] uppercase rounded-xl transition-all duration-300 ${
                    plan.popular
                      ? "bg-chrome text-bg"
                      : "border border-chrome/30 text-chrome hover:bg-chrome/5"
                  }`}
                >
                  Empezar ahora
                </motion.button>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Coaches */}
      <section id="coaches" className="py-16 md:py-24 lg:py-40 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-bg via-surface/50 to-bg pointer-events-none" />
        <div className="relative z-10 max-w-[1280px] mx-auto px-6 md:px-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="mb-16 md:mb-20"
          >
            <motion.span variants={fadeInUp} className="text-[11px] tracking-[0.25em] uppercase text-chrome mb-4 block font-medium">
              Equipo
            </motion.span>
            <motion.h2 variants={fadeInUp} className="font-display text-text-hi text-[clamp(32px,5vw,52px)] uppercase tracking-[0.02em]">
              Nuestros coaches
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl"
          >
            {COACHES.map((c) => (
              <motion.div
                key={c.name}
                variants={fadeInUp}
                whileHover={{ y: -4, transition: { duration: 0.3 } }}
                className="group bg-surface/50 border border-white/[0.06] rounded-2xl p-8 flex items-center gap-6 hover:border-chrome/20 transition-all duration-500"
              >
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center font-display text-2xl text-bg shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(212,255,61,0.2)]"
                  style={{ backgroundColor: c.color }}
                >
                  {c.initials}
                </div>
                <div>
                  <h3 className="font-display text-text-hi text-2xl uppercase tracking-wide">
                    {c.name}
                  </h3>
                  <p className="text-text-muted text-xs tracking-[0.1em] uppercase mt-2">
                    {c.specialty}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-bg to-surface/30 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-chrome/[0.03] rounded-full blur-[120px] pointer-events-none" />
        <div className="relative z-10 max-w-[1280px] mx-auto px-6 md:px-10 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            <motion.span variants={fadeInUp} className="text-[11px] tracking-[0.25em] uppercase text-chrome mb-5 block font-medium">
              Reservá en segundos
            </motion.span>
            <motion.h2 variants={fadeInUp} className="font-display text-text-hi text-[clamp(36px,6vw,56px)] uppercase tracking-[0.02em] mb-6">
              ¿Listo para <span className="text-chrome drop-shadow-[0_0_30px_rgba(212,255,61,0.3)]">entrenar</span>?
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-text-mid max-w-[440px] mx-auto mb-10 text-base md:text-lg leading-relaxed">
              Primera clase gratis. Confirmación inmediata por la app.
            </motion.p>
            <motion.div variants={fadeInUp}>
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 0 50px rgba(212,255,61,0.35)" }}
                whileTap={{ scale: 0.98 }}
                onClick={onGoToApp}
                className="group inline-flex items-center gap-3 px-10 py-5 text-[13px] font-semibold tracking-[0.08em] uppercase bg-chrome text-bg rounded-xl transition-all duration-300"
              >
                Reservar ahora
                <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Instalar app (PWA) */}
      <section id="instalar" className="py-16 md:py-24 lg:py-40 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-bg via-surface/50 to-bg pointer-events-none" />
        <div className="relative z-10 max-w-[1280px] mx-auto px-6 md:px-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="mb-16 md:mb-20 text-center"
          >
            <motion.span variants={fadeInUp} className="text-[11px] tracking-[0.25em] uppercase text-neon mb-4 block font-medium">
              Instalación
            </motion.span>
            <motion.h2 variants={fadeInUp} className="font-display text-text-hi text-[clamp(32px,5vw,52px)] uppercase tracking-[0.02em]">
              ¿Cómo instalar la app en tu celular?
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-text-mid max-w-[560px] mx-auto mt-6 text-base md:text-lg leading-relaxed">
              Tené OZ Entrenamiento en tu pantalla de inicio como si fuera una app nativa. Seguí los pasos según tu celular.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto"
          >
            {/* iPhone */}
            <motion.div
              variants={fadeInUp}
              className="brutal-card-neon p-6 md:p-8 flex flex-col gap-6"
            >
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="w-16 h-16 brutal-border-neon bg-ink flex items-center justify-center shrink-0">
                  <Apple size={48} className="text-text-hi" />
                </div>
                <div>
                  <h3 className="font-display text-text-hi text-xl uppercase tracking-wide">
                    iPhone / Safari
                  </h3>
                  <p className="text-text-muted text-xs tracking-wider uppercase mt-1">
                    Pasos para iOS
                  </p>
                </div>
              </div>
              <ol className="flex flex-col gap-4">
                {IPHONE_STEPS.map((step, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="shrink-0 w-7 h-7 flex items-center justify-center border-2 border-neon text-neon font-mono text-xs font-bold">
                      {i + 1}
                    </span>
                    <span className="text-text-mid text-sm leading-relaxed pt-0.5">{step}</span>
                  </li>
                ))}
              </ol>
              <div className="mt-auto pt-4 border-t border-neon/20 flex items-center gap-2 text-[11px] tracking-wider uppercase text-text-muted">
                <Share size={14} className="text-neon" />
                <span>Usá Safari, no Chrome ni Firefox</span>
              </div>
            </motion.div>

            {/* Android */}
            <motion.div
              variants={fadeInUp}
              className="brutal-card-neon p-6 md:p-8 flex flex-col gap-6"
            >
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="w-16 h-16 brutal-border-neon bg-ink flex items-center justify-center shrink-0">
                  <Smartphone size={48} className="text-neon" />
                </div>
                <div>
                  <h3 className="font-display text-text-hi text-xl uppercase tracking-wide">
                    Android / Chrome
                  </h3>
                  <p className="text-text-muted text-xs tracking-wider uppercase mt-1">
                    Pasos para Android
                  </p>
                </div>
              </div>
              <ol className="flex flex-col gap-4">
                {ANDROID_STEPS.map((step, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="shrink-0 w-7 h-7 flex items-center justify-center border-2 border-neon text-neon font-mono text-xs font-bold">
                      {i + 1}
                    </span>
                    <span className="text-text-mid text-sm leading-relaxed pt-0.5">{step}</span>
                  </li>
                ))}
              </ol>
              <div className="mt-auto pt-4 border-t border-neon/20 flex items-center gap-2 text-[11px] tracking-wider uppercase text-text-muted">
                <MoreVertical size={14} className="text-neon" />
                <span>Menú de 3 puntos arriba a la derecha</span>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            className="mt-10 text-center"
          >
            <button
              type="button"
              onClick={onGoToApp}
              className="brutal-btn brutal-btn-neon inline-flex items-center gap-3 px-8 py-4"
            >
              <Plus size={16} />
              Abrir la app
            </button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 md:py-16 border-t border-white/[0.06]">
        <div className="max-w-[1280px] mx-auto px-6 md:px-10">
          <div className="flex flex-col md:flex-row justify-between items-start gap-10 pb-10 border-b border-white/[0.06]">
            <div className="max-w-[320px]">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-chrome flex items-center justify-center">
                  <Dumbbell size={16} className="text-bg" />
                </div>
                <span className="font-display text-text-hi text-base tracking-[0.1em]">
                  OZ ENTRENAMIENTO
                </span>
              </div>
              <p className="text-text-muted text-[13px] leading-relaxed">
                Funcional, pesas y cross training en Ingeniero White.
              </p>
            </div>
            <div className="flex gap-10">
              {[
                { href: "#actividades", label: "Actividades" },
                { href: "#planes", label: "Planes" },
                { href: "https://www.instagram.com/oz.entrenamiento/", label: "Instagram" },
              ].map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  target={item.href.startsWith("http") ? "_blank" : undefined}
                  rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="text-[12px] text-text-muted hover:text-text-hi transition-colors uppercase tracking-wider"
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-8 text-[11px] text-text-muted">
            <span>© {new Date().getFullYear()} OZ Entrenamiento</span>
            <span>Ingeniero White, Buenos Aires</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
