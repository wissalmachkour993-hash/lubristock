"use client";

import { AppLayout } from "@/components/app-layout";
import { Header } from "@/components/header";
import { KPICards } from "@/components/dashboard/kpi-cards";
import { ConsumptionChart } from "@/components/dashboard/consumption-chart";
import { DistributionChart } from "@/components/dashboard/distribution-chart";
import { CategoryChart } from "@/components/dashboard/category-chart";
import { StockAlerts } from "@/components/dashboard/stock-alerts";
import { TopEquipment } from "@/components/dashboard/top-equipment";
import { StockByLubricant } from "@/components/dashboard/stock-by-lubricant";
import { VariationChart } from "@/components/dashboard/variation-chart";
import { TopLubricant } from "@/components/dashboard/top-lubricant";
import { AnomalyDetection } from "@/components/dashboard/anomaly-detection";
import { StockPrediction } from "@/components/dashboard/stock-prediction";
import { ParetoChart } from "@/components/dashboard/pareto-chart";
import { ConsumptionVsHours } from "@/components/dashboard/consumption-vs-hours";
import { CiterneStockOverview } from "@/components/dashboard/citerne-stock-overview";

export default function DashboardPage() {
  return (
    <AppLayout>
      <Header
        title="Tableau de bord"
        subtitle="Vue d'ensemble de la gestion des lubrifiants"
      />

      <div className="p-4 space-y-3">
        <CiterneStockOverview />
        <KPICards />

        <div className="grid gap-3 lg:grid-cols-4">
          <StockByLubricant />
          <VariationChart />
          <TopLubricant />
          <TopEquipment />
        </div>

        <div className="grid gap-3 lg:grid-cols-2">
          <ConsumptionChart />
          <DistributionChart />
        </div>

        <div className="grid gap-3 lg:grid-cols-2">
          <CategoryChart />
          <StockAlerts />
        </div>

        <div className="grid gap-3 lg:grid-cols-2">
          <AnomalyDetection />
          <StockPrediction />
        </div>

        <div className="grid gap-3 lg:grid-cols-2">
          <ParetoChart />
          <ConsumptionVsHours />
        </div>
      </div>
    </AppLayout>
  );
}
