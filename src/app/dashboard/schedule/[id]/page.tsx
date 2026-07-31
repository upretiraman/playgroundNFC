import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import Container from "@/components/Container";
import PlanEditor from "@/components/dashboard/PlanEditor";
import AttendanceRow from "@/components/dashboard/AttendanceRow";
import { getSessionUser, canManageEventTeam } from "@/lib/auth-helpers";
import { getEventWithAttendance } from "@/lib/events";
import { repository } from "@/lib/repository";
import type { TeamSlug } from "@/lib/types";
import type { AttendanceStatusValue } from "@/lib/auth-types";

export const metadata: Metadata = {
  title: "Session Detail",
};

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getSessionUser();
  if (!user) return null;

  const event = await getEventWithAttendance(id);
  if (!event) notFound();

  const eventTeam = event.team as TeamSlug | "both";
  const canView =
    user.role === "ADMIN" ||
    eventTeam === "both" ||
    user.team === eventTeam;

  if (!canView) {
    redirect("/dashboard/schedule");
  }

  const canEdit = canManageEventTeam(user, eventTeam);

  const rosterTeam = eventTeam === "both" ? undefined : eventTeam;
  const players = await repository.getPlayers(rosterTeam);
  const playerBySlug = new Map(players.map((p) => [p.slug, p]));

  const attendanceRows = event.attendances
    .map((a) => {
      const player = playerBySlug.get(a.playerSlug);
      return {
        ...a,
        playerName: player?.name ?? a.playerSlug,
        playerMeta: player
          ? `#${player.number} · ${player.position}`
          : "Former roster player",
      };
    })
    .sort((a, b) => a.playerName.localeCompare(b.playerName));

  return (
    <div className="bg-cream py-16 sm:py-20">
      <Container className="max-w-3xl">
        <Link
          href="/dashboard/schedule"
          className="font-display text-sm uppercase tracking-wide text-crimson hover:text-crimson-dark"
        >
          &larr; Schedule
        </Link>

        <div className="mt-6 flex items-center gap-2">
          <span
            className={`rounded-full px-3 py-0.5 text-xs font-display uppercase tracking-wide ${
              event.type === "GAME"
                ? "bg-gold/20 text-charcoal"
                : "bg-crimson/10 text-crimson"
            }`}
          >
            {event.type === "GAME" ? "Game" : "Training"}
          </span>
          <span className="text-xs uppercase tracking-wide text-charcoal-soft capitalize">
            {event.team} team
          </span>
        </div>

        <h1 className="mt-2 font-display text-3xl text-charcoal sm:text-4xl">
          {new Date(event.date).toLocaleDateString("en-GB", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </h1>
        <p className="mt-2 text-charcoal-soft">
          {event.startTime}–{event.endTime} · {event.venue}
        </p>
        <p className="text-sm text-charcoal-soft/80">{event.address}</p>
        {event.opponent && (
          <p className="mt-2 font-display text-charcoal">
            vs {event.opponent}
          </p>
        )}
        {event.notes && (
          <p className="mt-3 rounded bg-cream-dark px-4 py-3 text-sm text-charcoal-soft">
            {event.notes}
          </p>
        )}
        <p className="mt-3 text-xs text-charcoal-soft/70">
          Scheduled by {event.createdBy.name}
        </p>

        {event.type === "TRAINING" && (
          <div className="mt-10">
            <h2 className="font-display text-xl text-charcoal">
              Training Plan
            </h2>
            <div className="mt-3 rounded-xl border border-cream-dark bg-white/60 p-6 shadow-sm">
              {canEdit ? (
                <PlanEditor eventId={event.id} initialPlan={event.plan ?? ""} />
              ) : event.plan ? (
                <p className="whitespace-pre-line text-charcoal-soft">
                  {event.plan}
                </p>
              ) : (
                <p className="text-charcoal-soft/70">
                  No plan added yet.
                </p>
              )}
            </div>
          </div>
        )}

        <div className="mt-10">
          <h2 className="font-display text-xl text-charcoal">Attendance</h2>
          <div className="mt-3 divide-y divide-cream-dark rounded-xl border border-cream-dark bg-white/60 shadow-sm">
            {attendanceRows.length === 0 ? (
              <p className="p-6 text-charcoal-soft/70">
                No attendance records for this session.
              </p>
            ) : canEdit ? (
              attendanceRows.map((row) => (
                <AttendanceRow
                  key={row.playerSlug}
                  eventId={event.id}
                  playerSlug={row.playerSlug}
                  playerName={row.playerName}
                  playerMeta={row.playerMeta}
                  initialStatus={row.status as AttendanceStatusValue}
                  initialNote={row.note ?? ""}
                  highlight={user.playerSlug === row.playerSlug}
                />
              ))
            ) : (
              attendanceRows.map((row) => (
                <div
                  key={row.playerSlug}
                  className={`flex items-center justify-between gap-4 p-4 ${
                    user.playerSlug === row.playerSlug ? "bg-crimson/5" : ""
                  }`}
                >
                  <div>
                    <p className="font-display text-charcoal">
                      {row.playerName}
                    </p>
                    <p className="text-xs text-charcoal-soft">
                      {row.playerMeta}
                    </p>
                  </div>
                  <span className="rounded-full bg-cream-dark px-3 py-1 text-xs font-display uppercase tracking-wide text-charcoal-soft">
                    {row.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </Container>
    </div>
  );
}
