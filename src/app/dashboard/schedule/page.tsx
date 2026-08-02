import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/Container";
import { getSessionUser } from "@/lib/auth-helpers";
import { listEvents } from "@/lib/events";
import type { TeamSlug } from "@/lib/types";

export const metadata: Metadata = {
  title: "Schedule",
};

export default async function SchedulePage() {
  const user = await getSessionUser();
  if (!user) return null;

  const team = user.role === "ADMIN" ? undefined : (user.team as TeamSlug);
  const events = await listEvents(team ?? undefined);

  const canCreate = user.role === "TRAINER" || user.role === "ADMIN";

  return (
    <div className="bg-cream py-16 sm:py-20">
      <Container>
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="font-display text-sm uppercase tracking-[0.3em] text-crimson">
              Member Area
            </span>
            <h1 className="mt-2 font-display text-4xl text-charcoal sm:text-5xl">
              Training &amp; Game Schedule
            </h1>
          </div>
          {canCreate && (
            <Link
              href="/dashboard/schedule/new"
              className="rounded bg-crimson px-5 py-2.5 font-display text-sm uppercase tracking-wide text-cream hover:bg-crimson-light"
            >
              + New Session
            </Link>
          )}
        </div>

        {events.length === 0 ? (
          <p className="text-charcoal-soft">No sessions scheduled yet.</p>
        ) : (
          <div className="grid gap-4">
            {events.map((event) => (
              <Link
                key={event.id}
                href={`/dashboard/schedule/${event.id}`}
                className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-cream-dark bg-white/60 p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div>
                  <div className="flex items-center gap-2">
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
                  <p className="mt-2 font-display text-lg text-charcoal">
                    {new Date(event.date).toLocaleDateString("en-GB", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                    {" · "}
                    {event.startTime}–{event.endTime}
                  </p>
                  <p className="text-sm text-charcoal-soft">
                    {event.venue}
                    {event.opponent ? ` · vs ${event.opponent}` : ""}
                  </p>
                </div>
                <span className="font-display text-sm uppercase tracking-wide text-crimson">
                  View &rarr;
                </span>
              </Link>
            ))}
          </div>
        )}
      </Container>
    </div>
  );
}
