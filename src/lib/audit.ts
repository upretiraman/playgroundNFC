import { db } from "@/lib/db";

/**
 * Records who did what to what, and when — no before/after diff, per
 * docs/features/audit-log.md. Called from every mutating server action so
 * each capability's write path stays a one-line addition. Read access is
 * restricted to super-admins (src/app/dashboard/audit-log/page.tsx).
 */
export async function logAuditEntry(entry: {
  actorId: string;
  action: string;
  targetType: string;
  targetId: string;
}) {
  await db.auditEntry.create({ data: entry });
}
