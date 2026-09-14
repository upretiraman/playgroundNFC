export const ROLES = ["PLAYER", "TRAINER", "ADMIN"] as const;
export type UserRole = (typeof ROLES)[number];

/** Parses the comma-separated `roles` column into a typed set, dropping anything unrecognized. */
export function parseRoles(raw: string): UserRole[] {
  return raw
    .split(",")
    .map((r) => r.trim())
    .filter((r): r is UserRole => (ROLES as readonly string[]).includes(r));
}

export function serializeRoles(roles: UserRole[]): string {
  return roles.join(",");
}

export function hasRole(
  user: { roles: UserRole[] },
  role: UserRole
): boolean {
  return user.roles.includes(role);
}

export const EVENT_TYPES = ["TRAINING", "GAME"] as const;
export type EventType = (typeof EVENT_TYPES)[number];

export const ATTENDANCE_STATUSES = [
  "PRESENT",
  "ABSENT",
  "EXCUSED",
  "UNKNOWN",
] as const;
export type AttendanceStatusValue = (typeof ATTENDANCE_STATUSES)[number];

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  roles: UserRole[];
  isSuperAdmin: boolean;
  mustChangePassword: boolean;
  team: "boys" | "girls" | null;
  playerSlug: string | null;
}
