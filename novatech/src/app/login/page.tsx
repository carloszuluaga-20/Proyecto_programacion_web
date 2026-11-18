"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Boxes,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Package,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  AlertCircle,
  Loader2,
} from "lucide-react";

type Language = "es" | "en";
const LANGUAGE_KEY = "novatech_language";

const translations = {
  es: {
    platform: "PLATAFORMA DE GESTIÓN",
    heroTitle: "Tu negocio,",
    heroAccent: "mejor organizado.",
    heroDescription:
      "Controla tu inventario, organiza tus productos y gestiona tus ventas desde un solo lugar.",
    featureInventory: "Inventario en tiempo real",
    featureSales: "Gestión de ventas",
    featureSecurity: "Acceso seguro",
    welcome: "Bienvenido de nuevo",
    description: "Ingresa tus datos para acceder a tu espacio de trabajo.",
    email: "Correo electrónico",
    emailPlaceholder: "correo@ejemplo.com",
    password: "Contraseña",
    passwordPlaceholder: "Ingresa tu contraseña",
    showPassword: "Mostrar contraseña",
    hidePassword: "Ocultar contraseña",
    login: "Iniciar sesión",
    loggingIn: "Ingresando...",
    invalidCredentials: "Correo o contraseña incorrectos.",
    loginError: "No se pudo iniciar sesión. Inténtalo nuevamente.",
    unexpectedError: "Ocurrió un error inesperado.",
    footer: "Todos los derechos reservados.",
    secureAccess: "Acceso protegido",
    language: "Idioma",
  },
  en: {
    platform: "MANAGEMENT PLATFORM",
    heroTitle: "Your business,",
    heroAccent: "better organized.",
    heroDescription:
      "Track inventory, organize products, and manage sales from one place.",
    featureInventory: "Real-time inventory",
    featureSales: "Sales management",
    featureSecurity: "Secure access",
    welcome: "Welcome back",
    description: "Enter your credentials to access your workspace.",
    email: "Email address",
    emailPlaceholder: "email@example.com",
    password: "Password",
    passwordPlaceholder: "Enter your password",
    showPassword: "Show password",
    hidePassword: "Hide password",
    login: "Sign in",
    loggingIn: "Signing in...",
    invalidCredentials: "Incorrect email or password.",
    loginError: "Could not sign in. Please try again.",
    unexpectedError: "An unexpected error occurred.",
    footer: "All rights reserved.",
    secureAccess: "Protected access",
    language: "Language",
  },
};

