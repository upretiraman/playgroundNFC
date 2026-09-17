# Teams & Player Rosters

The public face of who plays for NFC Nürnberg: the two squads (boys, girls),
their coaches, and each player's profile. This is also the capability with
the biggest data-model change coming — today a roster entry is just a JSON
row; the target model ties it to a real `User` login and auto-manages it as
Player accounts are created, edited, or removed.

**Status**: Live (browsing). `Player` is a Prisma model with a `published`
flag and an Admin CMS (`/dashboard/roster`) — see [Current vs. target](#current-vs-target).
Roster auto-create/unpublish tied to account role changes is built. The
`User` ↔ `Player` foreign key (`User.playerSlug` is still a loosely-typed
string match) is still target only — a separate piece of work from the
auto-create/unpublish wiring, see [Data model changes](#data-model-changes).

## User stories

- As a **Guest**, I want to see both teams with a summary and coach name, so
  I get a quick overview before drilling into a roster.
- As a **Guest**, I want to see a full roster for a team (number, position,
  captain badge), so I can look up a specific player.
- As a **Guest**, I want to open a player's profile (bio, hometown, joined
  year, captain status), so I can learn more about them.
- As an **Admin**, I want a Player account I create to automatically get a
  roster entry (rather than picking one from a static list), so account
  creation and roster maintenance are the same action, not two. **Built** —
  `createUser`/`updateUser` (`src/app/dashboard/users/actions.ts`)
  auto-create an unpublished stub `Player` row (name from the account, team
  from the form, placeholder number/position/bio/joinedYear) whenever the
  Player role is applied and no existing roster entry was picked to link
  instead. An Admin can still pick an existing entry from the "Link to
  Existing Roster Entry" dropdown to skip the stub and link directly.
- As an **Admin**, I want a roster entry to stay unpublished until I choose
  to publish it, so a newly created account doesn't show a half-filled
  profile to the public before I've added a bio/photo. **Built** — every new
  entry, whether created at `/dashboard/roster/new` or auto-created by
  adding the Player role to an account, defaults to unpublished until the
  Admin explicitly publishes it from `/dashboard/roster`.
- As an **Admin**, I want removing the Player role from an account to
  unpublish (not delete) their roster entry, so match history and past
  profile data aren't lost. **Built** — `updateUser` unpublishes the linked
  `Player` row when Player leaves an account's role set; the `User.playerSlug`
  link itself is left in place (not nulled out) so re-adding Player later
  naturally re-offers the same entry instead of orphaning it.

## Acceptance criteria

- `/teams` lists both teams with roster size, description, coach.
- `/teams/[team]` lists every published player on that team's roster,
  sorted by squad number.
- `/teams/[team]/[player]` renders a single player's profile; a mismatched
  team/player slug pair 404s (already enforced).
- Home page surfaces captains from both teams (already implemented).
- **Built**: `Player` is a Prisma model with a `published` flag
  (`/dashboard/roster`); an unpublished entry doesn't appear under
  `/teams/[team]` or `/teams/[team]/[player]`, and publishing/unpublishing
  takes effect immediately (those pages are `force-dynamic`).
- **Built**: creating a Player account (or adding Player to an existing
  one) auto-creates a linked, unpublished roster entry unless an existing
  one is picked instead; removing Player from a multi-role account
  auto-unpublishes (not deletes) the linked roster entry.

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
| Storage | `Player` is a Prisma table (`prisma/schema.prisma`), Admin-edited at `/dashboard/roster`. `teams.json` is still dev-edited JSON. | `Player` unchanged; open question on `teams.json` (see [Proposed issues](#proposed-issues)) |
| Roster ↔ account link | `User.playerSlug` — auto-created (own stub `Player` row) when Player is added with no existing entry picked, or picked from a dropdown to link an existing one; still a loose string match, not a foreign key | Auto-create/unpublish unchanged; the foreign key itself is still open — see [Data model changes](#data-model-changes) |
| Publish gate | **Built** — `published: Boolean` on `Player`, manually toggled from `/dashboard/roster`; auto-created stub entries also start unpublished | Unchanged |
| Removing Player role | **Built** — `updateUser` unpublishes (never deletes) the linked `Player` row when Player leaves the role set; `User.playerSlug` is left in place for a later re-add | Unchanged |
| Teams | `teams.json`, developer-edited | Likely stays low-churn enough to remain JSON, or migrates alongside `Player` — see open question in [Proposed issues](#proposed-issues) |

## Data model changes

- **Built**: Prisma `Player` model (replacing `players.json`): slug, team,
  name, number, position, bio, joinedYear, hometown?, isCaptain?,
  `published: Boolean`. No `photoUrl` field — dropped rather than carried
  over, since `PlayerAvatar.tsx`'s generated-initials avatars are the only
  thing rendered and the JSON field was already unused.
- **Not yet built**: a relation from `Player` to the `User` that owns the
  login (`userId`, nullable — a roster entry can exist without a login
  until an account is created, or vice versa depending on the build order
  chosen). `User.playerSlug` is still a loosely-typed string matched
  against `Player.slug`, not a foreign key. This is a separate piece of
  work from auto-create/unpublish below and was never a dependency of it —
  the loose string link was already enough to build on.
- **Built**: auto-create/unpublish triggers off the Player role being
  added to or removed from a `User`'s role set
  (`src/app/dashboard/users/actions.ts`'s `createStubPlayer`/
  `unpublishLinkedPlayer`, called from `createUser`/`updateUser`). Depended
  on [Account Management](./account-management.md)'s multi-role work
  (`User.roles` as a set), which had already landed.

## Permissions

Guests/Players/Trainers/Admins all read the same published roster; only an
Admin publishes/unpublishes entries (bundled into "Manage public content
(CMS)" plus the account-management flows in
[docs/roles/admin.md](../roles/admin.md)). See
[docs/roles-and-permissions.md](../roles-and-permissions.md) for the
authoritative permission rule.

## Proposed issues

- [x] **Add `Player` Prisma model with `published` flag, migrate off `players.json`** — done (`prisma/schema.prisma`, `src/lib/repository.ts`). `players.json` remains only as the one-time seed source in `prisma/seed.ts`.
- [x] **Admin dashboard: publish/unpublish and edit a roster entry** (bio, hometown, etc.) — done (`/dashboard/roster`, `/dashboard/roster/new`, `/dashboard/roster/[id]`). No photo field — see [Data model changes](#data-model-changes).
- [ ] **Link `Player` to `User` via foreign key, backfill `playerSlug` matches**.
- [x] **Auto-create unpublished `Player` row when Player role is added to an account** — done, `createStubPlayer` in `src/app/dashboard/users/actions.ts`.
- [x] **Unpublish (not delete) `Player` row when Player role is removed** — done, `unpublishLinkedPlayer` in `src/app/dashboard/users/actions.ts`.
- [ ] **Decide whether `teams.json` migrates to Prisma alongside `Player`, or stays static** — open question, teams change far less often than rosters; resolve before filing the `Player` migration issue so the scope is settled up front.
