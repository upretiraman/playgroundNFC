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
