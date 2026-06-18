"use client";

import { ChangeEvent, useEffect, useRef, useState } from "react";
import { AppLayout } from "@/components/app-layout";
import { Header } from "@/components/header";
import { useStore } from "@/lib/store";
import { apiDownloadBlob } from "@/lib/api-client";
import { exportMonthlyReport, exportToExcel, exportWeeklyReport } from "@/lib/export";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertTriangle,
  Calendar,
  ClipboardList,
  Download,
  Droplets,
  FileDown,
  FileSpreadsheet,
  FileText,
  Package,
  Upload,
  Wrench,
} from "lucide-react";
import { getOtHistory, type OtHistoryEntry } from "@/lib/ot-history";
import { downloadOtPdfFromHistory } from "@/lib/ot-pdf";

export default function ExportsPage() {
  const { lubrifiants, interventions, importInterventionsFile } = useStore();
  const excelInputRef = useRef<HTMLInputElement | null>(null);
  const [templateLoading, setTemplateLoading] = useState(false);
  const [otHistory, setOtHistory] = useState<OtHistoryEntry[]>([]);

  const totalConsomme = interventions.reduce(
    (total, intervention) => total + Number(intervention.quantite || 0),
    0
  );
  
  const lubrifiantsCritiques = lubrifiants.filter((lubrifiant) => {
    const stockActuel = Number(lubrifiant.stockActuel || 0);
  
    const stockMin = Number(
      (lubrifiant as any).stockMin ??
        (lubrifiant as any).stockMinimum ??
        (lubrifiant as any).seuilMin ??
        (lubrifiant as any).min ??
        0
    );
  
    return stockMin > 0 && stockActuel <= stockMin;
  }).length;
  
  const recommandations =
    interventions.length === 0
      ? "Aucune intervention enregistrée pour le moment."
      : "Les rapports permettent de suivre les consommations, identifier les lubrifiants critiques et préparer les actions de réapprovisionnement.";

  useEffect(() => {
    setOtHistory(getOtHistory());
  }, []);

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

  const handleExportMonthly = () => {
    exportMonthlyReport(interventions, lubrifiants);
    toast.success("Rapport mensuel téléchargé");
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
        `${result.lignes_importees} interventions importées. ${result.erreurs.length} erreurs éventuelles.`
      );
    } catch {
      toast.error("Échec de l'import Excel. Vérifiez le format des colonnes.");
    } finally {
      event.target.value = "";
    }
  };

  const handleDownloadOtFromHistory = async (entry: OtHistoryEntry) => {
    await downloadOtPdfFromHistory(
      entry.intervention,
      entry.stockPhysiqueAvant,
      entry.otNumber,
      entry.reservationNumber,
      entry.fileName
    );
    toast.success(`OT #${entry.otNumber} téléchargé`);
  };

  return (
    <AppLayout>
      <Header
  title="Rapports & Exports"
  subtitle="Suivi hebdomadaire, mensuel et export des données de lubrification"
/>

<div className="p-4 md:p-6">
  <div className="mx-auto w-full max-w-7xl space-y-6">
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            Centre de reporting opérationnel
          </h2>
          <p className="text-sm text-muted-foreground">
            Analyse des consommations, suivi des interventions et génération des rapports.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
            {lubrifiants.length} lubrifiants
          </span>
          <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
            {interventions.length} interventions
          </span>
        </div>
      </div>
    </div>

    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
      <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
        <CardContent className="p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30">
              <Package className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{lubrifiants.length}</p>
              <p className="text-xs text-muted-foreground">Lubrifiants suivis</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
        <CardContent className="p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
              <Wrench className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{interventions.length}</p>
              <p className="text-xs text-muted-foreground">Interventions</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
        <CardContent className="p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-900/30">
              <Droplets className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalConsomme} kg</p>
              <p className="text-xs text-muted-foreground">Quantité consommée</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
        <CardContent className="p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/30">
              <ClipboardList className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{otHistory.length}</p>
              <p className="text-xs text-muted-foreground">OT générés</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-[#1447E6]" />
          Rapports de consommation
        </CardTitle>
        <CardDescription>
          Générez des bilans hebdomadaires ou mensuels pour le suivi des lubrifiants.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                  Bilan hebdomadaire
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Analyse des interventions et consommations des 7 derniers jours.
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              <Button onClick={handleExportWeekly} variant="outline" className="w-full">
                <Download className="mr-2 h-4 w-4" />
                Exporter Excel
              </Button>

              <Button
                onClick={() => void handleExportWeeklyPdf()}
                className="w-full bg-[#1447E6] hover:bg-[#1447E6]/90"
              >
                <FileDown className="mr-2 h-4 w-4" />
                PDF avec graphes
              </Button>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-900/30">
                <FileText className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                  Rapport mensuel
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Synthèse mensuelle des consommations, interventions et besoins de réapprovisionnement.
                </p>
              </div>
            </div>

            <Button onClick={handleExportMonthly} variant="outline" className="mt-5 w-full">
              <Download className="mr-2 h-4 w-4" />
              Télécharger rapport mensuel
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>

    <div className="grid gap-5 lg:grid-cols-2">
      <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-cyan-600" />
            Import des interventions
          </CardTitle>
          <CardDescription>
            Intégrez l’historique terrain à partir d’un fichier Excel.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
              Historique interventions
            </p>
            <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              Utilisez le modèle conseillé pour éviter les erreurs de colonnes. Formats acceptés : .xlsx, .xls.
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                variant="secondary"
                disabled={templateLoading}
                onClick={() => void handleDownloadTemplate()}
              >
                <Download className="mr-2 h-4 w-4" />
                {templateLoading ? "Téléchargement…" : "Télécharger modèle"}
              </Button>

              <Button variant="outline" onClick={() => excelInputRef.current?.click()}>
                <Upload className="mr-2 h-4 w-4" />
                Importer fichier
              </Button>
            </div>

            <input
              ref={excelInputRef}
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={handleImportExcel}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
            Export global
          </CardTitle>
          <CardDescription>
            Export complet des lubrifiants, stocks et interventions.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
              Fichier Excel complet
            </p>
            <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              Ce fichier regroupe l’inventaire des lubrifiants et l’historique des interventions.
            </p>

            <Button onClick={handleExportExcel} className="mt-4 w-full">
              <Download className="mr-2 h-4 w-4" />
              Télécharger le fichier Excel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>

    <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-600" />
          Observations et recommandations
        </CardTitle>
        <CardDescription>
          Synthèse automatique pour l’aide à la décision.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-2 text-sm text-muted-foreground">
        <p>{recommandations}</p>
        <p>
          {lubrifiantsCritiques > 0
            ? `${lubrifiantsCritiques} lubrifiant(s) sont en niveau critique ou proche du stock minimum.`
            : "Aucun lubrifiant critique détecté selon les seuils disponibles."}
        </p>
        <p>
          {otHistory.length === 0
            ? "Aucun OT PDF généré pour le moment."
            : "Les OT générés sont disponibles dans l’historique pour consultation ou réimpression."}
        </p>
      </CardContent>
    </Card>

    <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Historique PDF des OT générés</CardTitle>
        <CardDescription>
          Consultez et retéléchargez les bons OT générés depuis les interventions.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {otHistory.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Aucun PDF OT généré pour le moment.
          </p>
        ) : (
          <div className="space-y-2">
            {otHistory.map((entry) => (
              <div
                key={entry.id}
                className="flex flex-col gap-2 rounded-lg border border-slate-200 p-3 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800"
              >
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    OT #{entry.otNumber} - {entry.intervention.engin}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(entry.generatedAt).toLocaleString("fr-FR")} - {entry.fileName}
                  </p>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => void handleDownloadOtFromHistory(entry)}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Télécharger PDF
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  </div>
</div>
</AppLayout>
  );
}