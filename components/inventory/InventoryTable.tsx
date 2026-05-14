"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Check,
  Filter,
  Plus,
  Search,
} from "lucide-react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { InventoryDashboardRow } from "@/lib/inventory-dashboard.types";
import {
  FACTEUR_SECURITE_ALERTE,
  JOURS_QUARANTAINE_LABO,
  autonomieJours,
  peutGenererDemandeAchat,
} from "@/lib/inventory-dashboard.utils";

const nf = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 });

export interface InventoryTableProps {
  rows?: InventoryDashboardRow[];
  onAddLubrifiant?: () => void;
}

type FiltreCriticité = "tous" | "critique" | "normal";

function estSousStockMin(row: InventoryDashboardRow): boolean {
  return row.stockActuelKg < row.stockMinKg;
}

function estCritique(row: InventoryDashboardRow): boolean {
  return estSousStockMin(row) || row.classification === "Critique";
}

/** Remplissage cuve : actuel / max (plafonné à 100 % pour la barre). */
function pctRemplissageCuve(row: InventoryDashboardRow): number {
  if (row.stockMaxKg <= 0) return 0;
  return Math.min(100, (row.stockActuelKg / row.stockMaxKg) * 100);
}

/** Génère une série « en dents de scie » autour du min/max pour la courbe de stock. */
function buildSawtoothSeries(
  min: number,
  max: number,
  points: number,
  seed: number
): { jour: string; stockKg: number }[] {
  const out: { jour: string; stockKg: number }[] = [];
  const amplitude = (max - min) / 2 || 500;
  const center = (min + max) / 2;
  for (let i = 0; i < points; i += 1) {
    const t = i / (points - 1 || 1);
    const saw = Math.abs(((t * 8 + seed) % 2) - 1) * 2 - 1;
    const wobble = Math.sin(i * 0.9 + seed) * 0.12 * amplitude;
    const stock = Math.min(
      max * 1.02,
      Math.max(min * 0.85, center + saw * amplitude * 0.55 + wobble)
    );
    out.push({ jour: `J${i + 1}`, stockKg: Math.round(stock) });
  }
  return out;
}

