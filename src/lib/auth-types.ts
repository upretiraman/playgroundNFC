export const ROLES = ["PLAYER", "TRAINER", "ADMIN"] as const;
export type UserRole = (typeof ROLES)[number];

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
  role: UserRole;
  team: "boys" | "girls" | null;
  playerSlug: string | null;
}
