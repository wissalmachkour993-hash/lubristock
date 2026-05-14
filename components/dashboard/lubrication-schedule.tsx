"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { scheduledLubrifications } from "@/lib/data";
import { CalendarDays, CheckCircle2, AlertTriangle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const statusConfig = {
  planifie: {
    label: "Planifié",
    color: "text-blue-500",
    bg: "bg-blue-500/20",
    icon: Clock,
  },
  complete: {
    label: "Complété",
    color: "text-emerald-500",
    bg: "bg-emerald-500/20",
    icon: CheckCircle2,
  },
  retard: {
    label: "En retard",
    color: "text-red-500",
    bg: "bg-red-500/20",
    icon: AlertTriangle,
  },
};

export function LubricationSchedule() {
  const sortedSchedule = [...scheduledLubrifications].sort((a, b) => {
    const statusOrder = { retard: 0, planifie: 1, complete: 2 };
    return statusOrder[a.status] - statusOrder[b.status];
  });

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-purple-500" />
          Planning des lubrifications
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {sortedSchedule.map((schedule) => {
          const config = statusConfig[schedule.status];
          const Icon = config.icon;
          const scheduleDate = new Date(schedule.date);
          const isToday = scheduleDate.toDateString() === new Date().toDateString();

          return (
            <div
              key={schedule.id}
              className={cn(
                "p-3 rounded-lg border transition-all hover:border-primary/50",
                config.bg,
                schedule.status === "retard" && "animate-pulse"
              )}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Icon className={cn("h-4 w-4", config.color)} />
                  <span className="font-medium text-sm">{schedule.enginNom}</span>
                </div>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs",
                    config.color,
                    config.bg
                  )}
                >
                  {config.label}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <div>
                  <span className="font-medium">Date:</span>{" "}
                  <span className={cn(isToday && "text-primary font-semibold")}>
                    {scheduleDate.toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "short",
                    })}
                    {isToday && " (Aujourd'hui)"}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Type:</span> {schedule.type}
                </div>
                <div>
                  <span className="font-medium">Lubrifiant:</span> {schedule.lubrifiant.split(" ").slice(0, 2).join(" ")}
                </div>
                <div>
                  <span className="font-medium">Qté:</span> ~{schedule.quantiteEstimee}L
                </div>
              </div>
            </div>
          );
        })}

        {/* Stats rapides */}
        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-border">
          <div className="text-center">
            <p className="text-lg font-bold text-blue-500">
              {scheduledLubrifications.filter((s) => s.status === "planifie").length}
            </p>
            <p className="text-xs text-muted-foreground">Planifiées</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-red-500">
              {scheduledLubrifications.filter((s) => s.status === "retard").length}
            </p>
            <p className="text-xs text-muted-foreground">En retard</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-emerald-500">
              {scheduledLubrifications.filter((s) => s.status === "complete").length}
            </p>
            <p className="text-xs text-muted-foreground">Complétées</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
