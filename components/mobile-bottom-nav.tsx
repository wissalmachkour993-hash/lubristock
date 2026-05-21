"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, Settings, Smartphone, Wrench } from "lucide-react";

const items = [
  { href: "/tableau-de-bord", label: "Dashboard", icon: LayoutDashboard },
  { href: "/inventaire", label: "Inventaire", icon: Package },
  { href: "/interventions", label: "Interventions", icon: Wrench },
  { href: "/parametres", label: "Paramètres", icon: Settings },
  { href: "/install", label: "Installer", icon: Smartphone },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur md:hidden">
      <div className="grid grid-cols-5">
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] leading-tight sm:text-[11px] ${active ? "text-[#1447E6]" : "text-muted-foreground"}`}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
