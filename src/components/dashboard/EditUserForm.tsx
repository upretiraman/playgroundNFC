"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateUser } from "@/app/dashboard/users/actions";
import type { UserRole } from "@/lib/auth-types";

interface PlayerOption {
  slug: string;
  name: string;
  team: "boys" | "girls";
}

export default function EditUserForm({
  userId,
  players,
  isSuperAdmin,
  initialName,
  initialEmail,
  initialRoles,
  initialTeam,
  initialPlayerSlug,
}: {
  userId: string;
  players: PlayerOption[];
  isSuperAdmin: boolean;
  initialName: string;
  initialEmail: string;
  initialRoles: UserRole[];
  initialTeam: "boys" | "girls" | null;
  initialPlayerSlug: string | null;
}) {
  const router = useRouter();
  const [roles, setRoles] = useState<UserRole[]>(initialRoles);
  const [team, setTeam] = useState<"boys" | "girls">(initialTeam ?? "boys");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const playersForTeam = useMemo(
    () => players.filter((p) => p.team === team),
    [players, team]
  );

  function toggleRole(role: UserRole) {
    setRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  }

  const needsTeam = roles.includes("PLAYER");

  return (
    <form
      action={(formData) => {
        setError(null);
        setSuccess(null);
        startTransition(async () => {
          try {
            await updateUser(userId, formData);
            setSuccess("Account updated.");
            router.refresh();
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
      {success && (
        <p className="rounded bg-gold/10 px-4 py-2 text-sm text-charcoal">
          {success}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="edit-name"
            className="font-display text-xs uppercase tracking-wide text-charcoal-soft"
          >
            Full Name
          </label>
          <input
            id="edit-name"
            name="name"
            type="text"
            required
            defaultValue={initialName}
            className="mt-1 w-full rounded border border-cream-dark bg-white px-4 py-2.5 text-charcoal focus:border-crimson focus:outline-none"
          />
        </div>
        <div>
          <label
            htmlFor="edit-email"
            className="font-display text-xs uppercase tracking-wide text-charcoal-soft"
          >
            Email
          </label>
          <input
            id="edit-email"
            name="email"
            type="email"
            required
            defaultValue={initialEmail}
            className="mt-1 w-full rounded border border-cream-dark bg-white px-4 py-2.5 text-charcoal focus:border-crimson focus:outline-none"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <span className="font-display text-xs uppercase tracking-wide text-charcoal-soft">
            Roles
          </span>
          <div className="mt-1 flex flex-wrap gap-4 py-2.5">
            {(["PLAYER", "TRAINER", ...(isSuperAdmin ? (["ADMIN"] as const) : [])] as UserRole[]).map(
              (r) => (
                <label
                  key={r}
                  className="flex items-center gap-2 text-sm text-charcoal"
                >
                  <input
                    type="checkbox"
                    name="roles"
                    value={r}
                    checked={roles.includes(r)}
                    onChange={() => toggleRole(r)}
                    className="h-4 w-4 rounded border-cream-dark text-crimson focus:ring-crimson"
                  />
                  {r === "PLAYER"
                    ? "Player"
                    : r === "TRAINER"
                      ? "Trainer"
                      : "Administrator"}
                </label>
              )
            )}
          </div>
        </div>

        {needsTeam && (
          <div>
            <label
              htmlFor="edit-team"
              className="font-display text-xs uppercase tracking-wide text-charcoal-soft"
            >
              Team
            </label>
            <select
              id="edit-team"
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

      {roles.includes("PLAYER") && (
        <div>
          <label
            htmlFor="edit-playerSlug"
            className="font-display text-xs uppercase tracking-wide text-charcoal-soft"
          >
            Link to Roster Player (optional)
          </label>
          <select
            id="edit-playerSlug"
            name="playerSlug"
            defaultValue={initialPlayerSlug ?? ""}
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
        {pending ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
}
