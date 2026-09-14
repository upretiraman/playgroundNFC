"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setUserActive } from "@/app/dashboard/users/actions";

export default function ToggleActiveButton({
  userId,
  isActive,
  memberName,
}: {
  userId: string;
  isActive: boolean;
  memberName: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const label = isActive ? "Deactivate Account" : "Reactivate Account";
  const confirmMessage = isActive
    ? `Deactivate ${memberName}? They will no longer be able to log in. Their events, attendance, and roster entry are kept.`
    : `Reactivate ${memberName}? They will be able to log in again.`;

  return (
    <div>
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (!confirm(confirmMessage)) return;
          setError(null);
          startTransition(async () => {
            try {
              await setUserActive(userId, !isActive);
              router.refresh();
            } catch (e) {
              setError(e instanceof Error ? e.message : "Something went wrong.");
            }
          });
        }}
        className={`rounded border px-4 py-2.5 font-display text-xs uppercase tracking-wide disabled:opacity-60 ${
          isActive
            ? "border-cream-dark text-charcoal-soft hover:border-crimson hover:text-crimson"
            : "border-cream-dark text-charcoal-soft hover:border-gold hover:text-charcoal"
        }`}
      >
        {pending ? "Working..." : label}
      </button>
      {error && (
        <p className="mt-2 rounded bg-crimson/10 px-4 py-2 text-sm text-crimson">
          {error}
        </p>
      )}
    </div>
  );
}
