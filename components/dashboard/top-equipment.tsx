"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useStore } from "@/lib/store";
import { computeTopEquipments } from "@/lib/analytics";
import { Truck } from "lucide-react";

export function TopEquipment() {
  const { interventions } = useStore();
  const topEquipements = computeTopEquipments(interventions, 5);
  const maxConsommation = Math.max(...topEquipements.map((e) => e.consommation), 1);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#8b5cf6]" />
          Top machine
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {topEquipements.slice(0, 4).map((equip, index) => (
          <div key={equip.engin} className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-secondary">
              <Truck className="h-3 w-3 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium">{equip.engin}</span>
                <span className="text-xs font-semibold text-[#1447E6]">
                  {equip.consommation} L
                </span>
              </div>
              <div className="flex items-center gap-1">
                <div className="flex-1 h-1 rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#1447E6] to-[#0088bb]"
                    style={{
                      width: `${(equip.consommation / maxConsommation) * 100}%`,
                    }}
                  />
                </div>
                <span className="text-[8px] text-muted-foreground">
                  {equip.heures.toLocaleString("fr-FR")}h
                </span>
              </div>
            </div>
            <div className="flex h-4 w-4 items-center justify-center rounded-full bg-secondary text-[8px] font-medium">
              #{index + 1}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
