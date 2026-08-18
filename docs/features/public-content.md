# Public Content & Static Info

The Home, Club, and Contact pages — the club's public-facing identity: who it
is, what it stands for, how it's run, and how to reach it. This is the first
thing a prospective member or parent sees, so it needs to stay accurate
without requiring a developer to ship a code change every time club info
changes (a committee role-holder changes, the mission statement is reworded,
a phone number changes).

**Status**: Live, content is developer-edited JSON.

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
- Only an Admin (not a Trainer or Player) can edit this content — see
  [Permissions](#permissions).

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
| Storage | `src/lib/data/club.json`, `roles.json`, `membership-tiers.json` (dev-edited, requires a deploy) | Prisma-backed, editable from the dashboard |
| Editing | Developer only, via a JSON commit | Admin, via a CMS form in `/dashboard` |
| Committee roles | Static list, no photos/contact per role | Unchanged in shape, just DB-backed |
| Membership tiers | Description only, no fee amount | Gains a fee amount (shared dependency with [Membership & Fee Records](./membership-and-fees.md)) |

## Data model changes

- New Prisma models replacing `club.json`, `roles.json`: a singleton
  `ClubInfo` record (or a small fixed-row table) and a `ClubRole` table
  (slug, title, reportsTo, summary, duties).
- `MembershipTier` becomes a Prisma model (today `membership-tiers.json`);
  gains a `feeAmount` field. This table is shared with
  [Membership & Fee Records](./membership-and-fees.md) — land the schema
  change once, not twice.
- `src/lib/repository.ts`'s `ClubRepository` interface (`getClubInfo`,
  `getClubRoles`, `getMembershipTiers`) is unchanged; only
  `JsonClubRepository`'s implementation moves from JSON reads to Prisma
  reads. Callers (`page.tsx`, `club/page.tsx`, `contact/page.tsx`) do not
  change.

## Permissions

Editing is Admin-only ("Manage public content (CMS)" in the permission
matrix). See [docs/roles-and-permissions.md](../roles-and-permissions.md)
and [docs/roles/admin.md](../roles/admin.md) for the authoritative rule —
this document does not restate it.

## Proposed issues

- [ ] **Add `ClubInfo` and `ClubRole` Prisma models, migrate off JSON** — schema + migration + repository implementation swap, no page changes.
- [ ] **Add `feeAmount` to `MembershipTier` and migrate off JSON** — coordinate with [Membership & Fee Records](./membership-and-fees.md) so this lands once.
- [ ] **Admin CMS: edit club info** — dashboard form for mission/motto/values/contact fields.
- [ ] **Admin CMS: manage committee roles** — create/edit/reorder/delete entries.
- [ ] **Admin CMS: edit membership tier descriptions** — separate from the fee-amount field, which belongs to the fee-records work.
