"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { logAuditEntry } from "@/lib/audit";
import { requireRole } from "@/lib/auth-helpers";
import { slugify } from "@/lib/slug";
import type { PlayerPosition, TeamSlug } from "@/lib/types";

const TEAMS: TeamSlug[] = ["boys", "girls"];
const POSITIONS: PlayerPosition[] = [
  "Goalkeeper",
  "Defender",
  "Midfielder",
  "Forward",
];

function requireString(formData: FormData, key: string): string {
  const value = formData.get(key);
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`Missing required field: ${key}`);
  }
  return value;
}

function playerFields(formData: FormData) {
  const team = requireString(formData, "team") as TeamSlug;
  const name = requireString(formData, "name");
  const number = Number(requireString(formData, "number"));
  const position = requireString(formData, "position") as PlayerPosition;
  const bio = requireString(formData, "bio");
  const joinedYear = Number(requireString(formData, "joinedYear"));
  const hometown = (formData.get("hometown") as string)?.trim() || null;
  const isCaptain = formData.get("isCaptain") === "on";
  const published = formData.get("published") === "on";

  if (!TEAMS.includes(team)) {
    throw new Error("Invalid team");
  }
  if (!POSITIONS.includes(position)) {
    throw new Error("Invalid position");
  }
  if (!Number.isFinite(number) || number <= 0) {
    throw new Error("Number must be a positive number");
  }
  if (!Number.isFinite(joinedYear)) {
    throw new Error("Joined year must be a number");
  }

  return { team, name, number, position, bio, joinedYear, hometown, isCaptain, published };
}

export async function createPlayer(formData: FormData) {
  const actingUser = await requireRole(["ADMIN"]);
  const fields = playerFields(formData);
  const slugInput = (formData.get("slug") as string)?.trim();
  const slug = slugify(slugInput || `${fields.team}-${fields.name}`);

  if (!slug) {
    throw new Error("Could not derive a slug from the player name");
  }

  const existing = await db.player.findUnique({ where: { slug } });
  if (existing) {
    throw new Error("A player with this slug already exists");
  }

  const player = await db.player.create({ data: { ...fields, slug } });

  await logAuditEntry({
    actorId: actingUser.id,
    action: "player.create",
    targetType: "Player",
    targetId: player.id,
  });

  revalidatePath("/dashboard/roster");
  revalidatePath("/teams");
  return { id: player.id };
}

export async function updatePlayer(id: string, formData: FormData) {
  const actingUser = await requireRole(["ADMIN"]);
  const fields = playerFields(formData);

  await db.player.update({ where: { id }, data: fields });

  await logAuditEntry({
    actorId: actingUser.id,
    action: "player.update",
    targetType: "Player",
    targetId: id,
  });

  revalidatePath("/dashboard/roster");
  revalidatePath("/teams");
  return { id };
}

export async function setPlayerPublished(id: string, published: boolean) {
  const actingUser = await requireRole(["ADMIN"]);
  await db.player.update({ where: { id }, data: { published } });

  await logAuditEntry({
    actorId: actingUser.id,
    action: "player.setPublished",
    targetType: "Player",
    targetId: id,
  });

  revalidatePath("/dashboard/roster");
  revalidatePath("/teams");
}
