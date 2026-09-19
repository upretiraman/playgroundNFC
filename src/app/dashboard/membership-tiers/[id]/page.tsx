import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import Container from "@/components/Container";
import MembershipTierForm from "@/components/dashboard/MembershipTierForm";
import { getSessionUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import type { MembershipTier } from "@/lib/types";

export const metadata: Metadata = {
  title: "Edit Membership Tier",
};

export default async function EditMembershipTierPage({
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

  const tier = await db.membershipTier.findUnique({ where: { id } });
  if (!tier) notFound();

  return (
    <div className="bg-cream py-16 sm:py-20">
      <Container className="max-w-2xl">
        <Link
          href="/dashboard/membership-tiers"
          className="font-display text-sm uppercase tracking-wide text-crimson hover:text-crimson-dark"
        >
          &larr; Manage Membership Tiers
        </Link>
        <h1 className="mt-2 font-display text-4xl text-charcoal sm:text-5xl">
          Edit Membership Tier
        </h1>

        <div className="mt-8 rounded-xl border border-cream-dark bg-white/60 p-6 shadow-sm">
          <MembershipTierForm tier={tier as MembershipTier & { id: string }} />
        </div>
      </Container>
    </div>
  );
}
