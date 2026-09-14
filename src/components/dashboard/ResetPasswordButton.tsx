"use client";

import { useState, useTransition } from "react";
import { resetUserPassword } from "@/app/dashboard/users/actions";

export default function ResetPasswordButton({ userId }: { userId: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState<string | null>(null);

  return (
    <div>
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (!confirm("Issue a new temporary password for this account?")) return;
          setError(null);
          setNewPassword(null);
          startTransition(async () => {
            try {
              const password = await resetUserPassword(userId);
              setNewPassword(password);
            } catch (e) {
              setError(e instanceof Error ? e.message : "Something went wrong.");
            }
          });
        }}
        className="rounded border border-cream-dark px-4 py-2.5 font-display text-xs uppercase tracking-wide text-charcoal-soft hover:border-crimson hover:text-crimson disabled:opacity-60"
      >
        {pending ? "Resetting..." : "Reset Password"}
      </button>
      {error && (
        <p className="mt-2 rounded bg-crimson/10 px-4 py-2 text-sm text-crimson">
          {error}
        </p>
      )}
      {newPassword && (
        <div className="mt-2 rounded bg-gold/10 px-4 py-2 text-sm text-charcoal">
          <p>
            New temporary password: <span className="font-mono">{newPassword}</span>
          </p>
          <p className="mt-1 text-xs text-charcoal-soft">
            Share this with the member yourself — it&apos;s shown only here. They
            will be asked to set their own password on next login.
          </p>
        </div>
      )}
    </div>
  );
}
