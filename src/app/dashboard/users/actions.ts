"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { canManageAdmins, requireRole } from "@/lib/auth-helpers";
import { ROLES, serializeRoles, type UserRole } from "@/lib/auth-types";

function requireString(formData: FormData, key: string): string {
  const value = formData.get(key);
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`Missing required field: ${key}`);
  }
  return value;
}

export async function createUser(formData: FormData) {
  const actingUser = await requireRole(["ADMIN"]);

  const name = requireString(formData, "name");
  const email = requireString(formData, "email").toLowerCase().trim();
  const password = requireString(formData, "password");
  const roles = formData
    .getAll("roles")
    .filter((r): r is UserRole => ROLES.includes(r as UserRole));
  const team = (formData.get("team") as string) || null;
  const playerSlug = (formData.get("playerSlug") as string) || null;

  if (roles.length === 0) {
    throw new Error("Select at least one role");
  }
  if (roles.includes("ADMIN") && !canManageAdmins(actingUser)) {
    throw new Error("Only a super-admin can create an Administrator account.");
  }
  const needsTeam = roles.includes("PLAYER") || roles.includes("TRAINER");
  if (needsTeam && !team) {
    throw new Error("Team is required for Player and Trainer accounts");
  }
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
      team: needsTeam ? team : null,
      playerSlug: roles.includes("PLAYER") ? playerSlug : null,
      mustChangePassword: true,
    },
  });

  revalidatePath("/dashboard/users");
}
