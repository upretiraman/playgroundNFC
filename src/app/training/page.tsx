import type { Metadata } from "next";
import Container from "@/components/Container";
import { repository } from "@/lib/repository";
import type { TrainingSession } from "@/lib/types";

export const metadata: Metadata = {
  title: "Training",
  description:
    "Weekly training schedule for NFC Nürnberg's boys' and girls' teams, including venue and timing details.",
};

const dayOrder = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

function sortByDay(sessions: TrainingSession[]) {
  return [...sessions].sort(
    (a, b) => dayOrder.indexOf(a.dayOfWeek) - dayOrder.indexOf(b.dayOfWeek)
  );
}

function SessionCard({ session }: { session: TrainingSession }) {
  return (
    <div className="rounded-xl border border-cream-dark bg-white/60 p-6 shadow-sm">
      <p className="font-display text-xs uppercase tracking-[0.3em] text-crimson">
        {session.dayOfWeek}
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

export default async function TrainingPage() {
  const [boys, girls, both] = await Promise.all([
    repository.getTrainingSessions("boys"),
    repository.getTrainingSessions("girls"),
    repository.getTrainingSessions(),
  ]);

  const jointSessions = both.filter((s) => s.team === "both");
  const boysOnly = sortByDay(boys.filter((s) => s.team === "boys"));
  const girlsOnly = sortByDay(girls.filter((s) => s.team === "girls"));

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
          </div>
        </div>

        {jointSessions.length > 0 && (
          <div className="mt-12">
            <h2 className="font-display text-2xl text-charcoal">
              Joint Sessions
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {sortByDay(jointSessions).map((session) => (
                <SessionCard key={session.id} session={session} />
              ))}
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}
