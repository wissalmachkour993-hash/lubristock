import {
  AlertTriangle,
  BarChart3,
  Download,
  House,
  LayoutDashboard,
  Package,
  Settings,
  Smartphone,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import type { UserRole } from "@/lib/auth";

export interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
  roles: UserRole[];
}

export const NAV_ITEMS: NavItem[] = [
  {
    name: "Accueil",
    href: "/",
    icon: House,
    roles: ["chef"],
  },
  {
    name: "Tableau de bord",
    href: "/tableau-de-bord",
    icon: LayoutDashboard,
    roles: ["chef"],
  },
  {
    name: "Inventaire",
    href: "/inventaire",
    icon: Package,
    roles: ["chef"],
  },
  {
    name: "Interventions",
    href: "/interventions",
    icon: Wrench,
    roles: ["operateur", "chef"],
  },
  {
    name: "Exports",
    href: "/exports",
    icon: Download,
    roles: ["chef"],
  },
  {
    name: "Paramètres",
    href: "/parametres",
    icon: Settings,
    roles: ["chef"],
  },
  {
    name: "Alertes",
    href: "/alertes",
    icon: AlertTriangle,
    roles: ["chef"],
  },
  {
    name: "App sur téléphone",
    href: "/install",
    icon: Smartphone,
    roles: ["chef"],
  },
];

export function getNavItemsForRole(role: UserRole): NavItem[] {
  return NAV_ITEMS.filter((item) => item.roles.includes(role));
}