export default function LoginPage() {
  const router = useRouter();
  const [language, setLanguage] = useState<Language>("es");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(LANGUAGE_KEY);
      if (stored === "es" || stored === "en") {
        setLanguage(stored);
        document.documentElement.lang = stored;
      }
    } catch (err) {
      console.error("Could not load language preference:", err);
    }
  }, []);

  const t = translations[language];

  function changeLanguage(nextLanguage: Language) {
    setLanguage(nextLanguage);
    setError("");
    document.documentElement.lang = nextLanguage;
    try {
      window.localStorage.setItem(LANGUAGE_KEY, nextLanguage);
      window.dispatchEvent(
        new CustomEvent("novatech-language-change", {
          detail: { language: nextLanguage },
        }),
      );
    } catch (err) {
      console.error("Could not save language preference:", err);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error(t.invalidCredentials);
        }
        throw new Error(t.loginError);
      }

      router.replace("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.unexpectedError);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f6f8fc] text-slate-900 lg:grid lg:grid-cols-2">
      {/* Brand and product introduction */}
      <section className="relative hidden min-h-screen overflow-hidden bg-gradient-to-br from-[#123cbb] via-[#254ed6] to-[#6546cf] p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-16">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-28 -top-28 h-96 w-96 rounded-full border border-white/15" />
          <div className="absolute -right-12 -top-12 h-72 w-72 rounded-full border border-white/15" />
          <div className="absolute -bottom-40 -left-28 h-[30rem] w-[30rem] rounded-full bg-white/10 blur-3xl" />
          <div className="absolute right-0 top-1/2 h-80 w-80 rounded-full bg-indigo-300/20 blur-3xl" />
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-white/15 shadow-lg shadow-blue-950/10 backdrop-blur-sm">
            <Boxes size={27} strokeWidth={2.2} />
          </div>
          <div>
            <p className="text-2xl font-extrabold tracking-tight">NovaTech</p>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-blue-100/85">
              Inventory & Sales
            </p>
          </div>
        </div>

        <div className="relative z-10 max-w-xl py-16">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold tracking-[0.14em] text-blue-50 backdrop-blur-sm">
            <Sparkles size={15} />
            {t.platform}
          </div>
          <h1 className="text-5xl font-extrabold leading-[1.12] tracking-tight xl:text-6xl">
            {t.heroTitle}
            <br />
            <span className="text-blue-100">{t.heroAccent}</span>
          </h1>
          <p className="mt-6 max-w-md text-base leading-8 text-blue-100/90">
            {t.heroDescription}
          </p>

          <div className="mt-10 grid max-w-md gap-3">
            {[
              { icon: Package, label: t.featureInventory },
              { icon: ShoppingBag, label: t.featureSales },
              { icon: ShieldCheck, label: t.featureSecurity },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-4 py-3.5 backdrop-blur-sm"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
                  <Icon size={19} />
                </div>
                <span className="text-sm font-semibold">{label}</span>
                <CheckCircle2 size={17} className="ml-auto text-blue-100" />
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-xs text-blue-100/75">
          © 2026 NovaTech. {t.footer}
        </p>
      </section>

      {/* Login form */}
      <section className="flex min-h-screen flex-col px-5 py-6 sm:px-10 lg:px-12 xl:px-20">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 lg:invisible">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 text-white">
              <Boxes size={23} />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-slate-900">
              NovaTech
            </span>
          </div>
          <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm" aria-label={t.language}>
            <button
              type="button"
              onClick={() => changeLanguage("es")}
              aria-pressed={language === "es"}
              className={`rounded-lg px-3 py-2 text-xs font-bold transition ${language === "es" ? "bg-blue-600 text-white shadow-sm" : "text-slate-500 hover:bg-slate-100"}`}
            >
              ES
            </button>
            <button
              type="button"
              onClick={() => changeLanguage("en")}
              aria-pressed={language === "en"}
              className={`rounded-lg px-3 py-2 text-xs font-bold transition ${language === "en" ? "bg-blue-600 text-white shadow-sm" : "text-slate-500 hover:bg-slate-100"}`}
            >
              EN
            </button>
          </div>
        </div>

        <div className="mx-auto flex w-full max-w-[440px] flex-1 flex-col justify-center py-12">
          <div className="mb-8">
            <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 text-blue-600">
              <LockKeyhole size={26} />
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
              {t.welcome}
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              {t.description}
            </p>
          </div>

          <div className="rounded-[24px] border border-slate-200/90 bg-white p-6 shadow-[0_18px_60px_-30px_rgba(15,23,42,0.24)] sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-semibold text-slate-700">
                  {t.email}
                </label>
                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/60 px-4 transition focus-within:border-blue-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-500/10">
                  <Mail size={19} className="shrink-0 text-slate-400" />
                  <input
                    id="email"
                    type="email"
                    autoComplete="username"
                    required
                    disabled={loading}
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder={t.emailPlaceholder}
                    className="w-full min-w-0 bg-transparent py-3.5 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-semibold text-slate-700">
                  {t.password}
                </label>
                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/60 px-4 transition focus-within:border-blue-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-500/10">
                  <LockKeyhole size={19} className="shrink-0 text-slate-400" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    disabled={loading}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder={t.passwordPlaceholder}
                    className="w-full min-w-0 bg-transparent py-3.5 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    aria-label={showPassword ? t.hidePassword : t.showPassword}
                    title={showPassword ? t.hidePassword : t.showPassword}
                    className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-200/70 hover:text-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                  >
                    {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                  </button>
                </div>
              </div>

              {error && (
                <div role="alert" className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-700">
                  <AlertCircle size={18} className="mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:from-blue-700 hover:to-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? <Loader2 size={19} className="animate-spin" /> : <ArrowRight size={19} />}
                {loading ? t.loggingIn : t.login}
              </button>
            </form>
          </div>

          <div className="mt-6 flex items-center justify-center gap-2 text-xs font-medium text-slate-400">
            <ShieldCheck size={16} className="text-emerald-500" />
            {t.secureAccess}
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 lg:hidden">
          © 2026 NovaTech. {t.footer}
        </p>
      </section>
    </main>
  );
}
