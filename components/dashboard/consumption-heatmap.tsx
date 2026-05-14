"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { heatmapData } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

function getHeatColor(value: number): string {
  if (value === 0) return "bg-muted";
  if (value < 20) return "bg-emerald-500/30";
  if (value < 35) return "bg-emerald-500/60";
  if (value < 50) return "bg-amber-500/60";
  return "bg-red-500/70";
}

function getIntensityLabel(value: number): string {
  if (value === 0) return "Aucune";
  if (value < 20) return "Faible";
  if (value < 35) return "Modérée";
  if (value < 50) return "Élevée";
  return "Très élevée";
}

export function ConsumptionHeatmap() {
  const weeks = ["S1", "S2", "S3", "S4"];

  return (
    <Card className="lg:col-span-2">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-amber-500" />
          Heatmap de consommation par machine
        </CardTitle>
      </CardHeader>
      <CardContent>
        <TooltipProvider>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left text-xs font-medium text-muted-foreground pb-3 pr-4">
                    Machine
                  </th>
                  {weeks.map((week) => (
                    <th
                      key={week}
                      className="text-center text-xs font-medium text-muted-foreground pb-3 px-2"
                    >
                      {week}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {heatmapData.map((row, idx) => (
                  <tr key={row.engin} className={cn(idx % 2 === 0 && "bg-muted/30")}>
                    <td className="text-sm font-medium py-2 pr-4">{row.engin}</td>
                    {[row.semaine1, row.semaine2, row.semaine3, row.semaine4].map(
                      (value, weekIdx) => (
                        <td key={weekIdx} className="px-2 py-2">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div
                                className={cn(
                                  "h-8 w-full rounded-md flex items-center justify-center text-xs font-medium transition-all hover:scale-105 cursor-pointer",
                                  getHeatColor(value),
                                  value > 0 && "text-foreground"
                                )}
                              >
                                {value > 0 ? `${value}L` : "-"}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <div className="text-xs">
                                <p className="font-semibold">{row.engin}</p>
                                <p>Semaine {weekIdx + 1}: {value}L</p>
                                <p className="text-muted-foreground">
                                  Intensité: {getIntensityLabel(value)}
                                </p>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </td>
                      )
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TooltipProvider>
        
        {/* Légende */}
        <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-border">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-muted" />
            <span className="text-xs text-muted-foreground">Aucune</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-emerald-500/30" />
            <span className="text-xs text-muted-foreground">Faible</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-emerald-500/60" />
            <span className="text-xs text-muted-foreground">Modérée</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-amber-500/60" />
            <span className="text-xs text-muted-foreground">Élevée</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-red-500/70" />
            <span className="text-xs text-muted-foreground">Très élevée</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
