"use client";

import { AppLayout } from "@/components/app-layout";
import { Header } from "@/components/header";
import { useStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Moon,
  Sun,
  Download,
  FileDown,
  FileSpreadsheet,
  RefreshCw,
  Calendar,
  FileText,
  AlertTriangle,
  Settings,
  Database,
  Upload,
  
} from "lucide-react";
import { toast } from "sonner";
import { exportToExcel, exportWeeklyReport } from "@/lib/export";
import { ChangeEvent, useRef, useState } from "react";

import { apiDownloadBlob } from "@/lib/api-client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function ParametresPage() {
  const { darkMode, toggleDarkMode, resetData, lubrifiants, interventions, importInterventionsFile } = useStore();
  const excelInputRef = useRef<HTMLInputElement | null>(null);
  const [templateLoading, setTemplateLoading] = useState(false);

  const handleExportExcel = () => {
    exportToExcel(lubrifiants, interventions);
    toast.success("Export Excel téléchargé avec succès");
  };

  const handleExportWeekly = () => {
    exportWeeklyReport(interventions, lubrifiants);
    toast.success("Bilan hebdomadaire téléchargé");
  };

  const handleExportWeeklyPdf = async () => {
    try {
      const { generateWeeklyLubricantConsumptionPdf } = await import("@/lib/weekly-lubricant-report-pdf");
      await generateWeeklyLubricantConsumptionPdf(interventions, lubrifiants);
      toast.success("Rapport hebdomadaire PDF téléchargé");
    } catch {
      toast.error("Échec de la génération du PDF.");
    }
  };

  const handleReset = () => {
    resetData();
    toast.success("Données réinitialisées avec succès");
  };

  const handleDownloadTemplate = async () => {
    setTemplateLoading(true);
    try {
      await apiDownloadBlob("/import/interventions/template", "modele-import-interventions-ocp.xlsx");
      toast.success("Modèle Excel téléchargé");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erreur inconnue";
      toast.error(`Impossible de télécharger le modèle : ${message}`);
    } finally {
      setTemplateLoading(false);
    }
  };

  const handleImportExcel = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const result = await importInterventionsFile(file);
      toast.success(
        `${result.lignes_importees} interventions importées. ${result.erreurs.length} erreurs éventuelles. Dashboard synchronisé avec le backend.`
      );
    } catch (error) {
      toast.error("Échec de l'import Excel. Vérifiez le format des colonnes.");
    } finally {
      event.target.value = "";
    }
  };

  return (
    <AppLayout>
      <Header
        title="Paramètres"
        subtitle="Configuration de l'application"
      />

      <div className="p-6 space-y-6">
        {/* Apparence */}
        <Card id="exports">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-[#1447E6]" />
              Apparence
            </CardTitle>
            <CardDescription>
              Personnalisez l&apos;apparence de l&apos;application
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {darkMode ? (
                  <Moon className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <Sun className="h-5 w-5 text-amber-500" />
                )}
                <div>
                  <p className="font-medium">Mode sombre</p>
                  <p className="text-sm text-muted-foreground">
                    {darkMode ? "Activé" : "Désactivé"}
                  </p>
                </div>
              </div>
              <Switch checked={darkMode} onCheckedChange={toggleDarkMode} />
            </div>
          </CardContent>
        </Card>

        {/* Exports */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5 text-[#1447E6]" />
              Exports
            </CardTitle>
            <CardDescription>
              Téléchargez vos données et rapports
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="rounded-xl border border-[#1447E6]/15 bg-gradient-to-r from-[#1447E6]/10 via-sky-100/60 to-cyan-100/70 p-4 dark:from-[#1447E6]/20 dark:via-slate-900 dark:to-cyan-950/40">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Centre d&apos;export OCP Benguerir
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Accédez rapidement aux exports Excel et rapports périodiques.
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="rounded-lg border border-white/70 bg-white/80 px-2 py-2 shadow-sm dark:border-slate-700 dark:bg-slate-900/70">
                    <p className="font-semibold text-slate-900 dark:text-slate-100">{lubrifiants.length}</p>
                    <p className="text-[11px] text-slate-500">Lubrifiants</p>
                  </div>
                  <div className="rounded-lg border border-white/70 bg-white/80 px-2 py-2 shadow-sm dark:border-slate-700 dark:bg-slate-900/70">
                    <p className="font-semibold text-slate-900 dark:text-slate-100">{interventions.length}</p>
                    <p className="text-[11px] text-slate-500">Interventions</p>
                  </div>
                  <div className="rounded-lg border border-white/70 bg-white/80 px-2 py-2 shadow-sm dark:border-slate-700 dark:bg-slate-900/70">
                    <p className="font-semibold text-slate-900 dark:text-slate-100">3</p>
                    <p className="text-[11px] text-slate-500">Formats</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-slate-50/50 p-4 dark:bg-slate-900/30">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-cyan-100 dark:bg-cyan-900/30">
                    <Upload className="h-5 w-5 text-cyan-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-slate-900 dark:text-slate-100">
                      Importer historique interventions (Excel)
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Téléchargez le modèle pour garder les bons en-têtes : Date, Catégorie, Engin, Lubrifiant, Type,
                      Quantité (L), Compteur Horaire (Responsable et Observation optionnels).
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <Button variant="secondary" disabled={templateLoading} onClick={() => void handleDownloadTemplate()}>
                    <Download className="mr-2 h-4 w-4" />
                    {templateLoading ? "Téléchargement…" : "Modèle Excel"}
                  </Button>
                  <Button variant="outline" onClick={() => excelInputRef.current?.click()}>
                    <Upload className="mr-2 h-4 w-4" />
                    Importer
                  </Button>
                </div>
              </div>
              <input
                ref={excelInputRef}
                type="file"
                accept=".xlsx,.xls"
                className="hidden"
                onChange={handleImportExcel}
              />
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              {/* Export Excel complet */}
              <div className="rounded-xl border border-border bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:bg-slate-950">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                    <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-medium">Export Excel complet</p>
                    <p className="text-sm text-muted-foreground">
                      Lubrifiants, interventions et rapports
                    </p>
                  </div>
                </div>
                <Button onClick={handleExportExcel} variant="outline" className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Exporter
                </Button>
              </div>

              {/* Bilan hebdomadaire */}
              <div className="rounded-xl border border-border bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:bg-slate-950">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                    <Calendar className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">Bilan hebdomadaire</p>
                    <p className="text-sm text-muted-foreground">
                      Excel : 7 derniers jours · PDF : 7 jours (2 pages)
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Button onClick={handleExportWeekly} variant="outline" className="w-full">
                    <Download className="mr-2 h-4 w-4" />
                    Exporter Excel
                  </Button>
                  <Button
                    onClick={() => void handleExportWeeklyPdf()}
                    className="w-full bg-[#1447E6] hover:bg-[#1447E6]/90"
                  >
                    <FileDown className="mr-2 h-4 w-4" />
                    Rapport PDF
                  </Button>
                </div>
              </div>

              {/* Rapport mensuel */}
              <div className="rounded-xl border border-border bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:bg-slate-950">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
                    <FileText className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium">Rapport mensuel</p>
                    <p className="text-sm text-muted-foreground">
                      Synthèse du mois en cours
                    </p>
                  </div>
                </div>
                <Button onClick={handleExportExcel} variant="outline" className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Exporter
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Données */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-[#1447E6]" />
              Données
            </CardTitle>
            <CardDescription>
              Gérez les données de l&apos;application
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/10">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <RefreshCw className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="font-medium">Réinitialiser les données</p>
                  <p className="text-sm text-muted-foreground">
                    Restaurer les données par défaut
                  </p>
                </div>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Réinitialiser
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Cette action va réinitialiser toutes les données aux valeurs par défaut.
                      Toutes vos modifications seront perdues. Cette action est irréversible.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction onClick={handleReset} className="bg-red-600 hover:bg-red-700">
                      Réinitialiser
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>

        {/* Info */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/OCP%20logo-x5nfLttde4Q4qAg5RIHltvZYJOE32v.jpg"
                alt="OCP Logo"
                className="h-16 w-16 object-contain"
              />
              <div>
                <h3 className="text-lg font-semibold">OCP - Gestion des Lubrifiants</h3>
                <p className="text-sm text-muted-foreground">
                  Version 1.0.0 • Plateforme de suivi et d&apos;optimisation
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  © 2024 OCP Group. Tous droits réservés.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
