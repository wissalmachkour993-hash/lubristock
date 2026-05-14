"use client";

import { useStore } from "@/lib/store";
import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { Toaster } from "sonner";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { darkMode, initializeData, initialized } = useStore();

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
      <main className="min-h-screen">
        {children}
      </main>
      <Toaster richColors position="top-right" />
    </div>
  );
}
