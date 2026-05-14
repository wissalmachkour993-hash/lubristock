"use client";

import { useStore } from "@/lib/store";
import { Bell, Search, Menu, LayoutDashboard, Package, Wrench, Settings, House } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const { alertes, markAlerteAsRead } = useStore();
  const unreadAlertes = alertes.filter((a) => !a.lu);
  const pathname = usePathname();

  const mobileNavigation = [
    { name: "Dashboard", href: "/tableau-de-bord", icon: LayoutDashboard },
    { name: "Inventaire", href: "/inventaire", icon: Package },
    { name: "Interventions", href: "/interventions", icon: Wrench },
    { name: "Paramètres", href: "/parametres", icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-3 md:h-16 md:px-6">
      <div className="flex items-center gap-2">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[260px]">
            <SheetHeader>
              <SheetTitle>Navigation</SheetTitle>
            </SheetHeader>
            <div className="mt-6 space-y-2">
              {mobileNavigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm ${isActive ? "bg-[#1447E6] text-white" : "hover:bg-secondary"}`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </SheetContent>
        </Sheet>
        <div>
        <h1 className="text-base md:text-2xl font-bold text-foreground">{title}</h1>
        {subtitle && (
          <p className="hidden md:block text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher..."
            className="w-64 pl-9 bg-secondary"
          />
        </div>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {unreadAlertes.length > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                >
                  {unreadAlertes.length}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            {unreadAlertes.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Aucune nouvelle alerte
              </div>
            ) : (
              unreadAlertes.slice(0, 5).map((alerte) => (
                <DropdownMenuItem
                  key={alerte.id}
                  onClick={() => markAlerteAsRead(alerte.id)}
                  className="flex flex-col items-start gap-1 p-3"
                >
                  <span className="text-sm font-medium">{alerte.message}</span>
                  <span className="text-xs text-muted-foreground">
                    {alerte.date}
                  </span>
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User */}
        <div className="flex items-center gap-2 md:gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-2 py-1.5 text-xs font-medium text-foreground transition hover:bg-secondary"
          >
            <House className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Accueil</span>
          </Link>
          <div className="hidden h-9 w-9 rounded-full bg-[#1447E6] text-white font-medium sm:flex items-center justify-center">
            MA
          </div>
          <div className="hidden lg:block">
            <p className="text-sm font-medium">ELORCHE Ahmed</p>
            <p className="text-xs text-muted-foreground">Chef d&apos;atelier Station de service</p>
          </div>
        </div>
      </div>
    </header>
  );
}
