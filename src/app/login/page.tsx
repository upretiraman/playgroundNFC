import type { Metadata } from "next";
import { Suspense } from "react";
import Container from "@/components/Container";
import LoginForm from "@/components/LoginForm";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to NFC Nürnberg's member area.",
};

export default function LoginPage() {
  return (
    <div className="bg-cream py-16 sm:py-20">
      <Container className="max-w-md">
        <div className="mb-8 text-center">
          <span className="font-display text-sm uppercase tracking-[0.3em] text-crimson">
            Member Area
          </span>
          <h1 className="mt-2 font-display text-4xl text-charcoal">
            Sign In
          </h1>
          <p className="mt-3 text-charcoal-soft">
            For Players, Trainers, and Administrators. Don&apos;t have an
            account? Ask your Administrator to set one up for you.
          </p>
        </div>

        <div className="rounded-xl border border-cream-dark bg-white/60 p-8 shadow-sm">
          <Suspense>
            <LoginForm />
          </Suspense>
        </div>
      </Container>
    </div>
  );
}
