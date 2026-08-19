"use client";

import { useMemo, useState, useTransition } from "react";
import { createUser } from "@/app/dashboard/users/actions";
import type { UserRole } from "@/lib/auth-types";

interface PlayerOption {
  slug: string;
  name: string;
  team: "boys" | "girls";
}

function generatePassword() {
  return Array.from({ length: 12 }, () =>
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789"[
      Math.floor(Math.random() * 57)
    ]
  ).join("");
}

export default function NewUserForm({
  players,
  isSuperAdmin,
}: {
  players: PlayerOption[];
  isSuperAdmin: boolean;
}) {
  const [role, setRole] = useState<UserRole>("PLAYER");
  const [team, setTeam] = useState<"boys" | "girls">("boys");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const playersForTeam = useMemo(
    () => players.filter((p) => p.team === team),
    [players, team]
  );

  return (
    <form
      action={(formData) => {
        setError(null);
        setSuccess(null);
        startTransition(async () => {
          try {
            await createUser(formData);
            setSuccess("Account created.");
            setPassword("");
            (document.getElementById("new-user-form") as HTMLFormElement)?.reset();
          } catch (e) {
            setError(e instanceof Error ? e.message : "Something went wrong.");
          }
        });
      }}
      id="new-user-form"
      className="grid gap-5"
    >
      {error && (
        <p className="rounded bg-crimson/10 px-4 py-2 text-sm text-crimson">
          {error}
        </p>
      )}
      {success && (
        <p className="rounded bg-gold/10 px-4 py-2 text-sm text-charcoal">
          {success}
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
            className="mt-1 w-full rounded border border-cream-dark bg-white px-4 py-2.5 text-charcoal focus:border-crimson focus:outline-none"
          />
        </div>
        <div>
          <label
            htmlFor="email"
            className="font-display text-xs uppercase tracking-wide text-charcoal-soft"
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="mt-1 w-full rounded border border-cream-dark bg-white px-4 py-2.5 text-charcoal focus:border-crimson focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="password"
          className="font-display text-xs uppercase tracking-wide text-charcoal-soft"
        >
          Temporary Password
        </label>
        <div className="mt-1 flex gap-2">
          <input
            id="password"
            name="password"
            type="text"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded border border-cream-dark bg-white px-4 py-2.5 text-charcoal focus:border-crimson focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setPassword(generatePassword())}
            className="shrink-0 rounded border border-cream-dark px-4 py-2.5 font-display text-xs uppercase tracking-wide text-charcoal-soft hover:border-crimson hover:text-crimson"
          >
            Generate
          </button>
        </div>
        <p className="mt-1 text-xs text-charcoal-soft/70">
          Share this with the new member yourself — it&apos;s shown only here.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="role"
            className="font-display text-xs uppercase tracking-wide text-charcoal-soft"
          >
            Role
          </label>
          <select
            id="role"
            name="role"
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
            className="mt-1 w-full rounded border border-cream-dark bg-white px-4 py-2.5 text-charcoal focus:border-crimson focus:outline-none"
          >
            <option value="PLAYER">Player</option>
            <option value="TRAINER">Trainer</option>
            {isSuperAdmin && <option value="ADMIN">Administrator</option>}
          </select>
        </div>

        {role !== "ADMIN" && (
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
              value={team}
              onChange={(e) => setTeam(e.target.value as "boys" | "girls")}
              className="mt-1 w-full rounded border border-cream-dark bg-white px-4 py-2.5 text-charcoal focus:border-crimson focus:outline-none"
            >
              <option value="boys">Boys Team</option>
              <option value="girls">Girls Team</option>
            </select>
          </div>
        )}
      </div>

      {role === "PLAYER" && (
        <div>
          <label
            htmlFor="playerSlug"
            className="font-display text-xs uppercase tracking-wide text-charcoal-soft"
          >
            Link to Roster Player (optional)
          </label>
          <select
            id="playerSlug"
            name="playerSlug"
            defaultValue=""
            className="mt-1 w-full rounded border border-cream-dark bg-white px-4 py-2.5 text-charcoal focus:border-crimson focus:outline-none"
          >
            <option value="">Not linked</option>
            {playersForTeam.map((p) => (
              <option key={p.slug} value={p.slug}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded bg-crimson px-6 py-3 font-display text-sm uppercase tracking-wide text-cream transition-colors hover:bg-crimson-light disabled:opacity-60"
      >
        {pending ? "Creating..." : "Create Account"}
      </button>
    </form>
  );
}
