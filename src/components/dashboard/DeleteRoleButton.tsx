"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteRole } from "@/app/dashboard/committee/actions";

export default function DeleteRoleButton({
  roleId,
  roleTitle,
}: {
  roleId: string;
  roleTitle: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <>
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (!confirm(`Delete "${roleTitle}"? This can't be undone.`)) return;
          setError(null);
          startTransition(async () => {
            try {
              await deleteRole(roleId);
              router.refresh();
            } catch (e) {
              setError(e instanceof Error ? e.message : "Something went wrong.");
            }
          });
        }}
        className="font-display uppercase tracking-wide text-charcoal-soft hover:text-crimson disabled:opacity-60"
      >
        {pending ? "Deleting..." : "Delete"}
      </button>
      {error && <span className="ml-2 text-xs text-crimson">{error}</span>}
    </>
  );
}
