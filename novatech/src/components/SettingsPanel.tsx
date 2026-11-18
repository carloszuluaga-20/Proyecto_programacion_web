"use client";

import { useEffect, useState } from "react";
import {
  Settings,
  Globe,
  Monitor,
  ShieldCheck,
  Database,
  CheckCircle2,
  Languages,
  Info,
  Save,
  Sparkles,
  Laptop,
  Check,
} from "lucide-react";

type Language = "es" | "en";

const LANGUAGE_KEY = "novatech_language";

const translations = {
  es: {
    title: "Configuración",
    subtitle: "Personaliza NovaTech para trabajar a tu manera.",
    badge: "PREFERENCIAS DEL SISTEMA",
    preferences: "Preferencias generales",
    preferencesDescription: "Ajusta la experiencia de uso de tu espacio de trabajo.",
    language: "Idioma del sistema",
    languageDescription: "Elige el idioma de los menús y módulos de NovaTech.",
    spanish: "Español",
    english: "Inglés",
    selected: "Seleccionado",
    save: "Guardar preferencias",
    saved: "Preferencias guardadas correctamente.",
    saveError: "No se pudieron guardar las preferencias. Inténtalo de nuevo.",
    information: "Información del sistema",
    informationDescription: "Detalles de la plataforma y sus tecnologías.",
    application: "Aplicación",
    applicationValue: "NovaTech Inventory Manager",
    version: "Versión",
    versionValue: "1.0.0 (desarrollo)",
    platform: "Plataforma",
    platformValue: "Aplicación web",
    database: "Base de datos",
    databaseValue: "PostgreSQL",
    security: "Seguridad",
    securityValue: "Autenticación de usuarios",
    status: "Estado del sistema",
    statusValue: "Configuración disponible",
    note: "El idioma se guarda en este navegador y se aplica a los módulos de NovaTech al guardar los cambios.",
  },
  en: {
    title: "Settings",
    subtitle: "Customize NovaTech to work your way.",
    badge: "SYSTEM PREFERENCES",
    preferences: "General preferences",
    preferencesDescription: "Customize your workspace experience.",
    language: "System language",
    languageDescription: "Choose the language used across NovaTech menus and modules.",
    spanish: "Spanish",
    english: "English",
    selected: "Selected",
    save: "Save preferences",
    saved: "Preferences saved successfully.",
    saveError: "Could not save preferences. Please try again.",
    information: "System information",
    informationDescription: "Platform details and technologies.",
    application: "Application",
    applicationValue: "NovaTech Inventory Manager",
    version: "Version",
    versionValue: "1.0.0 (development)",
    platform: "Platform",
    platformValue: "Web application",
    database: "Database",
    databaseValue: "PostgreSQL",
    security: "Security",
    securityValue: "User authentication",
    status: "System status",
    statusValue: "Settings available",
    note: "Your language preference is saved in this browser and applied across NovaTech modules when you save changes.",
  },
};

