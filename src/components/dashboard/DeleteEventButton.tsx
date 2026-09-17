"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteEvent } from "@/app/dashboard/schedule/actions";

export default function DeleteEventButton({ eventId }: { eventId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <>
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (
            !confirm(
              "Cancel this session? It will stop showing on the schedule and this can't be undone."
            )
          )
            return;
          setError(null);
          startTransition(async () => {
            try {
              await deleteEvent(eventId);
              router.push("/dashboard/schedule");
            } catch (e) {
              setError(e instanceof Error ? e.message : "Something went wrong.");
            }
          });
        }}
        className="font-display text-sm uppercase tracking-wide text-charcoal-soft hover:text-crimson disabled:opacity-60"
      >
        {pending ? "Cancelling..." : "Cancel Session"}
      </button>
      {error && <span className="ml-2 text-xs text-crimson">{error}</span>}
    </>
  );
}
