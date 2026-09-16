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

  const roleLabel: Record<string, string> = {
    PLAYER: "Player",
    TRAINER: "Trainer",
    ADMIN: "Administrator",
  };
  const areaLabel = user.roles.map((r) => roleLabel[r]).join(" + ");

  return (
    <div className="bg-cream py-16 sm:py-20">
      <Container className="max-w-3xl">
        <span className="font-display text-sm uppercase tracking-[0.3em] text-crimson">
          {areaLabel} Area
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
              {user.roles.includes("TRAINER") || user.roles.includes("ADMIN")
                ? "Schedule trainings and games, set plans, and mark attendance."
                : "See upcoming sessions, training plans, and your attendance."}
            </p>
          </Link>

          {(user.roles.includes("TRAINER") || user.roles.includes("ADMIN")) && (
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

          {(user.roles.includes("TRAINER") || user.roles.includes("ADMIN")) && (
            <Link
              href="/dashboard/attendance"
              className="rounded-xl border border-cream-dark bg-white/60 p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <p className="font-display text-lg text-charcoal">
                Attendance Reports
              </p>
              <p className="mt-2 text-sm text-charcoal-soft">
                Per-player and per-team attendance summaries.
              </p>
            </Link>
          )}

          {(user.roles.includes("PLAYER") || user.roles.includes("ADMIN")) && (
            <Link
              href="/dashboard/fees"
              className="rounded-xl border border-cream-dark bg-white/60 p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <p className="font-display text-lg text-charcoal">
                Fee Records
              </p>
              <p className="mt-2 text-sm text-charcoal-soft">
                {user.roles.includes("ADMIN")
                  ? "Record contributions and see every member's outstanding balance."
                  : "See your contribution history and what's outstanding."}
              </p>
            </Link>
          )}

          {user.roles.includes("ADMIN") && (
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

          {user.roles.includes("ADMIN") && (
            <Link
              href="/dashboard/roster"
              className="rounded-xl border border-cream-dark bg-white/60 p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <p className="font-display text-lg text-charcoal">
                Manage Roster
              </p>
              <p className="mt-2 text-sm text-charcoal-soft">
                Create, edit, and publish or unpublish player profiles.
              </p>
            </Link>
          )}

          {user.roles.includes("ADMIN") && (
            <Link
              href="/dashboard/news"
              className="rounded-xl border border-cream-dark bg-white/60 p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <p className="font-display text-lg text-charcoal">
                Manage News
              </p>
              <p className="mt-2 text-sm text-charcoal-soft">
                Publish, edit, and remove news articles.
              </p>
            </Link>
          )}

          {user.roles.includes("ADMIN") && (
            <Link
              href="/dashboard/club-info"
              className="rounded-xl border border-cream-dark bg-white/60 p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <p className="font-display text-lg text-charcoal">
                Club Info
              </p>
              <p className="mt-2 text-sm text-charcoal-soft">
                Edit mission, motto, values, and contact details.
              </p>
            </Link>
          )}

          {user.roles.includes("ADMIN") && (
            <Link
              href="/dashboard/committee"
              className="rounded-xl border border-cream-dark bg-white/60 p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <p className="font-display text-lg text-charcoal">
                Manage Committee
              </p>
              <p className="mt-2 text-sm text-charcoal-soft">
                Create, edit, and remove committee roles.
              </p>
            </Link>
          )}

          {user.roles.includes("ADMIN") && (
            <Link
              href="/dashboard/membership-tiers"
              className="rounded-xl border border-cream-dark bg-white/60 p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <p className="font-display text-lg text-charcoal">
                Membership Tiers
              </p>
              <p className="mt-2 text-sm text-charcoal-soft">
                Create, edit, and remove membership tiers.
              </p>
            </Link>
          )}

          {user.roles.includes("ADMIN") && (
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

          {user.isSuperAdmin && (
            <Link
              href="/dashboard/audit-log"
              className="rounded-xl border border-cream-dark bg-white/60 p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <p className="font-display text-lg text-charcoal">
                Audit Log
              </p>
              <p className="mt-2 text-sm text-charcoal-soft">
                Who did what to what, and when.
              </p>
            </Link>
          )}
        </div>
      </Container>
    </div>
  );
}
