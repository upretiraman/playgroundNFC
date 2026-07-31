"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import Container from "./Container";

const links = [
  { href: "/", label: "Home" },
  { href: "/club", label: "Club" },
  { href: "/teams", label: "Teams" },
  { href: "/training", label: "Training" },
  { href: "/news", label: "News" },
  { href: "/contact", label: "Contact" },
];

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

        <nav className="hidden items-center gap-1 md:flex">
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
        </nav>
      )}
    </header>
  );
}
