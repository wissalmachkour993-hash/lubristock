import type { Metadata } from "next";
import { InstallGuide } from "@/components/install-guide";

export const metadata: Metadata = {
  title: "Installer l'application — OCP Lubrifiants",
  description:
    "Instructions pour installer Gestion Lubrifiants OCP sur iPhone, Android et PC (PWA, sans magasin d'applications).",
  robots: { index: true, follow: true },
};

export default function InstallPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/40">
      <InstallGuide />
    </div>
  );
}