export function InventoryTable({ rows = [], onAddLubrifiant }: InventoryTableProps) {
  const [query, setQuery] = useState("");
  const [filtreCriticité, setFiltreCriticité] = useState<FiltreCriticité>("tous");
  const [detailRow, setDetailRow] = useState<InventoryDashboardRow | null>(null);

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((row) => {
      if (filtreCriticité === "critique" && !estCritique(row)) return false;
      if (filtreCriticité === "normal" && estCritique(row)) return false;
      if (!q) return true;
      return (
        row.codeSap.toLowerCase().includes(q) ||
        row.codeOracle.toLowerCase().includes(q) ||
        row.description.toLowerCase().includes(q)
      );
    });
  }, [rows, query, filtreCriticité]);

  const chartData = useMemo(() => {
    if (!detailRow) return [];
    return buildSawtoothSeries(
      detailRow.stockMinKg,
      detailRow.stockMaxKg,
      18,
      detailRow.codeSap.length + detailRow.codeOracle.length
    );
  }, [detailRow]);

  if (rows.length === 0) {
    return (
      <Card className="border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <CardHeader className="border-b border-slate-100 pb-4 dark:border-slate-800">
          <CardTitle className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            Inventaire lubrifiants — Mine Benguerir
          </CardTitle>
        </CardHeader>
        <CardContent className="py-10 text-center text-sm text-slate-500">
          Aucune ligne à afficher.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <Card className="overflow-hidden border border-slate-200/90 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <CardHeader className="space-y-1 border-b border-slate-100 bg-slate-50/50 px-6 py-5 dark:border-slate-800 dark:bg-slate-900/40">
          <CardTitle className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            Inventaire lubrifiants — Mine Benguerir
          </CardTitle>
          <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            Codes SAP / Oracle, seuils min–max et autonomie. Réf. sécurité ×{FACTEUR_SECURITE_ALERTE}{" "}
            · Quarantaine labo {JOURS_QUARANTAINE_LABO} j.
          </p>
        </CardHeader>

        <CardContent className="space-y-4 p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative max-w-md flex-1">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
                aria-hidden
              />
              <Input
                type="search"
                placeholder="Rechercher (SAP, Oracle, désignation)…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="h-10 border-slate-200 bg-white pl-9 text-sm shadow-none placeholder:text-slate-400 focus-visible:ring-slate-300 dark:border-slate-700 dark:bg-slate-950"
              />
            </div>

            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-10 gap-2 border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
                  >
                    <Filter className="size-4 shrink-0" aria-hidden />
                    Filtre criticité
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                    Afficher
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup
                    value={filtreCriticité}
                    onValueChange={(v) => setFiltreCriticité(v as FiltreCriticité)}
                  >
                    <DropdownMenuRadioItem value="tous">Toutes les lignes</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="critique">Critique uniquement</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="normal">Normal uniquement</DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
              {onAddLubrifiant && (
                <Button
                  type="button"
                  size="sm"
                  className="h-10 gap-2 bg-[#1447E6] text-white hover:bg-[#1447E6]/90"
                  onClick={onAddLubrifiant}
                >
                  <Plus className="size-4" />
                  Ajouter un lubrifiant
                </Button>
              )}
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
            <table className="w-full min-w-[900px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-900/50">
                  <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
                    Code SAP / Oracle
                  </th>
                  <th className="min-w-[200px] px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
                    Désignation de l&apos;huile
                  </th>
                  <th className="w-[220px] px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
                    Stock actuel (kg)
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
                    Stock min / max (kg)
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
                    Criticité
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
                    Autonomie (j)
                  </th>
                  <th className="w-[100px] px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
                    Détails
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row) => {
                  const sousMin = estSousStockMin(row);
                  const critique = estCritique(row);
                  const auto = autonomieJours(row);
                  const pct = pctRemplissageCuve(row);

                  return (
                    <tr
                      key={row.codeSap}
                      className={cn(
                        "border-b border-slate-100 transition-colors last:border-0 dark:border-slate-800/80",
                        sousMin
                          ? "bg-red-50/90 dark:bg-red-950/25"
                          : "bg-white hover:bg-slate-50/80 dark:bg-slate-950 dark:hover:bg-slate-900/60"
                      )}
                    >
                      <td className="align-top px-4 py-3">
                        <div className="flex flex-col gap-0.5 font-mono text-xs text-slate-800 dark:text-slate-200">
                          <span>
                            <span className="text-slate-400">SAP</span> {row.codeSap}
                          </span>
                          <span>
                            <span className="text-slate-400">Ora</span> {row.codeOracle}
                          </span>
                        </div>
                      </td>
                      <td className="max-w-xs px-4 py-3 align-top text-slate-800 dark:text-slate-200">
                        <span className="line-clamp-2 text-[13px] leading-snug">{row.description}</span>
                      </td>
                      <td className="px-4 py-3 align-top">
                        <div className="space-y-2">
                          <div className="flex items-baseline justify-between gap-2">
                            <span
                              className={cn(
                                "tabular-nums text-[13px] font-medium tracking-tight",
                                sousMin
                                  ? "font-bold text-red-600 dark:text-red-400"
                                  : "text-slate-900 dark:text-slate-100"
                              )}
                            >
                              {nf.format(row.stockActuelKg)} kg
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {nf.format(pct)} % cuve
                            </span>
                          </div>
                          <Progress
                            value={pct}
                            className={cn(
                              "h-1.5 bg-slate-100 dark:bg-slate-800",
                              sousMin
                                ? "[&_[data-slot=progress-indicator]]:bg-red-500"
                                : "[&_[data-slot=progress-indicator]]:bg-sky-600 dark:[&_[data-slot=progress-indicator]]:bg-sky-500"
                            )}
                          />
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right align-middle tabular-nums text-[13px] text-slate-700 dark:text-slate-300">
                        <span className="text-slate-500">{nf.format(row.stockMinKg)}</span>
                        <span className="mx-1.5 text-slate-300">/</span>
                        <span>{nf.format(row.stockMaxKg)}</span>
                      </td>
                      <td className="px-4 py-3 text-center align-middle">
                        {critique ? (
                          <Badge
                            variant="destructive"
                            className="gap-1 rounded-md border-0 px-2 py-0.5 text-[11px] font-medium shadow-none"
                          >
                            <AlertTriangle className="size-3.5 shrink-0" aria-hidden />
                            Critique
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="gap-1 rounded-md border-emerald-200 bg-emerald-50/80 px-2 py-0.5 text-[11px] font-medium text-emerald-800 shadow-none dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200"
                          >
                            <Check className="size-3.5 shrink-0" aria-hidden />
                            Normal
                          </Badge>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right align-middle tabular-nums text-[13px] text-slate-800 dark:text-slate-200">
                        {auto == null ? "—" : nf.format(auto)}
                      </td>
                      <td className="px-4 py-3 text-center align-middle">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-8 border-slate-200 text-xs font-medium text-slate-700 shadow-none hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200"
                          onClick={() => setDetailRow(row)}
                        >
                          Détails
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredRows.length === 0 && (
            <p className="text-center text-sm text-slate-500">Aucun résultat pour cette recherche ou ce filtre.</p>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!detailRow} onOpenChange={(open) => !open && setDetailRow(null)}>
        <DialogContent
          className="max-h-[90vh] max-w-[min(100vw-2rem,720px)] gap-0 overflow-hidden p-0 sm:max-w-[720px]"
          showCloseButton
        >
          {detailRow && (
            <>
              <DialogHeader className="border-b border-slate-100 px-6 py-4 text-left dark:border-slate-800">
                <DialogTitle className="pr-8 text-base font-semibold leading-snug text-slate-900 dark:text-slate-100">
                  {detailRow.description}
                </DialogTitle>
                <DialogDescription className="font-mono text-xs text-slate-500">
                  SAP {detailRow.codeSap} · Oracle {detailRow.codeOracle}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 px-6 py-4">
                <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                  Schéma illustratif en dents de scie (évolution stock). Lignes de référence : stock min
                  (rouge) et stock max (vert).
                </p>
                <div className="h-[300px] w-full rounded-lg border border-slate-100 bg-white p-2 dark:border-slate-800 dark:bg-slate-950">
                  {chartData.length > 0 && (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData} margin={{ top: 8, right: 12, left: 0, bottom: 4 }}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-800" />
                        <XAxis dataKey="jour" tick={{ fontSize: 10, fill: "#64748b" }} />
                        <YAxis tick={{ fontSize: 10, fill: "#64748b" }} domain={["auto", "auto"]} />
                        <Tooltip
                          contentStyle={{
                            borderRadius: 8,
                            border: "1px solid #e2e8f0",
                            fontSize: 12,
                          }}
                          formatter={(v: number) => [`${nf.format(v)} kg`, "Stock"]}
                          labelFormatter={(l) => String(l)}
                        />
                        <Legend wrapperStyle={{ fontSize: 12 }} />
                        <ReferenceLine
                          y={detailRow.stockMinKg}
                          stroke="#dc2626"
                          strokeDasharray="4 4"
                          label={{ value: "Min", fill: "#dc2626", fontSize: 10 }}
                        />
                        <ReferenceLine
                          y={detailRow.stockMaxKg}
                          stroke="#16a34a"
                          strokeDasharray="4 4"
                          label={{ value: "Max", fill: "#16a34a", fontSize: 10 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="stockKg"
                          name="Stock (kg)"
                          stroke="#0c4a6e"
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>
                <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setDetailRow(null)}
                  >
                    Fermer
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    disabled={!peutGenererDemandeAchat(detailRow)}
                    onClick={() => {
                      toast.success(`Demande d'achat générée pour ${detailRow.codeSap}`);
                      setDetailRow(null);
                    }}
                  >
                    Demande d&apos;achat
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
