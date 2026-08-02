import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Container from "@/components/Container";
import NewUserForm from "@/components/dashboard/NewUserForm";
import { getSessionUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { repository } from "@/lib/repository";

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
  if (user.role !== "ADMIN") {
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
                        {ROLE_LABEL[u.role] ?? u.role}
                      </td>
                      <td className="p-3 text-sm capitalize text-charcoal-soft">
                        {u.team ?? "—"}
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
              />
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
