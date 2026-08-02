"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth-helpers";
import type { ProductArtVariant, ProductCategory } from "@/lib/types";

const CATEGORIES: ProductCategory[] = ["Cap", "Tote Bag", "T-Shirt"];
const ART_VARIANTS: ProductArtVariant[] = ["cap", "tote", "tshirt"];

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

function productFields(formData: FormData) {
  const name = requireString(formData, "name");
  const category = requireString(formData, "category") as ProductCategory;
  const artVariant = (formData.get("artVariant") as string) || null;
  const imageUrl = (formData.get("imageUrl") as string)?.trim() || null;
  const price = Number(requireString(formData, "price"));
  const currency = (formData.get("currency") as string) || "EUR";
  const colorway = requireString(formData, "colorway");
  const description = requireString(formData, "description");
  const active = formData.get("active") === "on";

  if (!CATEGORIES.includes(category)) {
    throw new Error("Invalid category");
  }
  if (artVariant && !ART_VARIANTS.includes(artVariant as ProductArtVariant)) {
    throw new Error("Invalid art variant");
  }
  if (!Number.isFinite(price) || price < 0) {
    throw new Error("Price must be a non-negative number");
  }

  return { name, category, artVariant, imageUrl, price, currency, colorway, description, active };
}

export async function createProduct(formData: FormData) {
  const user = await requireRole(["ADMIN"]);
  const fields = productFields(formData);
  const slugInput = (formData.get("slug") as string)?.trim();
  const slug = slugify(slugInput || fields.name);

  if (!slug) {
    throw new Error("Could not derive a slug from the product name");
  }

  const existing = await db.product.findUnique({ where: { slug } });
  if (existing) {
    throw new Error("A product with this slug already exists");
  }

  const product = await db.product.create({
    data: { ...fields, slug, createdById: user.id },
  });

  revalidatePath("/dashboard/shop");
  revalidatePath("/shop");
  return { id: product.id };
}

export async function updateProduct(id: string, formData: FormData) {
  await requireRole(["ADMIN"]);
  const fields = productFields(formData);

  await db.product.update({ where: { id }, data: fields });

  revalidatePath("/dashboard/shop");
  revalidatePath("/shop");
  return { id };
}

export async function deleteProduct(id: string) {
  await requireRole(["ADMIN"]);
  await db.product.delete({ where: { id } });

  revalidatePath("/dashboard/shop");
  revalidatePath("/shop");
}
