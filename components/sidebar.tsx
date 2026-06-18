"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";
import { useAuth } from "@/components/auth-provider";
import { getNavItemsForRole } from "@/lib/navigation";
import { getRoleLabel } from "@/lib/auth";
import {
  Moon,
  Sun,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode, alertes } = useStore();
  const [collapsed, setCollapsed] = useState(false);

  if (!user) return null;

  const navigation = getNavItemsForRole(user.role);
  const unreadAlertes = alertes.filter((a) => !a.lu).length;
  const showAlertesBadge = user.role === "chef" && unreadAlertes > 0;

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen transition-all duration-300 border-r border-border bg-sidebar",
        collapsed ? "w-16" : "w-64",
        "hidden md:block"
      )}
    >
      <div className="flex h-full flex-col">
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
                <span className="text-lg font-bold text-[#22c55e]">LubriOCP</span>
                <span className="text-xs text-muted-foreground">OCP Benguerir</span>
              </div>
            </div>
          )}
        </div>

        <nav className="flex-1 space-y-1 px-2 py-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const isAlertes = item.href === "/alertes";

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
                <div className="relative shrink-0">
                  <item.icon className="h-5 w-5" />
                  {isAlertes && showAlertesBadge && (
                    <Badge
                      variant="destructive"
                      className="absolute -right-2 -top-2 h-4 w-4 rounded-full p-0 text-[10px]"
                    >
                      {unreadAlertes}
                    </Badge>
                  )}
                </div>
                {!collapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border p-4 space-y-2">
          {!collapsed && (
            <div className="rounded-lg bg-sidebar-accent px-3 py-2">
              <p className="text-sm font-medium">{user.displayName}</p>
              <p className="text-xs text-muted-foreground">
                {getRoleLabel(user.role)}
              </p>
            </div>
          )}

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

          <Button
            variant="ghost"
            onClick={handleLogout}
            className={cn(
              "w-full justify-start gap-3 px-3 text-destructive hover:text-destructive",
              collapsed && "justify-center px-0"
            )}
          >
            <LogOut className="h-5 w-5" />
            {!collapsed && <span>Déconnexion</span>}
          </Button>

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
