import { db } from "@/lib/db";
import type { TeamSlug } from "@/lib/types";
import type { EventType } from "@/lib/auth-types";

export async function listEvents(team?: TeamSlug) {
  return db.event.findMany({
    where: team ? { OR: [{ team }, { team: "both" }] } : undefined,
    orderBy: { date: "asc" },
    include: { createdBy: { select: { name: true } } },
  });
}

/**
 * Public-facing query: only events from today onward, optionally filtered
 * by team and/or type. Used by the public /training page and the home
 * page teaser so they stay in sync with whatever Trainers have scheduled.
 */
export async function listUpcomingEvents(opts: {
  team?: TeamSlug;
  type?: EventType;
  limit?: number;
} = {}) {
  const { team, type, limit } = opts;
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  return db.event.findMany({
    where: {
      date: { gte: startOfToday },
      ...(team ? { OR: [{ team }, { team: "both" }] } : {}),
      ...(type ? { type } : {}),
    },
    orderBy: { date: "asc" },
    take: limit,
  });
}

export async function getEventWithAttendance(id: string) {
  return db.event.findUnique({
    where: { id },
    include: {
      attendances: true,
      createdBy: { select: { name: true } },
    },
  });
}

/**
 * Attendance rows for the reports page (Trainer + Admin, see
 * docs/roles/trainer.md), optionally filtered by the event's team and/or a
 * date range. `team` filters to that team's events plus club-wide ("both")
 * ones, matching how listEvents scopes the schedule.
 */
export async function listAttendanceForReport(opts: {
  team?: TeamSlug;
  from?: Date;
  to?: Date;
} = {}) {
  const { team, from, to } = opts;
  return db.attendance.findMany({
    where: {
      event: {
        ...(team ? { OR: [{ team }, { team: "both" }] } : {}),
        ...(from || to
          ? {
              date: {
                ...(from ? { gte: from } : {}),
                ...(to ? { lte: to } : {}),
              },
            }
          : {}),
      },
    },
    include: {
      event: { select: { id: true, type: true, team: true, date: true } },
    },
    orderBy: { event: { date: "asc" } },
  });
}
