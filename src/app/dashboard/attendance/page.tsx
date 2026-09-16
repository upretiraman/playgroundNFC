import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Container from "@/components/Container";
import { getSessionUser, canManageTeam } from "@/lib/auth-helpers";
import { listAttendanceForReport } from "@/lib/events";
import { repository } from "@/lib/repository";
import type { TeamSlug } from "@/lib/types";
import type { AttendanceStatusValue } from "@/lib/auth-types";

export const metadata: Metadata = {
  title: "Attendance Reports",
};

export const dynamic = "force-dynamic";

const STATUSES: AttendanceStatusValue[] = [
  "PRESENT",
  "ABSENT",
  "EXCUSED",
  "UNKNOWN",
];

type Counts = Record<AttendanceStatusValue, number>;

function emptyCounts(): Counts {
  return { PRESENT: 0, ABSENT: 0, EXCUSED: 0, UNKNOWN: 0 };
}

function addCounts(into: Counts, from: Counts) {
  for (const status of STATUSES) into[status] += from[status];
}

// Rate is out of sessions Trainers actually marked — UNKNOWN (not yet
// marked) doesn't count against a player.
function attendanceRate(counts: Counts): number | null {
  const marked = counts.PRESENT + counts.ABSENT + counts.EXCUSED;
  if (marked === 0) return null;
  return Math.round((counts.PRESENT / marked) * 100);
}

