"use client";

import { useEffect, useRef } from "react";
import { WifiOff, CloudOff } from "lucide-react";
import { useNetworkStatus } from "@/hooks/use-network-status";
import { useStore } from "@/lib/store";
import { toast } from "sonner";

export function OfflineBanner() {
  const { online, offline } = useNetworkStatus();
  const initializeData = useStore((s) => s.initializeData);
  const wasOnline = useRef<boolean | null>(null);

  useEffect(() => {
    document.documentElement.classList.toggle("is-offline", offline);
    return () => document.documentElement.classList.remove("is-offline");
  }, [offline]);

  useEffect(() => {
    if (wasOnline.current === null) {
      wasOnline.current = online;
      return;
    }
    if (wasOnline.current === online) return;
    wasOnline.current = online;

    if (online) {
      toast.success("Connexion rétablie — synchronisation des données…", { id: "network-status" });
      initializeData();
    } else {
      toast.info("Mode hors ligne : vos données locales restent disponibles.", {
        id: "network-status",
        duration: 5000,
      });
    }
  }, [online, initializeData]);

  if (!offline) return null;

  return (
    <div
      role="status"
      className="fixed left-0 right-0 top-0 z-[100] flex items-center justify-center gap-2 border-b border-amber-600/40 bg-amber-500 px-3 py-2 text-center text-sm font-medium text-amber-950 shadow-md"
    >
      <WifiOff className="h-4 w-4 shrink-0" aria-hidden />
      <span>
        Mode hors ligne — consultation et saisie locales actives. Les données seront synchronisées au retour du réseau.
      </span>
      <CloudOff className="hidden h-4 w-4 shrink-0 sm:inline" aria-hidden />
    </div>
  );
}
