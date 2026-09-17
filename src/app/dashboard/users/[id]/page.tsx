import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import Container from "@/components/Container";
import EditUserForm from "@/components/dashboard/EditUserForm";
import ResetPasswordButton from "@/components/dashboard/ResetPasswordButton";
import ToggleActiveButton from "@/components/dashboard/ToggleActiveButton";
import { canManageAdmins, getSessionUser } from "@/lib/auth-helpers";
import { parseRoles } from "@/lib/auth-types";
import { db } from "@/lib/db";
import { repository } from "@/lib/repository";

export const metadata: Metadata = {
  title: "Edit Account",
};

export default async function EditUserPage({
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

  const [target, players] = await Promise.all([
    db.user.findUnique({ where: { id } }),
    repository.getPlayers(undefined, { includeUnpublished: true }),
  ]);
  if (!target) notFound();

  const targetRoles = parseRoles(target.roles);
  if (targetRoles.includes("ADMIN") && !canManageAdmins(user)) {
    redirect("/dashboard/users");
  }

  // `User.team` is nulled whenever Player isn't in the role set (it's
  // meaningless for Trainer/Admin), so re-adding Player after a removal has
  // no team to default to. Fall back to the still-linked roster entry's own
  // team so the form pre-selects the team that actually matches it, rather
  // than a hardcoded default that would filter it out of the dropdown.
  const linkedPlayerTeam = target.playerSlug
    ? players.find((p) => p.slug === target.playerSlug)?.team ?? null
    : null;

  return (
    <div className="bg-cream py-16 sm:py-20">
      <Container className="max-w-2xl">
        <Link
          href="/dashboard/users"
          className="font-display text-sm uppercase tracking-wide text-crimson hover:text-crimson-dark"
        >
          &larr; Manage Accounts
        </Link>
        <h1 className="mt-2 font-display text-4xl text-charcoal sm:text-5xl">
          Edit Account
        </h1>
        <p className="mt-2 text-charcoal-soft">{target.email}</p>

        <div className="mt-8 rounded-xl border border-cream-dark bg-white/60 p-8 shadow-sm">
          <EditUserForm
            userId={target.id}
            players={players.map((p) => ({
              slug: p.slug,
              name: p.name,
              team: p.team,
            }))}
            isSuperAdmin={user.isSuperAdmin}
            initialName={target.name}
            initialEmail={target.email}
            initialRoles={targetRoles}
            initialTeam={(target.team as "boys" | "girls" | null) ?? linkedPlayerTeam}
            initialPlayerSlug={target.playerSlug}
          />
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-cream-dark bg-white/60 p-6 shadow-sm">
            <h2 className="font-display text-sm uppercase tracking-wide text-charcoal-soft">
              Password
            </h2>
            <p className="mt-1 text-sm text-charcoal-soft">
              Issue a new temporary password. The member must set their own on
              next login.
            </p>
            <div className="mt-4">
              <ResetPasswordButton userId={target.id} />
            </div>
          </div>

          <div className="rounded-xl border border-cream-dark bg-white/60 p-6 shadow-sm">
            <h2 className="font-display text-sm uppercase tracking-wide text-charcoal-soft">
              Account Status
            </h2>
            <p className="mt-1 text-sm text-charcoal-soft">
              {target.isActive
                ? "Active — can log in."
                : "Disabled — cannot log in. History is retained."}
            </p>
            <div className="mt-4">
              {target.id === user.id ? (
                <p className="text-xs text-charcoal-soft/70">
                  You cannot deactivate your own account.
                </p>
              ) : (
                <ToggleActiveButton
                  userId={target.id}
                  isActive={target.isActive}
                  memberName={target.name}
                />
              )}
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
