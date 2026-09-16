import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import Container from "@/components/Container";
import ContributionPeriods from "@/components/dashboard/ContributionPeriods";
import RecordContributionForm from "@/components/dashboard/RecordContributionForm";
import { getSessionUser } from "@/lib/auth-helpers";
import { parseRoles } from "@/lib/auth-types";
import { db } from "@/lib/db";
import { repository } from "@/lib/repository";
import { groupContributionsByPeriod, listContributions } from "@/lib/contributions";

export const metadata: Metadata = {
  title: "Member Fee Record",
};

export default async function MemberFeesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getSessionUser();
  if (!user) return null;
  if (!user.roles.includes("ADMIN")) {
    redirect("/dashboard");
  }

  const member = await db.user.findUnique({ where: { id } });
  if (!member || !parseRoles(member.roles).includes("PLAYER")) {
    notFound();
  }

  const [contributions, tiers] = await Promise.all([
    listContributions(member.id),
    repository.getMembershipTiers(),
  ]);
  const groups = groupContributionsByPeriod(contributions, tiers);

  return (
    <div className="bg-cream py-16 sm:py-20">
      <Container className="max-w-3xl">
        <Link
          href="/dashboard/fees"
          className="font-display text-sm uppercase tracking-wide text-crimson hover:text-crimson-dark"
        >
          &larr; Fee Records
        </Link>
        <h1 className="mt-2 font-display text-4xl text-charcoal sm:text-5xl">
          {member.name}
        </h1>
        <p className="mt-2 text-charcoal-soft">{member.email}</p>

        <div className="mt-10">
          <h2 className="font-display text-xl text-charcoal">
            Contribution History
          </h2>
          <div className="mt-4">
            <ContributionPeriods groups={groups} />
          </div>
        </div>

        <div className="mt-10">
          <h2 className="font-display text-xl text-charcoal">
            Record a Contribution
          </h2>
          <div className="mt-4 rounded-xl border border-cream-dark bg-white/60 p-6 shadow-sm">
            <RecordContributionForm memberId={member.id} tiers={tiers} />
          </div>
        </div>
      </Container>
    </div>
  );
}
