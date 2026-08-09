# NFC Nürnberg club website

Website for NFC Nürnberg, a hobby football club for the Nepali community in
Nürnberg, Germany. Next.js (App Router, TypeScript), Tailwind CSS v4, Prisma +
libSQL/Turso, NextAuth (Auth.js) v5.

## Non-negotiables — read before editing

- **Never change the theme, visual design, or existing page behavior** as a
  side effect of adding a new feature. The crimson/maroon (`#5f0713`) +
  cream + charcoal + gold palette in `src/app/globals.css` and the crest at
  `public/brand/logo.png` are final; new UI must reuse those tokens and the
  existing component patterns (`Container`, the card/section styles used
  throughout), not introduce a new visual language.
- **All placeholder content is fake.** Player names, coach names, the
  training venue ("Sportpark Valznerweiher"), emails, etc. in
  `src/lib/data/*.json` and `prisma/seed.ts` are invented filler pending real
  club details. Don't treat them as ground truth when reasoning about the
  club; do treat them as the format to follow when adding real data.
- **Git workflow:** work directly on branch `claude/nurnberg-nepali-football-site-7a29gf`,
  one commit per logical change with a descriptive message, push after each.
  No PR unless explicitly asked. Never rewrite/force-push history on this
  branch without being asked.
- **After every change**, report the current git branch and the list of
  files changed (`git branch --show-current` + `git status`/`git diff
  --stat`) — even if nothing was actually committed. This applies whether
  the change touched tracked source files or not.

## Architecture

Two data layers, deliberately separate:

1. **Static content** (`src/lib/data/*.json`, read via `src/lib/repository.ts`'s
   `ClubRepository` interface) — club info, teams, players, news, membership
   tiers, committee roles. Content editors change JSON; if this ever needs a
   real CMS/DB, only `repository.ts`'s implementation changes, not callers.
2. **Dynamic data** (Prisma + libSQL/Turso, `src/lib/db.ts` / `src/lib/events.ts`) —
   user accounts, training/game events, attendance. This is what the member
   area (`/login`, `/dashboard/**`) reads and writes, and what the public
   `/`, `/training`, and `/contact` pages read (via `listUpcomingEvents`) so
   Trainer-scheduled sessions show up on the public site without a rebuild.
   Those three pages are `export const dynamic = "force-dynamic"` — don't
   remove that or they'll freeze at build-time content again.

### Auth & roles

`src/auth.ts` (NextAuth Credentials provider, JWT sessions) + `src/proxy.ts`
(route protection for `/dashboard/**` — **not** `middleware.ts`, see gotchas
below). Session user shape is `SessionUser` in `src/lib/auth-types.ts`:
`role` (`PLAYER` | `TRAINER` | `ADMIN`), `team` (`boys` | `girls` | null),
`playerSlug` (links a Player account to a roster entry).

- **Guest** (no account): full read access to all public pages. Never gate
  a public page behind login.
- **Player**: read-only `/dashboard/schedule` scoped to their team, sees own
  attendance highlighted.
- **Trainer**: create/edit events for their own team only
  (`canManageTeam`/`canManageEventTeam` in `src/lib/auth-helpers.ts`), edit
  training plans, mark attendance.
- **Admin**: everything, any team, plus `/dashboard/users` to create
  accounts. Only Admins can manage `team: "both"` (club-wide) events.

Server actions (`src/app/dashboard/**/actions.ts`) re-check role/team
authorization server-side even though the page also checks — the page check
is UX, the action check is the actual security boundary.

There is no self-registration and no password reset flow. Admin accounts are
created by `prisma/seed.ts`; everyone else is created from
`/dashboard/users` by an Admin.

**The list above is as-built. The club's agreed target model is
`docs/roles-and-permissions.md`** (index + permission matrix + shared rules,
with one file per role under `docs/roles/`: `guest.md`, `player.md`,
`trainer.md`, `admin.md`, `super-admin.md`) — read it before changing
anything about roles, and treat it as the intent when the two disagree. It is
a spec, not yet implemented; every page ends with a current-vs-target gap
table, and the index carries a suggested build order. Headline
differences: Trainers become club-wide (no `team` scoping), Players see the
whole club schedule, account management grows edit/reset/soft-disable, a
super-admin flag gates Admin-on-Admin management and the audit log, and public
content moves out of JSON into the database.

## Known gotchas (hit these already — don't rediscover them)

