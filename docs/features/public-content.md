# Public Content & Static Info

The Home, Club, and Contact pages — the club's public-facing identity: who it
is, what it stands for, how it's run, and how to reach it. This is the first
thing a prospective member or parent sees, so it needs to stay accurate
without requiring a developer to ship a code change every time club info
changes (a committee role-holder changes, the mission statement is reworded,
a phone number changes).

**Status**: Club info and committee roles are DB-backed — `ClubInfo`
(singleton) and `ClubRole` Prisma models, with an Admin CMS at
`/dashboard/club-info` and `/dashboard/committee`. Membership tier
*descriptions* are still JSON (only `feeAmount` has moved out, for the
fee-records work).

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
  **Built for club info and committee roles** — `/`, `/club`, and
  `/contact` are `force-dynamic`. Tier descriptions still require a JSON
  commit + deploy, since `MembershipTier` hasn't moved to Prisma.
- Only an Admin (not a Trainer or Player) can edit this content — see
  [Permissions](#permissions). **Built** for club info and committee
  roles: `/dashboard/club-info`, `/dashboard/committee`, and their actions
  all redirect/reject anyone without the Admin role.

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
| Storage | `ClubInfo` (singleton) and `ClubRole` Prisma models. `club.json`/`roles.json` remain only as the one-time seed source in `prisma/seed.ts`. `membership-tiers.json` is still dev-edited JSON. | `MembershipTier` moves to Prisma too |
| Editing | Admin, via `/dashboard/club-info` and `/dashboard/committee` (club info + committee roles). Tier descriptions still need a JSON commit. | Admin, via a CMS form, for tier descriptions too |
| Committee roles | Same shape as before, DB-backed, with an added `order` field (int) driving display order — reordering is done by editing that number, not drag-and-drop | Unchanged |
| Membership tiers | Description + `feeAmount` (annual, EUR) — still JSON-backed, not yet Prisma | Prisma-backed, editable from the dashboard |
| Audit log | Every club-info/committee-role mutation writes an entry (`clubInfo.update`/`role.create`/`role.update`/`role.delete`) | Unchanged |

## Data model changes

- **Built**: `ClubInfo` — a singleton row (fixed `id: "club-info"`, not a
  fixed-row-count table pattern) replacing `club.json`: name, shortName,
  foundedYear, city, country, motto, values (newline-separated — SQLite
  has no array type), mission, email, instagram?, whatsapp?, address.
- **Built**: `ClubRole` replacing `roles.json`: slug (unique), title,
  reportsTo, summary, duties (newline-separated), order (Int, drives
  display order; seeded from each entry's index in `roles.json`).
- `MembershipTier` moving to a Prisma model (today `membership-tiers.json`)
  is **not done** — out of scope for this round, tracked separately below.
  It's shared with [Membership & Fee Records](./membership-and-fees.md) —
  land the schema change once, not twice, when it's picked up.
- `src/lib/repository.ts`'s `ClubRepository` interface (`getClubInfo`,
  `getClubRoles`, `getMembershipTiers`) is unchanged; only
  `JsonClubRepository`'s implementation moved from JSON reads to Prisma
  reads for `getClubInfo`/`getClubRoles`. Callers (`page.tsx`,
  `club/page.tsx`, `contact/page.tsx`) did not change — those pages and
  `/club` switched to `force-dynamic` since they now read live DB data.

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
- [ ] **Migrate `MembershipTier` off JSON to Prisma** — split out from the
      `feeAmount` issue above, which landed first without it. Still open.
- [x] **Admin CMS: edit club info** — dashboard form for mission/motto/values/contact fields — done, `/dashboard/club-info`.
- [x] **Admin CMS: manage committee roles** — create/edit/delete entries, reordered by an editable `order` field — done, `/dashboard/committee`, `/dashboard/committee/new`, `/dashboard/committee/[id]`. No drag-and-drop reordering UI, per the "don't over-build this ahead of real usage" principle used elsewhere in these docs (e.g. the audit log's plain list) — an Admin retypes the number instead.
- [ ] **Admin CMS: edit membership tier descriptions** — separate from the fee-amount field, which belongs to the fee-records work. Still open, blocked on the `MembershipTier` migration above.
