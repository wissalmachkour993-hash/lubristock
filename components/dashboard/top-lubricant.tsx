"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useStore } from "@/lib/store";
import { Droplets, TrendingUp, Award } from "lucide-react";
import { cn } from "@/lib/utils";

export function TopLubricant() {
  const { interventions, lubrifiants } = useStore();

  // Calculer la consommation totale par lubrifiant
  const consumptionByLubricant = lubrifiants.map(lubrifiant => {
    const totalConsumption = interventions
      .filter(i => i.lubrifiant === lubrifiant.nom)
      .reduce((acc, i) => acc + i.quantite, 0);
    
    return {
      name: lubrifiant.nom,
      consumption: totalConsumption,
      stock: lubrifiant.stockActuel,
      unit: lubrifiant.unite,
    };
  }).sort((a, b) => b.consumption - a.consumption);

  const topLubricant = consumptionByLubricant[0];
  const secondLubricant = consumptionByLubricant[1];
  const thirdLubricant = consumptionByLubricant[2];

  if (!topLubricant) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#f59e0b]" />
            Top lubrifiant
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[200px]">
          <p className="text-muted-foreground text-sm">Aucune donnée disponible</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#f59e0b]" />
          Top lubrifiant
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Top 1 */}
        <div className="flex items-center gap-3 p-2 rounded-lg bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-900/10 border border-amber-200 dark:border-amber-800/30">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 text-white">
            <Award className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">
              {topLubricant.name}
            </p>
            <p className="text-xs text-amber-600 dark:text-amber-500">
              {topLubricant.consumption} {topLubricant.unit} consommés
            </p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-amber-700 dark:text-amber-400">
              {topLubricant.consumption}
            </p>
            <p className="text-[9px] text-muted-foreground">{topLubricant.unit}</p>
          </div>
        </div>

        {/* Top 2 */}
        {secondLubricant && (
          <div className="flex items-center gap-3 p-2 rounded-lg bg-secondary/50">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-400 text-white text-xs font-bold">
              2
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium">
                {secondLubricant.name.length > 20 ? 
                  secondLubricant.name.substring(0, 20) + "..." : 
                  secondLubricant.name
                }
              </p>
              <p className="text-[9px] text-muted-foreground">
                {secondLubricant.consumption} {secondLubricant.unit}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold">{secondLubricant.consumption}</p>
              <p className="text-[9px] text-muted-foreground">{secondLubricant.unit}</p>
            </div>
          </div>
        )}

        {/* Top 3 */}
        {thirdLubricant && (
          <div className="flex items-center gap-3 p-2 rounded-lg bg-secondary/30">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-600 text-white text-xs font-bold">
              3
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium">
                {thirdLubricant.name.length > 20 ? 
                  thirdLubricant.name.substring(0, 20) + "..." : 
                  thirdLubricant.name
                }
              </p>
              <p className="text-[9px] text-muted-foreground">
                {thirdLubricant.consumption} {thirdLubricant.unit}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold">{thirdLubricant.consumption}</p>
              <p className="text-[9px] text-muted-foreground">{thirdLubricant.unit}</p>
            </div>
          </div>
        )}

        {/* Statistique */}
        <div className="pt-2 border-t border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Droplets className="h-3 w-3 text-blue-500" />
              <span className="text-[9px] text-muted-foreground">Total consommé</span>
            </div>
            <span className="text-xs font-semibold">
              {consumptionByLubricant.reduce((acc, l) => acc + l.consumption, 0)} L
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
