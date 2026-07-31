"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Container from "./Container";

const links = [
  { href: "/", label: "Home" },
  { href: "/club", label: "Club" },
  { href: "/teams", label: "Teams" },
  { href: "/training", label: "Training" },
  { href: "/news", label: "News" },
  { href: "/contact", label: "Contact" },
];

function AccountControl({ onNavigate }: { onNavigate?: () => void }) {
  const { data: session, status } = useSession();

  if (status === "loading") return null;

  if (!session) {
    return (
      <Link
        href="/login"
        onClick={onNavigate}
        className="rounded border border-cream-dark px-4 py-2 font-display text-sm uppercase tracking-wide text-cream-dark transition-colors hover:border-cream hover:text-cream"
      >
        Login
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href="/dashboard"
        onClick={onNavigate}
        className="rounded border border-cream-dark px-4 py-2 font-display text-sm uppercase tracking-wide text-cream-dark transition-colors hover:border-cream hover:text-cream"
      >
        Dashboard
      </Link>
      <button
        type="button"
        onClick={() => {
          onNavigate?.();
          signOut({ callbackUrl: "/" });
        }}
        className="rounded px-4 py-2 font-display text-sm uppercase tracking-wide text-cream-dark transition-colors hover:text-cream"
      >
        Sign Out
      </button>
    </div>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b-4 border-crimson bg-charcoal">
      <Container className="flex h-20 items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-3"
          onClick={() => setOpen(false)}
        >
          <Image
            src="/brand/logo.png"
            alt="NFC Nürnberg crest"
            width={48}
            height={48}
            className="h-12 w-12"
            priority
          />
          <span className="font-display text-lg leading-tight text-cream sm:text-xl">
            NFC
            <br className="sm:hidden" /> Nürnberg
          </span>
        </Link>

        <div className="hidden items-center gap-4 md:flex">
          <nav className="flex items-center gap-1">
            {links.map((link) => {
              const active =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded px-4 py-2 font-display text-sm uppercase tracking-wide transition-colors ${
                    active
                      ? "bg-crimson text-cream"
                      : "text-cream-dark hover:bg-crimson-deep hover:text-cream"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
          <AccountControl />
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={open}
          className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 md:hidden"
        >
          <span
            className={`h-0.5 w-6 bg-cream transition-transform ${
              open ? "translate-y-2 rotate-45" : ""
            }`}
          />
          <span
            className={`h-0.5 w-6 bg-cream transition-opacity ${
              open ? "opacity-0" : ""
            }`}
          />
          <span
            className={`h-0.5 w-6 bg-cream transition-transform ${
              open ? "-translate-y-2 -rotate-45" : ""
            }`}
          />
        </button>
      </Container>

      {open && (
        <nav className="flex flex-col border-t border-crimson-deep bg-charcoal md:hidden">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="border-b border-charcoal-soft px-6 py-4 font-display text-sm uppercase tracking-wide text-cream-dark active:bg-crimson-deep"
            >
              {link.label}
            </Link>
          ))}
          <div className="px-6 py-4">
            <AccountControl onNavigate={() => setOpen(false)} />
          </div>
        </nav>
      )}
    </header>
  );
}
