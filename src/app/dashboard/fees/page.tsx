import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import Container from "@/components/Container";
import ContributionPeriods from "@/components/dashboard/ContributionPeriods";
import { getSessionUser } from "@/lib/auth-helpers";
import { parseRoles } from "@/lib/auth-types";
import { db } from "@/lib/db";
import { repository } from "@/lib/repository";
import { groupContributionsByPeriod, listContributions } from "@/lib/contributions";

export const metadata: Metadata = {
  title: "Fee Records",
};

export const dynamic = "force-dynamic";

export default async function FeesPage() {
  const user = await getSessionUser();
  if (!user) return null;

  const isAdmin = user.roles.includes("ADMIN");
  const isPlayer = user.roles.includes("PLAYER");
  if (!isAdmin && !isPlayer) {
    redirect("/dashboard");
  }

  const tiers = await repository.getMembershipTiers();

  let ownGroups = null;
  if (isPlayer) {
    const own = await listContributions(user.id);
    ownGroups = groupContributionsByPeriod(own, tiers);
  }

  let members: Array<{ id: string; name: string; email: string; totalPaid: number }> = [];
  if (isAdmin) {
    const allUsers = await db.user.findMany({ orderBy: { name: "asc" } });
    const playerUsers = allUsers.filter((u) => parseRoles(u.roles).includes("PLAYER"));
    const totals = await db.contribution.groupBy({
      by: ["memberId"],
      _sum: { amount: true },
    });
    const totalByMemberId = new Map(totals.map((t) => [t.memberId, t._sum.amount ?? 0]));
    members = playerUsers.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      totalPaid: totalByMemberId.get(u.id) ?? 0,
    }));
  }

  return (
    <div className="bg-cream py-16 sm:py-20">
      <Container>
        <span className="font-display text-sm uppercase tracking-[0.3em] text-crimson">
          {isAdmin ? "Administrator" : "Member"} Area
        </span>
        <h1 className="mt-2 font-display text-4xl text-charcoal sm:text-5xl">
          Fee Records
        </h1>

        {isPlayer && (
          <div className="mt-10">
            <h2 className="font-display text-xl text-charcoal">
              My Contributions
            </h2>
            <p className="mt-1 text-sm text-charcoal-soft">
              Every contribution recorded against your account, and what&apos;s
              still outstanding per membership period.
            </p>
            <div className="mt-4">
              <ContributionPeriods groups={ownGroups ?? []} />
            </div>
          </div>
        )}

        {isAdmin && (
          <div className="mt-12">
            <h2 className="font-display text-xl text-charcoal">
              All Members
            </h2>
            <div className="mt-4 overflow-x-auto rounded-xl border border-cream-dark bg-white/60 shadow-sm">
              <table className="w-full min-w-[560px] text-left">
                <thead>
                  <tr className="border-b border-cream-dark bg-cream-dark/60">
                    <th className="p-3 font-display text-xs uppercase tracking-wide text-charcoal-soft">
                      Member
                    </th>
                    <th className="p-3 font-display text-xs uppercase tracking-wide text-charcoal-soft">
                      Total Paid (all-time)
                    </th>
                    <th className="p-3" />
                  </tr>
                </thead>
                <tbody>
                  {members.map((member) => (
                    <tr key={member.id} className="border-b border-cream-dark/60">
                      <td className="p-3 text-charcoal">
                        {member.name}
                        <span className="ml-2 text-xs text-charcoal-soft">
                          {member.email}
                        </span>
                      </td>
                      <td className="p-3 text-sm text-charcoal-soft">
                        €{member.totalPaid.toFixed(2)}
                      </td>
                      <td className="p-3 text-right text-sm">
                        <Link
                          href={`/dashboard/fees/${member.id}`}
                          className="font-display uppercase tracking-wide text-crimson hover:text-crimson-dark"
                        >
                          View / Record
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {members.length === 0 && (
                    <tr>
                      <td colSpan={3} className="p-6 text-center text-charcoal-soft/70">
                        No members hold the Player role yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}
