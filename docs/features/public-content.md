# Public Content & Static Info

The Home, Club, and Contact pages — the club's public-facing identity: who it
is, what it stands for, how it's run, and how to reach it. This is the first
thing a prospective member or parent sees, so it needs to stay accurate
without requiring a developer to ship a code change every time club info
changes (a committee role-holder changes, the mission statement is reworded,
a phone number changes).

**Status**: Fully DB-backed — `ClubInfo` (singleton), `ClubRole`, and
`MembershipTier` Prisma models, with an Admin CMS at `/dashboard/club-info`,
`/dashboard/committee`, and `/dashboard/membership-tiers`. This closes out
the content migration this document tracks.

## User stories

- As a **Guest**, I want to see the club's mission, values, and founding
  story on the home page, so I understand what the club is before I decide
  to reach out.
- As a **Guest**, I want to see the club's committee structure (who holds
  which role, what they're responsible for) on the Club page, so I know who
  to approach for what.
- As a **Guest**, I want to see the membership tiers (Active / Supporting /
  Guest-Trial) and what each one entitles me to, so I know what I'm signing
  up for before I show up.
- As a **Guest**, I want a Contact page with email, WhatsApp, Instagram, and
  the next training location, so I have more than one way to get in touch.
- As an **Admin**, I want to edit club info, committee roles, and membership
  tier descriptions from the dashboard, so a wording change or a committee
  reshuffle doesn't require a code deploy.

## Acceptance criteria

- Home page renders club name, motto, founded year, city/country, mission,
  and values, plus live counts of teams/players and upcoming training
  sessions (already DB-backed via `listUpcomingEvents`).
- Club page renders the mission/values banner, a link to the full club
  protocol PDF, the membership tier table, and the committee roster
  (title, reports-to, summary, duties) for every entry in the roles content.
- Contact page renders email (`mailto:`), WhatsApp and Instagram links
  (only if present), and the venue/address of the next upcoming training
  session, falling back to a hardcoded venue string when no session exists.
- Once Admin editing ships: edits to club info / committee roles / tier
  descriptions are visible on the public pages without a rebuild or deploy.
  **Built** — `/`, `/club`, and `/contact` are all `force-dynamic`, and
  `/club`'s membership tier table now reads live `MembershipTier` rows too.
- Only an Admin (not a Trainer or Player) can edit this content — see
  [Permissions](#permissions). **Built** for all three content types:
  `/dashboard/club-info`, `/dashboard/committee`, and
  `/dashboard/membership-tiers` — and their actions — all redirect/reject
  anyone without the Admin role.

## Out of scope

- Membership **fee amounts**, **contributions**, and **outstanding balance**
  — that's [Membership & Fee Records](./membership-and-fees.md). This
  document only covers the public *description* of each tier (what it is,
  what it includes), which stays visible to Guests.
- The contact form's delivery mechanism (where a submitted message actually
  goes) — out of scope for this document; today `ContactForm` is UI-only
  and this doc doesn't change that.
- News articles — see [News](./news.md).
- Team rosters and player profiles — see
  [Teams & Player Rosters](./teams-and-rosters.md).

## Current vs. target

| Area | Today | Target |
|---|---|---|
| Storage | `ClubInfo` (singleton), `ClubRole`, and `MembershipTier` Prisma models. `club.json`/`roles.json`/`membership-tiers.json` remain only as one-time seed sources in `prisma/seed.ts`. | Unchanged — this document's migration is complete |
| Editing | Admin, via `/dashboard/club-info`, `/dashboard/committee`, and `/dashboard/membership-tiers` | Unchanged |
| Committee roles | Same shape as before, DB-backed, with an added `order` field (int) driving display order — reordering is done by editing that number, not drag-and-drop | Unchanged |
| Membership tiers | Description + `feeAmount` (annual, EUR), fully Prisma-backed (`/dashboard/membership-tiers`) | Unchanged |
| Audit log | Every mutation writes an entry (`clubInfo.update`, `role.create`/`update`/`delete`, `membershipTier.create`/`update`/`delete`) | Unchanged |

## Data model changes

- **Built**: `ClubInfo` — a singleton row (fixed `id: "club-info"`, not a
  fixed-row-count table pattern) replacing `club.json`: name, shortName,
  foundedYear, city, country, motto, values (newline-separated — SQLite
  has no array type), mission, email, instagram?, whatsapp?, address.
- **Built**: `ClubRole` replacing `roles.json`: slug (unique), title,
  reportsTo, summary, duties (newline-separated), order (Int, drives
  display order; seeded from each entry's index in `roles.json`).
- **Built**: `MembershipTier` replacing `membership-tiers.json`: slug
  (unique), name, description, friendlies, tournaments, feeAmount (Float).
  `Contribution.tierSlug` (from
  [Membership & Fee Records](./membership-and-fees.md)) stays a loose
  string reference into this table's `slug` — same pattern as
  `Attendance.playerSlug` before `Player` became a table — so no change
  was needed there when this table landed.
- `src/lib/repository.ts`'s `ClubRepository` interface (`getClubInfo`,
  `getClubRoles`, `getMembershipTiers`) is unchanged; only
  `JsonClubRepository`'s implementation moved from JSON reads to Prisma
  reads. Callers (`page.tsx`, `club/page.tsx`, `contact/page.tsx`) did not
  change — those pages and `/club` switched to `force-dynamic` since they
  now read live DB data.

## Permissions

Editing is Admin-only ("Manage public content (CMS)" in the permission
matrix). See [docs/roles-and-permissions.md](../roles-and-permissions.md)
and [docs/roles/admin.md](../roles/admin.md) for the authoritative rule —
this document does not restate it.

## Proposed issues

- [x] **Add `ClubInfo` and `ClubRole` Prisma models, migrate off JSON** — done; no page changes to the public pages beyond adding `force-dynamic`.
- [x] **Add `feeAmount` to `MembershipTier`** — landed directly on
      `src/lib/data/membership-tiers.json` and the `MembershipTier` type
      (annual amount, EUR), ahead of the Prisma migration below, since the
      fee-records work needed the field before the full content migration
      was ready.
- [x] **Migrate `MembershipTier` off JSON to Prisma** — split out from the
      `feeAmount` issue above, which landed first without it — done.
- [x] **Admin CMS: edit club info** — dashboard form for mission/motto/values/contact fields — done, `/dashboard/club-info`.
- [x] **Admin CMS: manage committee roles** — create/edit/delete entries, reordered by an editable `order` field — done, `/dashboard/committee`, `/dashboard/committee/new`, `/dashboard/committee/[id]`. No drag-and-drop reordering UI, per the "don't over-build this ahead of real usage" principle used elsewhere in these docs (e.g. the audit log's plain list) — an Admin retypes the number instead.
- [x] **Admin CMS: edit membership tier descriptions** — done, `/dashboard/membership-tiers`, `/dashboard/membership-tiers/new`, `/dashboard/membership-tiers/[id]` (full create/edit/delete, not just editing descriptions — consistent with the other CMS routes in this document).
