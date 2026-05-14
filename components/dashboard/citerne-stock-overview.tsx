"use client";

import { useMemo } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Gauge, Layers } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useStore } from "@/lib/store";
import { CITERNE_REFERENCE_ROWS, CITERNE_REFERENCE_KG } from "@/lib/citerne-reference";
import { buildCiterneStockSeries, computeCiterneStockBySap } from "@/lib/citerne-stock";

const CHART_COLORS = ["#15803d", "#2563eb", "#ca8a04", "#7c3aed"];

const qtyFormatter = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 });

export function CiterneStockOverview() {
  const gaugeOperations = useStore((s) => s.gaugeOperations);
  const interventions = useStore((s) => s.interventions);

  const stockBySap = useMemo(
    () => computeCiterneStockBySap(gaugeOperations, interventions),
    [gaugeOperations, interventions]
  );

  const mergedChartSeries = useMemo(() => {
    const bySap: Record<string, Array<{ date: string; stockKg: number }>> = {};
    for (const ref of CITERNE_REFERENCE_ROWS) {
      const pts = buildCiterneStockSeries(ref.codeSap, gaugeOperations, interventions, { maxPoints: 80 });
      bySap[ref.codeSap] = pts.filter((p) => p.date !== "---");
    }

    const allDates = new Set<string>();
    for (const arr of Object.values(bySap)) {
      for (const p of arr) allDates.add(p.date);
    }
    const sorted = [...allDates].sort();
    const keys = CITERNE_REFERENCE_ROWS.map((r) => r.codeSap);
    const carried: Record<string, number> = Object.fromEntries(
      keys.map((k) => [k, CITERNE_REFERENCE_KG])
    );

    const rows =
      sorted.length === 0
        ? [{ date: "(aucun événement)", ...Object.fromEntries(keys.map((k) => [k, CITERNE_REFERENCE_KG])) }]
        : sorted.map((date) => {
            const row: Record<string, string | number> = { date };
            for (const k of keys) {
              const pt = bySap[k].find((p) => p.date === date);
              if (pt) carried[k] = pt.stockKg;
              row[k] = carried[k];
            }
            return row;
          });

    return rows;
  }, [gaugeOperations, interventions]);

  return (
    <div className="grid gap-3 lg:grid-cols-2">
      <Card className="lg:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="flex flex-wrap items-center gap-2 text-base font-semibold">
            <Layers className="h-5 w-5 text-emerald-600" aria-hidden />
            Stock physique citernes (jauges + mouvements)
            <span className="text-xs font-normal text-muted-foreground">
              Une jauge impose le niveau réel ; vidanges / appoints diminuent ; ravitaillements augmentent.
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {CITERNE_REFERENCE_ROWS.map((ref) => {
              const kg = stockBySap.get(ref.codeSap) ?? CITERNE_REFERENCE_KG;
              const pct = ref.stockMaxKg > 0 ? Math.min(100, (kg / ref.stockMaxKg) * 100) : 0;
              const sub =
                kg < ref.stockMinKg ? "Sous seuil mini" : kg > ref.stockMaxKg ? "Au-dessus du max théorique" : "Dans la plage mini / max";

              return (
                <Card key={ref.codeSap} className="border border-border/80 bg-muted/15 shadow-none">
                  <CardContent className="p-4">
                    <p className="text-xs font-medium text-muted-foreground line-clamp-2">{ref.description}</p>
                    <p className="mt-2 flex items-baseline gap-2">
                      <Gauge className="h-5 w-5 shrink-0 text-emerald-600" aria-hidden />
                      <span className="text-2xl font-bold tabular-nums tracking-tight">
                        {qtyFormatter.format(kg)}
                      </span>
                      <span className="text-sm text-muted-foreground">kg</span>
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      SAP {ref.codeSap} — {pct.toFixed(0)} % vs max tableau
                    </p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">{sub}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Évolution du stock reconstruit dans le temps</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[280px] w-full rounded-md border bg-background p-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mergedChartSeries} margin={{ top: 8, right: 12, left: 0, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="currentColor" className="opacity-70" />
                <YAxis tick={{ fontSize: 11 }} stroke="currentColor" className="opacity-70" />
                <Tooltip
                  formatter={(value: number) => [`${qtyFormatter.format(Number(value))} kg`, ""]}
                  labelFormatter={(d) => `Date ${d}`}
                  contentStyle={{ fontSize: 12 }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} iconType="line" />
                {CITERNE_REFERENCE_ROWS.map((ref, idx) => (
                  <Line
                    key={ref.codeSap}
                    type="stepAfter"
                    dataKey={ref.codeSap}
                    name={ref.description.replace(/\.$/, "").slice(0, 22)}
                    stroke={CHART_COLORS[idx % CHART_COLORS.length]}
                    strokeWidth={2}
                    dot={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
