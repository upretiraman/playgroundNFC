"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { logAuditEntry } from "@/lib/audit";
import { requireRole } from "@/lib/auth-helpers";
import type { TeamSlug } from "@/lib/types";

const TEAMS: Array<TeamSlug | "both"> = ["boys", "girls", "both"];

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

function newsFields(formData: FormData) {
  const title = requireString(formData, "title");
  const date = requireString(formData, "date");
  const summary = requireString(formData, "summary");
  const body = requireString(formData, "body");
  const team = (formData.get("team") as string) || null;
  const coverImage = (formData.get("coverImage") as string)?.trim() || null;

  if (team && !TEAMS.includes(team as TeamSlug | "both")) {
    throw new Error("Invalid team");
  }

  return {
    title,
    date: new Date(`${date}T00:00:00`),
    summary,
    body,
    team,
    coverImage,
  };
}

export async function createNewsArticle(formData: FormData) {
  const actingUser = await requireRole(["ADMIN"]);
  const fields = newsFields(formData);
  const slugInput = (formData.get("slug") as string)?.trim();
  const slug = slugify(slugInput || fields.title);

  if (!slug) {
    throw new Error("Could not derive a slug from the title");
  }

  const existing = await db.newsItem.findUnique({ where: { slug } });
  if (existing) {
    throw new Error("An article with this slug already exists");
  }

  const article = await db.newsItem.create({ data: { ...fields, slug } });

  await logAuditEntry({
    actorId: actingUser.id,
    action: "news.create",
    targetType: "NewsItem",
    targetId: article.id,
  });

  revalidatePath("/dashboard/news");
  revalidatePath("/news");
  revalidatePath("/");
  return { id: article.id };
}

export async function updateNewsArticle(id: string, formData: FormData) {
  const actingUser = await requireRole(["ADMIN"]);
  const fields = newsFields(formData);

  await db.newsItem.update({ where: { id }, data: fields });

  await logAuditEntry({
    actorId: actingUser.id,
    action: "news.update",
    targetType: "NewsItem",
    targetId: id,
  });

  revalidatePath("/dashboard/news");
  revalidatePath("/news");
  revalidatePath("/");
  return { id };
}

export async function deleteNewsArticle(id: string) {
  const actingUser = await requireRole(["ADMIN"]);
  await db.newsItem.delete({ where: { id } });

  await logAuditEntry({
    actorId: actingUser.id,
    action: "news.delete",
    targetType: "NewsItem",
    targetId: id,
  });

  revalidatePath("/dashboard/news");
  revalidatePath("/news");
  revalidatePath("/");
}
