"use server";

import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { logAuditEntry } from "@/lib/audit";
import { canManageAdmins, requireRole } from "@/lib/auth-helpers";
import {
  parseRoles,
  ROLES,
  serializeRoles,
  type SessionUser,
  type UserRole,
} from "@/lib/auth-types";
import { slugify } from "@/lib/slug";
import type { TeamSlug } from "@/lib/types";

/** Auto-creates an unpublished stub roster entry for a newly Player-flagged
 * account, so account creation and roster maintenance are one action
 * (docs/features/teams-and-rosters.md) rather than two — the Admin fills in
 * real details (number, position, bio) later via /dashboard/roster. Only
 * called when no existing roster entry was picked to link instead. Returns
 * the new row's slug. */
async function createStubPlayer(
  actingUserId: string,
  name: string,
  team: TeamSlug
) {
  const base = slugify(`${team}-${name}`) || "player";
  let slug = base;
  for (let suffix = 2; await db.player.findUnique({ where: { slug } }); suffix++) {
    slug = `${base}-${suffix}`;
  }

  const player = await db.player.create({
    data: {
      slug,
      team,
      name,
      number: 0,
      position: "Forward",
      bio: "",
      joinedYear: new Date().getFullYear(),
      published: false,
    },
  });

  await logAuditEntry({
    actorId: actingUserId,
    action: "player.create",
    targetType: "Player",
    targetId: player.id,
  });

  return player.slug;
}

/** Unpublishes (never deletes) the roster entry linked to a `User` losing the
 * Player role, per the multi-role rules in docs/roles-and-permissions.md —
 * match history and profile data stay intact for if Player is added back. */
async function unpublishLinkedPlayer(actingUserId: string, playerSlug: string | null) {
  if (!playerSlug) return;
  const player = await db.player.findUnique({ where: { slug: playerSlug } });
  if (!player || !player.published) return;

  await db.player.update({ where: { slug: playerSlug }, data: { published: false } });

  await logAuditEntry({
    actorId: actingUserId,
    action: "player.setPublished",
    targetType: "Player",
    targetId: player.id,
  });
}

function requireString(formData: FormData, key: string): string {
  const value = formData.get(key);
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`Missing required field: ${key}`);
  }
  return value;
}

/** Reads and validates the submitted role set + team against who's submitting it. */
function readRoleSet(actingUser: SessionUser, formData: FormData) {
  const roles = formData
    .getAll("roles")
    .filter((r): r is UserRole => ROLES.includes(r as UserRole));
  const team = (formData.get("team") as string) || null;

  if (roles.length === 0) {
    throw new Error("Select at least one role");
  }
  if (roles.includes("ADMIN") && !canManageAdmins(actingUser)) {
    throw new Error("Only a super-admin can grant the Administrator role.");
  }
  const needsTeam = roles.includes("PLAYER");
  if (needsTeam && !team) {
    throw new Error("Team is required for Player accounts");
  }

  return { roles, team: needsTeam ? team : null, needsTeam };
}

/** Loads the account a mutation targets and confirms the acting user may touch it. */
async function loadManageableTarget(actingUser: SessionUser, userId: string) {
  const target = await db.user.findUnique({ where: { id: userId } });
  if (!target) {
    throw new Error("Account not found");
  }
  if (parseRoles(target.roles).includes("ADMIN") && !canManageAdmins(actingUser)) {
    throw new Error("Only a super-admin can manage an Administrator account.");
  }
  return target;
}

export async function createUser(formData: FormData) {
  const actingUser = await requireRole(["ADMIN"]);

  const name = requireString(formData, "name");
  const email = requireString(formData, "email").toLowerCase().trim();
  const password = requireString(formData, "password");
  const chosenPlayerSlug = (formData.get("playerSlug") as string) || null;
  const { roles, team } = readRoleSet(actingUser, formData);

  if (password.length < 8) {
    throw new Error("Password must be at least 8 characters");
  }

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    throw new Error("An account with this email already exists");
  }

  const passwordHash = await bcrypt.hash(password, 12);

  // No existing roster entry picked to link → give this new Player their own,
  // unpublished until an Admin fills it in. See createStubPlayer above.
  const playerSlug = roles.includes("PLAYER")
    ? (chosenPlayerSlug ?? (await createStubPlayer(actingUser.id, name, team as TeamSlug)))
    : null;

  const created = await db.user.create({
    data: {
      name,
      email,
      passwordHash,
      roles: serializeRoles(roles),
      team,
      playerSlug,
      mustChangePassword: true,
    },
  });

  await logAuditEntry({
    actorId: actingUser.id,
    action: "user.create",
    targetType: "User",
    targetId: created.id,
  });

  revalidatePath("/dashboard/users");
  revalidatePath("/dashboard/roster");
}

