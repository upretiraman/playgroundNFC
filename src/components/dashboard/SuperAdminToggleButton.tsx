"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setSuperAdmin } from "@/app/dashboard/users/actions";

export default function SuperAdminToggleButton({
  userId,
  isSuperAdmin,
  memberName,
  isLastSuperAdmin,
}: {
  userId: string;
  isSuperAdmin: boolean;
  memberName: string;
  isLastSuperAdmin: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const blocked = isSuperAdmin && isLastSuperAdmin;
  const label = isSuperAdmin ? "Revoke Super-admin" : "Grant Super-admin";
  const confirmMessage = isSuperAdmin
    ? `Revoke super-admin access from ${memberName}? They will keep their Administrator role but lose the ability to manage fellow Admins, grant/revoke this flag, or read the audit log.`
    : `Grant super-admin access to ${memberName}? They will be able to manage fellow Administrators, grant/revoke this flag, and read the audit log.`;

  return (
    <div>
      <button
        type="button"
        disabled={pending || blocked}
        onClick={() => {
          if (!confirm(confirmMessage)) return;
          setError(null);
          startTransition(async () => {
            try {
              await setSuperAdmin(userId, !isSuperAdmin);
              router.refresh();
            } catch (e) {
              setError(e instanceof Error ? e.message : "Something went wrong.");
            }
          });
        }}
        className={`rounded border px-4 py-2.5 font-display text-xs uppercase tracking-wide disabled:opacity-60 ${
          isSuperAdmin
            ? "border-cream-dark text-charcoal-soft hover:border-crimson hover:text-crimson"
            : "border-cream-dark text-charcoal-soft hover:border-gold hover:text-charcoal"
        }`}
      >
        {pending ? "Working..." : label}
      </button>
      {blocked && (
        <p className="mt-2 text-xs text-charcoal-soft/70">
          This is the last active super-admin — the flag can&apos;t be
          revoked until another account holds it.
        </p>
      )}
      {error && (
        <p className="mt-2 rounded bg-crimson/10 px-4 py-2 text-sm text-crimson">
          {error}
        </p>
      )}
    </div>
  );
}
