import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Container from "@/components/Container";
import PlayerAvatar from "@/components/PlayerAvatar";
import { repository } from "@/lib/repository";
import type { TeamSlug } from "@/lib/types";

export async function generateStaticParams() {
  const players = await repository.getPlayers();
  return players.map((player) => ({
    team: player.team,
    player: player.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ team: string; player: string }>;
}): Promise<Metadata> {
  const { player: playerSlug } = await params;
  const player = await repository.getPlayer(playerSlug);
  if (!player) return {};
  return {
    title: player.name,
    description: player.bio,
  };
}

export default async function PlayerProfilePage({
  params,
}: {
  params: Promise<{ team: string; player: string }>;
}) {
  const { team: teamSlug, player: playerSlug } = await params;
  const team = await repository.getTeam(teamSlug as TeamSlug);
  const player = await repository.getPlayer(playerSlug);

  if (!team || !player || player.team !== team.slug) notFound();

  return (
    <div className="bg-cream py-16 sm:py-20">
      <Container className="max-w-3xl">
        <Link
          href={`/teams/${team.slug}`}
          className="font-display text-sm uppercase tracking-wide text-crimson hover:text-crimson-dark"
        >
          &larr; {team.name} roster
        </Link>

        <div className="mt-8 flex flex-col items-center gap-6 rounded-xl border border-cream-dark bg-white/60 p-10 text-center shadow-sm sm:flex-row sm:text-left">
          <PlayerAvatar
            name={player.name}
            isCaptain={player.isCaptain}
            className="h-32 w-32 shrink-0 sm:h-40 sm:w-40"
          />
          <div>
            <p className="font-display text-xs uppercase tracking-[0.3em] text-crimson">
              {team.name} {player.isCaptain ? "· Captain" : ""}
            </p>
            <h1 className="mt-2 font-display text-4xl text-charcoal">
              {player.name}
            </h1>
            <div className="mt-3 flex flex-wrap justify-center gap-x-6 gap-y-1 text-sm text-charcoal-soft sm:justify-start">
              <span>Number {player.number}</span>
              <span>{player.position}</span>
              {player.hometown && <span>From {player.hometown}</span>}
              <span>With the club since {player.joinedYear}</span>
            </div>
          </div>
        </div>

        <p className="mt-8 text-lg text-charcoal-soft">{player.bio}</p>
      </Container>
    </div>
  );
}
