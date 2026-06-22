"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { getRoleLabel, getUserInitials } from "@/lib/auth";
import { getNavItemsForRole } from "@/lib/navigation";
import { Button } from "@/components/ui/button";

const featureStyles: Record<
  string,
  { color: string; bgColor: string; description: string }
> = {
  Accueil: {
    description: "Vue d'ensemble de la plateforme",
    color: "text-slate-600",
    bgColor: "bg-slate-100/90 dark:bg-slate-900/40",
  },
  "Tableau de bord": {
    description: "Indicateurs en temps réel",
    color: "text-violet-600",
    bgColor: "bg-violet-100/90 dark:bg-violet-900/40",
  },
  Inventaire: {
    description: "Stocks et lubrifiants",
    color: "text-emerald-600",
    bgColor: "bg-emerald-100/90 dark:bg-emerald-900/40",
  },
  Interventions: {
    description: "Suivi des opérations terrain",
    color: "text-blue-600",
    bgColor: "bg-blue-100/90 dark:bg-blue-900/40",
  },
  Exports: {
    description: "Exports et rapports",
    color: "text-cyan-600",
    bgColor: "bg-cyan-100/90 dark:bg-cyan-900/40",
  },
  Paramètres: {
    description: "Configuration générale",
    color: "text-rose-600",
    bgColor: "bg-rose-100/90 dark:bg-rose-900/40",
  },
  Alertes: {
    description: "Notifications critiques",
    color: "text-amber-600",
    bgColor: "bg-amber-100/90 dark:bg-amber-900/40",
  },
  
};

export default function LandingPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    if (mounted && !user) {
      router.replace("/login");
    }
  }, [mounted, user, router]);
  useEffect(() => {
    setMounted(true);
    const updateClock = () => setNow(new Date());
    updateClock();
    const timer = window.setInterval(updateClock, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const featureLinks = useMemo(() => {
    if (!user) return [];
  
    return getNavItemsForRole(user.role)
    
    .filter((item) => item.href !== "/" && item.href !== "/install")
      .map((item) => ({
        label: item.name,
        href: item.href,
        icon: item.icon,
        ...(featureStyles[item.name] ?? {
          description: "",
          color: "text-slate-600",
          bgColor: "bg-slate-100/90",
        }),
      }));
  }, [user]);

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

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <main className="w-full">
        <section className="relative min-h-screen overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(120deg,#f8fafc,#e2e8f0)]" />

          <div className="absolute left-0 top-0 h-[240px] w-full lg:h-[280px]">
            <img
              src="/api/landing-images/site"
              
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950/45 via-slate-950/25 to-slate-100" />
          </div>

          <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl items-center px-3 py-5 md:px-8 md:py-8">
            <div className="w-full rounded-3xl border border-slate-200 bg-white/95 p-4 shadow-xl sm:p-6 md:p-10">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <p className="inline-flex rounded-full border border-slate-300 bg-slate-100 px-4 py-1 text-xs font-semibold tracking-wide text-slate-700">
                  OCP Benguerir
                </p>
                {user && (
                  <div className="flex items-center gap-3">
                    <div className="hidden items-center gap-2 sm:flex">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1447E6] text-xs font-semibold text-white">
                        {getUserInitials(user)}
                      </div>
                      <div>
                      <p className="text-sm font-medium">Utilisateur</p>
<p className="text-xs text-muted-foreground">
  {getRoleLabel(user.role)}
</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleLogout}
                      className="gap-2"
                    >
                      <LogOut className="h-4 w-4" />
                      Déconnexion
                    </Button>
                  </div>
                )}
              </div>

              <div className="max-w-4xl space-y-4">
                {mounted && (
                  <div className="inline-flex flex-wrap items-center gap-2 rounded-full border border-[#1447E6]/25 bg-[#1447E6]/10 px-4 py-1.5 text-xs font-medium text-[#0f2a7a]">
                    <span className="capitalize">{currentDate}</span>
                    <span className="text-slate-400">•</span>
                    <span>{currentTime}</span>
                  </div>
                )}
                <h1 className="text-2xl font-extrabold leading-tight text-slate-900 sm:text-3xl md:text-5xl">
                  Plateforme OCP Benguerir - Gestion du Ravitaillement en
                  Lubrifiants
                </h1>
                <p className="max-w-3xl text-sm text-slate-700 md:text-base">
                  Centralisation des stocks, consommations et opérations terrain.
                </p>
              </div>

              <div className="mt-4 lg:hidden">
                <div className="relative h-24 overflow-hidden rounded-xl">
                  <img
                    src="/api/landing-images/site"
                  
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
                      <p className="text-base font-semibold text-slate-900">
                        {item.label}
                      </p>
                      <p className="mt-1 hidden text-xs text-slate-600 sm:block">
                        {item.description}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
