"use server";

import bcrypt from "bcryptjs";
import { getSessionUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";

export async function changeOwnPassword(formData: FormData) {
  const user = await getSessionUser();
  if (!user) throw new Error("Not authenticated");

  const newPassword = formData.get("newPassword");
  if (typeof newPassword !== "string" || newPassword.length < 8) {
    throw new Error("Password must be at least 8 characters");
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await db.user.update({
    where: { id: user.id },
    data: { passwordHash, mustChangePassword: false },
  });
}
