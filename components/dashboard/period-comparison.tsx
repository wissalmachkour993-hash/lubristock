"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { periodComparison } from "@/lib/data";
import { ArrowUpRight, ArrowDownRight, TrendingUp, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Button } from "@/components/ui/button";

type Period = "semaine" | "mois";

export function PeriodComparison() {
  const [period, setPeriod] = useState<Period>("semaine");

  const current = period === "semaine" 
    ? periodComparison.semaineActuelle 
    : periodComparison.moisActuel;
  const previous = period === "semaine" 
    ? periodComparison.semainePrecedente 
    : periodComparison.moisPrecedent;

  const totalChange = ((current.total - previous.total) / previous.total) * 100;
  const vidangeChange = ((current.vidange - previous.vidange) / previous.vidange) * 100;
  const appointChange = ((current.appoint - previous.appoint) / previous.appoint) * 100;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Calendar className="h-4 w-4 text-blue-500" />
            Comparaison des périodes
          </CardTitle>
          <div className="flex gap-1">
            <Button
              variant={period === "semaine" ? "default" : "ghost"}
              size="sm"
              onClick={() => setPeriod("semaine")}
              className="h-7 text-xs"
            >
              Semaine
            </Button>
            <Button
              variant={period === "mois" ? "default" : "ghost"}
              size="sm"
              onClick={() => setPeriod("mois")}
              className="h-7 text-xs"
            >
              Mois
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Total */}
        <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                Total consommation
              </p>
              <p className="text-3xl font-bold">{current.total}L</p>
            </div>
            <div
              className={cn(
                "flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium",
                totalChange >= 0
                  ? "bg-red-500/20 text-red-500"
                  : "bg-emerald-500/20 text-emerald-500"
              )}
            >
              {totalChange >= 0 ? (
                <ArrowUpRight className="h-4 w-4" />
              ) : (
                <ArrowDownRight className="h-4 w-4" />
              )}
              {Math.abs(totalChange).toFixed(1)}%
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            vs {period === "semaine" ? "semaine" : "mois"} précédent(e): {previous.total}L
          </p>
        </div>

        {/* Détails */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-muted/50">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-muted-foreground">Vidanges</p>
              <div
                className={cn(
                  "flex items-center gap-0.5 text-xs font-medium",
                  vidangeChange >= 0 ? "text-red-500" : "text-emerald-500"
                )}
              >
                {vidangeChange >= 0 ? (
                  <ArrowUpRight className="h-3 w-3" />
                ) : (
                  <ArrowDownRight className="h-3 w-3" />
                )}
                {Math.abs(vidangeChange).toFixed(1)}%
              </div>
            </div>
            <p className="text-xl font-bold">{current.vidange}L</p>
            <p className="text-xs text-muted-foreground">
              Préc: {previous.vidange}L
            </p>
          </div>

          <div className="p-3 rounded-lg bg-muted/50">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-muted-foreground">Appoints</p>
              <div
                className={cn(
                  "flex items-center gap-0.5 text-xs font-medium",
                  appointChange >= 0 ? "text-red-500" : "text-emerald-500"
                )}
              >
                {appointChange >= 0 ? (
                  <ArrowUpRight className="h-3 w-3" />
                ) : (
                  <ArrowDownRight className="h-3 w-3" />
                )}
                {Math.abs(appointChange).toFixed(1)}%
              </div>
            </div>
            <p className="text-xl font-bold">{current.appoint}L</p>
            <p className="text-xs text-muted-foreground">
              Préc: {previous.appoint}L
            </p>
          </div>
        </div>

        {/* Indicateur tendance */}
        <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30 border border-border">
          <TrendingUp className={cn(
            "h-4 w-4",
            totalChange >= 0 ? "text-red-500" : "text-emerald-500"
          )} />
          <p className="text-xs text-muted-foreground">
            {totalChange >= 0 
              ? "Augmentation de la consommation - Surveiller les équipements"
              : "Réduction de la consommation - Bonne performance"
            }
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
