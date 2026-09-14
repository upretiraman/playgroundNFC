"use client";

import { useState, useTransition } from "react";
import { signOut } from "next-auth/react";
import { changeOwnPassword } from "@/app/dashboard/change-password/actions";

export default function ChangePasswordForm() {
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();

  if (done) {
    return (
      <p className="rounded bg-gold/10 px-4 py-3 text-sm text-charcoal">
        Password changed. Signing you out — log back in with your new
        password.
      </p>
    );
  }

  return (
    <form
      action={(formData) => {
        setError(null);
        startTransition(async () => {
          try {
            await changeOwnPassword(formData);
            setDone(true);
            await signOut({ callbackUrl: "/login" });
          } catch (e) {
            setError(e instanceof Error ? e.message : "Something went wrong.");
          }
        });
      }}
      className="grid gap-5"
    >
      {error && (
        <p className="rounded bg-crimson/10 px-4 py-2 text-sm text-crimson">
          {error}
        </p>
      )}
      <div>
        <label
          htmlFor="newPassword"
          className="font-display text-xs uppercase tracking-wide text-charcoal-soft"
        >
          New Password
        </label>
        <input
          id="newPassword"
          name="newPassword"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="mt-1 w-full rounded border border-cream-dark bg-white px-4 py-2.5 text-charcoal focus:border-crimson focus:outline-none"
        />
        <p className="mt-1 text-xs text-charcoal-soft/70">
          At least 8 characters. You&apos;ll be signed out and asked to log in
          again with it.
        </p>
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded bg-crimson px-6 py-3 font-display text-sm uppercase tracking-wide text-cream transition-colors hover:bg-crimson-light disabled:opacity-60"
      >
        {pending ? "Saving..." : "Set New Password"}
      </button>
    </form>
  );
}
