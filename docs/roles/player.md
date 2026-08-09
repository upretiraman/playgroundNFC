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
roster record can never drift apart.

The auto-created entry is **hidden from the public site until an Admin
publishes it**. Real names go on a public website by deliberate act, never as a
side effect of account creation.

A Player's team follows from their roster entry rather than being set
independently on the account.

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
multi-role account unpublishes but retains that roster entry.

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
| Schedule scope | Own team only (`src/app/dashboard/schedule/page.tsx:16`) | Whole club |
| Attendance visibility | Own record | Unchanged |
| Roster link | Optional, picked from `players.json` dropdown | Auto-created, publish-gated |
| Password | Admin-set, permanent | Forced change on first login and after reset |
| Fee records | Do not exist | Sees own itemized record, outstanding auto-computed |
| Read-only | Yes | Unchanged |
| Roles | Single role only | Can combine with Trainer/Admin |

The roster-link change is the significant one: it requires players to move from
`src/lib/data/players.json` into a database table with a `published` flag.
