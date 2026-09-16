"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createPlayer, updatePlayer } from "@/app/dashboard/roster/actions";
import type { Player, PlayerPosition, TeamSlug } from "@/lib/types";

const TEAMS: TeamSlug[] = ["boys", "girls"];
const POSITIONS: PlayerPosition[] = [
  "Goalkeeper",
  "Defender",
  "Midfielder",
  "Forward",
];

export default function PlayerForm({ player }: { player?: Player & { id: string } }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      action={(formData) => {
        setError(null);
        startTransition(async () => {
          try {
            const { id } = player
              ? await updatePlayer(player.id, formData)
              : await createPlayer(formData);
            router.push(`/dashboard/roster/${id}`);
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
            Full Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            defaultValue={player?.name}
            className="mt-1 w-full rounded border border-cream-dark bg-white px-4 py-2.5 text-charcoal focus:border-crimson focus:outline-none"
          />
        </div>

        {!player && (
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
              placeholder="auto-generated from team + name"
              className="mt-1 w-full rounded border border-cream-dark bg-white px-4 py-2.5 text-charcoal focus:border-crimson focus:outline-none"
            />
          </div>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label
            htmlFor="team"
            className="font-display text-xs uppercase tracking-wide text-charcoal-soft"
          >
            Team
          </label>
          <select
            id="team"
            name="team"
            defaultValue={player?.team ?? TEAMS[0]}
            className="mt-1 w-full rounded border border-cream-dark bg-white px-4 py-2.5 text-charcoal focus:border-crimson focus:outline-none"
          >
            {TEAMS.map((t) => (
              <option key={t} value={t}>
                {t === "boys" ? "Boys Team" : "Girls Team"}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor="number"
            className="font-display text-xs uppercase tracking-wide text-charcoal-soft"
          >
            Number
          </label>
          <input
            id="number"
            name="number"
            type="number"
            min="1"
            required
            defaultValue={player?.number}
            className="mt-1 w-full rounded border border-cream-dark bg-white px-4 py-2.5 text-charcoal focus:border-crimson focus:outline-none"
          />
        </div>
        <div>
          <label
            htmlFor="position"
            className="font-display text-xs uppercase tracking-wide text-charcoal-soft"
          >
            Position
          </label>
          <select
            id="position"
            name="position"
            defaultValue={player?.position ?? POSITIONS[0]}
            className="mt-1 w-full rounded border border-cream-dark bg-white px-4 py-2.5 text-charcoal focus:border-crimson focus:outline-none"
          >
            {POSITIONS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="joinedYear"
            className="font-display text-xs uppercase tracking-wide text-charcoal-soft"
          >
            Joined Year
          </label>
          <input
            id="joinedYear"
            name="joinedYear"
            type="number"
            required
            defaultValue={player?.joinedYear}
            className="mt-1 w-full rounded border border-cream-dark bg-white px-4 py-2.5 text-charcoal focus:border-crimson focus:outline-none"
          />
        </div>
        <div>
          <label
            htmlFor="hometown"
            className="font-display text-xs uppercase tracking-wide text-charcoal-soft"
          >
            Hometown (optional)
          </label>
          <input
            id="hometown"
            name="hometown"
            type="text"
            defaultValue={player?.hometown ?? ""}
            className="mt-1 w-full rounded border border-cream-dark bg-white px-4 py-2.5 text-charcoal focus:border-crimson focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="bio"
          className="font-display text-xs uppercase tracking-wide text-charcoal-soft"
        >
          Bio
        </label>
        <textarea
          id="bio"
          name="bio"
          rows={3}
          required
          defaultValue={player?.bio}
          className="mt-1 w-full rounded border border-cream-dark bg-white px-4 py-2.5 text-charcoal focus:border-crimson focus:outline-none"
        />
      </div>

      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2 text-sm text-charcoal-soft">
          <input
            type="checkbox"
            name="isCaptain"
            defaultChecked={player?.isCaptain ?? false}
            className="h-4 w-4 rounded border-cream-dark"
          />
          Team captain
        </label>
        <label className="flex items-center gap-2 text-sm text-charcoal-soft">
          <input
            type="checkbox"
            name="published"
            defaultChecked={player?.published ?? false}
            className="h-4 w-4 rounded border-cream-dark"
          />
          Visible on the public site
        </label>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="rounded bg-crimson px-6 py-3 font-display text-sm uppercase tracking-wide text-cream transition-colors hover:bg-crimson-light disabled:opacity-60"
      >
        {pending
          ? player
            ? "Saving..."
            : "Creating..."
          : player
            ? "Save Changes"
            : "Create Player"}
      </button>
    </form>
  );
}
