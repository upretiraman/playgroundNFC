"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createEvent } from "@/app/dashboard/schedule/actions";

export default function NewEventForm({
  teamOptions,
  defaultTeam,
  defaultVenue,
  defaultAddress,
}: {
  teamOptions: { value: string; label: string }[];
  defaultTeam: string;
  defaultVenue: string;
  defaultAddress: string;
}) {
  const router = useRouter();
  const [type, setType] = useState<"TRAINING" | "GAME">("TRAINING");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      action={(formData) => {
        setError(null);
        startTransition(async () => {
          try {
            const { id } = await createEvent(formData);
            router.push(`/dashboard/schedule/${id}`);
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

      <div className="grid gap-2">
        <span className="font-display text-xs uppercase tracking-wide text-charcoal-soft">
          Session Type
        </span>
        <div className="flex gap-3">
          {(["TRAINING", "GAME"] as const).map((option) => (
            <label
              key={option}
              className={`flex-1 cursor-pointer rounded border px-4 py-3 text-center font-display text-sm uppercase tracking-wide transition-colors ${
                type === option
                  ? "border-crimson bg-crimson text-cream"
                  : "border-cream-dark bg-white text-charcoal-soft"
              }`}
            >
              <input
                type="radio"
                name="type"
                value={option}
                checked={type === option}
                onChange={() => setType(option)}
                className="sr-only"
              />
              {option === "TRAINING" ? "Training" : "Game"}
            </label>
          ))}
        </div>
      </div>

      <div>
        <label
          htmlFor="team"
          className="font-display text-xs uppercase tracking-wide text-charcoal-soft"
        >
          Team
        </label>
        <select
          id="team"
          name={teamOptions.length === 1 ? undefined : "team"}
          defaultValue={defaultTeam}
          disabled={teamOptions.length === 1}
          className="mt-1 w-full rounded border border-cream-dark bg-white px-4 py-2.5 text-charcoal focus:border-crimson focus:outline-none disabled:opacity-70"
        >
          {teamOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {teamOptions.length === 1 && (
          <input type="hidden" name="team" value={defaultTeam} />
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label
            htmlFor="date"
            className="font-display text-xs uppercase tracking-wide text-charcoal-soft"
          >
            Date
          </label>
          <input
            id="date"
            name="date"
            type="date"
            required
            className="mt-1 w-full rounded border border-cream-dark bg-white px-4 py-2.5 text-charcoal focus:border-crimson focus:outline-none"
          />
        </div>
        <div>
          <label
            htmlFor="startTime"
            className="font-display text-xs uppercase tracking-wide text-charcoal-soft"
          >
            Start Time
          </label>
          <input
            id="startTime"
            name="startTime"
            type="time"
            required
            className="mt-1 w-full rounded border border-cream-dark bg-white px-4 py-2.5 text-charcoal focus:border-crimson focus:outline-none"
          />
        </div>
        <div>
          <label
            htmlFor="endTime"
            className="font-display text-xs uppercase tracking-wide text-charcoal-soft"
          >
            End Time
          </label>
          <input
            id="endTime"
            name="endTime"
            type="time"
            required
            className="mt-1 w-full rounded border border-cream-dark bg-white px-4 py-2.5 text-charcoal focus:border-crimson focus:outline-none"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="venue"
            className="font-display text-xs uppercase tracking-wide text-charcoal-soft"
          >
            Venue
          </label>
          <input
            id="venue"
            name="venue"
            type="text"
            required
            defaultValue={defaultVenue}
            className="mt-1 w-full rounded border border-cream-dark bg-white px-4 py-2.5 text-charcoal focus:border-crimson focus:outline-none"
          />
        </div>
        <div>
          <label
            htmlFor="address"
            className="font-display text-xs uppercase tracking-wide text-charcoal-soft"
          >
            Address
          </label>
          <input
            id="address"
            name="address"
            type="text"
            required
            defaultValue={defaultAddress}
            className="mt-1 w-full rounded border border-cream-dark bg-white px-4 py-2.5 text-charcoal focus:border-crimson focus:outline-none"
          />
        </div>
      </div>

      {type === "GAME" && (
        <div>
          <label
            htmlFor="opponent"
            className="font-display text-xs uppercase tracking-wide text-charcoal-soft"
          >
            Opponent
          </label>
          <input
            id="opponent"
            name="opponent"
            type="text"
            className="mt-1 w-full rounded border border-cream-dark bg-white px-4 py-2.5 text-charcoal focus:border-crimson focus:outline-none"
          />
        </div>
      )}

      {type === "TRAINING" && (
        <div>
          <label
            htmlFor="plan"
            className="font-display text-xs uppercase tracking-wide text-charcoal-soft"
          >
            Training Plan (optional — can add later)
          </label>
          <textarea
            id="plan"
            name="plan"
            rows={4}
            className="mt-1 w-full rounded border border-cream-dark bg-white px-4 py-2.5 text-charcoal focus:border-crimson focus:outline-none"
          />
        </div>
      )}

      <div>
        <label
          htmlFor="notes"
          className="font-display text-xs uppercase tracking-wide text-charcoal-soft"
        >
          Notes (optional)
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={2}
          className="mt-1 w-full rounded border border-cream-dark bg-white px-4 py-2.5 text-charcoal focus:border-crimson focus:outline-none"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="rounded bg-crimson px-6 py-3 font-display text-sm uppercase tracking-wide text-cream transition-colors hover:bg-crimson-light disabled:opacity-60"
      >
        {pending ? "Saving..." : "Schedule Session"}
      </button>
    </form>
  );
}
