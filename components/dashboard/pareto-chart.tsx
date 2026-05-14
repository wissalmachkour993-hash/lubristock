"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { paretoData } from "@/lib/data";
import {
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
} from "recharts";

export function ParetoChart() {
  return (
    <Card className="lg:col-span-2">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-purple-500" />
          Diagramme Pareto - Top machines consommatrices
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={paretoData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="engin"
                tick={{ fontSize: 11 }}
                className="text-muted-foreground"
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis
                yAxisId="left"
                tick={{ fontSize: 11 }}
                className="text-muted-foreground"
                label={{
                  value: "Litres",
                  angle: -90,
                  position: "insideLeft",
                  style: { fontSize: 11 },
                }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 11 }}
                className="text-muted-foreground"
                domain={[0, 100]}
                label={{
                  value: "% Cumulé",
                  angle: 90,
                  position: "insideRight",
                  style: { fontSize: 11 },
                }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                formatter={(value: number, name: string) => [
                  name === "cumul" ? `${value}%` : `${value}L`,
                  name === "cumul" ? "% Cumulé" : "Consommation",
                ]}
              />
              <Bar
                yAxisId="left"
                dataKey="consommation"
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
                name="consommation"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="cumul"
                stroke="#ef4444"
                strokeWidth={2}
                dot={{ fill: "#ef4444", strokeWidth: 2 }}
                name="cumul"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-border">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-primary" />
            <span className="text-xs text-muted-foreground">Consommation (L)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-0.5 w-4 bg-red-500" />
            <span className="text-xs text-muted-foreground">Cumul (%)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
