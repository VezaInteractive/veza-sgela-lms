import { BookOpen, Briefcase, Compass, House, UserRound, type LucideIcon } from "lucide-react";

export type NavKey = "home" | "explore" | "learn" | "opportunities" | "me";

/** Bottom tab bar order (PRD 14.2): Home, Explore, Learn, Opportunities, Me. */
export const NAV_ITEMS: { key: NavKey; href: string; icon: LucideIcon }[] = [
  { key: "home", href: "/home", icon: House },
  { key: "explore", href: "/explore", icon: Compass },
  { key: "learn", href: "/learn", icon: BookOpen },
  { key: "opportunities", href: "/opportunities", icon: Briefcase },
  { key: "me", href: "/me", icon: UserRound },
];

export function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + "/");
}
