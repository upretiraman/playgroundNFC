"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateClubInfo } from "@/app/dashboard/club-info/actions";
import type { ClubInfo } from "@/lib/types";

export default function ClubInfoForm({ club }: { club: ClubInfo }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <form
      action={(formData) => {
        setError(null);
        setSuccess(false);
        startTransition(async () => {
          try {
            await updateClubInfo(formData);
            setSuccess(true);
            router.refresh();
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
      {success && (
        <p className="rounded bg-gold/10 px-4 py-2 text-sm text-charcoal">
          Saved.
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="name"
            className="font-display text-xs uppercase tracking-wide text-charcoal-soft"
          >
            Club Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            defaultValue={club.name}
            className="mt-1 w-full rounded border border-cream-dark bg-white px-4 py-2.5 text-charcoal focus:border-crimson focus:outline-none"
          />
        </div>
        <div>
          <label
            htmlFor="shortName"
            className="font-display text-xs uppercase tracking-wide text-charcoal-soft"
          >
            Short Name
          </label>
          <input
            id="shortName"
            name="shortName"
            type="text"
            required
            defaultValue={club.shortName}
            className="mt-1 w-full rounded border border-cream-dark bg-white px-4 py-2.5 text-charcoal focus:border-crimson focus:outline-none"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label
            htmlFor="foundedYear"
            className="font-display text-xs uppercase tracking-wide text-charcoal-soft"
          >
            Founded Year
          </label>
          <input
            id="foundedYear"
            name="foundedYear"
            type="number"
            required
            defaultValue={club.foundedYear}
            className="mt-1 w-full rounded border border-cream-dark bg-white px-4 py-2.5 text-charcoal focus:border-crimson focus:outline-none"
          />
        </div>
        <div>
          <label
            htmlFor="city"
            className="font-display text-xs uppercase tracking-wide text-charcoal-soft"
          >
            City
          </label>
          <input
            id="city"
            name="city"
            type="text"
            required
            defaultValue={club.city}
            className="mt-1 w-full rounded border border-cream-dark bg-white px-4 py-2.5 text-charcoal focus:border-crimson focus:outline-none"
          />
        </div>
        <div>
          <label
            htmlFor="country"
            className="font-display text-xs uppercase tracking-wide text-charcoal-soft"
          >
            Country
          </label>
          <input
            id="country"
            name="country"
            type="text"
            required
            defaultValue={club.country}
            className="mt-1 w-full rounded border border-cream-dark bg-white px-4 py-2.5 text-charcoal focus:border-crimson focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="motto"
          className="font-display text-xs uppercase tracking-wide text-charcoal-soft"
        >
          Motto
        </label>
        <input
          id="motto"
          name="motto"
          type="text"
          required
          defaultValue={club.motto}
          className="mt-1 w-full rounded border border-cream-dark bg-white px-4 py-2.5 text-charcoal focus:border-crimson focus:outline-none"
        />
      </div>

      <div>
        <label
          htmlFor="values"
          className="font-display text-xs uppercase tracking-wide text-charcoal-soft"
        >
          Values (one per line)
        </label>
        <textarea
          id="values"
          name="values"
          rows={3}
          required
          defaultValue={club.values.join("\n")}
          className="mt-1 w-full rounded border border-cream-dark bg-white px-4 py-2.5 text-charcoal focus:border-crimson focus:outline-none"
        />
      </div>

      <div>
        <label
          htmlFor="mission"
          className="font-display text-xs uppercase tracking-wide text-charcoal-soft"
        >
          Mission
        </label>
        <textarea
          id="mission"
          name="mission"
          rows={4}
          required
          defaultValue={club.mission}
          className="mt-1 w-full rounded border border-cream-dark bg-white px-4 py-2.5 text-charcoal focus:border-crimson focus:outline-none"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label
            htmlFor="email"
            className="font-display text-xs uppercase tracking-wide text-charcoal-soft"
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            defaultValue={club.email}
            className="mt-1 w-full rounded border border-cream-dark bg-white px-4 py-2.5 text-charcoal focus:border-crimson focus:outline-none"
          />
        </div>
        <div>
          <label
            htmlFor="instagram"
            className="font-display text-xs uppercase tracking-wide text-charcoal-soft"
          >
            Instagram URL (optional)
          </label>
          <input
            id="instagram"
            name="instagram"
            type="text"
            defaultValue={club.instagram ?? ""}
            className="mt-1 w-full rounded border border-cream-dark bg-white px-4 py-2.5 text-charcoal focus:border-crimson focus:outline-none"
          />
        </div>
        <div>
          <label
            htmlFor="whatsapp"
            className="font-display text-xs uppercase tracking-wide text-charcoal-soft"
          >
            WhatsApp URL (optional)
          </label>
          <input
            id="whatsapp"
            name="whatsapp"
            type="text"
            defaultValue={club.whatsapp ?? ""}
            className="mt-1 w-full rounded border border-cream-dark bg-white px-4 py-2.5 text-charcoal focus:border-crimson focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="address"
          className="font-display text-xs uppercase tracking-wide text-charcoal-soft"
        >
          Address
        </label>
        <input
          id="address"
          name="address"
          type="text"
          required
          defaultValue={club.address}
          className="mt-1 w-full rounded border border-cream-dark bg-white px-4 py-2.5 text-charcoal focus:border-crimson focus:outline-none"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="rounded bg-crimson px-6 py-3 font-display text-sm uppercase tracking-wide text-cream transition-colors hover:bg-crimson-light disabled:opacity-60"
      >
        {pending ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
}
