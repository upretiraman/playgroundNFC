import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Container from "@/components/Container";
import PlayerAvatar from "@/components/PlayerAvatar";
import { repository } from "@/lib/repository";
import type { TeamSlug } from "@/lib/types";

export async function generateStaticParams() {
  const teams = await repository.getTeams();
  return teams.map((team) => ({ team: team.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ team: string }>;
}): Promise<Metadata> {
  const { team: teamSlug } = await params;
  const team = await repository.getTeam(teamSlug as TeamSlug);
  if (!team) return {};
  return {
    title: team.name,
    description: team.description,
  };
}

export default async function TeamRosterPage({
  params,
}: {
  params: Promise<{ team: string }>;
}) {
  const { team: teamSlug } = await params;
  const team = await repository.getTeam(teamSlug as TeamSlug);
  if (!team) notFound();

  const players = await repository.getPlayers(team.slug);

  return (
    <div>
      <section className="bg-charcoal py-16 text-cream sm:py-20">
        <Container>
          <p className="font-display text-xs uppercase tracking-[0.3em] text-gold">
            Since {team.foundedYear}
          </p>
          <h1 className="mt-2 font-display text-4xl sm:text-5xl">
            {team.name}
          </h1>
          <p className="mt-4 max-w-2xl text-cream-dark">{team.description}</p>
          <p className="mt-4 text-sm text-cream-dark">
            {team.coachRole}: <span className="text-cream">{team.coachName}</span>
          </p>
        </Container>
      </section>

      <section className="bg-cream py-16 sm:py-20">
        <Container>
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <h2 className="font-display text-3xl text-charcoal sm:text-4xl">
              Roster
            </h2>
            <Link
              href="/teams"
              className="font-display text-sm uppercase tracking-wide text-crimson hover:text-crimson-dark"
            >
              &larr; All teams
            </Link>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {players.map((player) => (
              <Link
                key={player.slug}
                href={`/teams/${team.slug}/${player.slug}`}
                className="group flex flex-col items-center gap-4 rounded-xl border border-cream-dark bg-white/50 p-6 text-center shadow-sm transition-shadow hover:shadow-md"
              >
                <PlayerAvatar
                  name={player.name}
                  isCaptain={player.isCaptain}
                  className="h-24 w-24"
                />
                <div>
                  <p className="font-display text-lg text-charcoal">
                    {player.name}
                  </p>
                  <p className="text-sm text-charcoal-soft">
                    #{player.number} &middot; {player.position}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </section>
    </div>
  );
}
