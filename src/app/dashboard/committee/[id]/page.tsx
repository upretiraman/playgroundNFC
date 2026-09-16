import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import Container from "@/components/Container";
import RoleForm from "@/components/dashboard/RoleForm";
import { getSessionUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import type { ClubRole } from "@/lib/types";

export const metadata: Metadata = {
  title: "Edit Role",
};

export default async function EditRolePage({
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

  const role = await db.clubRole.findUnique({ where: { id } });
  if (!role) notFound();

  return (
    <div className="bg-cream py-16 sm:py-20">
      <Container className="max-w-2xl">
        <Link
          href="/dashboard/committee"
          className="font-display text-sm uppercase tracking-wide text-crimson hover:text-crimson-dark"
        >
          &larr; Manage Committee
        </Link>
        <h1 className="mt-2 font-display text-4xl text-charcoal sm:text-5xl">
          Edit Role
        </h1>

        <div className="mt-8 rounded-xl border border-cream-dark bg-white/60 p-6 shadow-sm">
          <RoleForm
            role={
              {
                ...role,
                duties: role.duties.split("\n").filter(Boolean),
              } as ClubRole & { id: string; order: number }
            }
          />
        </div>
      </Container>
    </div>
  );
}
