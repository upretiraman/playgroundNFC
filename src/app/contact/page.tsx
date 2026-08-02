import type { Metadata } from "next";
import Container from "@/components/Container";
import ContactForm from "@/components/ContactForm";
import { repository } from "@/lib/repository";
import { listUpcomingEvents } from "@/lib/events";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with NFC Nürnberg — join a training session, ask a question, or connect on Instagram and WhatsApp.",
};

const FALLBACK_VENUE = "Sportpark Valznerweiher";
const FALLBACK_ADDRESS = "Nürnberg, Germany (exact pitch to be confirmed)";

// Reads live schedule data from the database, so this must not be
// statically frozen at build time.
export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const club = await repository.getClubInfo();
  const training = await listUpcomingEvents({ type: "TRAINING", limit: 1 });

  return (
    <div className="bg-cream py-16 sm:py-20">
      <Container className="grid gap-12 lg:grid-cols-2">
        <div>
          <span className="font-display text-sm uppercase tracking-[0.3em] text-crimson">
            Say Hello
          </span>
          <h1 className="mt-2 font-display text-4xl text-charcoal sm:text-5xl">
            Contact Us
          </h1>
          <p className="mt-4 max-w-lg text-charcoal-soft">
            Curious about joining NFC N&uuml;rnberg? The easiest way in is to
            simply come to a training session &mdash; see the{" "}
            <a href="/training" className="text-crimson underline">
              full schedule
            </a>
            . Or reach out below and we&apos;ll get back to you.
          </p>

          <div className="mt-8 grid gap-4">
            <a
              href={`mailto:${club.email}`}
              className="flex items-center justify-between rounded-lg border border-cream-dark bg-white/60 px-5 py-4 hover:shadow-sm"
            >
              <span className="font-display text-sm uppercase tracking-wide text-charcoal">
                Email
              </span>
              <span className="text-charcoal-soft">{club.email}</span>
            </a>
            {club.whatsapp && (
              <a
                href={club.whatsapp}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between rounded-lg border border-cream-dark bg-white/60 px-5 py-4 hover:shadow-sm"
              >
                <span className="font-display text-sm uppercase tracking-wide text-charcoal">
                  WhatsApp
                </span>
                <span className="text-charcoal-soft">Join the group</span>
              </a>
            )}
            {club.instagram && (
              <a
                href={club.instagram}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between rounded-lg border border-cream-dark bg-white/60 px-5 py-4 hover:shadow-sm"
              >
                <span className="font-display text-sm uppercase tracking-wide text-charcoal">
                  Instagram
                </span>
                <span className="text-charcoal-soft">Follow along</span>
              </a>
            )}
          </div>

          <div className="mt-8 rounded-lg bg-charcoal p-6 text-cream">
            <h2 className="font-display text-sm uppercase tracking-wide text-gold">
              Training Locations
            </h2>
            <p className="mt-2 text-sm text-cream-dark">
              {training[0]?.venue ?? FALLBACK_VENUE}
              <br />
              {training[0]?.address ?? FALLBACK_ADDRESS}
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-cream-dark bg-white/60 p-8 shadow-sm">
          <h2 className="font-display text-xl text-charcoal">
            Send a Message
          </h2>
          <div className="mt-6">
            <ContactForm email={club.email} />
          </div>
        </div>
      </Container>
    </div>
  );
}
