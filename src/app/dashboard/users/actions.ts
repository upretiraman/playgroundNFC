"use server";

import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { canManageAdmins, requireRole } from "@/lib/auth-helpers";
import {
  parseRoles,
  ROLES,
  serializeRoles,
  type SessionUser,
  type UserRole,
} from "@/lib/auth-types";

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
  const needsTeam = roles.includes("PLAYER") || roles.includes("TRAINER");
  if (needsTeam && !team) {
    throw new Error("Team is required for Player and Trainer accounts");
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
  const playerSlug = (formData.get("playerSlug") as string) || null;
  const { roles, team } = readRoleSet(actingUser, formData);

  if (password.length < 8) {
    throw new Error("Password must be at least 8 characters");
  }

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    throw new Error("An account with this email already exists");
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await db.user.create({
    data: {
      name,
      email,
      passwordHash,
      roles: serializeRoles(roles),
      team,
      playerSlug: roles.includes("PLAYER") ? playerSlug : null,
      mustChangePassword: true,
    },
  });

  revalidatePath("/dashboard/users");
}

export async function updateUser(userId: string, formData: FormData) {
  const actingUser = await requireRole(["ADMIN"]);
  const target = await loadManageableTarget(actingUser, userId);

  const name = requireString(formData, "name");
  const email = requireString(formData, "email").toLowerCase().trim();
  const playerSlug = (formData.get("playerSlug") as string) || null;
  const { roles, team } = readRoleSet(actingUser, formData);

  if (email !== target.email) {
    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      throw new Error("An account with this email already exists");
    }
  }

  await db.user.update({
    where: { id: userId },
    data: {
      name,
      email,
      roles: serializeRoles(roles),
      team,
      playerSlug: roles.includes("PLAYER") ? playerSlug : null,
    },
  });

  revalidatePath("/dashboard/users");
  revalidatePath(`/dashboard/users/${userId}`);
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

  revalidatePath("/dashboard/users");
  revalidatePath(`/dashboard/users/${userId}`);
}
