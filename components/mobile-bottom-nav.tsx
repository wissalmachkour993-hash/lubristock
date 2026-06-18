"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { getNavItemsForRole } from "@/lib/navigation";

export function MobileBottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  if (!user) return null;

  const items = getNavItemsForRole(user.role).filter(
    (item) => item.href !== "/install"
  );

  if (items.length === 0) return null;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur md:hidden">
      <div
        className="grid"
        style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
      >
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] leading-tight sm:text-[11px] ${active ? "text-[#1447E6]" : "text-muted-foreground"}`}
            >
              <item.icon className="h-4 w-4" />
              <span className="truncate px-1">{item.name.split(" ")[0]}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
