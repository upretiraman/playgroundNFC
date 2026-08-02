---
name: run-nfc-site
description: Launch, drive, and smoke-test the NFC Nürnberg club website (Next.js + Prisma/SQLite + NextAuth). Use whenever asked to run, start, launch, preview, or verify this app locally — this is the project-specific skill the generic `run` skill looks for first.
license: MIT
---

# Running the NFC Nürnberg site

Next.js App Router app with a Prisma/SQLite backend for the member area
(login, schedules, attendance). See `CLAUDE.md` at the repo root for
architecture and gotchas — this skill only covers launching and driving it.

## First-time setup (skip if already done)

```bash
npm install
cp .env.example .env          # only if .env doesn't already exist
npx prisma migrate dev        # creates prisma dev database (dev.db)
npx prisma db seed            # creates bootstrap Administrator, prints password ONCE
```

If `.env` and `dev.db` already exist, skip straight to launching.

## Launch

```bash
npm run dev -- -p 3100        # pick a port that isn't already in use
```

Poll instead of guessing when it's ready:

```bash
timeout 30 bash -c 'until curl -sf http://localhost:3100/ >/dev/null; do sleep 1; done'
```

**Gotcha:** in this environment that poll can report a timeout even though
the server is actually up a couple seconds later — a `curl -s -o /dev/null
-w "%{http_code}"` check right after is more reliable than trusting the
poll's exit code.

**Stopping it:** `lsof -ti:<port> -sTCP:LISTEN | xargs -r kill -9`. Do this
*before* relaunching on the same port — a `next dev` background process
left over from an earlier turn will keep serving stale code on that port
while a second `npm run dev` on the same port fails with `EADDRINUSE`
right next to it, which is confusing to debug. If you see `EADDRINUSE`,
find the real live PID with `ps aux | grep "next dev\|next-server"` and
kill that one specifically.

## Drive it

**Automated, checked-in:** `npm run test:smoke` (or
`SMOKE_TEST_URL=http://localhost:3100 npm run test:smoke` for a non-default
port). This is `scripts/smoke-test.ts` — it creates its own throwaway
Admin/Trainer/Player accounts and one event, exercises the Guest → Admin →
Trainer → Player flow, and deletes everything it created. Safe to run
against the real seeded dev database. Requires the dev server already
running.

**Manual/visual, via Playwright:** this sandbox pre-installs a specific
Chromium build that may not match what the project's `playwright` package
expects by revision number — don't run `npx playwright install`. Instead
pass the pre-installed path explicitly when it exists:

```js
const { chromium } = require("playwright");
const { existsSync } = require("fs");
const executablePath = existsSync("/opt/pw-browsers/chromium")
  ? "/opt/pw-browsers/chromium"
  : undefined;
const browser = await chromium.launch({ headless: true, executablePath });
```

(`scripts/smoke-test.ts` already does this — copy the pattern rather than
re-deriving it.)

There is no self-service password reset and no public sign-up. To log in
as a real Trainer/Player during manual testing, either:
- use the bootstrap Administrator (credentials only exist in whoever ran
  `prisma db seed` — check with them, or reset via `npm run db:reset` and
  re-seed to get a fresh one), then create the account you need from
  `/dashboard/users`, or
- create a throwaway account directly via Prisma, same pattern as
  `scripts/smoke-test.ts`'s `seedAccounts()` — don't guess a password hash
  format, reuse `bcrypt.hash(password, 10)` from `bcryptjs` like that file
  does.

## Useful scripts

| Command | What it does |
|---|---|
| `npm run dev -- -p <port>` | Start the dev server on a specific port |
| `npm run build` / `npm run lint` | Must both pass before calling anything done |
| `npm run test:smoke` | End-to-end role-based smoke test (see above) |
| `npm run db:migrate` | Apply Prisma migrations |
| `npm run db:seed` | Re-run the seed script (idempotent — upserts by fixed IDs) |
| `npm run db:reset` | **Destructive.** Drops and recreates the dev database, then reseeds |
| `npm run db:studio` | Opens Prisma Studio, a visual browser for the dev database |
