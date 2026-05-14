"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";
import {
  LayoutDashboard,
  Package,
  Wrench,
  Settings,
  Bell,
  Moon,
  Sun,
  Smartphone,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const navigation = [
  { name: "Tableau de bord", href: "/tableau-de-bord", icon: LayoutDashboard },
  { name: "Inventaire", href: "/inventaire", icon: Package },
  { name: "Interventions", href: "/interventions", icon: Wrench },
  { name: "Paramètres", href: "/parametres", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { darkMode, toggleDarkMode, alertes } = useStore();
  const [collapsed, setCollapsed] = useState(false);
  
  const unreadAlertes = alertes.filter((a) => !a.lu).length;

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen transition-all duration-300 border-r border-border bg-sidebar",
        collapsed ? "w-16" : "w-64",
        "hidden md:block"
      )}
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-20 items-center justify-center border-b border-border px-4">
          {collapsed ? (
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/OCP%20logo-x5nfLttde4Q4qAg5RIHltvZYJOE32v.jpg"
              alt="OCP"
              className="h-10 w-10 object-contain"
            />
          ) : (
            <div className="flex items-center gap-3">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/OCP%20logo-x5nfLttde4Q4qAg5RIHltvZYJOE32v.jpg"
                alt="OCP"
                className="h-12 w-12 object-contain"
              />
              <div className="flex flex-col">
                <span className="text-lg font-bold text-[#22c55e]">OCP</span>
                <span className="text-xs text-muted-foreground">Gestion Lubrifiants</span>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-2 py-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                  isActive
                    ? "bg-[#1447E6] text-white"
                    : "text-sidebar-foreground hover:bg-sidebar-accent"
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-border p-4 space-y-2">
          <Link
            href="/download"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all text-sidebar-foreground hover:bg-sidebar-accent",
              collapsed && "justify-center"
            )}
          >
            <Smartphone className="h-5 w-5 shrink-0" />
            {!collapsed && <span>App sur téléphone</span>}
          </Link>

          {/* Alertes */}
          <Link
            href="/alertes"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all text-sidebar-foreground hover:bg-sidebar-accent",
              collapsed && "justify-center"
            )}
          >
            <div className="relative">
              <Bell className="h-5 w-5" />
              {unreadAlertes > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -right-2 -top-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                >
                  {unreadAlertes}
                </Badge>
              )}
            </div>
            {!collapsed && <span>Alertes</span>}
          </Link>

          {/* Toggle Dark Mode */}
          <Button
            variant="ghost"
            onClick={toggleDarkMode}
            className={cn(
              "w-full justify-start gap-3 px-3",
              collapsed && "justify-center px-0"
            )}
          >
            {darkMode ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
            {!collapsed && <span>{darkMode ? "Mode clair" : "Mode sombre"}</span>}
          </Button>

          {/* Collapse Button */}
          <Button
            variant="ghost"
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              "w-full justify-start gap-3 px-3",
              collapsed && "justify-center px-0"
            )}
          >
            {collapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <>
                <ChevronLeft className="h-5 w-5" />
                <span>Réduire</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </aside>
  );
}
