import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/Container";
import { repository } from "@/lib/repository";

export const metadata: Metadata = {
  title: "News",
  description:
    "Updates, match results, and milestones from NFC Nürnberg's boys' and girls' teams.",
};

export default async function NewsPage() {
  const news = await repository.getNews();

  return (
    <div className="bg-cream py-16 sm:py-20">
      <Container>
        <div className="mb-12 text-center">
          <span className="font-display text-sm uppercase tracking-[0.3em] text-crimson">
            Club Updates
          </span>
          <h1 className="mt-2 font-display text-4xl text-charcoal sm:text-5xl">
            News
          </h1>
        </div>

        <div className="mx-auto grid max-w-3xl gap-6">
          {news.map((item) => (
            <Link
              key={item.slug}
              href={`/news/${item.slug}`}
              className="rounded-xl border border-cream-dark bg-white/50 p-6 shadow-sm transition-shadow hover:shadow-md sm:p-8"
            >
              <div className="flex flex-wrap items-center gap-3">
                <p className="font-display text-xs uppercase tracking-wide text-crimson">
                  {new Date(item.date).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
                {item.team && (
                  <span className="rounded-full bg-cream-dark px-3 py-0.5 text-xs capitalize text-charcoal-soft">
                    {item.team === "both" ? "Club-wide" : `${item.team} team`}
                  </span>
                )}
              </div>
              <h2 className="mt-2 font-display text-xl text-charcoal sm:text-2xl">
                {item.title}
              </h2>
              <p className="mt-2 text-charcoal-soft">{item.summary}</p>
            </Link>
          ))}
        </div>
      </Container>
    </div>
  );
}
