import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/Container";
import { getSessionUser } from "@/lib/auth-helpers";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const user = await getSessionUser();
  if (!user) return null; // middleware guarantees a session here

  const roleLabel: Record<typeof user.role, string> = {
    PLAYER: "Player",
    TRAINER: "Trainer",
    ADMIN: "Administrator",
  };

  return (
    <div className="bg-cream py-16 sm:py-20">
      <Container className="max-w-3xl">
        <span className="font-display text-sm uppercase tracking-[0.3em] text-crimson">
          {roleLabel[user.role]} Area
        </span>
        <h1 className="mt-2 font-display text-4xl text-charcoal sm:text-5xl">
          Welcome, {user.name}
        </h1>

        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          <Link
            href="/dashboard/schedule"
            className="rounded-xl border border-cream-dark bg-white/60 p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <p className="font-display text-lg text-charcoal">
              Training &amp; Game Schedule
            </p>
            <p className="mt-2 text-sm text-charcoal-soft">
              {user.role === "PLAYER"
                ? "See upcoming sessions, training plans, and your attendance."
                : "Schedule trainings and games, set plans, and mark attendance."}
            </p>
          </Link>

          {(user.role === "TRAINER" || user.role === "ADMIN") && (
            <Link
              href="/dashboard/schedule/new"
              className="rounded-xl border border-cream-dark bg-white/60 p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <p className="font-display text-lg text-charcoal">
                Schedule New Session
              </p>
              <p className="mt-2 text-sm text-charcoal-soft">
                Add a new training session or game to the calendar.
              </p>
            </Link>
          )}

          {user.role === "ADMIN" && (
            <Link
              href="/dashboard/users"
              className="rounded-xl border border-cream-dark bg-white/60 p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <p className="font-display text-lg text-charcoal">
                Manage Accounts
              </p>
              <p className="mt-2 text-sm text-charcoal-soft">
                Create Player, Trainer, and Administrator accounts.
              </p>
            </Link>
          )}

          {user.role === "ADMIN" && (
            <Link
              href="/dashboard/shop"
              className="rounded-xl border border-cream-dark bg-white/60 p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <p className="font-display text-lg text-charcoal">
                Manage Shop
              </p>
              <p className="mt-2 text-sm text-charcoal-soft">
                Add, edit, and remove merchandise on the club shop.
              </p>
            </Link>
          )}
        </div>
      </Container>
    </div>
  );
}
