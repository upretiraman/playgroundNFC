"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createProduct, updateProduct } from "@/app/dashboard/shop/actions";
import type { Product, ProductArtVariant, ProductCategory } from "@/lib/types";

const CATEGORIES: ProductCategory[] = ["Cap", "Tote Bag", "T-Shirt"];
const ART_VARIANTS: ProductArtVariant[] = ["cap", "tote", "tshirt"];

export default function ProductForm({ product }: { product?: Product }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      action={(formData) => {
        setError(null);
        startTransition(async () => {
          try {
            const { id } = product
              ? await updateProduct(product.id, formData)
              : await createProduct(formData);
            router.push(`/dashboard/shop?updated=${id}`);
          } catch (e) {
            setError(e instanceof Error ? e.message : "Something went wrong.");
          }
        });
      }}
      className="grid gap-5"
    >
      {error && (
        <p className="rounded bg-crimson/10 px-4 py-2 text-sm text-crimson">
          {error}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="name"
            className="font-display text-xs uppercase tracking-wide text-charcoal-soft"
          >
            Product Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            defaultValue={product?.name}
            className="mt-1 w-full rounded border border-cream-dark bg-white px-4 py-2.5 text-charcoal focus:border-crimson focus:outline-none"
          />
        </div>

        {!product && (
          <div>
            <label
              htmlFor="slug"
              className="font-display text-xs uppercase tracking-wide text-charcoal-soft"
            >
              Slug (optional)
            </label>
            <input
              id="slug"
              name="slug"
              type="text"
              placeholder="auto-generated from name"
              className="mt-1 w-full rounded border border-cream-dark bg-white px-4 py-2.5 text-charcoal focus:border-crimson focus:outline-none"
            />
          </div>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="category"
            className="font-display text-xs uppercase tracking-wide text-charcoal-soft"
          >
            Category
          </label>
          <select
            id="category"
            name="category"
            defaultValue={product?.category ?? CATEGORIES[0]}
            className="mt-1 w-full rounded border border-cream-dark bg-white px-4 py-2.5 text-charcoal focus:border-crimson focus:outline-none"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="artVariant"
            className="font-display text-xs uppercase tracking-wide text-charcoal-soft"
          >
            Fallback Illustration
          </label>
          <select
            id="artVariant"
            name="artVariant"
            defaultValue={product?.artVariant ?? ""}
            className="mt-1 w-full rounded border border-cream-dark bg-white px-4 py-2.5 text-charcoal focus:border-crimson focus:outline-none"
          >
            <option value="">None</option>
            {ART_VARIANTS.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-charcoal-soft/70">
            Used on the public shop page when no Image URL is set below.
          </p>
        </div>
      </div>

      <div>
        <label
          htmlFor="imageUrl"
          className="font-display text-xs uppercase tracking-wide text-charcoal-soft"
        >
          Image URL (optional)
        </label>
        <input
          id="imageUrl"
          name="imageUrl"
          type="text"
          placeholder="/shop/tshirt.png"
          defaultValue={product?.imageUrl ?? ""}
          className="mt-1 w-full rounded border border-cream-dark bg-white px-4 py-2.5 text-charcoal focus:border-crimson focus:outline-none"
        />
        <p className="mt-1 text-xs text-charcoal-soft/70">
          Path to a real product photo already placed under{" "}
          <code>public/</code>. Leave blank to use the fallback illustration.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label
            htmlFor="price"
            className="font-display text-xs uppercase tracking-wide text-charcoal-soft"
          >
            Price
          </label>
          <input
            id="price"
            name="price"
            type="number"
            min="0"
            step="0.01"
            required
            defaultValue={product?.price}
            className="mt-1 w-full rounded border border-cream-dark bg-white px-4 py-2.5 text-charcoal focus:border-crimson focus:outline-none"
          />
        </div>
        <div>
          <label
            htmlFor="currency"
            className="font-display text-xs uppercase tracking-wide text-charcoal-soft"
          >
            Currency
          </label>
          <input
            id="currency"
            name="currency"
            type="text"
            defaultValue={product?.currency ?? "EUR"}
            className="mt-1 w-full rounded border border-cream-dark bg-white px-4 py-2.5 text-charcoal focus:border-crimson focus:outline-none"
          />
        </div>
        <div>
          <label
            htmlFor="colorway"
            className="font-display text-xs uppercase tracking-wide text-charcoal-soft"
          >
            Colorway
          </label>
          <input
            id="colorway"
            name="colorway"
            type="text"
            required
            defaultValue={product?.colorway}
            className="mt-1 w-full rounded border border-cream-dark bg-white px-4 py-2.5 text-charcoal focus:border-crimson focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="description"
          className="font-display text-xs uppercase tracking-wide text-charcoal-soft"
        >
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          required
          defaultValue={product?.description}
          className="mt-1 w-full rounded border border-cream-dark bg-white px-4 py-2.5 text-charcoal focus:border-crimson focus:outline-none"
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-charcoal-soft">
        <input
          type="checkbox"
          name="active"
          defaultChecked={product?.active ?? true}
          className="h-4 w-4 rounded border-cream-dark"
        />
        Visible on the public shop page
      </label>

      <button
        type="submit"
        disabled={pending}
        className="rounded bg-crimson px-6 py-3 font-display text-sm uppercase tracking-wide text-cream transition-colors hover:bg-crimson-light disabled:opacity-60"
      >
        {pending
          ? product
            ? "Saving..."
            : "Creating..."
          : product
            ? "Save Changes"
            : "Create Product"}
      </button>
    </form>
  );
}
