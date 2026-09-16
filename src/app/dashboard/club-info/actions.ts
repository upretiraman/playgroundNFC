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

export async function updateClubInfo(formData: FormData) {
  const actingUser = await requireRole(["ADMIN"]);

  const name = requireString(formData, "name");
  const shortName = requireString(formData, "shortName");
  const foundedYear = Number(requireString(formData, "foundedYear"));
  const city = requireString(formData, "city");
  const country = requireString(formData, "country");
  const motto = requireString(formData, "motto");
  const valuesInput = requireString(formData, "values");
  const mission = requireString(formData, "mission");
  const email = requireString(formData, "email");
  const instagram = (formData.get("instagram") as string)?.trim() || null;
  const whatsapp = (formData.get("whatsapp") as string)?.trim() || null;
  const address = requireString(formData, "address");

  if (!Number.isInteger(foundedYear)) {
    throw new Error("Founded year must be a whole number");
  }

  const values = valuesInput
    .split("\n")
    .map((v) => v.trim())
    .filter(Boolean);
  if (values.length === 0) {
    throw new Error("At least one value is required");
  }

  await db.clubInfo.update({
    where: { id: "club-info" },
    data: {
      name,
      shortName,
      foundedYear,
      city,
      country,
      motto,
      values: values.join("\n"),
      mission,
      email,
      instagram,
      whatsapp,
      address,
    },
  });

  await logAuditEntry({
    actorId: actingUser.id,
    action: "clubInfo.update",
    targetType: "ClubInfo",
    targetId: "club-info",
  });

  revalidatePath("/dashboard/club-info");
  revalidatePath("/");
  revalidatePath("/club");
  revalidatePath("/contact");
}
