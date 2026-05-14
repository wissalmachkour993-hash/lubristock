"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useStore } from "@/lib/store";
import { AlertOctagon, Wrench, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { computeDrainIntervalAnomalies } from "@/lib/drain-interval-anomalies";

export function AnomalyDetection() {
  const { interventions } = useStore();

  const anomalies = useMemo(() => computeDrainIntervalAnomalies(interventions), [interventions]);

  const criticalCount = anomalies.filter((a) => a.severity === "critical").length;
  const warningCount = anomalies.filter((a) => a.severity === "warning").length;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <AlertOctagon className="h-4 w-4 shrink-0 text-red-500" />
            Détection automatique d&apos;anomalies
          </CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            {criticalCount > 0 && (
              <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
                {criticalCount} critique
              </span>
            )}
            {warningCount > 0 && (
              <span className="rounded-full bg-amber-500 px-2 py-0.5 text-xs font-bold text-white">
                {warningCount} alerte
              </span>
            )}
            {anomalies.length === 0 && (
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                Aucune anomalie
              </span>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {anomalies.length === 0 ? (
          <p className="rounded-lg border border-dashed p-4 text-center text-xs text-muted-foreground">
            Aucune anomalie d&apos;échéancier de vidange détectée sur les interventions enregistrées.
            Importez ou saisissez des vidanges avec compteur horaire pour activer le suivi.
          </p>
        ) : (
          anomalies.map((anomaly) => {
            const isCritical = anomaly.severity === "critical";

            return (
              <div
                key={anomaly.id}
                className={cn(
                  "rounded-lg border p-3 transition-all",
                  isCritical ? "border-red-500/50 bg-red-500/10" : "border-amber-500/50 bg-amber-500/10"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={cn("rounded-lg p-2", isCritical ? "bg-red-500/20" : "bg-amber-500/20")}>
                    <Wrench
                      className={cn("h-4 w-4", isCritical ? "text-red-500" : "text-amber-500")}
                      aria-hidden
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                      <div className="min-w-0">
                        <span className="text-sm font-medium">{anomaly.machine}</span>
                        <span className="ml-2 text-[11px] text-muted-foreground">· {anomaly.lubrifiant}</span>
                      </div>
                      <span
                        className={cn(
                          "shrink-0 rounded-full px-2 py-0.5 text-xs font-medium text-white",
                          isCritical ? "bg-red-500" : "bg-amber-500"
                        )}
                      >
                        {isCritical ? "Critique" : "Alerte"}
                      </span>
                    </div>
                    <p className="mb-2 text-xs text-muted-foreground">{anomaly.description}</p>
                    <div className="flex flex-wrap items-center gap-4 text-xs">
                      <div>
                        <span className="text-muted-foreground">Actuel : </span>
                        <span
                          className={cn("font-medium tabular-nums", isCritical ? "text-red-500" : "text-amber-500")}
                        >
                          {anomaly.value}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Attendu : </span>
                        <span className="font-medium text-emerald-600 tabular-nums">{anomaly.expected}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}

        <Button variant="ghost" className="w-full text-xs text-muted-foreground" asChild>
          <Link href="/alertes">
            Voir toutes les anomalies
            <ChevronRight className="ml-1 h-3 w-3" aria-hidden />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
