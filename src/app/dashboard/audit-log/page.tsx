import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Container from "@/components/Container";
import { getSessionUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";

export const metadata: Metadata = {
  title: "Audit Log",
};

export const dynamic = "force-dynamic";

// A first pass keeps this a simple reverse-chronological list — no
// pagination, search, or export until real usage calls for it. See
// docs/features/audit-log.md's Out of scope.
const ENTRY_LIMIT = 200;

export default async function AuditLogPage() {
  const user = await getSessionUser();
  if (!user) return null;
  if (!user.isSuperAdmin) {
    redirect("/dashboard");
  }

  const entries = await db.auditEntry.findMany({
    orderBy: { createdAt: "desc" },
    take: ENTRY_LIMIT,
    include: { actor: { select: { name: true, email: true } } },
  });

  return (
    <div className="bg-cream py-16 sm:py-20">
      <Container>
        <span className="font-display text-sm uppercase tracking-[0.3em] text-crimson">
          Super-Admin Area
        </span>
        <h1 className="mt-2 font-display text-4xl text-charcoal sm:text-5xl">
          Audit Log
        </h1>
        <p className="mt-3 text-charcoal-soft">
          Who did what to what, and when — across accounts, events, roster
          profiles, and fee records. No before/after diffs. Most recent{" "}
          {ENTRY_LIMIT} entries.
        </p>

        <div className="mt-10 overflow-x-auto rounded-xl border border-cream-dark bg-white/60 shadow-sm">
          <table className="w-full min-w-[640px] text-left">
            <thead>
              <tr className="border-b border-cream-dark bg-cream-dark/60">
                <th className="p-3 font-display text-xs uppercase tracking-wide text-charcoal-soft">
                  When
                </th>
                <th className="p-3 font-display text-xs uppercase tracking-wide text-charcoal-soft">
                  Actor
                </th>
                <th className="p-3 font-display text-xs uppercase tracking-wide text-charcoal-soft">
                  Action
                </th>
                <th className="p-3 font-display text-xs uppercase tracking-wide text-charcoal-soft">
                  Target
                </th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id} className="border-b border-cream-dark/60">
                  <td className="p-3 text-sm text-charcoal-soft">
                    {entry.createdAt.toLocaleString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="p-3 text-charcoal">
                    {entry.actor.name}
                    <span className="ml-1 text-xs text-charcoal-soft">
                      {entry.actor.email}
                    </span>
                  </td>
                  <td className="p-3 text-sm text-charcoal-soft">
                    {entry.action}
                  </td>
                  <td className="p-3 text-sm text-charcoal-soft">
                    {entry.targetType} &middot; {entry.targetId}
                  </td>
                </tr>
              ))}
              {entries.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-charcoal-soft/70">
                    No audit entries yet.
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
