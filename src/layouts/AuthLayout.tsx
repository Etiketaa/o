import { useState } from "react";
import { Dumbbell, Mail, Lock, Eye, EyeOff, User, Phone, ArrowLeft } from "lucide-react";
import { COLORS, FONTS } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import { isMockMode } from "@/lib/supabase";
import { useToast } from "@/components/Toast";
import { ErrorMessage } from "@/components/ErrorMessage";

type Mode = "login" | "register";

interface AuthLayoutProps {
  onBack?: () => void;
}

export function AuthLayout({ onBack }: AuthLayoutProps) {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { login, signup, loginAs, loading } = useAuthStore();
  const { pushToast } = useToast();

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
      const result = await signup(email, password, nombre.trim(), telefono.trim());
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess("Cuenta creada. Revisa tu email para confirmar el registro.");
        pushToast("Cuenta creada. Revisá tu email para confirmar el registro.", "success");
        setMode("login");
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-full px-6" style={{ backgroundColor: COLORS.bg }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap');
      `}</style>

      {onBack && (
        <button
          onClick={onBack}
          aria-label="Volver al inicio"
          className="absolute top-4 left-4 flex items-center gap-1 text-xs"
          style={{ fontFamily: FONTS.mono, color: COLORS.textMuted }}
        >
          <ArrowLeft size={14} /> Volver
        </button>
      )}

      <div className="flex flex-col items-center gap-3 mb-8">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{ backgroundColor: COLORS.lime }}
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
          style={{ fontFamily: FONTS.body, color: COLORS.bg, backgroundColor: COLORS.lime }}
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
              style={{ color: COLORS.lime }}
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
            style={{ color: COLORS.lime }}
          >
            <ArrowLeft size={14} /> Volver al login
          </button>
        )}

        {isMockMode && (
          <div className="w-full flex flex-col gap-3 mt-4">
            <p style={{ fontFamily: FONTS.mono, color: COLORS.textMuted }} className="text-xs text-center">
              ACCESO RÁPIDO (DEMO - sin backend)
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => loginAs("admin")}
                className="flex-1 py-3 rounded-lg text-center text-sm font-semibold transition-opacity hover:opacity-90"
                style={{
                  fontFamily: FONTS.body,
                  color: COLORS.lime,
                  border: `1px solid ${COLORS.limeDim}`,
                  backgroundColor: "transparent",
                }}
              >
                Demo Admin
              </button>
              <button
                onClick={() => loginAs("alumno")}
                className="flex-1 py-3 rounded-lg text-center text-sm font-semibold transition-opacity hover:opacity-90"
                style={{
                  fontFamily: FONTS.body,
                  color: COLORS.lime,
                  border: `1px solid ${COLORS.limeDim}`,
                  backgroundColor: "transparent",
                }}
              >
                Demo Alumno
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
