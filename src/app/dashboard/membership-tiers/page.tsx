import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import Container from "@/components/Container";
import DeleteTierButton from "@/components/dashboard/DeleteTierButton";
import { getSessionUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";

export const metadata: Metadata = {
  title: "Manage Membership Tiers",
};

export default async function DashboardMembershipTiersPage() {
  const user = await getSessionUser();
  if (!user) return null;
  if (!user.roles.includes("ADMIN")) {
    redirect("/dashboard");
  }

  const tiers = await db.membershipTier.findMany({
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="bg-cream py-16 sm:py-20">
      <Container>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="font-display text-sm uppercase tracking-[0.3em] text-crimson">
              Administrator
            </span>
            <h1 className="mt-2 font-display text-4xl text-charcoal sm:text-5xl">
              Manage Membership Tiers
            </h1>
          </div>
          <Link
            href="/dashboard/membership-tiers/new"
            className="rounded bg-crimson px-5 py-2.5 font-display text-sm uppercase tracking-wide text-cream hover:bg-crimson-light"
          >
            Add Tier
          </Link>
        </div>

        <div className="mt-10 overflow-x-auto rounded-xl border border-cream-dark bg-white/60 shadow-sm">
          <table className="w-full min-w-[560px] text-left">
            <thead>
              <tr className="border-b border-cream-dark bg-cream-dark/60">
                <th className="p-3 font-display text-xs uppercase tracking-wide text-charcoal-soft">
                  Tier
                </th>
                <th className="p-3 font-display text-xs uppercase tracking-wide text-charcoal-soft">
                  Annual Fee
                </th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody>
              {tiers.map((tier) => (
                <tr key={tier.id} className="border-b border-cream-dark/60">
                  <td className="p-3 text-charcoal">{tier.name}</td>
                  <td className="p-3 text-sm text-charcoal-soft">
                    €{tier.feeAmount.toFixed(2)}
                  </td>
                  <td className="p-3 text-right text-sm">
                    <Link
                      href={`/dashboard/membership-tiers/${tier.id}`}
                      className="font-display uppercase tracking-wide text-crimson hover:text-crimson-dark"
                    >
                      Edit
                    </Link>
                    <span className="mx-2 text-charcoal-soft/40">·</span>
                    <DeleteTierButton tierId={tier.id} tierName={tier.name} />
                  </td>
                </tr>
              ))}
              {tiers.length === 0 && (
                <tr>
                  <td colSpan={3} className="p-6 text-center text-charcoal-soft/70">
                    No membership tiers yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Container>
    </div>
  );
}
