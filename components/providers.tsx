"use client";

import { AuthProvider } from "@/components/auth-provider";
import { PwaRegister } from "@/components/pwa-register";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <PwaRegister />
      {children}
    </AuthProvider>
  );
}