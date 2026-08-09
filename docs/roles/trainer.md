# Role: Trainer

A coach. `role: "TRAINER"`.

Part of the [Roles & Permissions](../roles-and-permissions.md) specification.
**Status: specification** — parts are not built yet, see
[Current vs. target](#current-vs-target).

Trainers are **club-wide, not scoped to a team**. Any Trainer may run sessions
for any team.

## Can

- Create and edit **training sessions** for any team: date, time, venue,
  address, training plan, notes.
- Create and edit **games/matches** for any team, including the opponent.
- **Cancel or delete** events, so a called-off session stops showing on the
  public site.
- **Mark attendance** for any session — present, absent, excused, unknown.
  Attendance is the Trainer's record; players do not self-mark or RSVP.
- View **attendance reports** — per-player and per-team summaries over a date
  range, the same figures an Admin sees.

## Cannot

- Create or edit **club-wide ("both teams") events**. Those are Admin-only.
- Create, edit, disable, or delete **user accounts** of any kind — including
  Player logins for players they coach.
- Manage **public content**: no news, no roster editing, no shop, no club info.
- See **membership or fee records** for anyone.
- See the **audit log**.
- See members' **contact details**. A Trainer reaches players through the
  channels the club already uses, not through the site.

## No team field

Because Trainers are club-wide, a Trainer account carries **no `team` value at
all**, like an Admin. The account creation form stops asking for one, and no
permission check consults it.

This is a deliberate widening of the current model, in which a Trainer is
locked to boys or girls. The trade-off accepted: an absent Trainer's sessions
can be picked up by any colleague without an Admin reassigning anything. It
also means two Trainers can edit or cancel the same event: this is
**silent last-write-wins**, with no conflict warning, edit history, or
notification to the Trainer who made the earlier change — the same trade-off
as above, just applied to concurrent edits instead of absence.

## Multi-role

A Trainer account can also hold Player and/or Admin roles — see
[Multi-role accounts](../roles-and-permissions.md#multi-role-accounts).
Trainer+Admin is permitted but largely redundant, since Admin already
includes full event override. Trainer+Player (a playing coach) keeps their
own roster entry and personal attendance view in addition to full club-wide
Trainer powers.

## Relationship to Admin

Admins hold **full override** on events, including ones a Trainer created —
they are the backstop when no Trainer is available. Trainers and Admins
therefore overlap on the schedule; the difference is that Admins additionally
own accounts, content, fees, and club-wide events, while Trainers own nothing
outside the schedule and attendance.

## Account lifecycle

- **Created** by an Admin from `/dashboard/users`.
- **Password** is Admin-set and temporary; forced change on first login.
- **Deactivated** as a **soft disable** — events they created and attendance
  they recorded are retained, and the events remain editable by other Trainers
  and Admins.

## Current vs. target

| | Today | Target |
|---|---|---|
| Team scope | One team, enforced by `canManageTeam` (`src/lib/auth-helpers.ts:21`) | Club-wide, any team |
| `team` field | Required at account creation | Dropped |
| Training sessions | Create/edit, own team | Create/edit, any team |
| Games | Create/edit, own team | Create/edit, any team |
| Cancel/delete events | Own team | Any team |
| Club-wide events | Blocked (`canManageEventTeam:28`) | Unchanged — still blocked |
| Attendance marking | Own team | Any team |
| Attendance reports | Do not exist | Can view |
| Accounts / content / fees / audit | No access | Unchanged — no access |
| Roles | Single role only | Can combine with Player/Admin |

Removing team scoping touches `canManageTeam`, `canManageEventTeam`, the
account creation form and action, and the `NewEventForm` "locked team" pattern
that currently pairs a disabled `<select>` with a hidden input.
