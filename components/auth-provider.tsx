"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  AuthUser,
  authenticate,
  clearSession,
  loadSession,
  saveSession,
} from "@/lib/auth";

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: (
    username: string,
    password: string
  ) =>
    | { success: true; user: AuthUser }
    | { success: false; error: string };
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const session = loadSession();
      setUser(session);
    } catch (error) {
      console.error("Erreur lors du chargement de la session:", error);
      clearSession();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback((username: string, password: string) => {
    const authenticatedUser = authenticate(username, password);

    if (!authenticatedUser) {
      return {
        success: false as const,
        error: "Nom d'utilisateur ou mot de passe incorrect.",
      };
    }

    saveSession(authenticatedUser);
    setUser(authenticatedUser);
    return { success: true as const, user: authenticatedUser };
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, isLoading, login, logout }),
    [user, isLoading, login, logout]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
