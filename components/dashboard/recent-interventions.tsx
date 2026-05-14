"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useStore } from "@/lib/store";
import { Badge } from "@/components/ui/badge";
import { Droplets, RefreshCw, Fuel } from "lucide-react";

export function RecentInterventions() {
  const { interventions } = useStore();
  const recentInterventions = interventions.slice(0, 6);

  return (
    <Card className="col-span-2">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-[#ef4444]" />
          Interventions récentes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recentInterventions.map((intervention) => (
            <div
              key={intervention.id}
              className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                    intervention.type === "Vidange"
                      ? "bg-blue-100 dark:bg-blue-900/30"
                      : intervention.type === "Appoint"
                        ? "bg-amber-100 dark:bg-amber-900/30"
                        : "bg-emerald-100 dark:bg-emerald-900/30"
                  }`}
                >
                  {intervention.type === "Vidange" ? (
                    <RefreshCw className="h-5 w-5 text-blue-600" />
                  ) : intervention.type === "Appoint" ? (
                    <Droplets className="h-5 w-5 text-amber-600" />
                  ) : (
                    <Fuel className="h-5 w-5 text-emerald-700" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium">{intervention.engin}</p>
                  <p className="text-xs text-muted-foreground">
                    {intervention.lubrifiant} • {intervention.responsable}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <Badge
                  variant={intervention.type === "Vidange" ? "default" : "secondary"}
                  className={
                    intervention.type === "Vidange"
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                      : intervention.type === "Appoint"
                        ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                        : "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/35 dark:text-emerald-400"
                  }
                >
                  {intervention.type}
                </Badge>
                <p className="text-xs text-muted-foreground mt-1">
                  {intervention.quantite}L • {intervention.date}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
