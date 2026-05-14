"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  BarChart3,
  Download,
  ArrowRight,
  Package,
  Settings,
  Wrench,
} from "lucide-react";

const featureLinks = [
  {
    label: "Interventions",
    description: "Suivi des opérations terrain",
    href: "/interventions",
    icon: Wrench,
    color: "text-blue-600",
    bgColor: "bg-blue-100/90 dark:bg-blue-900/40",
  },
  {
    label: "Inventaire",
    description: "Stocks et lubrifiants",
    href: "/inventaire",
    icon: Package,
    color: "text-emerald-600",
    bgColor: "bg-emerald-100/90 dark:bg-emerald-900/40",
  },
  {
    label: "Alertes",
    description: "Notifications critiques",
    href: "/alertes",
    icon: AlertTriangle,
    color: "text-amber-600",
    bgColor: "bg-amber-100/90 dark:bg-amber-900/40",
  },
  {
    label: "Tableau de bord",
    description: "Indicateurs en temps reel",
    href: "/tableau-de-bord",
    icon: BarChart3,
    color: "text-violet-600",
    bgColor: "bg-violet-100/90 dark:bg-violet-900/40",
  },
  {
    label: "Export",
    description: "Exports et rapports",
    href: "/exports",
    icon: Download,
    color: "text-cyan-600",
    bgColor: "bg-cyan-100/90 dark:bg-cyan-900/40",
  },
  {
    label: "Parametres",
    description: "Configuration generale",
    href: "/parametres",
    icon: Settings,
    color: "text-rose-600",
    bgColor: "bg-rose-100/90 dark:bg-rose-900/40",
  },
];

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setMounted(true);
    const updateClock = () => setNow(new Date());
    updateClock();
    const timer = window.setInterval(updateClock, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const currentDate = now
    ? new Intl.DateTimeFormat("fr-FR", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(now)
    : "Chargement de la date...";

  const currentTime = now
    ? new Intl.DateTimeFormat("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }).format(now)
    : "--:--:--";

  return (
    <main className="min-h-screen bg-slate-100">
      <section className="relative min-h-screen overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(120deg,#f8fafc,#e2e8f0)]" />

        {/* Photo unique horizontale en arrière-plan */}
        <div className="absolute left-0 top-0 h-[240px] w-full lg:h-[280px]">
          <img
            src="/api/landing-images/site"
            alt="Site industriel OCP Benguerir"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/45 via-slate-950/25 to-slate-100" />
        </div>

        <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl items-center px-3 py-5 md:px-8 md:py-8">
          <div className="w-full rounded-3xl border border-slate-200 bg-white/95 p-4 shadow-xl sm:p-6 md:p-10">
            <div className="max-w-4xl space-y-4">
              <p className="inline-flex rounded-full border border-slate-300 bg-slate-100 px-4 py-1 text-xs font-semibold tracking-wide text-slate-700">
                OCP Benguerir
              </p>
              {mounted && (
                <div className="inline-flex flex-wrap items-center gap-2 rounded-full border border-[#1447E6]/25 bg-[#1447E6]/10 px-4 py-1.5 text-xs font-medium text-[#0f2a7a]">
                  <span className="capitalize">{currentDate}</span>
                  <span className="text-slate-400">•</span>
                  <span>{currentTime}</span>
                </div>
              )}
              <h1 className="text-2xl font-extrabold leading-tight text-slate-900 sm:text-3xl md:text-5xl">
                Plateforme OCP Benguerir - Gestion du Ravitaillement en Lubrifiants
              </h1>
              <p className="max-w-3xl text-sm text-slate-700 md:text-base">
                Centralisation des stocks, consommations et operations terrain.
              </p>
            </div>

            <div className="mt-4 lg:hidden">
              <div className="relative h-24 overflow-hidden rounded-xl">
                <img
                  src="/api/landing-images/site"
                  alt="Site industriel OCP Benguerir"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-[#0f172a]/20" />
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {featureLinks.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="group rounded-2xl border border-slate-200 bg-white p-3.5 transition duration-200 hover:-translate-y-0.5 hover:border-[#1447E6]/35 hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <div className={`rounded-xl p-2.5 ${item.bgColor}`}>
                      <item.icon className={`h-5 w-5 ${item.color}`} />
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-500 transition group-hover:translate-x-0.5 group-hover:text-[#1447E6]" />
                  </div>
                  <div className="mt-3">
                    <p className="text-base font-semibold text-slate-900">{item.label}</p>
                    <p className="mt-1 hidden text-xs text-slate-600 sm:block">{item.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
