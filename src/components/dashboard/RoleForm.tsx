"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createRole, updateRole } from "@/app/dashboard/committee/actions";
import type { ClubRole } from "@/lib/types";

export default function RoleForm({ role }: { role?: ClubRole & { id: string; order: number } }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      action={(formData) => {
        setError(null);
        startTransition(async () => {
          try {
            const { id } = role
              ? await updateRole(role.id, formData)
              : await createRole(formData);
            router.push(`/dashboard/committee/${id}`);
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
            htmlFor="title"
            className="font-display text-xs uppercase tracking-wide text-charcoal-soft"
          >
            Title
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            defaultValue={role?.title}
            className="mt-1 w-full rounded border border-cream-dark bg-white px-4 py-2.5 text-charcoal focus:border-crimson focus:outline-none"
          />
        </div>

        {!role && (
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
              placeholder="auto-generated from title"
              className="mt-1 w-full rounded border border-cream-dark bg-white px-4 py-2.5 text-charcoal focus:border-crimson focus:outline-none"
            />
          </div>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="reportsTo"
            className="font-display text-xs uppercase tracking-wide text-charcoal-soft"
          >
            Reports To
          </label>
          <input
            id="reportsTo"
            name="reportsTo"
            type="text"
            required
            defaultValue={role?.reportsTo}
            className="mt-1 w-full rounded border border-cream-dark bg-white px-4 py-2.5 text-charcoal focus:border-crimson focus:outline-none"
          />
        </div>
        <div>
          <label
            htmlFor="order"
            className="font-display text-xs uppercase tracking-wide text-charcoal-soft"
          >
            Display Order
          </label>
          <input
            id="order"
            name="order"
            type="number"
            step="1"
            required
            defaultValue={role?.order ?? 0}
            className="mt-1 w-full rounded border border-cream-dark bg-white px-4 py-2.5 text-charcoal focus:border-crimson focus:outline-none"
          />
          <p className="mt-1 text-xs text-charcoal-soft/70">
            Lower numbers show first on the Club page.
          </p>
        </div>
      </div>

      <div>
        <label
          htmlFor="summary"
          className="font-display text-xs uppercase tracking-wide text-charcoal-soft"
        >
          Summary
        </label>
        <textarea
          id="summary"
          name="summary"
          rows={2}
          required
          defaultValue={role?.summary}
          className="mt-1 w-full rounded border border-cream-dark bg-white px-4 py-2.5 text-charcoal focus:border-crimson focus:outline-none"
        />
      </div>

      <div>
        <label
          htmlFor="duties"
          className="font-display text-xs uppercase tracking-wide text-charcoal-soft"
        >
          Duties (one per line)
        </label>
        <textarea
          id="duties"
          name="duties"
          rows={5}
          required
          defaultValue={role?.duties?.join("\n")}
          className="mt-1 w-full rounded border border-cream-dark bg-white px-4 py-2.5 text-charcoal focus:border-crimson focus:outline-none"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="rounded bg-crimson px-6 py-3 font-display text-sm uppercase tracking-wide text-cream transition-colors hover:bg-crimson-light disabled:opacity-60"
      >
        {pending
          ? role
            ? "Saving..."
            : "Creating..."
          : role
            ? "Save Changes"
            : "Add Role"}
      </button>
    </form>
  );
}
