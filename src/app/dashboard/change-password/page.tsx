import type { Metadata } from "next";
import Container from "@/components/Container";
import ChangePasswordForm from "@/components/dashboard/ChangePasswordForm";
import { getSessionUser } from "@/lib/auth-helpers";

export const metadata: Metadata = {
  title: "Set New Password",
};

export default async function ChangePasswordPage() {
  const user = await getSessionUser();
  if (!user) return null;

  return (
    <div className="bg-cream py-16 sm:py-20">
      <Container className="max-w-md">
        <span className="font-display text-sm uppercase tracking-[0.3em] text-crimson">
          Required
        </span>
        <h1 className="mt-2 font-display text-4xl text-charcoal">
          Set a New Password
        </h1>
        <p className="mt-3 text-charcoal-soft">
          {user.mustChangePassword
            ? "Your account was created (or reset) with a temporary password. Set your own before continuing."
            : "Choose a new password for your account."}
        </p>

        <div className="mt-8 rounded-xl border border-cream-dark bg-white/60 p-8 shadow-sm">
          <ChangePasswordForm />
        </div>
      </Container>
    </div>
  );
}
