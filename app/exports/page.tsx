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
import { Calendar, Download, FileSpreadsheet, FileText, Upload, FileDown } from "lucide-react";
import { getOtHistory, type OtHistoryEntry } from "@/lib/ot-history";
import { downloadOtPdfFromHistory } from "@/lib/ot-pdf";

export default function ExportsPage() {
  const { lubrifiants, interventions, importInterventionsFile } = useStore();
  const excelInputRef = useRef<HTMLInputElement | null>(null);
  const [templateLoading, setTemplateLoading] = useState(false);
  const [otHistory, setOtHistory] = useState<OtHistoryEntry[]>([]);

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
      <Header title="Export" subtitle="Import et export des données" />

      <div className="p-6">
        <div className="mx-auto w-full max-w-6xl space-y-6">
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                  Centre Import / Export
                </h2>
                <p className="text-sm text-muted-foreground">
                  Importez l’historique et exportez les rapports en 1 clic.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
                  {lubrifiants.length} lubrifiants
                </span>
                <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
                  {interventions.length} interventions
                </span>
              </div>
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-[1.35fr_0.65fr]">
            <Card className="overflow-hidden border-slate-200/80 shadow-sm dark:border-slate-800">
              <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-5 dark:border-slate-800 dark:bg-slate-900/30">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Upload className="h-4 w-4 text-cyan-600" />
                  Import Excel
                </CardTitle>
                <CardDescription>
                  Téléchargez le modèle, puis importez votre fichier d’interventions.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        Historique interventions (Excel)
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                        Modèle conseillé pour éviter les erreurs de colonnes. Formats acceptés : .xlsx, .xls
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-2">
                      <Button
                        variant="secondary"
                        disabled={templateLoading}
                        onClick={() => void handleDownloadTemplate()}
                        className="h-9"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        {templateLoading ? "Téléchargement…" : "Modèle"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => excelInputRef.current?.click()}
                        className="h-9"
                      >
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
              </CardContent>
            </Card>

            <div className="space-y-4">
              <div className="relative h-40 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <img
                  src="/api/landing-images/site"
                  alt="Site OCP Benguerir"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-slate-950/15 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3">
                  <p className="text-xs font-semibold text-white">Benguerir</p>
                  <p className="text-[11px] text-white/80">Import & rapports Excel</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card className="border-slate-200/80 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
                      <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        Export Excel complet
                      </p>
                      <p className="text-xs text-muted-foreground">Lubrifiants + interventions</p>
                    </div>
                  </div>
                </div>
                <Button onClick={handleExportExcel} className="mt-4 w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Télécharger
                </Button>
              </CardContent>
            </Card>

            <Card className="border-slate-200/80 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30">
                      <Calendar className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        Bilan hebdomadaire
                      </p>
                      <p className="text-xs text-muted-foreground">Excel : 7 derniers jours · PDF : 7 jours (2 pages)</p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex flex-col gap-2">
                  <Button onClick={handleExportWeekly} variant="outline" className="w-full">
                    <Download className="mr-2 h-4 w-4" />
                    Télécharger Excel
                  </Button>
                  <Button onClick={() => void handleExportWeeklyPdf()} className="w-full bg-[#1447E6] hover:bg-[#1447E6]/90">
                    <FileDown className="mr-2 h-4 w-4" />
                    Rapport PDF (graphes)
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200/80 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-900/30">
                      <FileText className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        Rapport mensuel
                      </p>
                      <p className="text-xs text-muted-foreground">Synthèse du mois</p>
                    </div>
                  </div>
                </div>
                <Button onClick={handleExportMonthly} variant="outline" className="mt-4 w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Télécharger
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Historique PDF des OT générés</CardTitle>
              <CardDescription>
                Consultez et retéléchargez les bons OT générés depuis les interventions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {otHistory.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucun PDF OT généré pour le moment.</p>
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
                        Ouvrir PDF
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

