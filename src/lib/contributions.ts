import { db } from "@/lib/db";
import type { MembershipTier } from "@/lib/types";

export async function listContributions(memberId: string) {
  return db.contribution.findMany({
    where: { memberId },
    orderBy: [{ periodYear: "desc" }, { date: "desc" }],
  });
}

export interface ContributionEntry {
  id: string;
  amount: number;
  date: Date;
}

export interface PeriodGroup {
  tierSlug: string;
  tierName: string;
  periodYear: number;
  entries: ContributionEntry[];
  paid: number;
  feeAmount: number;
  // feeAmount - paid. Positive = still owed, negative = overpaid, 0 = settled.
  outstanding: number;
}

/**
 * Groups a member's contributions by (tierSlug, periodYear) — each group is
 * the itemized entries plus the computed outstanding balance for that
 * period. Outstanding is never stored, only derived here from the tier's
 * feeAmount minus what's actually been recorded.
 */
export function groupContributionsByPeriod(
  contributions: Array<{
    id: string;
    amount: number;
    date: Date;
    tierSlug: string;
    periodYear: number;
  }>,
  tiers: MembershipTier[]
): PeriodGroup[] {
  const tierBySlug = new Map(tiers.map((t) => [t.slug, t]));
  const groups = new Map<string, PeriodGroup>();

  for (const c of contributions) {
    const key = `${c.periodYear}-${c.tierSlug}`;
    let group = groups.get(key);
    if (!group) {
      const tier = tierBySlug.get(c.tierSlug);
      group = {
        tierSlug: c.tierSlug,
        tierName: tier?.name ?? c.tierSlug,
        periodYear: c.periodYear,
        entries: [],
        paid: 0,
        feeAmount: tier?.feeAmount ?? 0,
        outstanding: 0,
      };
      groups.set(key, group);
    }
    group.entries.push({ id: c.id, amount: c.amount, date: c.date });
    group.paid += c.amount;
  }

  for (const group of groups.values()) {
    group.outstanding = group.feeAmount - group.paid;
    group.entries.sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  return [...groups.values()].sort(
    (a, b) => b.periodYear - a.periodYear || a.tierName.localeCompare(b.tierName)
  );
}
