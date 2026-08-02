"use client";

import { useState, useTransition } from "react";
import { updatePlan } from "@/app/dashboard/schedule/actions";

export default function PlanEditor({
  eventId,
  initialPlan,
}: {
  eventId: string;
  initialPlan: string;
}) {
  const [plan, setPlan] = useState(initialPlan);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <form
      action={(formData) => {
        setSaved(false);
        startTransition(async () => {
          await updatePlan(eventId, formData);
          setSaved(true);
        });
      }}
      className="grid gap-3"
    >
      <textarea
        name="plan"
        rows={5}
        value={plan}
        onChange={(e) => {
          setPlan(e.target.value);
          setSaved(false);
        }}
        placeholder="Warm-up, drills, small-sided games, cool-down..."
        className="w-full rounded border border-cream-dark bg-white px-4 py-2.5 text-charcoal focus:border-crimson focus:outline-none"
      />
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded bg-crimson px-5 py-2 font-display text-sm uppercase tracking-wide text-cream hover:bg-crimson-light disabled:opacity-60"
        >
          {pending ? "Saving..." : "Save Plan"}
        </button>
        {saved && !pending && (
          <span className="text-sm text-charcoal-soft">Saved.</span>
        )}
      </div>
    </form>
  );
}
