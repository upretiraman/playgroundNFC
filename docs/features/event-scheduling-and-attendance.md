# Event Scheduling & Attendance

Training sessions and games/matches: creating and editing them, marking who
showed up, and surfacing the schedule both publicly (`/training`, home page
teaser) and to members (`/dashboard/schedule`). The one capability that
already reads/writes live from Postgres/libSQL rather than JSON, and the one
with the most current-vs-target movement — team-scoping is being removed
entirely.

**Status**: Live. Team-scoping (Trainer and Player limited to one team) is
the current behavior; the target removes it.

## User stories

- As a **Guest**, I want to see upcoming training sessions on `/training`
  and the home page, split by team, so I know when and where to show up.
- As a **Trainer**, I want to create a training session or game for any
  team (not just "my" team), including a training plan, so I'm not blocked
  from covering for an absent colleague.
- As a **Trainer**, I want to mark each roster player's attendance
  (present/absent/excused/unknown) for a session, so there's a record of
  who showed up.
- As a **Trainer**, I want to see attendance reports (per-player, per-team,
  over a date range), so I can spot patterns without re-deriving them by
  hand.
- As an **Admin**, I want to create club-wide ("both teams") events that no
  Trainer can create, so joint sessions have an owner with the authority to
  schedule them.
- As a **Player**, I want to see the whole club's schedule (not just my
  team's), so I can follow the other team's fixtures too.
- As a **Player**, I want to see only my own attendance history, so my
  record stays private from teammates.

## Acceptance criteria

- `/training` and the home page teaser show only events from today onward
  (already implemented via `listUpcomingEvents`), and must stay
  `force-dynamic` per `CLAUDE.md`'s gotcha about static rendering + live DB
  data.
- `/dashboard/schedule` lists events; creating one requires type, team,
  date, start/end time, venue, address, and (for games) opponent or (for
  training) a plan; a new event auto-creates an `UNKNOWN` attendance row
  for every player on the affected team(s) (already implemented).
- A Trainer can create/edit/cancel events and mark attendance for **any**
  team, not just one — this is a **behavior change**, not an extension: it
  removes today's `canManageTeam` team boundary. See
  [docs/roles/trainer.md](../roles/trainer.md).
- Club-wide ("both") events remain Admin-only to create — unchanged by the
  Trainer de-scoping.
- A Player sees the **whole club's** schedule (today: own team only, per
  `schedule/page.tsx:16`) but only **their own** attendance record.
- Attendance reports (per-player/per-team summaries over a date range) are
  new — Trainer and Admin only, no equivalent exists today.
- Two Trainers editing/cancelling the same event is **silent
  last-write-wins** — no conflict warning, no edit history, no notification.
  This is an accepted trade-off, not a bug to fix as part of this document.

## Out of scope

- Player self-marking or RSVPing to a session — attendance stays the
  Trainer's record alone, explicitly ruled out in
  [docs/roles/player.md](../roles/player.md).
- Event edit history / conflict resolution between Trainers — see the
  "silent last-write-wins" note above; not addressed here.
- Recurring/repeating event templates — every event today is created
  individually; not requested.

## Current vs. target

| Area | Today | Target |
|---|---|---|
| Trainer scope | One team, `canManageTeam` (`src/lib/auth-helpers.ts:21`) | Club-wide, any team |
| Trainer `team` field | Required at account creation | Dropped |
| Player schedule view | Own team only (`schedule/page.tsx:16`) | Whole club |
| Player attendance view | Own record | Unchanged |
| Club-wide events | Admin-only (`canManageEventTeam`) | Unchanged |
| Attendance reports | Don't exist | Trainer + Admin |

## Data model changes

- No new tables — `Event` and `Attendance` already model everything needed.
- `canManageTeam` / `canManageEventTeam` in `src/lib/auth-helpers.ts` drop
  their team-equality check for Trainers (Admin behavior already ignores
  team). `canManageEventTeam`'s "both" → Admin-only branch is unchanged.
- Depends on [Account Management](./account-management.md)'s `User.team`
  removal for Trainers landing in the same wave — see the build order in
  [docs/features.md](../features.md).
- Attendance reports are a new read path over existing `Attendance` rows —
  no schema change, just new queries/UI.

## Permissions

Authoritative rule lives in
[docs/roles-and-permissions.md](../roles-and-permissions.md),
[docs/roles/trainer.md](../roles/trainer.md), and
[docs/roles/player.md](../roles/player.md) — this document does not
restate the matrix, only the acceptance criteria that follow from it.

## Proposed issues

- [ ] **Drop team-scoping from `canManageTeam`/`canManageEventTeam` for Trainers** — coordinate with the `User.team` schema change in Account Management so both land together.
- [ ] **Remove the team field from Trainer account creation** (`NewUserForm`, `createUser` action) — coordinate with Account Management.
- [ ] **Widen Player schedule view to the whole club** — `schedule/page.tsx:16`, a scope change plus tests.
- [ ] **Build attendance reports** (per-player and per-team, date-range filter) for Trainer + Admin.
