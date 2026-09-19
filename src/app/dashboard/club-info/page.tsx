import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Container from "@/components/Container";
import ClubInfoForm from "@/components/dashboard/ClubInfoForm";
import { getSessionUser } from "@/lib/auth-helpers";
import { repository } from "@/lib/repository";

export const metadata: Metadata = {
  title: "Club Info",
};

export const dynamic = "force-dynamic";

export default async function DashboardClubInfoPage() {
  const user = await getSessionUser();
  if (!user) return null;
  if (!user.roles.includes("ADMIN")) {
    redirect("/dashboard");
  }

  const club = await repository.getClubInfo();

  return (
    <div className="bg-cream py-16 sm:py-20">
      <Container className="max-w-2xl">
        <span className="font-display text-sm uppercase tracking-[0.3em] text-crimson">
          Administrator
        </span>
        <h1 className="mt-2 font-display text-4xl text-charcoal sm:text-5xl">
          Club Info
        </h1>
        <p className="mt-3 text-charcoal-soft">
          Mission, motto, values, and contact details shown on the Home,
          Club, and Contact pages.
        </p>

        <div className="mt-8 rounded-xl border border-cream-dark bg-white/60 p-6 shadow-sm">
          <ClubInfoForm club={club} />
        </div>
      </Container>
    </div>
  );
}
