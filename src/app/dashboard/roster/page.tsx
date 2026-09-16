import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import Container from "@/components/Container";
import TogglePublishedButton from "@/components/dashboard/TogglePublishedButton";
import { getSessionUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";

export const metadata: Metadata = {
  title: "Manage Roster",
};

export default async function DashboardRosterPage() {
  const user = await getSessionUser();
  if (!user) return null;
  if (!user.roles.includes("ADMIN")) {
    redirect("/dashboard");
  }

  const players = await db.player.findMany({
    orderBy: [{ team: "asc" }, { number: "asc" }],
  });

  return (
    <div className="bg-cream py-16 sm:py-20">
      <Container>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="font-display text-sm uppercase tracking-[0.3em] text-crimson">
              Administrator
            </span>
            <h1 className="mt-2 font-display text-4xl text-charcoal sm:text-5xl">
              Manage Roster
            </h1>
          </div>
          <Link
            href="/dashboard/roster/new"
            className="rounded bg-crimson px-5 py-2.5 font-display text-sm uppercase tracking-wide text-cream hover:bg-crimson-light"
          >
            Add Player
          </Link>
        </div>

        <div className="mt-10 overflow-x-auto rounded-xl border border-cream-dark bg-white/60 shadow-sm">
          <table className="w-full min-w-[720px] text-left">
            <thead>
              <tr className="border-b border-cream-dark bg-cream-dark/60">
                <th className="p-3 font-display text-xs uppercase tracking-wide text-charcoal-soft">
                  Player
                </th>
                <th className="p-3 font-display text-xs uppercase tracking-wide text-charcoal-soft">
                  Team
                </th>
                <th className="p-3 font-display text-xs uppercase tracking-wide text-charcoal-soft">
                  Number
                </th>
                <th className="p-3 font-display text-xs uppercase tracking-wide text-charcoal-soft">
                  Position
                </th>
                <th className="p-3 font-display text-xs uppercase tracking-wide text-charcoal-soft">
                  Public
                </th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody>
              {players.map((player) => (
                <tr key={player.id} className="border-b border-cream-dark/60">
                  <td className="p-3 text-charcoal">
                    {player.name}
                    {player.isCaptain && (
                      <span className="ml-1 text-xs text-gold">(captain)</span>
                    )}
                  </td>
                  <td className="p-3 text-sm capitalize text-charcoal-soft">
                    {player.team}
                  </td>
                  <td className="p-3 text-sm text-charcoal-soft">
                    #{player.number}
                  </td>
                  <td className="p-3 text-sm text-charcoal-soft">
                    {player.position}
                  </td>
                  <td className="p-3 text-sm text-charcoal-soft">
                    {player.published ? "Yes" : "No"}
                  </td>
                  <td className="p-3 text-right text-sm">
                    <Link
                      href={`/dashboard/roster/${player.id}`}
                      className="font-display uppercase tracking-wide text-crimson hover:text-crimson-dark"
                    >
                      Edit
                    </Link>
                    <span className="mx-2 text-charcoal-soft/40">·</span>
                    <TogglePublishedButton
                      playerId={player.id}
                      published={player.published}
                      playerName={player.name}
                    />
                  </td>
                </tr>
              ))}
              {players.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-charcoal-soft/70">
                    No players yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Container>
    </div>
  );
}
