"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth-helpers";
import { parseRoles } from "@/lib/auth-types";
import { repository } from "@/lib/repository";

function requireString(formData: FormData, key: string): string {
  const value = formData.get(key);
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`Missing required field: ${key}`);
  }
  return value;
}

export async function createContribution(memberId: string, formData: FormData) {
  const admin = await requireRole(["ADMIN"]);

  const member = await db.user.findUnique({ where: { id: memberId } });
  if (!member || !parseRoles(member.roles).includes("PLAYER")) {
    throw new Error("Can only record contributions for a member holding the Player role.");
  }

  const amount = Number(requireString(formData, "amount"));
  const date = requireString(formData, "date");
  const tierSlug = requireString(formData, "tierSlug");
  const periodYear = Number(requireString(formData, "periodYear"));

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Amount must be a positive number");
  }
  if (!Number.isInteger(periodYear)) {
    throw new Error("Period year must be a whole number");
  }

  const tiers = await repository.getMembershipTiers();
  if (!tiers.some((t) => t.slug === tierSlug)) {
    throw new Error("Invalid membership tier");
  }

  await db.contribution.create({
    data: {
      memberId,
      amount,
      date: new Date(`${date}T00:00:00`),
      tierSlug,
      periodYear,
      recordedById: admin.id,
    },
  });

  revalidatePath(`/dashboard/fees/${memberId}`);
  revalidatePath("/dashboard/fees");
}
