"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Activity, Heart, AlertCircle, CheckCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const healthConfig = {
  Bon: {
    color: "text-emerald-500",
    bg: "bg-emerald-500/20",
    border: "border-emerald-500/50",
    icon: CheckCircle,
  },
  Moyen: {
    color: "text-amber-500",
    bg: "bg-amber-500/20",
    border: "border-amber-500/50",
    icon: Activity,
  },
  Critique: {
    color: "text-red-500",
    bg: "bg-red-500/20",
    border: "border-red-500/50",
    icon: AlertCircle,
  },
};

export function MachineHealth() {
  const { engins } = useStore();

  const healthCounts = {
    Bon: engins.filter((e) => e.healthScore === "Bon").length,
    Moyen: engins.filter((e) => e.healthScore === "Moyen").length,
    Critique: engins.filter((e) => e.healthScore === "Critique").length,
  };

  const totalEngins = engins.length;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Heart className="h-4 w-4 text-red-500" />
          Score santé machines
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Résumé */}
        <div className="grid grid-cols-3 gap-2">
          {(["Bon", "Moyen", "Critique"] as const).map((status) => {
            const config = healthConfig[status];
            const Icon = config.icon;
            return (
              <div
                key={status}
                className={cn(
                  "p-3 rounded-lg border text-center transition-all hover:scale-105",
                  config.bg,
                  config.border
                )}
              >
                <Icon className={cn("h-5 w-5 mx-auto mb-1", config.color)} />
                <p className={cn("text-2xl font-bold", config.color)}>
                  {healthCounts[status]}
                </p>
                <p className="text-xs text-muted-foreground">{status}</p>
              </div>
            );
          })}
        </div>

        {/* Liste des machines critiques et moyennes */}
        <div className="space-y-3">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Machines nécessitant attention
          </p>
          {engins
            .filter((e) => e.healthScore === "Critique" || e.healthScore === "Moyen")
            .slice(0, 4)
            .map((engin) => {
              const config = healthConfig[engin.healthScore || "Bon"];
              return (
                <div
                  key={engin.id}
                  className={cn(
                    "p-3 rounded-lg border",
                    config.bg,
                    config.border
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">{engin.nom}</span>
                    <span
                      className={cn(
                        "text-xs font-bold px-2 py-0.5 rounded-full",
                        config.bg,
                        config.color
                      )}
                    >
                      {engin.healthScore}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-muted-foreground">Efficacité:</span>
                    <Progress
                      value={engin.efficiencyIndex}
                      className={cn(
                        "h-1.5 flex-1",
                        engin.efficiencyIndex && engin.efficiencyIndex < 60
                          ? "[&>div]:bg-red-500"
                          : engin.efficiencyIndex && engin.efficiencyIndex < 80
                          ? "[&>div]:bg-amber-500"
                          : "[&>div]:bg-emerald-500"
                      )}
                    />
                    <span className="text-xs font-medium">{engin.efficiencyIndex}%</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Conso. moy: {engin.consommationMoyenne}L/jour | {engin.heuresService.toLocaleString("fr-FR")}h
                  </p>
                </div>
              );
            })}
        </div>
      </CardContent>
    </Card>
  );
}
