import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import Container from "@/components/Container";
import DeleteNewsButton from "@/components/dashboard/DeleteNewsButton";
import { getSessionUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";

export const metadata: Metadata = {
  title: "Manage News",
};

export default async function DashboardNewsPage() {
  const user = await getSessionUser();
  if (!user) return null;
  if (!user.roles.includes("ADMIN")) {
    redirect("/dashboard");
  }

  const articles = await db.newsItem.findMany({ orderBy: { date: "desc" } });

  return (
    <div className="bg-cream py-16 sm:py-20">
      <Container>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="font-display text-sm uppercase tracking-[0.3em] text-crimson">
              Administrator
            </span>
            <h1 className="mt-2 font-display text-4xl text-charcoal sm:text-5xl">
              Manage News
            </h1>
          </div>
          <Link
            href="/dashboard/news/new"
            className="rounded bg-crimson px-5 py-2.5 font-display text-sm uppercase tracking-wide text-cream hover:bg-crimson-light"
          >
            Publish Article
          </Link>
        </div>

        <div className="mt-10 overflow-x-auto rounded-xl border border-cream-dark bg-white/60 shadow-sm">
          <table className="w-full min-w-[640px] text-left">
            <thead>
              <tr className="border-b border-cream-dark bg-cream-dark/60">
                <th className="p-3 font-display text-xs uppercase tracking-wide text-charcoal-soft">
                  Title
                </th>
                <th className="p-3 font-display text-xs uppercase tracking-wide text-charcoal-soft">
                  Date
                </th>
                <th className="p-3 font-display text-xs uppercase tracking-wide text-charcoal-soft">
                  Team
                </th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody>
              {articles.map((article) => (
                <tr key={article.id} className="border-b border-cream-dark/60">
                  <td className="p-3 text-charcoal">{article.title}</td>
                  <td className="p-3 text-sm text-charcoal-soft">
                    {article.date.toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="p-3 text-sm capitalize text-charcoal-soft">
                    {article.team ?? "—"}
                  </td>
                  <td className="p-3 text-right text-sm">
                    <Link
                      href={`/dashboard/news/${article.id}`}
                      className="font-display uppercase tracking-wide text-crimson hover:text-crimson-dark"
                    >
                      Edit
                    </Link>
                    <span className="mx-2 text-charcoal-soft/40">·</span>
                    <DeleteNewsButton
                      articleId={article.id}
                      articleTitle={article.title}
                    />
                  </td>
                </tr>
              ))}
              {articles.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-charcoal-soft/70">
                    No articles yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Container>
    </div>
  );
}
