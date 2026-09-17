# Role: Player

A club member on a team roster. `role: "PLAYER"`.

Part of the [Roles & Permissions](../roles-and-permissions.md) specification.
**Status: specification** — parts are not built yet, see
[Current vs. target](#current-vs-target).

The role is **read-only**. Setting a password when forced to after an Admin
reset is the single exception.

## Can

- See the **entire club schedule** — both teams' training sessions and games,
  plus club-wide events. Nothing is hidden between teams; a member may follow
  the other team's fixtures.
- See **their own attendance record only**: present, absent, or excused across
  past sessions.
- See **their own membership/fee contributions, itemized** — amount, date,
  and period/tier for each entry, plus an outstanding total computed
  automatically from their tier's fee (not entered by hand).
- Set a new password **when forced to** after account creation or an Admin
  reset.

## Cannot

- See any teammate's attendance, individually or in aggregate.
- See anyone else's fee records.
- Mark or RSVP their own attendance. Attendance is the Trainer's record alone;
  a Player who cannot attend tells the Trainer through the club's existing
  channels, not through the site.
- Change their password voluntarily — there is no self-service change page.
  They ask an Admin for a reset.
- Edit their own contact details, name, or roster entry.
- Create, edit, or delete anything: events, accounts, content.

## Roster link

Creating a Player account **auto-creates their roster entry**, so a login and a
roster record can never drift apart in the common case. **Built** — an Admin
creating a Player account (or adding Player to an existing one) gets an
auto-created, unpublished stub `Player` row (`createStubPlayer` in
`src/app/dashboard/users/actions.ts`) unless they instead pick an existing
`Player` row via the dropdown (`User.playerSlug`, still a loose string
reference, not a foreign key — a login and a roster record can still drift
apart if an Admin deliberately links to an existing entry that later gets
edited independently).

The auto-created entry is **hidden from the public site until an Admin
publishes it**. Real names go on a public website by deliberate act, never as a
side effect of account creation. **Built** — `Player` is a DB table with a
`published` flag, an auto-created stub always starts unpublished, and an
Admin can create, edit, and publish/unpublish profiles from
`/dashboard/roster`.

A Player's team follows from their roster entry rather than being set
independently on the account. **Not built** — `User.team` is still set
independently when an Admin creates/edits a Player account.

## Multi-role

A Player account can also hold Trainer and/or Admin roles at once — e.g. a
playing coach. See
[Multi-role accounts](../roles-and-permissions.md#multi-role-accounts) for
the general rules. The practical effect for a Player: their own roster
entry, personal schedule view, and personal attendance/fee record described
above stay theirs regardless of what other roles they also hold — a
Player+Trainer still sees their own attendance the way any Player does, in
addition to the club-wide Trainer powers on top.

Adding the Player role to an existing Trainer/Admin account auto-creates a
roster entry, same as a fresh Player signup. Removing Player from a
multi-role account unpublishes but retains that roster entry — both
**built**, see [Roster link](#roster-link) above.

## Account lifecycle

- **Created** by an Admin from `/dashboard/users` — no self-registration.
- **Password** is set by the Admin as a temporary one and communicated out of
  band; the Player is forced to change it on first login.
- **Deactivated** by an Admin as a **soft disable** — they can no longer log
  in, but their attendance history and roster entry are retained. Nothing is
  deleted when a member leaves.

## Current vs. target

| | Today | Target |
|---|---|---|
| Schedule scope | Whole club (`src/app/dashboard/schedule/page.tsx`) | Unchanged |
| Attendance visibility | Own record | Unchanged |
| Roster link | Auto-created (unpublished stub) when Player is added, or picked from a `Player` (DB) dropdown instead — still `User.playerSlug`, not a foreign key | Auto-create/unpublish unchanged; foreign key still open |
| Roster storage / publish gate | `Player` DB table with a `published` flag; Admin CRUD at `/dashboard/roster`; auto-created entries start unpublished | Unchanged |
| Password | Forced change on first login and after reset | Unchanged |
| Fee records | Sees own itemized record, outstanding auto-computed (`/dashboard/fees`) | Unchanged |
| Read-only | Yes | Unchanged |
| Roles | Can combine with Trainer/Admin | Unchanged |

The remaining gap is narrower now: players have moved from
`src/lib/data/players.json` into a database table with a `published` flag,
and creating/removing the link is an automatic side effect of adding/removing
the Player role. What's left is turning `User.playerSlug` into a real
foreign key (see [Data model consequences](../roles-and-permissions.md#data-model-consequences)
item 2) and having a Player's team follow their roster entry instead of
being set independently on the account.
