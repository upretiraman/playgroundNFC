"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createNewsArticle, updateNewsArticle } from "@/app/dashboard/news/actions";
import type { NewsItem } from "@/lib/types";

export default function NewsForm({ article }: { article?: NewsItem & { id: string } }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      action={(formData) => {
        setError(null);
        startTransition(async () => {
          try {
            const { id } = article
              ? await updateNewsArticle(article.id, formData)
              : await createNewsArticle(formData);
            router.push(`/dashboard/news/${id}`);
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

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="title"
            className="font-display text-xs uppercase tracking-wide text-charcoal-soft"
          >
            Title
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            defaultValue={article?.title}
            className="mt-1 w-full rounded border border-cream-dark bg-white px-4 py-2.5 text-charcoal focus:border-crimson focus:outline-none"
          />
        </div>

        {!article && (
          <div>
            <label
              htmlFor="slug"
              className="font-display text-xs uppercase tracking-wide text-charcoal-soft"
            >
              Slug (optional)
            </label>
            <input
              id="slug"
              name="slug"
              type="text"
              placeholder="auto-generated from title"
              className="mt-1 w-full rounded border border-cream-dark bg-white px-4 py-2.5 text-charcoal focus:border-crimson focus:outline-none"
            />
          </div>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="date"
            className="font-display text-xs uppercase tracking-wide text-charcoal-soft"
          >
            Date
          </label>
          <input
            id="date"
            name="date"
            type="date"
            required
            defaultValue={article?.date?.slice(0, 10)}
            className="mt-1 w-full rounded border border-cream-dark bg-white px-4 py-2.5 text-charcoal focus:border-crimson focus:outline-none"
          />
        </div>
        <div>
          <label
            htmlFor="team"
            className="font-display text-xs uppercase tracking-wide text-charcoal-soft"
          >
            Team (optional)
          </label>
          <select
            id="team"
            name="team"
            defaultValue={article?.team ?? ""}
            className="mt-1 w-full rounded border border-cream-dark bg-white px-4 py-2.5 text-charcoal focus:border-crimson focus:outline-none"
          >
            <option value="">None</option>
            <option value="boys">Boys Team</option>
            <option value="girls">Girls Team</option>
            <option value="both">Club-wide</option>
          </select>
        </div>
      </div>

      <div>
        <label
          htmlFor="summary"
          className="font-display text-xs uppercase tracking-wide text-charcoal-soft"
        >
          Summary
        </label>
        <textarea
          id="summary"
          name="summary"
          rows={2}
          required
          defaultValue={article?.summary}
          className="mt-1 w-full rounded border border-cream-dark bg-white px-4 py-2.5 text-charcoal focus:border-crimson focus:outline-none"
        />
      </div>

      <div>
        <label
          htmlFor="body"
          className="font-display text-xs uppercase tracking-wide text-charcoal-soft"
        >
          Body
        </label>
        <textarea
          id="body"
          name="body"
          rows={6}
          required
          defaultValue={article?.body}
          className="mt-1 w-full rounded border border-cream-dark bg-white px-4 py-2.5 text-charcoal focus:border-crimson focus:outline-none"
        />
      </div>

      <div>
        <label
          htmlFor="coverImage"
          className="font-display text-xs uppercase tracking-wide text-charcoal-soft"
        >
          Cover Image URL (optional)
        </label>
        <input
          id="coverImage"
          name="coverImage"
          type="text"
          placeholder="/news/cover.jpg"
          defaultValue={article?.coverImage ?? ""}
          className="mt-1 w-full rounded border border-cream-dark bg-white px-4 py-2.5 text-charcoal focus:border-crimson focus:outline-none"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="rounded bg-crimson px-6 py-3 font-display text-sm uppercase tracking-wide text-cream transition-colors hover:bg-crimson-light disabled:opacity-60"
      >
        {pending
          ? article
            ? "Saving..."
            : "Publishing..."
          : article
            ? "Save Changes"
            : "Publish Article"}
      </button>
    </form>
  );
}
