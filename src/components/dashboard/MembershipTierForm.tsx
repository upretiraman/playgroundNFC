"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createMembershipTier,
  updateMembershipTier,
} from "@/app/dashboard/membership-tiers/actions";
import type { MembershipTier } from "@/lib/types";

export default function MembershipTierForm({
  tier,
}: {
  tier?: MembershipTier & { id: string };
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      action={(formData) => {
        setError(null);
        startTransition(async () => {
          try {
            const { id } = tier
              ? await updateMembershipTier(tier.id, formData)
              : await createMembershipTier(formData);
            router.push(`/dashboard/membership-tiers/${id}`);
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
            Tier Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            defaultValue={tier?.name}
            className="mt-1 w-full rounded border border-cream-dark bg-white px-4 py-2.5 text-charcoal focus:border-crimson focus:outline-none"
          />
        </div>

        {!tier && (
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
          defaultValue={tier?.description}
          className="mt-1 w-full rounded border border-cream-dark bg-white px-4 py-2.5 text-charcoal focus:border-crimson focus:outline-none"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="friendlies"
            className="font-display text-xs uppercase tracking-wide text-charcoal-soft"
          >
            Friendly Games
          </label>
          <input
            id="friendlies"
            name="friendlies"
            type="text"
            required
            defaultValue={tier?.friendlies}
            className="mt-1 w-full rounded border border-cream-dark bg-white px-4 py-2.5 text-charcoal focus:border-crimson focus:outline-none"
          />
        </div>
        <div>
          <label
            htmlFor="tournaments"
            className="font-display text-xs uppercase tracking-wide text-charcoal-soft"
          >
            Tournaments
          </label>
          <input
            id="tournaments"
            name="tournaments"
            type="text"
            required
            defaultValue={tier?.tournaments}
            className="mt-1 w-full rounded border border-cream-dark bg-white px-4 py-2.5 text-charcoal focus:border-crimson focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="feeAmount"
          className="font-display text-xs uppercase tracking-wide text-charcoal-soft"
        >
          Annual Fee (EUR)
        </label>
        <input
          id="feeAmount"
          name="feeAmount"
          type="number"
          min="0"
          step="0.01"
          required
          defaultValue={tier?.feeAmount}
          className="mt-1 w-full rounded border border-cream-dark bg-white px-4 py-2.5 text-charcoal focus:border-crimson focus:outline-none"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="rounded bg-crimson px-6 py-3 font-display text-sm uppercase tracking-wide text-cream transition-colors hover:bg-crimson-light disabled:opacity-60"
      >
        {pending
          ? tier
            ? "Saving..."
            : "Creating..."
          : tier
            ? "Save Changes"
            : "Add Tier"}
      </button>
    </form>
  );
}
