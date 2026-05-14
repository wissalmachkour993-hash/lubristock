"use client";

import { AppLayout } from "@/components/app-layout";
import { Header } from "@/components/header";
import { useStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  AlertCircle,
  Wrench,
  Bell,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Alerte = {
  id: string | number;
  type: string;
  lu: boolean;
  message: string;
  date: string;
};

export default function AlertesPage() {
  const { alertes, markAlerteAsRead } = useStore();

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "stock_critique":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case "stock_faible":
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case "maintenance":
        return <Wrench className="h-5 w-5 text-blue-500" />;
      case "anomalie":
        return <XCircle className="h-5 w-5 text-purple-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getAlertStyle = (type: string) => {
    switch (type) {
      case "stock_critique":
        return "border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/10";
      case "stock_faible":
        return "border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-900/10";
      case "maintenance":
        return "border-blue-200 dark:border-blue-900/50 bg-blue-50 dark:bg-blue-900/10";
      case "anomalie":
        return "border-purple-200 dark:border-purple-900/50 bg-purple-50 dark:bg-purple-900/10";
      default:
        return "border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/10";
    }
  };

  const getAlertBadge = (type: string) => {
    switch (type) {
      case "stock_critique":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      case "stock_faible":
        return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
      case "maintenance":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      case "anomalie":
        return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  const getAlertLabel = (type: string) => {
    switch (type) {
      case "stock_critique":
        return "Stock Critique";
      case "stock_faible":
        return "Stock Faible";
      case "maintenance":
        return "Maintenance";
      case "anomalie":
        return "Anomalie";
      default:
        return "Info";
    }
  };

  const unreadAlertes = alertes.filter((a: Alerte) => !a.lu);
  const readAlertes = alertes.filter((a: Alerte) => a.lu);

  return (
    <AppLayout>
      <Header
        title="Alertes"
        subtitle="Centre de notifications et alertes"
      />

      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {alertes.filter((a: Alerte) => a.type === "stock_critique").length}
                  </p>
                  <p className="text-xs text-muted-foreground">Stock Critique</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {alertes.filter((a: Alerte) => a.type === "stock_faible").length}
                  </p>
                  <p className="text-xs text-muted-foreground">Stock Faible</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Wrench className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {alertes.filter((a: Alerte) => a.type === "maintenance").length}
                  </p>
                  <p className="text-xs text-muted-foreground">Maintenance</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <XCircle className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {alertes.filter((a: Alerte) => a.type === "anomalie").length}
                  </p>
                  <p className="text-xs text-muted-foreground">Anomalies</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Non lues */}
        {unreadAlertes.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-[#1447E6]" />
                Alertes non lues ({unreadAlertes.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {unreadAlertes.map((alerte) => (
                <div
                  key={alerte.id}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-lg border",
                    getAlertStyle(alerte.type)
                  )}
                >
                  <div className="flex items-center gap-3">
                    {getAlertIcon(alerte.type)}
                    <div>
                      <p className="font-medium">{alerte.message}</p>
                      <p className="text-sm text-muted-foreground">{alerte.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={getAlertBadge(alerte.type)}>
                      {getAlertLabel(alerte.type)}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => markAlerteAsRead(alerte.id)}
                    >
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Lues */}
        {readAlertes.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-muted-foreground">
                <CheckCircle className="h-5 w-5" />
                Alertes traitées ({readAlertes.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {readAlertes.map((alerte) => (
                <div
                  key={alerte.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border bg-secondary/30 opacity-60"
                >
                  <div className="flex items-center gap-3">
                    {getAlertIcon(alerte.type)}
                    <div>
                      <p className="font-medium">{alerte.message}</p>
                      <p className="text-sm text-muted-foreground">{alerte.date}</p>
                    </div>
                  </div>
                  <Badge variant="secondary">
                    {getAlertLabel(alerte.type)}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {alertes.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <CheckCircle className="h-12 w-12 mx-auto text-emerald-500 mb-4" />
              <h3 className="text-lg font-semibold">Aucune alerte</h3>
              <p className="text-muted-foreground">
                Tout fonctionne normalement, aucune alerte à signaler.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
