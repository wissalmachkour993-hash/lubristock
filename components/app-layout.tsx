"use client";

import { useStore } from "@/lib/store";
import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { Toaster } from "sonner";
import { OfflineBanner } from "@/components/offline-banner";
import { Sidebar } from "@/components/sidebar";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { useAuth } from "@/components/auth-provider";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { darkMode, initializeData, initialized } = useStore();
  const { user } = useAuth();

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  useEffect(() => {
    if (!initialized) initializeData();
  }, [initializeData, initialized]);

  return (
    <div className={cn("min-h-screen bg-background")}>
      <OfflineBanner />
      {user && <Sidebar />}
      <main className={cn("min-h-screen", user && "md:pl-64 pb-16 md:pb-0")}>
        {children}
      </main>
      {user && <MobileBottomNav />}
      <Toaster richColors position="top-right" />
    </div>
  );
}
