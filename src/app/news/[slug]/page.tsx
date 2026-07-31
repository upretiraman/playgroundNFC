import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Container from "@/components/Container";
import { repository } from "@/lib/repository";

export async function generateStaticParams() {
  const news = await repository.getNews();
  return news.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const item = await repository.getNewsItem(slug);
  if (!item) return {};
  return {
    title: item.title,
    description: item.summary,
  };
}

export default async function NewsItemPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = await repository.getNewsItem(slug);
  if (!item) notFound();

  return (
    <div className="bg-cream py-16 sm:py-20">
      <Container className="max-w-2xl">
        <Link
          href="/news"
          className="font-display text-sm uppercase tracking-wide text-crimson hover:text-crimson-dark"
        >
          &larr; All news
        </Link>

        <p className="mt-8 font-display text-xs uppercase tracking-wide text-crimson">
          {new Date(item.date).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
        <h1 className="mt-2 font-display text-3xl text-charcoal sm:text-4xl">
          {item.title}
        </h1>
        <p className="mt-6 text-lg text-charcoal-soft">{item.body}</p>
      </Container>
    </div>
  );
}
