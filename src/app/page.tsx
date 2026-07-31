import Image from "next/image";
import Link from "next/link";
import Container from "@/components/Container";
import PlayerAvatar from "@/components/PlayerAvatar";
import { repository } from "@/lib/repository";

export default async function Home() {
  const [club, teams, training, news, players] = await Promise.all([
    repository.getClubInfo(),
    repository.getTeams(),
    repository.getTrainingSessions(),
    repository.getNews(),
    repository.getPlayers(),
  ]);

  const featuredCaptains = players.filter((p) => p.isCaptain);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-charcoal text-cream">
        <div
          className="absolute inset-0 opacity-90"
          style={{
            background:
              "radial-gradient(circle at 15% 20%, var(--color-crimson-deep) 0%, var(--color-charcoal) 55%)",
          }}
        />
        <Container className="relative flex flex-col items-center gap-8 py-20 text-center sm:py-28">
          <Image
            src="/brand/logo.png"
            alt="NFC Nürnberg crest"
            width={180}
            height={180}
            priority
            className="h-36 w-36 drop-shadow-[0_0_35px_rgba(214,22,61,0.5)] sm:h-44 sm:w-44"
          />
          <div className="space-y-4">
            <p className="font-display text-sm uppercase tracking-[0.3em] text-gold">
              Est. {club.foundedYear} &middot; {club.city}, {club.country}
            </p>
            <h1 className="font-display text-4xl leading-tight text-balance sm:text-6xl">
              NFC N&uuml;rnberg
            </h1>
            <p className="font-display text-2xl italic text-crimson-light sm:text-3xl">
              {club.motto}
            </p>
            <p className="mx-auto max-w-2xl text-balance text-base text-cream-dark sm:text-lg">
              A hobby football club by and for the Nepali community in
              N&uuml;rnberg &mdash; boys&apos; and girls&apos; teams, training
              every week, and a badge we&apos;re proud to wear.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2 font-display text-xs uppercase tracking-[0.35em] text-cream-dark sm:text-sm">
              {club.values.map((value, i) => (
                <span key={value} className="flex items-center gap-3">
                  {i > 0 && <span className="text-gold">&bull;</span>}
                  {value}
                </span>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/teams"
              className="rounded bg-crimson px-6 py-3 font-display text-sm uppercase tracking-wide text-cream transition-colors hover:bg-crimson-light"
            >
              Meet the Teams
            </Link>
            <Link
              href="/contact"
              className="rounded border-2 border-cream px-6 py-3 font-display text-sm uppercase tracking-wide text-cream transition-colors hover:bg-cream hover:text-charcoal"
            >
              Join the Club
            </Link>
          </div>
        </Container>
      </section>

      {/* Mission */}
      <section className="bg-cream py-16 sm:py-20">
        <Container className="grid items-center gap-10 md:grid-cols-[1.2fr_1fr]">
          <div>
            <span className="font-display text-sm uppercase tracking-[0.3em] text-crimson">
              Our Story
            </span>
            <h2 className="mt-2 font-display text-3xl text-charcoal sm:text-4xl">
              One community, one badge
            </h2>
            <p className="mt-4 text-charcoal-soft sm:text-lg">
              {club.mission}
            </p>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-lg bg-charcoal p-4 text-center text-cream">
              <p className="font-display text-3xl text-gold sm:text-4xl">
                {teams.length}
              </p>
              <p className="mt-1 text-xs uppercase tracking-wide text-cream-dark">
                Teams
              </p>
            </div>
            <div className="rounded-lg bg-charcoal p-4 text-center text-cream">
              <p className="font-display text-3xl text-gold sm:text-4xl">
                {players.length}
              </p>
              <p className="mt-1 text-xs uppercase tracking-wide text-cream-dark">
                Players
              </p>
            </div>
            <div className="rounded-lg bg-charcoal p-4 text-center text-cream">
              <p className="font-display text-3xl text-gold sm:text-4xl">
                {training.length}
              </p>
              <p className="mt-1 text-xs uppercase tracking-wide text-cream-dark">
                Sessions / week
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Teams */}
      <section className="bg-cream-dark py-16 sm:py-20">
        <Container>
          <div className="mb-10 text-center">
            <span className="font-display text-sm uppercase tracking-[0.3em] text-crimson">
              The Squads
            </span>
            <h2 className="mt-2 font-display text-3xl text-charcoal sm:text-4xl">
              Boys &amp; Girls Teams
            </h2>
          </div>
          <div className="grid gap-8 md:grid-cols-2">
            {teams.map((team) => (
              <Link
                key={team.slug}
                href={`/teams/${team.slug}`}
                className="group relative overflow-hidden rounded-xl bg-charcoal p-8 text-cream shadow-lg transition-transform hover:-translate-y-1"
              >
                <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-crimson/30 blur-2xl transition-colors group-hover:bg-crimson/50" />
                <p className="font-display text-xs uppercase tracking-[0.3em] text-gold">
                  Since {team.foundedYear}
                </p>
                <h3 className="mt-2 font-display text-2xl sm:text-3xl">
                  {team.name}
                </h3>
                <p className="mt-3 text-cream-dark">{team.tagline}</p>
                <p className="mt-4 text-sm text-cream-dark">
                  Coached by {team.coachName}
                </p>
                <span className="mt-6 inline-flex items-center gap-2 font-display text-sm uppercase tracking-wide text-cream group-hover:text-gold">
                  View roster &rarr;
                </span>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* Captains */}
      {featuredCaptains.length > 0 && (
        <section className="bg-cream py-16 sm:py-20">
          <Container>
            <div className="mb-10 text-center">
              <span className="font-display text-sm uppercase tracking-[0.3em] text-crimson">
                Team Leaders
              </span>
              <h2 className="mt-2 font-display text-3xl text-charcoal sm:text-4xl">
                Our Captains
              </h2>
            </div>
            <div className="flex flex-wrap justify-center gap-10">
              {featuredCaptains.map((player) => (
                <Link
                  key={player.slug}
                  href={`/teams/${player.team}/${player.slug}`}
                  className="flex flex-col items-center gap-3 text-center"
                >
                  <PlayerAvatar
                    name={player.name}
                    isCaptain
                    className="h-28 w-28 sm:h-32 sm:w-32"
                  />
                  <div>
                    <p className="font-display text-lg text-charcoal">
                      {player.name}
                    </p>
                    <p className="text-sm capitalize text-charcoal-soft">
                      {player.team} team &middot; {player.position}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* Training teaser */}
      <section className="bg-charcoal py-16 text-cream sm:py-20">
        <Container className="grid items-center gap-10 md:grid-cols-[1fr_1.2fr]">
          <div>
            <span className="font-display text-sm uppercase tracking-[0.3em] text-gold">
              Get Involved
            </span>
            <h2 className="mt-2 font-display text-3xl sm:text-4xl">
              Regular training, every week
            </h2>
            <p className="mt-4 text-cream-dark">
              Both teams train weekly in N&uuml;rnberg, with an open scrimmage
              on Sundays. New players are always welcome &mdash; just show up.
            </p>
            <Link
              href="/training"
              className="mt-6 inline-block rounded bg-crimson px-6 py-3 font-display text-sm uppercase tracking-wide text-cream hover:bg-crimson-light"
            >
              Full Schedule
            </Link>
          </div>
          <div className="grid gap-3">
            {training.slice(0, 3).map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between rounded-lg bg-charcoal-soft/40 px-5 py-4"
              >
                <div>
                  <p className="font-display text-sm uppercase tracking-wide text-gold">
                    {session.dayOfWeek}
                  </p>
                  <p className="text-sm text-cream-dark">{session.venue}</p>
                </div>
                <p className="font-display text-lg">
                  {session.startTime}&ndash;{session.endTime}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* News teaser */}
      <section className="bg-cream py-16 sm:py-20">
        <Container>
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="font-display text-sm uppercase tracking-[0.3em] text-crimson">
                What&apos;s New
              </span>
              <h2 className="mt-2 font-display text-3xl text-charcoal sm:text-4xl">
                Latest from the Club
              </h2>
            </div>
            <Link
              href="/news"
              className="font-display text-sm uppercase tracking-wide text-crimson hover:text-crimson-dark"
            >
              All news &rarr;
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {news.slice(0, 3).map((item) => (
              <Link
                key={item.slug}
                href={`/news/${item.slug}`}
                className="flex flex-col rounded-xl border border-cream-dark bg-white/50 p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <p className="font-display text-xs uppercase tracking-wide text-crimson">
                  {new Date(item.date).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
                <h3 className="mt-2 font-display text-lg text-charcoal">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-charcoal-soft">
                  {item.summary}
                </p>
              </Link>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
