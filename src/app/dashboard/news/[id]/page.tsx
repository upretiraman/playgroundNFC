import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import Container from "@/components/Container";
import NewsForm from "@/components/dashboard/NewsForm";
import { getSessionUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import type { NewsItem } from "@/lib/types";

export const metadata: Metadata = {
  title: "Edit Article",
};

export default async function EditNewsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getSessionUser();
  if (!user) return null;
  if (!user.roles.includes("ADMIN")) {
    redirect("/dashboard");
  }

  const article = await db.newsItem.findUnique({ where: { id } });
  if (!article) notFound();

  return (
    <div className="bg-cream py-16 sm:py-20">
      <Container className="max-w-2xl">
        <Link
          href="/dashboard/news"
          className="font-display text-sm uppercase tracking-wide text-crimson hover:text-crimson-dark"
        >
          &larr; Manage News
        </Link>
        <h1 className="mt-2 font-display text-4xl text-charcoal sm:text-5xl">
          Edit Article
        </h1>

        <div className="mt-8 rounded-xl border border-cream-dark bg-white/60 p-6 shadow-sm">
          <NewsForm
            article={
              {
                ...article,
                date: article.date.toISOString(),
              } as NewsItem & { id: string }
            }
          />
        </div>
      </Container>
    </div>
  );
}
