import type { Metadata } from "next";
import Container from "@/components/Container";
import { listUpcomingEvents } from "@/lib/events";

export const metadata: Metadata = {
  title: "Training",
  description:
    "Upcoming training sessions for NFC Nürnberg's boys' and girls' teams, including venue and timing details.",
};

// Reads live schedule data from the database, so this must not be
// statically frozen at build time.
export const dynamic = "force-dynamic";

type UpcomingEvent = Awaited<ReturnType<typeof listUpcomingEvents>>[number];

function SessionCard({ session }: { session: UpcomingEvent }) {
  return (
    <div className="rounded-xl border border-cream-dark bg-white/60 p-6 shadow-sm">
      <p className="font-display text-xs uppercase tracking-[0.3em] text-crimson">
        {new Date(session.date).toLocaleDateString("en-GB", {
          weekday: "long",
          day: "numeric",
          month: "long",
        })}
      </p>
      <p className="mt-2 font-display text-2xl text-charcoal">
        {session.startTime}&ndash;{session.endTime}
      </p>
      <p className="mt-3 text-charcoal-soft">{session.venue}</p>
      <p className="text-sm text-charcoal-soft/80">{session.address}</p>
      {session.notes && (
        <p className="mt-3 rounded bg-cream-dark px-3 py-2 text-sm text-charcoal-soft">
          {session.notes}
        </p>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <p className="mt-4 text-sm text-charcoal-soft/70">
      No sessions currently scheduled &mdash; check back soon.
    </p>
  );
}

export default async function TrainingPage() {
  const trainings = await listUpcomingEvents({ type: "TRAINING" });
  const boysOnly = trainings.filter((e) => e.team === "boys");
  const girlsOnly = trainings.filter((e) => e.team === "girls");
  const jointSessions = trainings.filter((e) => e.team === "both");

  return (
    <div className="bg-cream py-16 sm:py-20">
      <Container>
        <div className="mb-12 text-center">
          <span className="font-display text-sm uppercase tracking-[0.3em] text-crimson">
            Get on the Pitch
          </span>
          <h1 className="mt-2 font-display text-4xl text-charcoal sm:text-5xl">
            Training Schedule
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-charcoal-soft">
            Both teams train weekly in N&uuml;rnberg. New players &mdash; of
            any experience level &mdash; are always welcome to come along.
          </p>
        </div>

        <div className="grid gap-12 md:grid-cols-2">
          <div>
            <h2 className="font-display text-2xl text-charcoal">
              Boys Team
            </h2>
            <div className="mt-4 grid gap-4">
              {boysOnly.map((session) => (
                <SessionCard key={session.id} session={session} />
              ))}
            </div>
            {boysOnly.length === 0 && <EmptyState />}
          </div>
          <div>
            <h2 className="font-display text-2xl text-charcoal">
              Girls Team
            </h2>
            <div className="mt-4 grid gap-4">
              {girlsOnly.map((session) => (
                <SessionCard key={session.id} session={session} />
              ))}
            </div>
            {girlsOnly.length === 0 && <EmptyState />}
          </div>
        </div>

        {jointSessions.length > 0 && (
          <div className="mt-12">
            <h2 className="font-display text-2xl text-charcoal">
              Joint Sessions
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {jointSessions.map((session) => (
                <SessionCard key={session.id} session={session} />
              ))}
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}
