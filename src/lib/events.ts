import { db } from "@/lib/db";
import type { TeamSlug } from "@/lib/types";

export async function listEvents(team?: TeamSlug) {
  return db.event.findMany({
    where: team ? { OR: [{ team }, { team: "both" }] } : undefined,
    orderBy: { date: "asc" },
    include: { createdBy: { select: { name: true } } },
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
