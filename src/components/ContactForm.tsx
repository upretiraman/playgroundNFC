"use client";

import { useState } from "react";

export default function ContactForm({ email }: { email: string }) {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const subject = encodeURIComponent(`Message from ${name || "the website"}`);
    const body = encodeURIComponent(message);
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <div>
        <label
          htmlFor="name"
          className="font-display text-xs uppercase tracking-wide text-charcoal-soft"
        >
          Your name
        </label>
        <input
          id="name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full rounded border border-cream-dark bg-white px-4 py-2.5 text-charcoal focus:border-crimson focus:outline-none"
        />
      </div>
      <div>
        <label
          htmlFor="message"
          className="font-display text-xs uppercase tracking-wide text-charcoal-soft"
        >
          Message
        </label>
        <textarea
          id="message"
          required
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="mt-1 w-full rounded border border-cream-dark bg-white px-4 py-2.5 text-charcoal focus:border-crimson focus:outline-none"
        />
      </div>
      <button
        type="submit"
        className="rounded bg-crimson px-6 py-3 font-display text-sm uppercase tracking-wide text-cream transition-colors hover:bg-crimson-dark"
      >
        Send via Email
      </button>
      <p className="text-xs text-charcoal-soft/70">
        This opens your email app with the message pre-filled &mdash; nothing
        is sent from this page directly.
      </p>
    </form>
  );
}
