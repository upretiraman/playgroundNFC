import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import Container from "@/components/Container";
import NewUserForm from "@/components/dashboard/NewUserForm";
import { getSessionUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { repository } from "@/lib/repository";
import { parseRoles } from "@/lib/auth-types";

export const metadata: Metadata = {
  title: "Manage Accounts",
};

const ROLE_LABEL: Record<string, string> = {
  PLAYER: "Player",
  TRAINER: "Trainer",
  ADMIN: "Administrator",
};

export default async function UsersPage() {
  const user = await getSessionUser();
  if (!user) return null;
  if (!user.roles.includes("ADMIN")) {
    redirect("/dashboard");
  }

  const [users, players] = await Promise.all([
    db.user.findMany({ orderBy: { createdAt: "asc" } }),
    repository.getPlayers(),
  ]);

  return (
    <div className="bg-cream py-16 sm:py-20">
      <Container>
        <span className="font-display text-sm uppercase tracking-[0.3em] text-crimson">
          Administrator
        </span>
        <h1 className="mt-2 font-display text-4xl text-charcoal sm:text-5xl">
          Manage Accounts
        </h1>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <h2 className="font-display text-xl text-charcoal">
              Existing Accounts
            </h2>
            <div className="mt-4 overflow-x-auto rounded-xl border border-cream-dark bg-white/60 shadow-sm">
              <table className="w-full min-w-[480px] text-left">
                <thead>
                  <tr className="border-b border-cream-dark bg-cream-dark/60">
                    <th className="p-3 font-display text-xs uppercase tracking-wide text-charcoal-soft">
                      Name
                    </th>
                    <th className="p-3 font-display text-xs uppercase tracking-wide text-charcoal-soft">
                      Email
                    </th>
                    <th className="p-3 font-display text-xs uppercase tracking-wide text-charcoal-soft">
                      Role
                    </th>
                    <th className="p-3 font-display text-xs uppercase tracking-wide text-charcoal-soft">
                      Team
                    </th>
                    <th className="p-3" />
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b border-cream-dark/60">
                      <td className="p-3 text-charcoal">{u.name}</td>
                      <td className="p-3 text-sm text-charcoal-soft">
                        {u.email}
                      </td>
                      <td className="p-3 text-sm text-charcoal-soft">
                        {parseRoles(u.roles)
                          .map((r) => ROLE_LABEL[r] ?? r)
                          .join(" + ")}
                        {u.isSuperAdmin && (
                          <span className="ml-1 text-xs text-gold">
                            (super-admin)
                          </span>
                        )}
                        {!u.isActive && (
                          <span className="ml-1 text-xs text-crimson">
                            (disabled)
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-sm capitalize text-charcoal-soft">
                        {u.team ?? "—"}
                      </td>
                      <td className="p-3 text-right text-sm">
                        <Link
                          href={`/dashboard/users/${u.id}`}
                          className="font-display uppercase tracking-wide text-crimson hover:text-crimson-dark"
                        >
                          Edit
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h2 className="font-display text-xl text-charcoal">
              New Account
            </h2>
            <div className="mt-4 rounded-xl border border-cream-dark bg-white/60 p-6 shadow-sm">
              <NewUserForm
                players={players.map((p) => ({
                  slug: p.slug,
                  name: p.name,
                  team: p.team,
                }))}
                isSuperAdmin={user.isSuperAdmin}
              />
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
