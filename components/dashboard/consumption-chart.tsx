"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useStore } from "@/lib/store";
import { computeMonthlyConsumption } from "@/lib/analytics";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export function ConsumptionChart() {
  const { interventions } = useStore();
  const data = computeMonthlyConsumption(interventions);

  return (
    <Card className="col-span-2">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#1447E6]" />
          Mouvements mensuels (vidange, appoint)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorVidange" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1447E6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#1447E6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorAppoint" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0088bb" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0088bb" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="mois"
                tick={{ fill: "currentColor", fontSize: 9 }}
                axisLine={{ stroke: "currentColor", opacity: 0.3 }}
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
                labelStyle={{ color: "hsl(var(--foreground))", fontSize: "10px" }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="vidange"
                name="Vidanges (kg)"
                stroke="#1447E6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorVidange)"
              />
              <Area
                type="monotone"
                dataKey="appoint"
                name="Appoints (kg)"
                stroke="#0088bb"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorAppoint)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
