import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import Container from "@/components/Container";
import RoleForm from "@/components/dashboard/RoleForm";
import { getSessionUser } from "@/lib/auth-helpers";

export const metadata: Metadata = {
  title: "Add Role",
};

export default async function NewRolePage() {
  const user = await getSessionUser();
  if (!user) return null;
  if (!user.roles.includes("ADMIN")) {
    redirect("/dashboard");
  }

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
          Add Role
        </h1>

        <div className="mt-8 rounded-xl border border-cream-dark bg-white/60 p-6 shadow-sm">
          <RoleForm />
        </div>
      </Container>
    </div>
  );
}
