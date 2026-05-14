import Head from "next/head";
import { useEffect, useState, FormEvent } from "react";
import { Droplets, Loader2, Smartphone, Share2, Home, MoreVertical, Copy, Check } from "lucide-react";

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

export default function DownloadPage() {
  const [device, setDevice] = useState<DeviceKind | null>(null);
  const [installUrl, setInstallUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setDevice(detectDevice(navigator.userAgent));
    setInstallUrl(`${window.location.origin}/download`);
  }, []);

  async function handleCopyInstallLink(e: FormEvent) {
    e.preventDefault();
    try {
      await navigator.clipboard.writeText(installUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  }

  if (device === null) {
    return (
      <>
        <Head>
          <title>LubriStock — Sur votre téléphone</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </Head>
        <div className="flex min-h-screen items-center justify-center bg-background">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" aria-hidden />
          <span className="sr-only">Chargement…</span>
        </div>
      </>
    );
  }

  const isMobile = device === "ios" || device === "android";

  return (
    <>
      <Head>
        <title>LubriStock — Sur votre téléphone</title>
        <meta
          name="description"
          content="Gérez vos stocks de lubrifiants facilement depuis votre mobile — application web, sans App Store ni Play Store."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/40 px-4 py-10 pb-16">
        <div className="mx-auto flex max-w-md flex-col items-center text-center">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20">
            <Droplets className="h-9 w-9" strokeWidth={1.75} aria-hidden />
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-foreground">LubriStock</h1>
          <p className="mt-3 text-base leading-relaxed text-muted-foreground">
            Gérez vos stocks de lubrifiants facilement depuis votre mobile
          </p>

          {isMobile ? (
            <>
              <a
                href="/"
                className="mt-10 inline-flex w-full max-w-sm items-center justify-center rounded-xl bg-primary px-5 py-3.5 text-base font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-95 active:opacity-90"
              >
                <Smartphone className="mr-2 h-5 w-5" aria-hidden />
                Ouvrir l&apos;application
              </a>
              <p className="mt-3 text-xs text-muted-foreground">
                Accès direct à l&apos;application web — aucun magasin d&apos;applications requis.
              </p>

              <div className="mt-10 w-full rounded-2xl border border-border bg-card p-5 text-left shadow-sm">
                <p className="text-sm font-semibold text-foreground">
                  {device === "ios" ? "Raccourci sur l’écran d’accueil (iPhone / iPad)" : "Installer sur l’écran d’accueil (Android)"}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Pour retrouver LubriStock comme une application : ajoutez cette page à votre écran d’accueil depuis le
                  navigateur.
                </p>
                {device === "ios" ? (
                  <ol className="mt-4 space-y-3 text-sm text-foreground">
                    <li className="flex gap-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold">
                        1
                      </span>
                      <span>
                        Ouvrez d&apos;abord{" "}
                        <a href="/" className="font-medium text-primary underline underline-offset-2">
                          l&apos;application
                        </a>{" "}
                        dans <strong>Safari</strong>.
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold">
                        2
                      </span>
                      <span className="flex items-start gap-2">
                        <Share2 className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                        Appuyez sur le bouton <strong>Partager</strong>, puis sur{" "}
                        <strong>Sur l&apos;écran d&apos;accueil</strong>.
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold">
                        3
                      </span>
                      <span className="flex items-start gap-2">
                        <Home className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                        Validez : l&apos;icône LubriStock apparaît sur votre écran d&apos;accueil.
                      </span>
                    </li>
                  </ol>
                ) : (
                  <ol className="mt-4 space-y-3 text-sm text-foreground">
                    <li className="flex gap-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold">
                        1
                      </span>
                      <span>
                        Ouvrez{" "}
                        <a href="/" className="font-medium text-primary underline underline-offset-2">
                          l&apos;application
                        </a>{" "}
                        dans <strong>Chrome</strong> (recommandé).
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold">
                        2
                      </span>
                      <span className="flex items-start gap-2">
                        <MoreVertical className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                        Menu <strong>⋮</strong> en haut à droite → choisissez{" "}
                        <strong>Installer l&apos;application</strong> ou <strong>Ajouter à l&apos;écran d&apos;accueil</strong>.
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold">
                        3
                      </span>
                      <span className="flex items-start gap-2">
                        <Home className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                        Confirmez : vous lancez LubriStock depuis l&apos;icône comme une app classique.
                      </span>
                    </li>
                  </ol>
                )}
              </div>
            </>
          ) : (
            <div className="mt-10 w-full rounded-2xl border border-border bg-card p-6 text-left shadow-sm">
              <p className="text-sm font-semibold text-foreground">Ouvrez ce lien sur votre téléphone</p>
              <p className="mt-2 text-xs text-muted-foreground">
                LubriStock est une <strong>application web</strong> : installez-la depuis le navigateur du téléphone
                (raccourci ou installation PWA), sans passer par l&apos;App Store ni le Play Store.
              </p>
              <form onSubmit={handleCopyInstallLink} className="mt-4 flex flex-col gap-2 sm:flex-row">
                <input
                  readOnly
                  value={installUrl}
                  className="min-w-0 flex-1 rounded-lg border border-input bg-muted/40 px-3 py-2 text-sm text-foreground"
                  aria-label="Lien à ouvrir sur le téléphone"
                />
                <button
                  type="submit"
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-95"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4" aria-hidden />
                      Copié
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" aria-hidden />
                      Copier le lien
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          <a
            href="/"
            className="mt-10 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Retour au site
          </a>
        </div>
      </div>
    </>
  );
}
