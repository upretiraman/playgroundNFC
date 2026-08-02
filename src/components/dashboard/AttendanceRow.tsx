"use client";

import { useState, useTransition } from "react";
import { setAttendance } from "@/app/dashboard/schedule/actions";
import { ATTENDANCE_STATUSES, type AttendanceStatusValue } from "@/lib/auth-types";

const STATUS_LABEL: Record<AttendanceStatusValue, string> = {
  PRESENT: "Present",
  ABSENT: "Absent",
  EXCUSED: "Excused",
  UNKNOWN: "Unmarked",
};

export default function AttendanceRow({
  eventId,
  playerSlug,
  playerName,
  playerMeta,
  initialStatus,
  initialNote,
  highlight,
}: {
  eventId: string;
  playerSlug: string;
  playerName: string;
  playerMeta: string;
  initialStatus: AttendanceStatusValue;
  initialNote: string;
  highlight: boolean;
}) {
  const [status, setStatus] = useState<AttendanceStatusValue>(initialStatus);
  const [note, setNote] = useState(initialNote);
  const [pending, startTransition] = useTransition();

  return (
    <form
      action={(formData) => {
        startTransition(async () => {
          await setAttendance(eventId, playerSlug, formData);
        });
      }}
      className={`grid grid-cols-1 items-center gap-3 rounded-lg p-3 sm:grid-cols-[1.5fr_1fr_1.5fr_auto] ${
        highlight ? "bg-crimson/5" : ""
      }`}
    >
      <div>
        <p className="font-display text-charcoal">{playerName}</p>
        <p className="text-xs text-charcoal-soft">{playerMeta}</p>
      </div>
      <select
        name="status"
        value={status}
        onChange={(e) => setStatus(e.target.value as AttendanceStatusValue)}
        className="rounded border border-cream-dark bg-white px-3 py-2 text-sm text-charcoal focus:border-crimson focus:outline-none"
      >
        {ATTENDANCE_STATUSES.map((s) => (
          <option key={s} value={s}>
            {STATUS_LABEL[s]}
          </option>
        ))}
      </select>
      <input
        name="note"
        type="text"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Note (optional)"
        className="rounded border border-cream-dark bg-white px-3 py-2 text-sm text-charcoal focus:border-crimson focus:outline-none"
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded border border-crimson px-4 py-2 font-display text-xs uppercase tracking-wide text-crimson transition-colors hover:bg-crimson hover:text-cream disabled:opacity-60"
      >
        {pending ? "..." : "Save"}
      </button>
    </form>
  );
}
