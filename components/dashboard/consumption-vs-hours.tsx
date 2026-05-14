"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { consumptionVsHours } from "@/lib/data";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ZAxis,
} from "recharts";
import { Clock } from "lucide-react";

export function ConsumptionVsHours() {
  return (
    <Card className="lg:col-span-2">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Clock className="h-4 w-4 text-cyan-500" />
          Consommation vs Heures machine
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                type="number"
                dataKey="heures"
                name="Heures"
                tick={{ fontSize: 11 }}
                className="text-muted-foreground"
                label={{
                  value: "Heures de service",
                  position: "insideBottom",
                  offset: -10,
                  style: { fontSize: 11 },
                }}
              />
              <YAxis
                type="number"
                dataKey="consommation"
                name="Consommation"
                tick={{ fontSize: 11 }}
                className="text-muted-foreground"
                label={{
                  value: "Consommation (L)",
                  angle: -90,
                  position: "insideLeft",
                  style: { fontSize: 11 },
                }}
              />
              <ZAxis type="number" dataKey="ratio" range={[100, 400]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                cursor={{ strokeDasharray: "3 3" }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-card p-3 rounded-lg border border-border shadow-lg">
                        <p className="font-semibold mb-1">{data.engin}</p>
                        <p className="text-xs text-muted-foreground">
                          Heures: {data.heures.toLocaleString("fr-FR")}h
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Consommation: {data.consommation}L
                        </p>
                        <p className="text-xs text-cyan-500 font-medium mt-1">
                          Ratio: {(data.ratio * 1000).toFixed(2)}L/1000h
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Scatter
                name="Équipements"
                data={consumptionVsHours}
                fill="hsl(var(--primary))"
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            La taille des points représente le ratio consommation/heures - Plus le point est grand, plus le ratio est élevé
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
