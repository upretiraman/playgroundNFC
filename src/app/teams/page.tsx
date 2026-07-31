import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/Container";
import { repository } from "@/lib/repository";

export const metadata: Metadata = {
  title: "Teams",
  description:
    "Meet NFC Nürnberg's boys' and girls' teams — coaches, rosters, and how the squads came together.",
};

export default async function TeamsPage() {
  const teams = await repository.getTeams();
  const players = await repository.getPlayers();

  return (
    <div className="bg-cream py-16 sm:py-20">
      <Container>
        <div className="mb-12 text-center">
          <span className="font-display text-sm uppercase tracking-[0.3em] text-crimson">
            NFC N&uuml;rnberg
          </span>
          <h1 className="mt-2 font-display text-4xl text-charcoal sm:text-5xl">
            Our Teams
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-charcoal-soft">
            Two squads, one club. Explore the rosters below to meet the
            players representing NFC N&uuml;rnberg.
          </p>
        </div>

        <div className="grid gap-10 md:grid-cols-2">
          {teams.map((team) => {
            const roster = players.filter((p) => p.team === team.slug);
            return (
              <div
                key={team.slug}
                className="overflow-hidden rounded-xl bg-charcoal text-cream shadow-lg"
              >
                <div className="diagonal-split h-3 w-full" />
                <div className="p-8">
                  <p className="font-display text-xs uppercase tracking-[0.3em] text-gold">
                    Since {team.foundedYear} &middot; {roster.length} players
                  </p>
                  <h2 className="mt-2 font-display text-3xl">{team.name}</h2>
                  <p className="mt-3 text-cream-dark">{team.description}</p>
                  <p className="mt-4 text-sm text-cream-dark">
                    {team.coachRole}: {team.coachName}
                  </p>
                  <Link
                    href={`/teams/${team.slug}`}
                    className="mt-6 inline-block rounded bg-crimson px-5 py-2.5 font-display text-sm uppercase tracking-wide text-cream hover:bg-crimson-light"
                  >
                    View full roster
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </div>
  );
}
