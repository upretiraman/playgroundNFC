"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireRole, canManageEventTeam } from "@/lib/auth-helpers";
import { repository } from "@/lib/repository";
import type { TeamSlug } from "@/lib/types";
import {
  ATTENDANCE_STATUSES,
  EVENT_TYPES,
  type AttendanceStatusValue,
} from "@/lib/auth-types";

function requireString(formData: FormData, key: string): string {
  const value = formData.get(key);
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`Missing required field: ${key}`);
  }
  return value;
}

export async function createEvent(formData: FormData) {
  const user = await requireRole(["TRAINER", "ADMIN"]);

  const type = requireString(formData, "type");
  const team = requireString(formData, "team") as TeamSlug | "both";
  const date = requireString(formData, "date");
  const startTime = requireString(formData, "startTime");
  const endTime = requireString(formData, "endTime");
  const venue = requireString(formData, "venue");
  const address = requireString(formData, "address");
  const opponent = (formData.get("opponent") as string) || null;
  const plan = (formData.get("plan") as string) || null;
  const notes = (formData.get("notes") as string) || null;

  if (!EVENT_TYPES.includes(type as (typeof EVENT_TYPES)[number])) {
    throw new Error("Invalid event type");
  }
  if (!canManageEventTeam(user, team)) {
    throw new Error("Not authorized for this team");
  }

  const players =
    team === "both"
      ? await repository.getPlayers()
      : await repository.getPlayers(team);

  const event = await db.event.create({
    data: {
      type,
      team,
      date: new Date(`${date}T00:00:00`),
      startTime,
      endTime,
      venue,
      address,
      opponent: type === "GAME" ? opponent : null,
      plan: type === "TRAINING" ? plan : null,
      notes,
      createdById: user.id,
      attendances: {
        create: players.map((p) => ({
          playerSlug: p.slug,
          status: "UNKNOWN",
        })),
      },
    },
  });

  revalidatePath("/dashboard/schedule");
  return { id: event.id };
}

export async function updatePlan(eventId: string, formData: FormData) {
  const user = await requireRole(["TRAINER", "ADMIN"]);
  const event = await db.event.findUniqueOrThrow({ where: { id: eventId } });

  if (!canManageEventTeam(user, event.team as TeamSlug | "both")) {
    throw new Error("Not authorized for this team");
  }

  const plan = (formData.get("plan") as string) || null;
  await db.event.update({ where: { id: eventId }, data: { plan } });
  revalidatePath(`/dashboard/schedule/${eventId}`);
}

export async function setAttendance(
  eventId: string,
  playerSlug: string,
  formData: FormData
) {
  const user = await requireRole(["TRAINER", "ADMIN"]);
  const event = await db.event.findUniqueOrThrow({ where: { id: eventId } });

  if (!canManageEventTeam(user, event.team as TeamSlug | "both")) {
    throw new Error("Not authorized for this team");
  }

  const status = requireString(formData, "status") as AttendanceStatusValue;
  const note = (formData.get("note") as string) || null;

  if (!ATTENDANCE_STATUSES.includes(status)) {
    throw new Error("Invalid attendance status");
  }

  await db.attendance.upsert({
    where: { eventId_playerSlug: { eventId, playerSlug } },
    update: { status, note },
    create: { eventId, playerSlug, status, note },
  });

  revalidatePath(`/dashboard/schedule/${eventId}`);
}
