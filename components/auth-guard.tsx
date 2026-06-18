"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { canAccessRoute, getDefaultRoute } from "@/lib/auth";
import { useAuth } from "./auth-provider";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isLoginPage = pathname === "/login";

  useEffect(() => {
    if (isLoading) return;

    if (!user && !isLoginPage) {
      router.replace("/login");
      return;
    }

    if (user && isLoginPage) {
      router.replace(getDefaultRoute(user.role));
      return;
    }

    if (user && !canAccessRoute(user.role, pathname)) {
      router.replace(getDefaultRoute(user.role));
    }
  }, [user, isLoading, isLoginPage, pathname, router]);

  // Très important : la page login doit toujours s'afficher
  if (isLoginPage) {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-slate-700">Chargement...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (!canAccessRoute(user.role, pathname)) {
    return null;
  }

  return <>{children}</>;
}