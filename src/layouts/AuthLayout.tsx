import { useState } from "react";
import { Dumbbell, Mail, Lock, Eye, EyeOff, User, Phone, ArrowLeft } from "lucide-react";
import { COLORS, FONTS } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import { ErrorMessage } from "@/components/ErrorMessage";
import { OnboardingGuide } from "@/components/OnboardingGuide";


type Mode = "login" | "register";

interface AuthLayoutProps {
  onBack?: () => void;
  /** Primer arranque: muestra el formulario para crear la cuenta del profesor. */
  setup?: boolean;
}

export function AuthLayout({ onBack, setup = false }: AuthLayoutProps) {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showOnboarding, setShowOnboarding] = useState(false);
  const { login, signup, crearCuentaProfesor, loadSession, loading } = useAuthStore();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (mode === "login") {
      const result = await login(email, password);
      if (result.error) setError(result.error);
    } else {
      if (!nombre.trim()) {
        setError("Ingresá tu nombre");
        return;
      }
      const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      if (!emailValido) {
        setError("Ingresá un email válido");
        return;
      }
      if (!password) {
        setError("Ingresá una contraseña");
        return;
      }
      const result = await signup({
        email,
        password,
        nombre: nombre.trim(),
        telefono: telefono.trim(),
        frecuencia_semana: 2,
        franja: "ambas",
        slots_preferidos: [],
      });
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess("Cuenta creada. ¡Bienvenido/a!");
        setShowOnboarding(true);
      }
    }
  };

  // --- Modo setup: crear la cuenta del profesor (primer arranque) ---
  if (setup) {
    const handleSubmitSetup = async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");
      setSuccess("");

      if (!nombre.trim()) {
        setError("Ingresá tu nombre");
        return;
      }
      const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      if (!emailValido) {
        setError("Ingresá un email válido");
        return;
      }
      if (!password) {
        setError("Ingresá una contraseña");
        return;
      }

      const result = await crearCuentaProfesor({
        email: email.trim(),
        password,
        nombre: nombre.trim(),
        telefono: telefono.trim(),
        frecuencia_semana: 4,
        franja: "ambas",
        slots_preferidos: [],
      });
      if (result.error) {
        setError(result.error);
      } else {
        // Aseguramos que la sesión quede activa para entrar al app.
        await loadSession();
      }
    };

    return (
      <>
      <div className="relative flex flex-col items-center justify-center min-h-full px-6" style={{ backgroundColor: COLORS.bg }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap');
        `}</style>

        {onBack && (
          <button
            onClick={onBack}
            aria-label="Volver al inicio"
            className="absolute top-4 left-4 flex items-center gap-1 text-xs"
            style={{ fontFamily: FONTS.mono, color: COLORS.textHi }}
          >
            <ArrowLeft size={14} /> Volver
          </button>
        )}

        <div className="flex flex-col items-center gap-3 mb-8">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ backgroundColor: COLORS.chrome }}
          >
            <Dumbbell size={32} color={COLORS.bg} />
          </div>
          <h1 style={{ fontFamily: FONTS.display, color: COLORS.textHi, fontSize: 36, letterSpacing: 2 }}>
            CONFIGURACIÓN INICIAL
          </h1>
          <p style={{ fontFamily: FONTS.mono, color: COLORS.textMuted }} className="text-sm">
            Crear cuenta del profesor
          </p>
        </div>

        <form
          onSubmit={handleSubmitSetup}
          className="w-full max-w-sm flex flex-col gap-4 mb-6"
          aria-label="Formulario de configuración inicial"
          noValidate
        >
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-lg"
            style={{ backgroundColor: COLORS.surface, border: `1px solid ${COLORS.border}` }}
          >
            <User size={18} color={COLORS.textMuted} />
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Nombre completo"
              aria-label="Nombre completo"
              autoComplete="name"
              required
              className="flex-1 outline-none text-sm"
              style={{ fontFamily: FONTS.body, color: COLORS.textHi, backgroundColor: "transparent" }}
            />
          </div>

          <div
            className="flex items-center gap-3 px-4 py-3 rounded-lg"
            style={{ backgroundColor: COLORS.surface, border: `1px solid ${COLORS.border}` }}
          >
            <Phone size={18} color={COLORS.textMuted} />
            <input
              type="tel"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              placeholder="Teléfono"
              aria-label="Teléfono"
              autoComplete="tel"
              className="flex-1 outline-none text-sm"
              style={{ fontFamily: FONTS.body, color: COLORS.textHi, backgroundColor: "transparent" }}
            />
          </div>

          <div
            className="flex items-center gap-3 px-4 py-3 rounded-lg"
            style={{ backgroundColor: COLORS.surface, border: `1px solid ${COLORS.border}` }}
          >
            <Mail size={18} color={COLORS.textMuted} />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              aria-label="Email"
              autoComplete="email"
              required
              className="flex-1 outline-none text-sm"
              style={{ fontFamily: FONTS.body, color: COLORS.textHi, backgroundColor: "transparent" }}
            />
          </div>

          <div
            className="flex items-center gap-3 px-4 py-3 rounded-lg"
            style={{ backgroundColor: COLORS.surface, border: `1px solid ${COLORS.border}` }}
          >
            <Lock size={18} color={COLORS.textMuted} />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña"
              aria-label="Contraseña"
              autoComplete="new-password"
              required
              className="flex-1 outline-none text-sm"
              style={{ fontFamily: FONTS.body, color: COLORS.textHi, backgroundColor: "transparent" }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              aria-pressed={showPassword}
            >
              {showPassword ? <EyeOff size={16} color={COLORS.textMuted} /> : <Eye size={16} color={COLORS.textMuted} />}
            </button>
          </div>

          <ErrorMessage message={error} variant="error" />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg text-center font-bold transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ fontFamily: FONTS.body, color: COLORS.bg, backgroundColor: COLORS.chrome, minHeight: 44 }}
          >
            {loading ? "Cargando..." : "Crear cuenta del profesor"}
          </button>
        </form>
      </div>
      </>
    );
  }

  return (
    <>
    <div className="flex flex-col items-center justify-center min-h-full px-6" style={{ backgroundColor: COLORS.bg }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap');
      `}</style>

      {onBack && (
        <button
          onClick={onBack}
          aria-label="Volver al inicio"
          className="absolute top-4 left-4 flex items-center gap-1 text-xs"
          style={{ fontFamily: FONTS.mono, color: COLORS.textHi }}
        >
          <ArrowLeft size={14} /> Volver
        </button>
      )}

      <div className="flex flex-col items-center gap-3 mb-8">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{ backgroundColor: COLORS.chrome }}
        >
          <Dumbbell size={32} color={COLORS.bg} />
        </div>
        <h1 style={{ fontFamily: FONTS.display, color: COLORS.textHi, fontSize: 36, letterSpacing: 2 }}>
          TU GYM
        </h1>
        <p style={{ fontFamily: FONTS.mono, color: COLORS.textMuted }} className="text-sm">
          Ingeniero White
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm flex flex-col gap-4 mb-6"
        aria-label="Formulario de autenticación"
        noValidate
      >
        {mode === "register" && (
          <>
            <div
              className="flex items-center gap-3 px-4 py-3 rounded-lg"
              style={{ backgroundColor: COLORS.surface, border: `1px solid ${COLORS.border}` }}
            >
              <User size={18} color={COLORS.textMuted} />
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Nombre completo"
                aria-label="Nombre completo"
                title="Tu nombre completo tal como figura en tu documento"
                autoComplete="name"
                required
                className="flex-1 outline-none text-sm"
                style={{ fontFamily: FONTS.body, color: COLORS.textHi, backgroundColor: "transparent" }}
              />
            </div>
            <div
              className="flex items-center gap-3 px-4 py-3 rounded-lg"
              style={{ backgroundColor: COLORS.surface, border: `1px solid ${COLORS.border}` }}
            >
              <Phone size={18} color={COLORS.textMuted} />
              <input
                type="tel"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="Teléfono (opcional)"
                aria-label="Teléfono"
                title="Teléfono de contacto para que el profesor te avise si hay cambios"
                autoComplete="tel"
                className="flex-1 outline-none text-sm"
                style={{ fontFamily: FONTS.body, color: COLORS.textHi, backgroundColor: "transparent" }}
              />
            </div>

          </>
        )}

        <div
          className="flex items-center gap-3 px-4 py-3 rounded-lg"
          style={{ backgroundColor: COLORS.surface, border: `1px solid ${COLORS.border}` }}
        >
          <Mail size={18} color={COLORS.textMuted} />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            aria-label="Email"
            title="Usá el email que vas a revisar para recibir confirmaciones"
            autoComplete="email"
            required
            className="flex-1 outline-none text-sm"
            style={{ fontFamily: FONTS.body, color: COLORS.textHi, backgroundColor: "transparent" }}
          />
        </div>

        <div
          className="flex items-center gap-3 px-4 py-3 rounded-lg"
          style={{ backgroundColor: COLORS.surface, border: `1px solid ${COLORS.border}` }}
        >
          <Lock size={18} color={COLORS.textMuted} />
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña"
            aria-label="Contraseña"
            title="Mínimo 6 caracteres, no la compartas con nadie"
            autoComplete="current-password"
            required
            className="flex-1 outline-none text-sm"
            style={{ fontFamily: FONTS.body, color: COLORS.textHi, backgroundColor: "transparent" }}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            aria-pressed={showPassword}
          >
            {showPassword ? <EyeOff size={16} color={COLORS.textMuted} /> : <Eye size={16} color={COLORS.textMuted} />}
          </button>
        </div>

        <ErrorMessage message={error} variant="error" />
        <ErrorMessage message={success} variant="success" />

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-lg text-center font-bold transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{ fontFamily: FONTS.body, color: COLORS.bg, backgroundColor: COLORS.chrome }}
        >
          {loading ? "Cargando..." : mode === "login" ? "Iniciar sesión" : "Crear cuenta"}
        </button>
      </form>

      <div className="w-full max-w-sm flex flex-col gap-3 items-center">
        {mode === "login" ? (
          <p style={{ fontFamily: FONTS.body, color: COLORS.textMuted }} className="text-sm">
            ¿No tenés cuenta?{" "}
            <button
              onClick={() => { setMode("register"); setError(""); setSuccess(""); }}
              aria-label="Cambiar a registro"
              style={{ color: COLORS.chrome }}
              className="font-semibold"
            >
              Registrate
            </button>
          </p>
        ) : (
          <button
            onClick={() => { setMode("login"); setError(""); setSuccess(""); }}
            className="flex items-center gap-1 text-sm"
            aria-label="Volver al login"
            style={{ color: COLORS.chrome }}
          >
            <ArrowLeft size={14} /> Volver al login
          </button>
        )}

        <div className="w-full flex flex-col gap-3 mt-4">
          <p className="text-[10px] font-mono text-text-muted text-center uppercase tracking-wider">
            Acceso rápido (demo)
          </p>

        </div>
      </div>
    </div>

    <OnboardingGuide
      open={showOnboarding}
      onClose={() => {
        setShowOnboarding(false);
        setMode("login");
      }}
    />
    </>
  );
}
