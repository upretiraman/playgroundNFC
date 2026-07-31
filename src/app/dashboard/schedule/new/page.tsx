import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Container from "@/components/Container";
import NewEventForm from "@/components/dashboard/NewEventForm";
import { getSessionUser } from "@/lib/auth-helpers";

export const metadata: Metadata = {
  title: "New Session",
};

const DEFAULT_VENUE = "Sportpark Valznerweiher";
const DEFAULT_ADDRESS = "Nürnberg, Germany (exact pitch to be confirmed)";

export default async function NewSessionPage() {
  const user = await getSessionUser();
  if (!user) return null;

  if (user.role !== "TRAINER" && user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const teamOptions =
    user.role === "ADMIN"
      ? [
          { value: "boys", label: "Boys Team" },
          { value: "girls", label: "Girls Team" },
          { value: "both", label: "Both Teams (club-wide)" },
        ]
      : [
          {
            value: user.team as string,
            label: user.team === "boys" ? "Boys Team" : "Girls Team",
          },
        ];

  return (
    <div className="bg-cream py-16 sm:py-20">
      <Container className="max-w-2xl">
        <span className="font-display text-sm uppercase tracking-[0.3em] text-crimson">
          Schedule
        </span>
        <h1 className="mt-2 font-display text-4xl text-charcoal">
          New Session
        </h1>
        <p className="mt-3 text-charcoal-soft">
          Create a training session or game. Attendance rows are created
          automatically for the whole team roster.
        </p>

        <div className="mt-8 rounded-xl border border-cream-dark bg-white/60 p-8 shadow-sm">
          <NewEventForm
            teamOptions={teamOptions}
            defaultTeam={teamOptions[0].value}
            defaultVenue={DEFAULT_VENUE}
            defaultAddress={DEFAULT_ADDRESS}
          />
        </div>
      </Container>
    </div>
  );
}
