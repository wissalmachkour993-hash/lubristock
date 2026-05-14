"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useStore } from "@/lib/store";
import {
  Droplets,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Truck,
  Package,
  Wrench,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { computeDashboardKPIs } from "@/lib/analytics";

interface KPICardProps {
  title: string;
  value: string | number;
  variation?: number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

function KPICard({ title, value, variation, icon, color, bgColor }: KPICardProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
              {title}
            </p>
            <p className="text-lg font-bold mt-1">{value}</p>
            {variation !== undefined && (
              <div className="flex items-center gap-1 mt-1">
                {variation >= 0 ? (
                  <TrendingUp className="h-3 w-3 text-green-500" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-500" />
                )}
                <span
                  className={cn(
                    "text-[10px] font-medium",
                    variation >= 0 ? "text-green-500" : "text-red-500"
                  )}
                >
                  {variation >= 0 ? "+" : ""}{variation}%
                </span>
                <span className="text-[10px] text-muted-foreground">vs mois préc.</span>
              </div>
            )}
          </div>
          <div
            className={cn(
              "h-8 w-8 rounded-lg flex items-center justify-center",
              bgColor
            )}
          >
            <div className={cn(color, "scale-75")}>{icon}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function KPICards() {
  const { lubrifiants, interventions, engins } = useStore();
  const machinesActives = engins.filter((e) => e.statut === "Actif").length;
  const kpiData = computeDashboardKPIs(lubrifiants, interventions, machinesActives);

  const kpis = [
    {
      title: "Stock total des huiles",
      value: `${kpiData.stockTotal.toLocaleString("fr-FR")} L`,
      icon: <Package className="h-6 w-6" />,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100 dark:bg-emerald-900/30",
    },
    {
      title: "Consommation du mois",
      value: `${kpiData.currentMonthConsumption.toLocaleString("fr-FR")} L`,
      variation: kpiData.consumptionVariation,
      icon: <Droplets className="h-6 w-6" />,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
    },
    {
      title: "Machines actives",
      value: kpiData.machinesActives,
      icon: <Truck className="h-6 w-6" />,
      color: "text-cyan-600",
      bgColor: "bg-cyan-100 dark:bg-cyan-900/30",
    },
    {
      title: "Anomalies",
      value: kpiData.anomalies,
      icon: <AlertTriangle className="h-6 w-6" />,
      color: "text-amber-600",
      bgColor: "bg-amber-100 dark:bg-amber-900/30",
    },
    {
      title: "Total interventions du mois",
      value: kpiData.totalInterventions,
      variation: kpiData.interventionVariation,
      icon: <Wrench className="h-6 w-6" />,
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-900/30",
    },
    {
      title: "Heures machine moyennes",
      value: `${kpiData.hoursAverage.toLocaleString("fr-FR")}h`,
      icon: <Clock className="h-6 w-6" />,
      color: "text-rose-600",
      bgColor: "bg-rose-100 dark:bg-rose-900/30",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {kpis.map((kpi, index) => (
        <KPICard key={index} {...kpi} />
      ))}
    </div>
  );
}
