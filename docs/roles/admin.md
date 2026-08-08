# Role: Admin

Runs the club's day-to-day operations in the app. `role: "ADMIN"`.

Part of the [Roles & Permissions](../roles-and-permissions.md) specification.
**Status: specification** — parts are not built yet, see
[Current vs. target](#current-vs-target).

An Admin without the super-admin flag is what this page describes. For managing
fellow Admins and reading the audit log, see [Super-admin](super-admin.md).

## Accounts (Players and Trainers)

- **Create** accounts — name, email, temporary password, role, and for Players
  the auto-created roster entry.
- **Edit** existing accounts — name, email, role, roster link.
- **Reset passwords**, issuing a new temporary password. The member is forced
  to change it on next login.
- **Deactivate** accounts. Deactivation is a **soft disable**: the member can
  no longer log in, but their events, attendance history, and roster entry are
  retained. Club records are never destroyed by a departure.

## Events — full override

- Create, edit, cancel, and delete **any event of any team**, including events
  a Trainer created. The Admin is the backstop when a Trainer is unavailable.
- **Club-wide ("both teams") events are Admin-only** — no Trainer may create
  them.
- Mark attendance on any session.

## Content — full CMS

Admins manage all public website content from the dashboard:

- News articles
- Team rosters, including publishing or unpublishing auto-created entries
- Shop products
- Club info — mission, motto, values, contact details
- Membership tiers

This is what moves the site off dev-edited JSON files; see
[Data model consequences](../roles-and-permissions.md#data-model-consequences).

## Records

- **Attendance reports** across the club — per-player and per-team summaries.
- **Membership/fee contribution records** for all members: who has paid, when,
  and what is outstanding.

## Cannot

- Create, edit, promote, demote, or disable **another Admin**. That is
  super-admin territory, and it is the main limit on this otherwise very broad
  role.
- Grant or revoke the **super-admin flag**.
- View the **audit log** — restricted to super-admins so that ordinary Admin
  actions remain reviewable by a smaller circle.
- Hard-delete anything. Removal is always a soft disable.

## Account lifecycle

- **Created** by a super-admin. The first Admin is the bootstrap account
  created by `prisma/seed.ts`, which also carries the super-admin flag.
- **Password** is set by the creating super-admin and forced to change on first
  login.
- **Carries no `team`** — Admins are club-wide.

## Current vs. target

| | Today | Target |
|---|---|---|
| Create accounts | Yes (`src/app/dashboard/users/actions.ts:17`) | Unchanged |
| Edit accounts | No | Yes |
| Reset passwords | No | Yes, with forced change |
| Deactivate accounts | No | Yes, soft disable |
| Create other Admins | Yes | **No** — super-admin only |
| Events | Full control, any team | Unchanged |
| Club-wide events | Admin-only | Unchanged |
| Public content | JSON files, dev-edited | Full CMS from the dashboard |
| Attendance reports | Do not exist | Can view |
| Fee records | Do not exist | Sees all |
| Audit log | Does not exist | **No access** — super-admin only |

Losing the ability to create fellow Admins is a **reduction** in what the role
can do today. Implementing it needs the super-admin flag to exist first, or the
club is left with no one able to add an Admin.