- **Next.js 16 renamed the `middleware` file convention to `proxy`.** Route
  protection lives in `src/proxy.ts`, not `middleware.ts`. Using the old name
  fails silently/confusingly (stale build cache can make it *look* like it's
  working right up until you clear `.next`).
- **Prisma 7 requires a driver adapter** — `@prisma/adapter-libsql` +
  `@libsql/client`, wired up in `src/lib/db.ts`. The generator is
  `prisma-client` (not the old `prisma-client-js`), output to
  `src/generated/prisma` (gitignored, regenerate with `npx prisma generate`
  after any schema change). SQLite has no native enum type — `role`,
  `type`, `status` fields in `prisma/schema.prisma` are plain strings with
  allowed values enforced in `src/lib/auth-types.ts`, not Prisma enums.
- **Database is Turso (libSQL), not a local SQLite file.** `prisma/schema.prisma`'s
  datasource `provider` stays `"sqlite"` — libSQL is wire-compatible with
  SQLite, so the schema, migrations, and queries are unchanged from plain
  SQLite. What actually changes is the connection: `DATABASE_URL` (a
  `libsql://...` URL) plus `TURSO_AUTH_TOKEN`, read in `src/lib/db.ts`. This
  is what makes the member area (accounts, events, attendance) safe to
  deploy to Vercel — serverless functions have an ephemeral, read-only
  filesystem, so a local SQLite file would lose every write on the next
  cold start/redeploy; Turso is a real network database instead. Local dev
  needs no Turso account: leave `DATABASE_URL` as the default
  `file:./dev.db` in `.env` and libSQL behaves exactly like local SQLite.
  Point it at a real `libsql://` URL (with `TURSO_AUTH_TOKEN` set) to run
  against Turso, e.g. for a shared dev database or to reproduce a
  production-only issue.
- **Disabled `<select>`/`<input>` elements are not included in FormData on
  submit.** `NewEventForm.tsx`'s team selector is disabled for Trainers
  (locked to their team) and pairs a disabled `<select>` (display only) with
  a separate `<input type="hidden" name="team">` carrying the real value.
  Follow this pattern for any other "locked" form field.
- **Server Actions that call `redirect()` throw internally** — Next.js's
  redirect mechanism uses a thrown, digest-tagged error. If a client
  component wraps the action call in try/catch expecting to catch real
  errors, `redirect()` inside the action breaks that. Current code sidesteps
  this by having actions return data and letting the client call
  `router.push()` (see `createEvent` / `NewEventForm.tsx`).
- **Static rendering + live DB data don't mix.** Any page reading from
  Prisma at request time needs `export const dynamic = "force-dynamic"` (or
  a `revalidate`), or Next will bake in whatever was in the DB at build time
  and never update it.

## Dev setup

```bash
npm install
cp .env.example .env        # then edit AUTH_SECRET if you want a fresh one
npx prisma migrate dev      # creates prisma dev database
npx prisma db seed          # creates bootstrap Administrator (prints password ONCE)
npm run dev
```

Useful scripts (see `package.json`): `db:migrate`, `db:seed`, `db:reset`
(drops + recreates + reseeds — destructive, local dev data only),
`db:studio` (visual DB browser), `test:smoke` (see below).

## Testing changes

- `npm run build && npm run lint` before considering anything done.
- `npm run test:smoke` — a checked-in Playwright script
  (`scripts/smoke-test.mjs`) that boots against an already-running dev
  server and exercises: guest blocked from `/dashboard`, Admin login,
  account creation, Trainer scheduling + attendance, Player read-only view.
  It creates and cleans up its own throwaway test accounts/events — safe to
  run against the seeded dev database.
- For anything visual, prefer actually looking at it: start the dev server,
  use the `run` skill or drive it directly with Playwright
  (`/opt/pw-browsers/chromium`), and look at the screenshot before claiming
  a UI change works.
- A dedicated `nfc-qa-verifier` subagent exists for "does the site still
  work end to end" checks — hand it that question rather than
  re-deriving the whole Playwright flow inline when you just need a status
  check.

## Content model reference

- `src/lib/data/club.json` — mission, motto ("More Than a Club"), values
  (Pride/Passion/Unity), contact info.
- `src/lib/data/teams.json`, `players.json` — rosters. Player photos are
  generated initials avatars (`PlayerAvatar.tsx`), not real images.
- `src/lib/data/roles.json`, `membership-tiers.json` — sourced from the
  club's actual governance protocol PDF (`public/documents/`), surfaced on
  `/club`.
- `src/lib/data/news.json` — hand-written articles, unrelated to the
  training/game event system.
