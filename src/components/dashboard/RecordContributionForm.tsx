"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createContribution } from "@/app/dashboard/fees/actions";
import type { MembershipTier } from "@/lib/types";

export default function RecordContributionForm({
  memberId,
  tiers,
}: {
  memberId: string;
  tiers: MembershipTier[];
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const currentYear = new Date().getFullYear();

  return (
    <form
      action={(formData) => {
        setError(null);
        startTransition(async () => {
          try {
            await createContribution(memberId, formData);
            router.refresh();
            (document.getElementById("record-contribution-form") as HTMLFormElement)?.reset();
          } catch (e) {
            setError(e instanceof Error ? e.message : "Something went wrong.");
          }
        });
      }}
      id="record-contribution-form"
      className="grid gap-4"
    >
      {error && (
        <p className="rounded bg-crimson/10 px-4 py-2 text-sm text-crimson">
          {error}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="amount"
            className="font-display text-xs uppercase tracking-wide text-charcoal-soft"
          >
            Amount (EUR)
          </label>
          <input
            id="amount"
            name="amount"
            type="number"
            min="0.01"
            step="0.01"
            required
            className="mt-1 w-full rounded border border-cream-dark bg-white px-4 py-2.5 text-charcoal focus:border-crimson focus:outline-none"
          />
        </div>
        <div>
          <label
            htmlFor="date"
            className="font-display text-xs uppercase tracking-wide text-charcoal-soft"
          >
            Date Paid
          </label>
          <input
            id="date"
            name="date"
            type="date"
            required
            className="mt-1 w-full rounded border border-cream-dark bg-white px-4 py-2.5 text-charcoal focus:border-crimson focus:outline-none"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="tierSlug"
            className="font-display text-xs uppercase tracking-wide text-charcoal-soft"
          >
            Membership Tier
          </label>
          <select
            id="tierSlug"
            name="tierSlug"
            defaultValue={tiers[0]?.slug}
            className="mt-1 w-full rounded border border-cream-dark bg-white px-4 py-2.5 text-charcoal focus:border-crimson focus:outline-none"
          >
            {tiers.map((tier) => (
              <option key={tier.slug} value={tier.slug}>
                {tier.name} (€{tier.feeAmount}/yr)
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor="periodYear"
            className="font-display text-xs uppercase tracking-wide text-charcoal-soft"
          >
            Period (Year)
          </label>
          <input
            id="periodYear"
            name="periodYear"
            type="number"
            step="1"
            required
            defaultValue={currentYear}
            className="mt-1 w-full rounded border border-cream-dark bg-white px-4 py-2.5 text-charcoal focus:border-crimson focus:outline-none"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="rounded bg-crimson px-6 py-3 font-display text-sm uppercase tracking-wide text-cream transition-colors hover:bg-crimson-light disabled:opacity-60"
      >
        {pending ? "Recording..." : "Record Contribution"}
      </button>
    </form>
  );
}
