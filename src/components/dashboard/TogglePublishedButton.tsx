"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setPlayerPublished } from "@/app/dashboard/roster/actions";

export default function TogglePublishedButton({
  playerId,
  published,
  playerName,
}: {
  playerId: string;
  published: boolean;
  playerName: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const label = published ? "Unpublish" : "Publish";
  const confirmMessage = published
    ? `Unpublish ${playerName}? Their profile will come off the public site, but the roster entry and attendance history are kept.`
    : `Publish ${playerName}? Their name and profile become visible on the public site.`;

  return (
    <>
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (!confirm(confirmMessage)) return;
          setError(null);
          startTransition(async () => {
            try {
              await setPlayerPublished(playerId, !published);
              router.refresh();
            } catch (e) {
              setError(e instanceof Error ? e.message : "Something went wrong.");
            }
          });
        }}
        className="font-display uppercase tracking-wide text-charcoal-soft hover:text-crimson disabled:opacity-60"
      >
        {pending ? "Working..." : label}
      </button>
      {error && <span className="ml-2 text-xs text-crimson">{error}</span>}
    </>
  );
}
