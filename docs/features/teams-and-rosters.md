# Teams & Player Rosters

The public face of who plays for NFC Nürnberg: the two squads (boys, girls),
their coaches, and each player's profile. This is also the capability with
the biggest data-model change coming — today a roster entry is just a JSON
row; the target model ties it to a real `User` login and auto-manages it as
Player accounts are created, edited, or removed.

**Status**: Live (browsing), content is developer-edited JSON. Roster
auto-create/publish-gating is target only.

## User stories

- As a **Guest**, I want to see both teams with a summary and coach name, so
  I get a quick overview before drilling into a roster.
- As a **Guest**, I want to see a full roster for a team (number, position,
  captain badge), so I can look up a specific player.
- As a **Guest**, I want to open a player's profile (bio, hometown, joined
  year, captain status), so I can learn more about them.
- As an **Admin**, I want a Player account I create to automatically get a
  roster entry (rather than picking one from a static list), so account
  creation and roster maintenance are the same action, not two.
- As an **Admin**, I want a roster entry to stay unpublished until I choose
  to publish it, so a newly created account doesn't show a half-filled
  profile to the public before I've added a bio/photo.
- As an **Admin**, I want removing the Player role from an account to
  unpublish (not delete) their roster entry, so match history and past
  profile data aren't lost.

## Acceptance criteria

- `/teams` lists both teams with roster size, description, coach.
- `/teams/[team]` lists every published player on that team's roster,
  sorted by squad number.
- `/teams/[team]/[player]` renders a single player's profile; a mismatched
  team/player slug pair 404s (already enforced).
- Home page surfaces captains from both teams (already implemented).
- Once the target model ships: creating a Player account auto-creates a
  roster entry linked to that `User`; the entry is unpublished by default
  and does not appear under `/teams/[team]` until an Admin publishes it.
- Removing the Player role from a multi-role account unpublishes but does
  not delete the linked roster entry.

## Out of scope

- Player-editable profiles (a Player editing their own bio/photo) — every
  role spec today has Players as read-only; this doc doesn't add
  self-service editing.
- Real player photos — `PlayerAvatar.tsx`'s generated-initials avatars stay;
  this doc doesn't add photo upload.
- Match statistics (goals, appearances) — not part of the current `Player`
  shape and not requested for this pass.

## Current vs. target

| Area | Today | Target |
|---|---|---|
| Storage | `src/lib/data/players.json`, `teams.json` (dev-edited) | `Player` becomes a Prisma table |
| Roster ↔ account link | `User.playerSlug` optionally picked from a static list at account creation | Auto-created when Player role is added to a `User`; `published` flag drives public visibility |
| Removing Player role | N/A — role is single-valued today | Unpublishes but retains the roster entry (soft, same pattern as account deactivation) |
| Teams | `teams.json`, developer-edited | Likely stays low-churn enough to remain JSON, or migrates alongside `Player` — see open question in [Proposed issues](#proposed-issues) |

## Data model changes

- New Prisma `Player` model (replacing `players.json`): slug, team, name,
  number, position, bio, photoUrl?, joinedYear, hometown?, isCaptain?,
  `published: Boolean`, and a relation to the `User` that owns the login
  (`userId`, nullable — a roster entry can exist without a login until an
  account is created, or vice versa depending on the build order chosen).
- `User.playerSlug` becomes a real foreign key to `Player.id` instead of a
  loosely-typed string matched against JSON.
- Depends on [Account Management](./account-management.md)'s multi-role
  work landing first — auto-create/unpublish triggers off Player role
  being added to or removed from a `User`'s role set, which requires
  `User.role` to already be a set. See the build order in
  [docs/features.md](../features.md).

## Permissions

Guests/Players/Trainers/Admins all read the same published roster; only an
Admin publishes/unpublishes entries (bundled into "Manage public content
(CMS)" plus the account-management flows in
[docs/roles/admin.md](../roles/admin.md)). See
[docs/roles-and-permissions.md](../roles-and-permissions.md) for the
authoritative permission rule.

## Proposed issues

- [ ] **Add `Player` Prisma model with `published` flag, migrate off `players.json`** — schema + migration + repository implementation swap.
- [ ] **Link `Player` to `User` via foreign key, backfill `playerSlug` matches**.
- [ ] **Auto-create unpublished `Player` row when Player role is added to an account** — part of the Account Management multi-role work; coordinate rather than duplicate.
- [ ] **Unpublish (not delete) `Player` row when Player role is removed**.
- [ ] **Admin dashboard: publish/unpublish and edit a roster entry** (bio, photo, hometown, etc.).
- [ ] **Decide whether `teams.json` migrates to Prisma alongside `Player`, or stays static** — open question, teams change far less often than rosters; resolve before filing the `Player` migration issue so the scope is settled up front.
