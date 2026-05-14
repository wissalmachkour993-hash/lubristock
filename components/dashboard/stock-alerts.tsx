"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useStore } from "@/lib/store";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, CheckCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function StockAlerts() {
  const { lubrifiants } = useStore();

  const getStockStatus = (actuel: number, minimum: number) => {
    const ratio = actuel / minimum;
    if (ratio <= 0.5) return "critique";
    if (ratio <= 1) return "faible";
    return "normal";
  };

  const getProgressColor = (status: string) => {
    switch (status) {
      case "critique":
        return "bg-red-500";
      case "faible":
        return "bg-amber-500";
      default:
        return "bg-emerald-500";
    }
  };

  const getIcon = (status: string) => {
    switch (status) {
      case "critique":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "faible":
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      default:
        return <CheckCircle className="h-4 w-4 text-emerald-500" />;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#f59e0b]" />
          État des stocks
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {lubrifiants.map((lubrifiant) => {
          const status = getStockStatus(
            lubrifiant.stockActuel,
            lubrifiant.stockMinimum
          );
          const percentage = Math.min(
            (lubrifiant.stockActuel / (lubrifiant.stockMinimum * 2)) * 100,
            100
          );

          return (
            <div key={lubrifiant.id} className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  {getIcon(status)}
                  <span className="text-xs font-medium">{lubrifiant.nom.length > 15 ? lubrifiant.nom.substring(0, 15) + "..." : lubrifiant.nom}</span>
                </div>
                <span
                  className={cn(
                    "text-xs font-semibold",
                    status === "critique" && "text-red-500",
                    status === "faible" && "text-amber-500",
                    status === "normal" && "text-emerald-500"
                  )}
                >
                  {lubrifiant.stockActuel} {lubrifiant.unite}
                </span>
              </div>
              <div className="relative h-1 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className={cn(
                    "h-full transition-all",
                    getProgressColor(status)
                  )}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
