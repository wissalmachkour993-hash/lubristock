"use client";

import { AuthProvider } from "@/components/auth-provider";
import { AuthGuard } from "@/components/auth-guard";
import { PwaRegister } from "@/components/pwa-register";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AuthGuard>
        <PwaRegister />
        {children}
      </AuthGuard>
    </AuthProvider>
  );
}