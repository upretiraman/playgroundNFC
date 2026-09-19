"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { logAuditEntry } from "@/lib/audit";
import { requireRole } from "@/lib/auth-helpers";

function requireString(formData: FormData, key: string): string {
  const value = formData.get(key);
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`Missing required field: ${key}`);
  }
  return value;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function tierFields(formData: FormData) {
  const name = requireString(formData, "name");
  const description = requireString(formData, "description");
  const friendlies = requireString(formData, "friendlies");
  const tournaments = requireString(formData, "tournaments");
  const feeAmount = Number(requireString(formData, "feeAmount"));

  if (!Number.isFinite(feeAmount) || feeAmount < 0) {
    throw new Error("Fee amount must be a non-negative number");
  }

  return { name, description, friendlies, tournaments, feeAmount };
}

export async function createMembershipTier(formData: FormData) {
  const actingUser = await requireRole(["ADMIN"]);
  const fields = tierFields(formData);
  const slugInput = (formData.get("slug") as string)?.trim();
  const slug = slugify(slugInput || fields.name);

  if (!slug) {
    throw new Error("Could not derive a slug from the name");
  }

  const existing = await db.membershipTier.findUnique({ where: { slug } });
  if (existing) {
    throw new Error("A tier with this slug already exists");
  }

  const tier = await db.membershipTier.create({ data: { ...fields, slug } });

  await logAuditEntry({
    actorId: actingUser.id,
    action: "membershipTier.create",
    targetType: "MembershipTier",
    targetId: tier.id,
  });

  revalidatePath("/dashboard/membership-tiers");
  revalidatePath("/club");
  return { id: tier.id };
}

export async function updateMembershipTier(id: string, formData: FormData) {
  const actingUser = await requireRole(["ADMIN"]);
  const fields = tierFields(formData);

  await db.membershipTier.update({ where: { id }, data: fields });

  await logAuditEntry({
    actorId: actingUser.id,
    action: "membershipTier.update",
    targetType: "MembershipTier",
    targetId: id,
  });

  revalidatePath("/dashboard/membership-tiers");
  revalidatePath("/club");
  return { id };
}

export async function deleteMembershipTier(id: string) {
  const actingUser = await requireRole(["ADMIN"]);
  await db.membershipTier.delete({ where: { id } });

  await logAuditEntry({
    actorId: actingUser.id,
    action: "membershipTier.delete",
    targetType: "MembershipTier",
    targetId: id,
  });

  revalidatePath("/dashboard/membership-tiers");
  revalidatePath("/club");
}
