import type { Metadata } from "next";
import Container from "@/components/Container";
import { repository } from "@/lib/repository";

export const metadata: Metadata = {
  title: "Club",
  description:
    "NFC Nürnberg's mission and values, membership tiers, and how the club is organized and run.",
};

export default async function ClubPage() {
  const [club, tiers, roles] = await Promise.all([
    repository.getClubInfo(),
    repository.getMembershipTiers(),
    repository.getClubRoles(),
  ]);

  return (
    <div>
      {/* Mission */}
      <section className="bg-charcoal py-16 text-cream sm:py-20">
        <Container>
          <span className="font-display text-sm uppercase tracking-[0.3em] text-gold">
            {club.motto}
          </span>
          <h1 className="mt-2 font-display text-4xl sm:text-5xl">The Club</h1>
          <p className="mt-4 max-w-2xl text-cream-dark sm:text-lg">
            {club.mission}
          </p>
          <div className="mt-6 flex flex-wrap gap-3 font-display text-xs uppercase tracking-[0.3em] text-cream-dark sm:text-sm">
            {club.values.map((value, i) => (
              <span key={value} className="flex items-center gap-3">
                {i > 0 && <span className="text-gold">&bull;</span>}
                {value}
              </span>
            ))}
          </div>
          <a
            href="/documents/club-protocol-roles-and-responsibilities.pdf"
            target="_blank"
            rel="noreferrer"
            className="mt-8 inline-block rounded bg-crimson px-6 py-3 font-display text-sm uppercase tracking-wide text-cream hover:bg-crimson-light"
          >
            Download Full Club Protocol (PDF)
          </a>
        </Container>
      </section>

      {/* Membership tiers */}
      <section className="bg-cream py-16 sm:py-20">
        <Container>
          <div className="mb-10 text-center">
            <span className="font-display text-sm uppercase tracking-[0.3em] text-crimson">
              How to Get Involved
            </span>
            <h2 className="mt-2 font-display text-3xl text-charcoal sm:text-4xl">
              Membership
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-charcoal-soft">
              Membership stays open to anyone willing to commit to regular
              training and matches. New people join through a short trial
              before being confirmed as an active or supporting member.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse overflow-hidden rounded-xl text-left shadow-sm">
              <thead>
                <tr className="bg-charcoal text-cream">
                  <th className="p-4 font-display text-sm uppercase tracking-wide">
                    Tier
                  </th>
                  <th className="p-4 font-display text-sm uppercase tracking-wide">
                    Friendly Games
                  </th>
                  <th className="p-4 font-display text-sm uppercase tracking-wide">
                    Tournaments
                  </th>
                </tr>
              </thead>
              <tbody>
                {tiers.map((tier, i) => (
                  <tr
                    key={tier.slug}
                    className={i % 2 === 0 ? "bg-white/60" : "bg-cream-dark"}
                  >
                    <td className="p-4 align-top">
                      <p className="font-display text-charcoal">
                        {tier.name}
                      </p>
                      <p className="mt-1 text-sm text-charcoal-soft">
                        {tier.description}
                      </p>
                    </td>
                    <td className="p-4 align-top text-charcoal-soft">
                      {tier.friendlies}
                    </td>
                    <td className="p-4 align-top text-charcoal-soft">
                      {tier.tournaments}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Container>
      </section>

      {/* Governance / roles */}
      <section className="bg-cream-dark py-16 sm:py-20">
        <Container>
          <div className="mb-10 text-center">
            <span className="font-display text-sm uppercase tracking-[0.3em] text-crimson">
              Governance
            </span>
            <h2 className="mt-2 font-display text-3xl text-charcoal sm:text-4xl">
              Committee &amp; Roles
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-charcoal-soft">
              The club is led by a Committee of role-holders, each with a
              defined scope, so nothing falls through the cracks.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {roles.map((role) => (
              <div
                key={role.slug}
                className="flex flex-col rounded-xl border border-cream bg-white/60 p-6 shadow-sm"
              >
                <p className="font-display text-lg text-charcoal">
                  {role.title}
                </p>
                <p className="mt-1 text-xs uppercase tracking-wide text-crimson">
                  Reports to: {role.reportsTo}
                </p>
                <p className="mt-3 text-sm text-charcoal-soft">
                  {role.summary}
                </p>
                <ul className="mt-4 space-y-1.5 text-sm text-charcoal-soft">
                  {role.duties.map((duty) => (
                    <li key={duty} className="flex gap-2">
                      <span className="text-crimson">&bull;</span>
                      <span>{duty}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Container>
      </section>
    </div>
  );
}
