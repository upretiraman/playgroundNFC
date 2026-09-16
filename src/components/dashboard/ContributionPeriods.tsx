import type { PeriodGroup } from "@/lib/contributions";

function formatEuro(amount: number) {
  return `€${amount.toFixed(2)}`;
}

function outstandingLabel(outstanding: number) {
  if (outstanding > 0) return `${formatEuro(outstanding)} outstanding`;
  if (outstanding < 0) return `${formatEuro(-outstanding)} overpaid`;
  return "Paid in full";
}

export default function ContributionPeriods({ groups }: { groups: PeriodGroup[] }) {
  if (groups.length === 0) {
    return <p className="text-charcoal-soft/70">No contributions recorded yet.</p>;
  }

  return (
    <div className="grid gap-6">
      {groups.map((group) => (
        <div
          key={`${group.periodYear}-${group.tierSlug}`}
          className="rounded-xl border border-cream-dark bg-white/60 shadow-sm"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-cream-dark bg-cream-dark/60 p-4">
            <div>
              <p className="font-display text-charcoal">
                {group.periodYear} &middot; {group.tierName}
              </p>
              <p className="text-xs text-charcoal-soft">
                {formatEuro(group.paid)} paid of {formatEuro(group.feeAmount)}
              </p>
            </div>
            <span
              className={`rounded-full px-3 py-0.5 text-xs font-display uppercase tracking-wide ${
                group.outstanding > 0
                  ? "bg-crimson/10 text-crimson"
                  : "bg-gold/20 text-charcoal"
              }`}
            >
              {outstandingLabel(group.outstanding)}
            </span>
          </div>
          <div className="divide-y divide-cream-dark">
            {group.entries.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between p-4 text-sm"
              >
                <span className="text-charcoal-soft">
                  {new Date(entry.date).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
                <span className="font-display text-charcoal">
                  {formatEuro(entry.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