export default async function AttendanceReportPage({
  searchParams,
}: {
  searchParams: Promise<{ team?: string; from?: string; to?: string }>;
}) {
  const user = await getSessionUser();
  if (!user) return null;
  if (!canManageTeam(user)) {
    redirect("/dashboard");
  }

  const { team: teamParam, from: fromParam, to: toParam } = await searchParams;
  const team =
    teamParam === "boys" || teamParam === "girls" ? teamParam : undefined;
  const from = fromParam ? new Date(`${fromParam}T00:00:00`) : undefined;
  const to = toParam ? new Date(`${toParam}T23:59:59`) : undefined;

  const [attendances, players] = await Promise.all([
    listAttendanceForReport({ team, from, to }),
    repository.getPlayers(),
  ]);
  const playerBySlug = new Map(players.map((p) => [p.slug, p]));

  const perPlayer = new Map<
    string,
    { name: string; team: TeamSlug | null; counts: Counts }
  >();

  for (const a of attendances) {
    const player = playerBySlug.get(a.playerSlug);
    if (!perPlayer.has(a.playerSlug)) {
      perPlayer.set(a.playerSlug, {
        name: player?.name ?? a.playerSlug,
        team: player?.team ?? null,
        counts: emptyCounts(),
      });
    }
    perPlayer.get(a.playerSlug)!.counts[a.status as AttendanceStatusValue]++;
  }

  const playerRows = [...perPlayer.entries()]
    .map(([slug, row]) => ({
      slug,
      ...row,
      rate: attendanceRate(row.counts),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  const teamTotals = new Map<string, Counts>();
  for (const row of playerRows) {
    const key = row.team ?? "unassigned";
    if (!teamTotals.has(key)) teamTotals.set(key, emptyCounts());
    addCounts(teamTotals.get(key)!, row.counts);
  }
  const clubTotals = emptyCounts();
  for (const totals of teamTotals.values()) addCounts(clubTotals, totals);

  const teamSummaries = [
    { label: "Boys Team", counts: teamTotals.get("boys") ?? emptyCounts() },
    { label: "Girls Team", counts: teamTotals.get("girls") ?? emptyCounts() },
    { label: "Whole Club", counts: clubTotals },
  ];

  return (
    <div className="bg-cream py-16 sm:py-20">
      <Container>
        <span className="font-display text-sm uppercase tracking-[0.3em] text-crimson">
          {user.roles.includes("ADMIN") ? "Admin" : "Trainer"} Area
        </span>
        <h1 className="mt-2 font-display text-4xl text-charcoal sm:text-5xl">
          Attendance Reports
        </h1>
        <p className="mt-3 text-charcoal-soft">
          Per-player and per-team attendance across all marked sessions.
        </p>

        <form className="mt-8 flex flex-wrap items-end gap-4">
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
              defaultValue={team ?? ""}
              className="mt-1 w-full rounded border border-cream-dark bg-white px-4 py-2.5 text-charcoal focus:border-crimson focus:outline-none"
            >
              <option value="">All Teams</option>
              <option value="boys">Boys Team</option>
              <option value="girls">Girls Team</option>
            </select>
          </div>
          <div>
            <label
              htmlFor="from"
              className="font-display text-xs uppercase tracking-wide text-charcoal-soft"
            >
              From
            </label>
            <input
              id="from"
              name="from"
              type="date"
              defaultValue={fromParam ?? ""}
              className="mt-1 w-full rounded border border-cream-dark bg-white px-4 py-2.5 text-charcoal focus:border-crimson focus:outline-none"
            />
          </div>
          <div>
            <label
              htmlFor="to"
              className="font-display text-xs uppercase tracking-wide text-charcoal-soft"
            >
              To
            </label>
            <input
              id="to"
              name="to"
              type="date"
              defaultValue={toParam ?? ""}
              className="mt-1 w-full rounded border border-cream-dark bg-white px-4 py-2.5 text-charcoal focus:border-crimson focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="rounded bg-crimson px-6 py-2.5 font-display text-sm uppercase tracking-wide text-cream transition-colors hover:bg-crimson-light"
          >
            Apply
          </button>
        </form>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {teamSummaries.map((summary) => {
            const rate = attendanceRate(summary.counts);
            return (
              <div
                key={summary.label}
                className="rounded-xl border border-cream-dark bg-white/60 p-6 shadow-sm"
              >
                <p className="font-display text-sm uppercase tracking-wide text-charcoal-soft">
                  {summary.label}
                </p>
                <p className="mt-2 font-display text-3xl text-charcoal">
                  {rate === null ? "—" : `${rate}%`}
                </p>
                <p className="mt-1 text-xs text-charcoal-soft/80">
                  {summary.counts.PRESENT} present · {summary.counts.ABSENT}{" "}
                  absent · {summary.counts.EXCUSED} excused ·{" "}
                  {summary.counts.UNKNOWN} unmarked
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-10">
          <h2 className="font-display text-xl text-charcoal">Per Player</h2>
          <div className="mt-4 overflow-x-auto rounded-xl border border-cream-dark bg-white/60 shadow-sm">
            <table className="w-full min-w-[560px] text-left">
              <thead>
                <tr className="border-b border-cream-dark bg-cream-dark/60">
                  <th className="p-3 font-display text-xs uppercase tracking-wide text-charcoal-soft">
                    Player
                  </th>
                  <th className="p-3 font-display text-xs uppercase tracking-wide text-charcoal-soft">
                    Team
                  </th>
                  <th className="p-3 font-display text-xs uppercase tracking-wide text-charcoal-soft">
                    Present
                  </th>
                  <th className="p-3 font-display text-xs uppercase tracking-wide text-charcoal-soft">
                    Absent
                  </th>
                  <th className="p-3 font-display text-xs uppercase tracking-wide text-charcoal-soft">
                    Excused
                  </th>
                  <th className="p-3 font-display text-xs uppercase tracking-wide text-charcoal-soft">
                    Unmarked
                  </th>
                  <th className="p-3 font-display text-xs uppercase tracking-wide text-charcoal-soft">
                    Rate
                  </th>
                </tr>
              </thead>
              <tbody>
                {playerRows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="p-6 text-center text-charcoal-soft/70"
                    >
                      No attendance records for this range.
                    </td>
                  </tr>
                ) : (
                  playerRows.map((row) => (
                    <tr key={row.slug} className="border-b border-cream-dark/60">
                      <td className="p-3 text-charcoal">{row.name}</td>
                      <td className="p-3 text-sm capitalize text-charcoal-soft">
                        {row.team ?? "—"}
                      </td>
                      <td className="p-3 text-sm text-charcoal-soft">
                        {row.counts.PRESENT}
                      </td>
                      <td className="p-3 text-sm text-charcoal-soft">
                        {row.counts.ABSENT}
                      </td>
                      <td className="p-3 text-sm text-charcoal-soft">
                        {row.counts.EXCUSED}
                      </td>
                      <td className="p-3 text-sm text-charcoal-soft">
                        {row.counts.UNKNOWN}
                      </td>
                      <td className="p-3 text-sm text-charcoal-soft">
                        {row.rate === null ? "—" : `${row.rate}%`}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Container>
    </div>
  );
}