export default function SettingsPanel() {
  const [language, setLanguage] = useState<Language>("es");
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const storedLanguage = window.localStorage.getItem(LANGUAGE_KEY);
      if (storedLanguage === "es" || storedLanguage === "en") {
        setLanguage(storedLanguage);
      }
    } catch (error) {
      console.error("Could not load language preference:", error);
    } finally {
      setReady(true);
    }
  }, []);

  const t = translations[language];

  function changeLanguage(value: Language) {
    setLanguage(value);
    setSaved(false);
    setSaveError(false);
  }

  function savePreferences() {
    try {
      window.localStorage.setItem(LANGUAGE_KEY, language);
      window.dispatchEvent(
        new CustomEvent("novatech-language-change", {
          detail: { language },
        }),
      );
      document.documentElement.lang = language;
      setSaved(true);
      setSaveError(false);
    } catch (error) {
      console.error("Could not save language preference:", error);
      setSaved(false);
      setSaveError(true);
    }
  }

  const information = [
    { label: t.application, value: t.applicationValue, icon: Monitor },
    { label: t.version, value: t.versionValue, icon: Settings },
    { label: t.platform, value: t.platformValue, icon: Globe },
    { label: t.database, value: t.databaseValue, icon: Database },
    { label: t.security, value: t.securityValue, icon: ShieldCheck },
    { label: t.status, value: t.statusValue, icon: CheckCircle2, success: true },
  ];

  return (
    <div className="space-y-6 pb-6">
      <section className="relative overflow-hidden rounded-[26px] bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 p-6 text-white shadow-lg shadow-blue-900/10 sm:p-8">
        <div className="pointer-events-none absolute -right-12 -top-20 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute bottom-0 right-24 h-28 w-28 rounded-full bg-cyan-300/10 blur-xl" />
        <div className="relative flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/15 shadow-inner">
            <Settings size={27} />
          </div>
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-bold tracking-[0.16em] text-blue-50">
              <Sparkles size={12} />
              {t.badge}
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              {t.title}
            </h1>
            <p className="mt-2 text-sm text-blue-100 sm:text-base">
              {t.subtitle}
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <section className="overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-5 sm:px-7">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <Globe size={22} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">{t.preferences}</h2>
              <p className="mt-0.5 text-sm text-slate-500">{t.preferencesDescription}</p>
            </div>
          </div>

          <div className="space-y-6 p-5 sm:p-7">
            <div>
              <div className="flex items-center gap-2 text-slate-800">
                <Languages size={19} className="text-blue-600" />
                <h3 className="text-sm font-bold">{t.language}</h3>
              </div>
              <p className="mt-2 text-sm text-slate-500">{t.languageDescription}</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2" role="group" aria-label={t.language}>
              {(["es", "en"] as const).map((value) => {
                const isSelected = language === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => changeLanguage(value)}
                    disabled={!ready}
                    aria-pressed={isSelected}
                    className={`relative flex min-h-28 flex-col items-start justify-between rounded-2xl border p-4 text-left transition-all disabled:opacity-50 ${
                      isSelected
                        ? "border-blue-500 bg-blue-50/70 shadow-sm ring-2 ring-blue-500/10"
                        : "border-slate-200 bg-white hover:border-blue-200 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex w-full items-center justify-between gap-2">
                      <span className={`flex h-10 w-10 items-center justify-center rounded-xl text-sm font-extrabold ${isSelected ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"}`}>
                        {value.toUpperCase()}
                      </span>
                      {isSelected && <CheckCircle2 size={20} className="text-blue-600" />}
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className="font-bold text-slate-900">{value === "es" ? t.spanish : t.english}</span>
                      {isSelected && <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700">{t.selected}</span>}
                    </div>
                  </button>
                );
              })}
            </div>

            {saved && (
              <div role="status" className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-700">
                <CheckCircle2 size={19} className="shrink-0" />
                {t.saved}
              </div>
            )}
            {saveError && (
              <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
                {t.saveError}
              </div>
            )}

            <button
              type="button"
              onClick={savePreferences}
              disabled={!ready}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-bold text-white shadow-md shadow-blue-600/15 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              {saved ? <Check size={18} /> : <Save size={18} />}
              {t.save}
            </button>
          </div>
        </section>

        <section className="overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-5 sm:px-7">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
              <Laptop size={22} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">{t.information}</h2>
              <p className="mt-0.5 text-sm text-slate-500">{t.informationDescription}</p>
            </div>
          </div>

          <div className="divide-y divide-slate-100 px-5 sm:px-7">
            {information.map(({ label, value, icon: Icon, success }) => (
              <div key={label} className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                <div className="flex items-center gap-3">
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${success ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"}`}>
                    <Icon size={17} />
                  </div>
                  <span className="text-sm font-semibold text-slate-700">{label}</span>
                </div>
                <span className={`text-sm sm:text-right ${success ? "font-bold text-emerald-700" : "font-medium text-slate-600"}`}>
                  {value}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50/80 p-4 sm:p-5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
          <Info size={19} />
        </div>
        <p className="pt-1.5 text-sm leading-6 text-blue-800">{t.note}</p>
      </div>
    </div>
  );
}
