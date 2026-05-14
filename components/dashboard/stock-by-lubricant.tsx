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
} from "recharts";

const COLORS = [
  "#1447E6",
  "#0088bb", 
  "#22c55e",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
];

export function StockByLubricant() {
  const { lubrifiants } = useStore();

  const stockData = lubrifiants.map(l => ({
    name: l.nom.length > 15 ? l.nom.substring(0, 15) + "..." : l.nom,
    stock: l.stockActuel,
    minimum: l.stockMinimum,
  }));

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#1447E6]" />
          Stock par lubrifiant
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stockData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
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
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px",
                  fontSize: "10px"
                }}
                formatter={(value: number) => [`${value} L`, "Stock"]}
              />
              <Bar dataKey="stock" radius={[2, 2, 0, 0]}>
                {stockData.map((entry, index) => (
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
