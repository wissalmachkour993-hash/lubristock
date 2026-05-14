"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useStore } from "@/lib/store";
import { computeCategoryConsumption } from "@/lib/analytics";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const COLORS = [
  "#1447E6",
  "#0088bb",
  "#22c55e",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
  "#84cc16",
];

export function CategoryChart() {
  const { interventions } = useStore();
  const consommationParCategorie = computeCategoryConsumption(interventions);

  return (
    <Card className="col-span-2">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#22c55e]" />
          Consommation par catégorie
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={consommationParCategorie}
              layout="vertical"
              margin={{ left: 15, right: 5, top: 5, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={true} vertical={false} />
              <XAxis
                type="number"
                tick={{ fill: "currentColor", fontSize: 9 }}
                axisLine={{ stroke: "currentColor", opacity: 0.3 }}
              />
              <YAxis
                type="category"
                dataKey="categorie"
                width={80}
                tick={{ fill: "currentColor", fontSize: 9 }}
                axisLine={{ stroke: "currentColor", opacity: 0.3 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px",
                  fontSize: "10px"
                }}
                formatter={(value: number) => [`${value} L`, "Consommation"]}
              />
              <Bar dataKey="consommation" radius={[0, 2, 2, 0]}>
                {consommationParCategorie.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
