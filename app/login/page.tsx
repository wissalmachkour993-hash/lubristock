"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, Lock, User } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { getDefaultRoute } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const result = login(username, password);

    if (!result.success) {
      setError(result.error);
      setIsSubmitting(false);
      return;
    }

    router.replace(getDefaultRoute(result.user.role));
    setIsSubmitting(false);
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-100 px-4 py-8 dark:bg-slate-950">
      <div className="absolute inset-0 bg-[linear-gradient(120deg,#f8fafc,#e2e8f0)] dark:bg-[linear-gradient(120deg,#0f172a,#1e293b)]" />

      <div className="absolute left-0 top-0 h-48 w-full md:h-64">
        <img
          src="/api/landing-images/site"
          alt="Site industriel OCP Benguerir"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/50 via-slate-950/30 to-slate-100 dark:to-slate-950" />
      </div>

      <Card className="relative z-10 w-full max-w-md border-slate-200/80 bg-white/95 shadow-2xl backdrop-blur dark:border-slate-800 dark:bg-slate-900/95">
        <CardHeader className="space-y-4 pb-2 text-center">
          <div className="mx-auto flex items-center gap-3">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/OCP%20logo-x5nfLttde4Q4qAg5RIHltvZYJOE32v.jpg"
              alt="OCP"
              className="h-14 w-14 object-contain"
            />
            <div className="text-left">
              <p className="text-2xl font-bold text-[#22c55e]">LubriOCP</p>
              <p className="text-xs text-muted-foreground">
                Gestion du ravitaillement en lubrifiants
              </p>
            </div>
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">Connexion</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              OCP Benguerir — accès sécurisé à la plateforme
            </p>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Nom d&apos;utilisateur</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="username"
                  type="text"
                  autoComplete="username"
                  placeholder="operateur ou chefatelier"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  className="pl-9"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="pl-9 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground"
                  aria-label={
                    showPassword
                      ? "Masquer le mot de passe"
                      : "Afficher le mot de passe"
                  }
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-[#1447E6] hover:bg-[#1038c4]"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Connexion en cours...
                </>
              ) : (
                "Se connecter"
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Démonstration PFE — comptes de test disponibles sur demande.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
