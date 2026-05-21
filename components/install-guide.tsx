"use client";

import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import {
  Droplets,
  Loader2,
  Smartphone,
  Share2,
  Home,
  MoreVertical,
  Copy,
  Check,
  Monitor,
  Download,
} from "lucide-react";

type DeviceKind = "ios" | "android" | "desktop";

function detectDevice(ua: string): DeviceKind {
  const isIOSDevice = /iPhone|iPad|iPod/i.test(ua);
  const isIPadOS =
    typeof navigator !== "undefined" &&
    navigator.platform === "MacIntel" &&
    navigator.maxTouchPoints > 1;
  if (isIOSDevice || isIPadOS) return "ios";
  if (/Android/i.test(ua)) return "android";
  return "desktop";
}

function StepBadge({ n }: { n: number }) {
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#003366] text-xs font-bold text-white">
      {n}
    </span>
  );
}

function DeviceCard({
  title,
  icon: Icon,
  children,
  highlight,
}: {
  title: string;
  icon: typeof Smartphone;
  children: ReactNode;
  highlight?: boolean;
}) {
  return (
    <section
      className={`rounded-2xl border bg-card p-5 text-left shadow-sm ${
        highlight ? "border-[#003366]/40 ring-2 ring-[#003366]/15" : "border-border"
      }`}
    >
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#003366]/10 text-[#003366]">
          <Icon className="h-5 w-5" aria-hidden />
        </div>
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
      </div>
      <ol className="space-y-4">{children}</ol>
    </section>
  );
}

function Step({ n, children }: { n: number; children: ReactNode }) {
  return (
    <li className="flex gap-3 text-sm leading-relaxed text-foreground">
      <StepBadge n={n} />
      <span className="pt-1">{children}</span>
    </li>
  );
}

export function InstallGuide() {
  const [device, setDevice] = useState<DeviceKind | null>(null);
  const [installUrl, setInstallUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setDevice(detectDevice(navigator.userAgent));
    setInstallUrl(`${window.location.origin}/install`);
  }, []);

  async function handleCopyLink(e: FormEvent) {
    e.preventDefault();
    try {
      await navigator.clipboard.writeText(installUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }

  if (device === null) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" aria-hidden />
        <span className="sr-only">Chargement…</span>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-10 pb-16 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#003366]/10 text-[#003366] ring-1 ring-[#003366]/20">
        <Droplets className="h-9 w-9" strokeWidth={1.75} aria-hidden />
      </div>

      <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        Gestion Lubrifiants OCP
      </h1>
      <p className="mt-2 text-sm text-muted-foreground sm:text-base">
        Installez l&apos;application sur votre appareil — sans App Store ni Play Store.
      </p>

      <Link
        href="/"
        className="mt-8 inline-flex w-full max-w-sm items-center justify-center rounded-xl bg-[#003366] px-5 py-3.5 text-base font-semibold text-white shadow-sm transition-opacity hover:opacity-95"
      >
        <Download className="mr-2 h-5 w-5" aria-hidden />
        Ouvrir l&apos;application
      </Link>

      <form
        onSubmit={handleCopyLink}
        className="mt-6 w-full rounded-2xl border border-border bg-card p-4 text-left shadow-sm"
      >
        <p className="text-xs font-medium text-foreground">Lien à partager avec l&apos;équipe</p>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row">
          <input
            readOnly
            value={installUrl}
            className="min-w-0 flex-1 rounded-lg border border-input bg-muted/40 px-3 py-2 text-sm"
            aria-label="Lien d'installation"
          />
          <button
            type="submit"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-[#003366] px-4 py-2 text-sm font-semibold text-white"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4" /> Copié
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" /> Copier
              </>
            )}
          </button>
        </div>
      </form>

      <div className="mt-10 w-full space-y-5">
        <DeviceCard
          title="iPhone / iPad"
          icon={Smartphone}
          highlight={device === "ios"}
        >
          <Step n={1}>
            Ouvrez ce site dans <strong>Safari</strong> (obligatoire pour l&apos;installation).
          </Step>
          <Step n={2}>
            <span className="inline-flex items-start gap-2">
              <Share2 className="mt-0.5 h-4 w-4 shrink-0 text-[#003366]" aria-hidden />
              Touchez <strong>Partager</strong> puis <strong>Sur l&apos;écran d&apos;accueil</strong>.
            </span>
          </Step>
          <Step n={3}>
            <span className="inline-flex items-start gap-2">
              <Home className="mt-0.5 h-4 w-4 shrink-0 text-[#003366]" aria-hidden />
              Validez : l&apos;icône <strong>LubriOCP</strong> apparaît sur votre écran d&apos;accueil.
            </span>
          </Step>
        </DeviceCard>

        <DeviceCard
          title="Android"
          icon={Smartphone}
          highlight={device === "android"}
        >
          <Step n={1}>
            Ouvrez ce site dans <strong>Chrome</strong>.
          </Step>
          <Step n={2}>
            <span className="inline-flex items-start gap-2">
              <MoreVertical className="mt-0.5 h-4 w-4 shrink-0 text-[#003366]" aria-hidden />
              Menu <strong>⋮</strong> → <strong>Installer l&apos;application</strong> ou{" "}
              <strong>Ajouter à l&apos;écran d&apos;accueil</strong>.
            </span>
          </Step>
          <Step n={3}>
            Confirmez : lancez <strong>LubriOCP</strong> depuis l&apos;icône comme une application.
          </Step>
        </DeviceCard>

        <DeviceCard title="PC (Windows / Mac)" icon={Monitor} highlight={device === "desktop"}>
          <Step n={1}>
            Utilisez <strong>Chrome</strong> ou <strong>Edge</strong>.
          </Step>
          <Step n={2}>
            Dans la barre d&apos;adresse, cliquez sur l&apos;icône <strong>Installer</strong> (⊕ ou ordinateur)
            si elle s&apos;affiche.
          </Step>
          <Step n={3}>
            Sinon : menu navigateur → <strong>Installer Gestion Lubrifiants OCP</strong> /{" "}
            <strong>Créer un raccourci</strong>.
          </Step>
        </DeviceCard>
      </div>

      <Link
        href="/"
        className="mt-10 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
      >
        Retour au tableau de bord
      </Link>
    </div>
  );
}
