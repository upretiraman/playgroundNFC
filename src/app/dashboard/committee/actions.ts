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

function roleFields(formData: FormData) {
  const title = requireString(formData, "title");
  const reportsTo = requireString(formData, "reportsTo");
  const summary = requireString(formData, "summary");
  const dutiesInput = requireString(formData, "duties");
  const order = Number(requireString(formData, "order"));

  if (!Number.isInteger(order)) {
    throw new Error("Order must be a whole number");
  }

  const duties = dutiesInput
    .split("\n")
    .map((d) => d.trim())
    .filter(Boolean);
  if (duties.length === 0) {
    throw new Error("At least one duty is required");
  }

  return { title, reportsTo, summary, duties: duties.join("\n"), order };
}

export async function createRole(formData: FormData) {
  const actingUser = await requireRole(["ADMIN"]);
  const fields = roleFields(formData);
  const slugInput = (formData.get("slug") as string)?.trim();
  const slug = slugify(slugInput || fields.title);

  if (!slug) {
    throw new Error("Could not derive a slug from the title");
  }

  const existing = await db.clubRole.findUnique({ where: { slug } });
  if (existing) {
    throw new Error("A role with this slug already exists");
  }

  const role = await db.clubRole.create({ data: { ...fields, slug } });

  await logAuditEntry({
    actorId: actingUser.id,
    action: "role.create",
    targetType: "ClubRole",
    targetId: role.id,
  });

  revalidatePath("/dashboard/committee");
  revalidatePath("/club");
  return { id: role.id };
}

export async function updateRole(id: string, formData: FormData) {
  const actingUser = await requireRole(["ADMIN"]);
  const fields = roleFields(formData);

  await db.clubRole.update({ where: { id }, data: fields });

  await logAuditEntry({
    actorId: actingUser.id,
    action: "role.update",
    targetType: "ClubRole",
    targetId: id,
  });

  revalidatePath("/dashboard/committee");
  revalidatePath("/club");
  return { id };
}

export async function deleteRole(id: string) {
  const actingUser = await requireRole(["ADMIN"]);
  await db.clubRole.delete({ where: { id } });

  await logAuditEntry({
    actorId: actingUser.id,
    action: "role.delete",
    targetType: "ClubRole",
    targetId: id,
  });

  revalidatePath("/dashboard/committee");
  revalidatePath("/club");
}
