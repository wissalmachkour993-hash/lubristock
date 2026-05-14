"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useStore } from "@/lib/store";
import { Gauge, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
  PolarAngleAxis,
} from "recharts";

export function EfficiencyIndex() {
  const { engins } = useStore();

  const avgEfficiency =
    engins.reduce((acc, e) => acc + (e.efficiencyIndex || 0), 0) / engins.length;

  const data = [
    {
      name: "Efficacité",
      value: Math.round(avgEfficiency),
      fill: avgEfficiency >= 80 
        ? "hsl(142, 76%, 36%)" 
        : avgEfficiency >= 60 
        ? "hsl(45, 93%, 47%)" 
        : "hsl(0, 84%, 60%)",
    },
  ];

  const topPerformers = engins
    .filter((e) => e.efficiencyIndex)
    .sort((a, b) => (b.efficiencyIndex || 0) - (a.efficiencyIndex || 0))
    .slice(0, 3);

  const lowPerformers = engins
    .filter((e) => e.efficiencyIndex)
    .sort((a, b) => (a.efficiencyIndex || 0) - (b.efficiencyIndex || 0))
    .slice(0, 3);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Gauge className="h-4 w-4 text-cyan-500" />
          Indice d&apos;efficacité de lubrification
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Gauge */}
        <div className="h-[160px] relative">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              cx="50%"
              cy="100%"
              innerRadius="80%"
              outerRadius="100%"
              barSize={20}
              data={data}
              startAngle={180}
              endAngle={0}
            >
              <PolarAngleAxis
                type="number"
                domain={[0, 100]}
                angleAxisId={0}
                tick={false}
              />
              <RadialBar
                background
                dataKey="value"
                cornerRadius={10}
                fill={data[0].fill}
              />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-end pb-2">
            <span className="text-4xl font-bold">{Math.round(avgEfficiency)}%</span>
            <span className="text-xs text-muted-foreground">Efficacité globale</span>
          </div>
        </div>

        {/* Performance lists */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          {/* Top performers */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-emerald-500" />
              Meilleurs
            </p>
            {topPerformers.map((engin) => (
              <div
                key={engin.id}
                className="flex items-center justify-between py-1.5 border-b border-border last:border-0"
              >
                <span className="text-xs">{engin.nom}</span>
                <span className="text-xs font-medium text-emerald-500">
                  {engin.efficiencyIndex}%
                </span>
              </div>
            ))}
          </div>

          {/* Low performers */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
              <TrendingDown className="h-3 w-3 text-red-500" />
              À améliorer
            </p>
            {lowPerformers.map((engin) => (
              <div
                key={engin.id}
                className="flex items-center justify-between py-1.5 border-b border-border last:border-0"
              >
                <span className="text-xs">{engin.nom}</span>
                <span
                  className={cn(
                    "text-xs font-medium",
                    (engin.efficiencyIndex || 0) < 60
                      ? "text-red-500"
                      : "text-amber-500"
                  )}
                >
                  {engin.efficiencyIndex}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
