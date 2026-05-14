"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useStore } from "@/lib/store";
import { AlertTriangle, TrendingDown, Calendar, Package, Scale } from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { buildPilotageStockRows } from "@/lib/stock-prediction-metrics";

const nf = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 });
const nf1 = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 });

export function StockPrediction() {
  const { lubrifiants, interventions, gaugeOperations } = useStore();

  const lignes = useMemo(
    () => buildPilotageStockRows(interventions, lubrifiants, gaugeOperations),
    [interventions, lubrifiants, gaugeOperations]
  );

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <TrendingDown className="h-4 w-4 shrink-0 text-red-500" aria-hidden />
          Pilotage rupture & réapprovisionnement
        </CardTitle>
      </CardHeader>
      <CardContent className="max-h-[620px] space-y-3 overflow-y-auto pr-1">
        {lignes.map((row) => {
          const isUrgent = row.alerte === "critique";
          const isWarning = row.alerte === "attention";
          const joursBadge =
            row.joursRestants === null ? "—" : row.joursRestants === Infinity ? "—" : `${row.joursRestants} j`;
          const barValue = Math.min(100, Math.max(0, row.pctPlageMiniMax));

          return (
            <div
              key={row.libelle}
              className={cn(
                "rounded-lg border p-3 transition-all",
                isUrgent
                  ? "border-red-500/50 bg-red-500/10"
                  : isWarning
                    ? "border-amber-500/55 bg-amber-500/[0.07]"
                    : "border-border bg-muted/25"
              )}
            >
              <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
                <div className="flex min-w-0 flex-1 items-start gap-2">
                  {isUrgent && <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 animate-pulse text-red-500" aria-hidden />}
                  <div className="min-w-0">
                    <p className="text-sm font-medium leading-tight">{row.libelle}</p>
                    {row.codeSap && (
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        SAP&nbsp;{row.codeSap}&nbsp;&nbsp;·&nbsp;&nbsp;Oracle&nbsp;{row.codeOracle}
                      </p>
                    )}
                  </div>
                </div>
                <span
                  className={cn(
                    "shrink-0 rounded-full px-2 py-0.5 text-xs font-bold",
                    isUrgent
                      ? "bg-red-500 text-white"
                      : isWarning
                        ? "bg-amber-500 text-white"
                        : "bg-muted text-muted-foreground"
                  )}
                  title={
                    row.joursRestants === null
                      ? "Cadence inconnue (pas de sorties sur la fenêtre)"
                      : "Jours jusqu’à stock nul avec la même cadence moyenne"
                  }
                >
                  {row.joursRestants === null ? "NC" : joursBadge}
                </span>
              </div>

              <Progress
                value={barValue}
                className={cn(
                  "mb-3 h-2",
                  isUrgent
                    ? "[&>div]:bg-red-500"
                    : isWarning
                      ? "[&>div]:bg-amber-500"
                      : "[&>div]:bg-emerald-600"
                )}
              />
              <p className="mb-2 text-[10px] text-muted-foreground flex items-center gap-1 flex-wrap">
                <Scale className="h-3 w-3" aria-hidden />
                Niveau vs plage {[nf.format(row.stockMin), nf.format(row.stockMax)].join(" – ")}
                &nbsp;
                <span className="tabular-nums">({nf1.format(row.pctPlageMiniMax)} % rempl.)</span>
              </p>

              <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Package className="h-3.5 w-3.5 shrink-0 text-foreground/70" aria-hidden />
                  <span>
                    Stock actuel:&nbsp;
                    <strong className="text-foreground">
                      {nf1.format(row.stockActuel)}
                      {row.unite}
                    </strong>
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 shrink-0 text-foreground/70" aria-hidden />
                  <span>
                    Rupture est.:{" "}
                    <strong className="text-foreground">
                      {row.dateRuptureIso
                        ? new Date(`${row.dateRuptureIso}T12:00:00`).toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "short",
                          })
                        : "—"}
                    </strong>
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
