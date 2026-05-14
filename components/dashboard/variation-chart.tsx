"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useStore } from "@/lib/store";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts";
import { TrendingUp, TrendingDown } from "lucide-react";
import { computeVariationByLubricant } from "@/lib/analytics";

export function VariationChart() {
  const { lubrifiants, interventions } = useStore();

  const variationData = computeVariationByLubricant(lubrifiants, interventions);

  const getBarColor = (variation: number) => {
    if (variation > 0) return "#22c55e"; // Vert pour augmentation
    if (variation < 0) return "#ef4444"; // Rouge pour diminution
    return "#6b7280"; // Gris pour stable
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#22c55e]" />
          Variation vs mois précédent
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={variationData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="name" 
                tick={{ fill: "currentColor", fontSize: 9 }}
                axisLine={{ stroke: "currentColor", opacity: 0.3 }}
                angle={-45}
                textAnchor="end"
                height={40}
              />
              <YAxis 
                tick={{ fill: "currentColor", fontSize: 9 }}
                axisLine={{ stroke: "currentColor", opacity: 0.3 }}
                domain={[-25, 25]}
              />
              <ReferenceLine y={0} stroke="#6b7280" strokeWidth={1} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px",
                  fontSize: "10px"
                }}
                formatter={(value: number) => [
                  `${value > 0 ? '+' : ''}${value}%`, 
                  "Variation"
                ]}
              />
              <Bar dataKey="variation" radius={[2, 2, 0, 0]}>
                {variationData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry.variation)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Légende des variations */}
        <div className="flex justify-center gap-4 mt-2">
          <div className="flex items-center gap-1">
            <TrendingUp className="h-3 w-3 text-green-500" />
            <span className="text-[9px] text-muted-foreground">Hausse</span>
          </div>
          <div className="flex items-center gap-1">
            <TrendingDown className="h-3 w-3 text-red-500" />
            <span className="text-[9px] text-muted-foreground">Baisse</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