export async function updateUser(userId: string, formData: FormData) {
  const actingUser = await requireRole(["ADMIN"]);
  const target = await loadManageableTarget(actingUser, userId);

  const name = requireString(formData, "name");
  const email = requireString(formData, "email").toLowerCase().trim();
  const chosenPlayerSlug = (formData.get("playerSlug") as string) || null;
  const { roles, team } = readRoleSet(actingUser, formData);

  if (email !== target.email) {
    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      throw new Error("An account with this email already exists");
    }
  }

  const wasPlayer = parseRoles(target.roles).includes("PLAYER");
  const willBePlayer = roles.includes("PLAYER");

  // Roster auto-create/unpublish tied to the Player role changing — see
  // docs/features/teams-and-rosters.md. A role set that stays Player
  // throughout (no transition) just uses whatever was submitted, unchanged.
  let playerSlug = target.playerSlug;
  if (willBePlayer && !wasPlayer) {
    // Re-adding Player after a previous removal re-links the same entry
    // (unpublished, not deleted, above) rather than spawning a duplicate —
    // only a genuinely first-time Player gets a fresh stub. The form's
    // roster dropdown is filtered to the newly-selected team, so it can't
    // offer a prior entry from a different team as an option; falling back
    // to `target.playerSlug` here (not just the submitted choice) is what
    // makes re-linking work even when nothing was submitted for it.
    playerSlug =
      chosenPlayerSlug ??
      target.playerSlug ??
      (await createStubPlayer(actingUser.id, name, team as TeamSlug));
  } else if (willBePlayer) {
    playerSlug = chosenPlayerSlug;
  } else if (wasPlayer) {
    await unpublishLinkedPlayer(actingUser.id, target.playerSlug);
  }

  await db.user.update({
    where: { id: userId },
    data: {
      name,
      email,
      roles: serializeRoles(roles),
      team,
      playerSlug,
    },
  });

  await logAuditEntry({
    actorId: actingUser.id,
    action: "user.update",
    targetType: "User",
    targetId: userId,
  });

  revalidatePath("/dashboard/users");
  revalidatePath(`/dashboard/users/${userId}`);
  revalidatePath("/dashboard/roster");
}

/** Issues a new temporary password and forces a change on next login. Returns
 * the plaintext password once — the caller must display it, nothing else stores it. */
export async function resetUserPassword(userId: string): Promise<string> {
  const actingUser = await requireRole(["ADMIN"]);
  await loadManageableTarget(actingUser, userId);

  const tempPassword = randomBytes(9).toString("base64url");
  const passwordHash = await bcrypt.hash(tempPassword, 12);

  await db.user.update({
    where: { id: userId },
    data: { passwordHash, mustChangePassword: true },
  });

  await logAuditEntry({
    actorId: actingUser.id,
    action: "user.resetPassword",
    targetType: "User",
    targetId: userId,
  });

  revalidatePath(`/dashboard/users/${userId}`);
  return tempPassword;
}

/** Soft disable/re-enable — never deletes the account or its history. */
export async function setUserActive(userId: string, isActive: boolean) {
  const actingUser = await requireRole(["ADMIN"]);
  if (userId === actingUser.id) {
    throw new Error("You cannot deactivate your own account.");
  }
  await loadManageableTarget(actingUser, userId);

  await db.user.update({ where: { id: userId }, data: { isActive } });

  await logAuditEntry({
    actorId: actingUser.id,
    action: "user.setActive",
    targetType: "User",
    targetId: userId,
  });

  revalidatePath("/dashboard/users");
  revalidatePath(`/dashboard/users/${userId}`);
}
