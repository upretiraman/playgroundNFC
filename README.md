# NFC Nürnberg

Website for NFC Nürnberg, a hobby football club for the Nepali community in Nürnberg, Germany — boys' and girls' teams, training schedules, player profiles, news, and club governance.

Built with Next.js (App Router, TypeScript, Tailwind CSS v4). Club/team/player content lives in `src/lib/data/*.json` behind a repository interface (`src/lib/repository.ts`), so it can be swapped for a real database/admin later without touching page code.

The site also has a member area (`/login`, `/dashboard/**`) with role-based access — Guest (public, no login), Player, Trainer, and Administrator — backed by Prisma + Turso (libSQL) and NextAuth (Auth.js). Trainers/Admins schedule trainings and games, set training plans, and mark attendance; Players see their team's schedule and their own attendance. Administrators also maintain the club shop, whose products live in the database rather than in JSON so merchandise can be added or hidden without a rebuild.

> All player names, coach names, the training venue, and contact details currently shown are placeholder content pending real club details — see `CLAUDE.md` for what's fake vs. what's structural.

## Contents

- [Site guide](#site-guide) — what each page does, with screenshots
  - [Public site](#public-site)
  - [Member area](#member-area-login-required)
- [Development](#development)

## Site guide

### Public site

Anyone can browse these pages without an account.

#### Home (`/`)

![Home page](docs/screenshots/home.png)

The landing page: hero with the club crest and motto ("More Than a Club"),
a mission statement with live club stats, cards for the Boys and Girls
teams, the current team captains, a teaser of the next few upcoming
training sessions, and the latest news. The stats and training teaser read
live data — anything a Trainer schedules shows up here automatically.

#### Club (`/club`)

![Club page](docs/screenshots/club.png)

The club's mission and values, a membership tiers table (Active /
Supporting / Guest-Trial, and what each is eligible for), and the full
committee/role breakdown (Chair, Head Coach, Team Captain, Treasurer, etc.)
sourced from the club's governance protocol — with a link to download the
full protocol PDF.

#### Teams (`/teams`)

![Teams overview](docs/screenshots/teams.png)

Overview of both squads with their coach and a short description, linking
through to each team's full roster.

#### Team roster (`/teams/boys`, `/teams/girls`)

![Boys team roster](docs/screenshots/teams-boys-roster.png)

The full player roster for one team — squad number, position, and a
generated initials avatar for each player (captain highlighted in gold).
Clicking a player opens their profile.

#### Player profile (`/teams/boys/[player]`)

![Player profile](docs/screenshots/player-profile.png)

An individual player's number, position, hometown, and a short bio.

#### Shop (`/shop`)

![Club shop](docs/screenshots/shop.png)

Official club merchandise — caps, tote bags, and T-shirts — each card
showing its category, description, colourway, and price in euros. Products
read live from the database, so anything an Administrator adds or hides in
the member area shows up here without a rebuild. Items with no photo fall
back to a generated crest illustration (`ProductArt.tsx`) in the club
palette. There's no online checkout: the "Order" button sends visitors to
`/contact`, and the page says so plainly.

#### Training (`/training`)

![Training schedule](docs/screenshots/training.png)

Upcoming training sessions, grouped by Boys Team / Girls Team / Joint
Sessions, each showing date, time, venue, and any notes. This reads live
from the same database Trainers schedule into via the member area — no
rebuild needed when a new session is added.

#### News (`/news`) and article (`/news/[slug]`)

![News list](docs/screenshots/news.png)
![News article](docs/screenshots/news-article.png)

Club announcements and milestones — separate from the training/game
schedule, hand-written per article.

#### Contact (`/contact`)

![Contact page](docs/screenshots/contact.png)

Email, WhatsApp, and Instagram links, the current training venue, and a
message form that opens the visitor's email client with the message
pre-filled (no backend email sending — it's transparent about that).

#### Sign in (`/login`)

![Login page](docs/screenshots/login.png)

Entry point to the member area. There's no public sign-up — Player and
Trainer accounts are created by an Administrator.

### Member area (login required)

Everything under `/dashboard/**` is role-gated: what you can see and do
depends on whether you're a **Player**, **Trainer**, or **Administrator**.

#### Dashboard (`/dashboard`)

![Administrator dashboard](docs/screenshots/dashboard-admin.png)

Role-aware landing page. A Player sees a link to their schedule; a Trainer
additionally sees "Schedule New Session"; an Administrator (shown above)
also sees "Manage Accounts" and "Manage Shop".

#### Schedule (`/dashboard/schedule`)

![Schedule list](docs/screenshots/dashboard-schedule.png)

List of upcoming trainings and games. Players see only their own team's
sessions, read-only. Trainers and Admins get a "New Session" button here.

#### Session detail (`/dashboard/schedule/[id]`)

![Session detail with training plan and attendance](docs/screenshots/dashboard-schedule-detail.png)

The core of the Trainer workflow: a free-text **training plan** for the
session, and an **attendance** grid — one row per roster player, each with
a status (Present / Absent / Excused / Unmarked) and an optional note,
saved independently per row. Trainers/Admins can edit both; Players see the
same page read-only, with their own row highlighted.

#### New session (`/dashboard/schedule/new`)

![New session form](docs/screenshots/dashboard-schedule-new.png)

Trainer/Admin only. Schedule a Training or a Game — date, time, venue,
opponent (for games), and an optional plan. A Trainer's team is locked to
their own; an Administrator can schedule for either team or club-wide.

#### Manage accounts (`/dashboard/users`)

![Manage accounts](docs/screenshots/dashboard-users.png)

Administrator only. Create Player, Trainer, or Administrator accounts,
optionally linking a Player account to an existing roster profile so they
see their own name highlighted in attendance.

#### Manage shop (`/dashboard/shop`)

![Manage shop](docs/screenshots/dashboard-shop.png)

Administrator only — Players and Trainers are redirected back to
`/dashboard`. Lists every product with its category, price, and whether
it's visible on the public shop, with Edit and Delete per row.

#### Add / edit product (`/dashboard/shop/new`, `/dashboard/shop/[id]`)

![Add product form](docs/screenshots/dashboard-shop-new.png)

Administrator only. Name, URL slug (auto-generated from the name if left
blank), category, price and currency, colourway, and description. A product
can either point at a real photo under `public/` via its image URL or use
one of the built-in fallback illustrations (cap / tote / T-shirt).
Unchecking "Visible on the public shop page" keeps the product in the
database but hides it from `/shop`.

## Development

```bash
npm install
cp .env.example .env        # then edit AUTH_SECRET if needed
npx prisma migrate dev      # creates a local libSQL database file (dev.db) — no Turso account needed
npx prisma db seed          # creates a bootstrap Administrator account (prints its password once)
npm run dev
```

Log in with the printed Administrator credentials at `/login`, then create Player/Trainer accounts from `/dashboard/users`.

The database is [Turso](https://turso.tech) (libSQL, SQLite-compatible) in
production, so that writes (accounts, events, attendance) survive on
Vercel's serverless/ephemeral filesystem. Locally, the default
`DATABASE_URL="file:./dev.db"` in `.env.example` needs no Turso account and
behaves like plain SQLite. To run against a real Turso database instead
(e.g. a shared dev database, or reproducing a production-only issue):

```bash
turso db create nfc-nurnberg-dev             # one-time, needs the Turso CLI + account
turso db show nfc-nurnberg-dev --url         # -> DATABASE_URL
turso db tokens create nfc-nurnberg-dev      # -> TURSO_AUTH_TOKEN
```

Set both in `.env`, then re-run `npx prisma migrate deploy` and
`npx prisma db seed` against that database.

See `CLAUDE.md` for architecture notes, the auth/role model, and gotchas already hit while building this.
