export type UserRole = "operateur" | "chef";

export interface AuthUser {
  username: string;
  role: UserRole;
  displayName: string;
}

export const AUTH_STORAGE_KEY = "lubriocp-auth-session";

const DEMO_USERS: Array<AuthUser & { password: string }> = [
  {
    username: "operateur",
    password: "op1234",
    role: "operateur",
    displayName: "Opérateur",
  },
  {
    username: "chefatelier",
    password: "chef2026",
    role: "chef",
    displayName: "Chef d'atelier",
  },
];

export function authenticate(
  username: string,
  password: string
): AuthUser | null {
  const normalizedUsername = username.trim().toLowerCase();
  const match = DEMO_USERS.find(
    (user) =>
      user.username.toLowerCase() === normalizedUsername &&
      user.password === password
  );

  if (!match) return null;

  return {
    username: match.username,
    role: match.role,
    displayName: match.displayName,
  };
}

export function loadSession(): AuthUser | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as AuthUser;
    if (!parsed?.username || !parsed?.role) return null;

    const isValidUser = DEMO_USERS.some(
      (user) => user.username === parsed.username && user.role === parsed.role
    );

    return isValidUser ? parsed : null;
  } catch {
    return null;
  }
}

export function saveSession(user: AuthUser): void {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
}

export function clearSession(): void {
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

export function canAccessRoute(role: UserRole, pathname: string): boolean {
  if (role === "chef") return true;
  return pathname === "/interventions" || pathname.startsWith("/interventions/");
}

export function getDefaultRoute(role: UserRole): string {
  return role === "operateur" ? "/interventions" : "/";
}

export function getRoleLabel(role: UserRole): string {
  return role === "chef" ? "Chef d'atelier" : "Opérateur";
}

export function getUserInitials(user: AuthUser): string {
  if (user.role === "chef") return "CA";
  return "OP";
}
