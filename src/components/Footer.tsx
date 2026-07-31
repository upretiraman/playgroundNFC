import Image from "next/image";
import Link from "next/link";
import Container from "./Container";
import { repository } from "@/lib/repository";

export default async function Footer() {
  const club = await repository.getClubInfo();

  return (
    <footer className="mt-24 border-t-4 border-crimson bg-charcoal text-cream-dark">
      <Container className="grid gap-10 py-12 sm:grid-cols-2 md:grid-cols-4">
        <div className="flex flex-col gap-3 sm:col-span-2 md:col-span-1">
          <div className="flex items-center gap-3">
            <Image
              src="/brand/logo.png"
              alt="NFC Nürnberg crest"
              width={44}
              height={44}
              className="h-11 w-11"
            />
            <span className="font-display text-lg text-cream">
              {club.name}
            </span>
          </div>
          <p className="text-sm">
            Est. {club.foundedYear} &middot; {club.city}, {club.country}
          </p>
          <p className="font-display italic text-crimson-light">
            {club.motto}
          </p>
        </div>

        <div>
          <h3 className="font-display text-sm uppercase tracking-wide text-cream">
            Explore
          </h3>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link href="/club" className="hover:text-cream">
                Club &amp; Governance
              </Link>
            </li>
            <li>
              <Link href="/teams" className="hover:text-cream">
                Teams &amp; Players
              </Link>
            </li>
            <li>
              <Link href="/training" className="hover:text-cream">
                Training Schedule
              </Link>
            </li>
            <li>
              <Link href="/news" className="hover:text-cream">
                News
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-display text-sm uppercase tracking-wide text-cream">
            Get in touch
          </h3>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <a href={`mailto:${club.email}`} className="hover:text-cream">
                {club.email}
              </a>
            </li>
            {club.instagram && (
              <li>
                <a
                  href={club.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-cream"
                >
                  Instagram
                </a>
              </li>
            )}
            {club.whatsapp && (
              <li>
                <a
                  href={club.whatsapp}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-cream"
                >
                  WhatsApp Group
                </a>
              </li>
            )}
          </ul>
        </div>

        <div>
          <h3 className="font-display text-sm uppercase tracking-wide text-cream">
            Join us
          </h3>
          <p className="mt-3 text-sm">
            New to the club? Come to any training session — no experience
            required.
          </p>
          <Link
            href="/contact"
            className="mt-3 inline-block rounded bg-crimson px-4 py-2 text-sm font-semibold text-cream hover:bg-crimson-dark"
          >
            Contact us
          </Link>
        </div>
      </Container>

      <div className="border-t border-charcoal-soft py-4">
        <Container className="flex flex-col items-center justify-between gap-2 text-xs sm:flex-row">
          <p>
            &copy; {new Date().getFullYear()} {club.name}. All rights
            reserved.
          </p>
          <p>Built with love for the community, by the community.</p>
        </Container>
      </div>
    </footer>
  );
}
