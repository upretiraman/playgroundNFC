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
- **Membership/fee contribution records** for all members, entered manually
  — amount, date, and period/tier per contribution. Outstanding is computed
  automatically from the tier's fee, not entered by hand. Sees an itemized
  view per member, the same shape a member sees for themselves.

## Multi-role

An Admin account can also hold Trainer and/or Player roles — see
[Multi-role accounts](../roles-and-permissions.md#multi-role-accounts).

## Cannot

- Create, edit, promote, demote, or disable **another Admin**. That is
  super-admin territory, and it is the main limit on this otherwise very broad
  role.
- Grant or revoke the **super-admin flag**.
- View the **audit log** — restricted to super-admins so that ordinary Admin
  actions remain reviewable by a smaller circle. Every action in this
  document (accounts, events, content, fee records) is still written to that
  log — this Admin simply can't read it back.
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
| Fee records | Do not exist | Sees all, itemized; manual entry, outstanding auto-computed |
| Audit log | Does not exist | Covers accounts, events, content, and fees (incl. super-admin actions) — **no access** to read it, super-admin only |
| Roles | Single role only | Can combine with Trainer/Player |

Losing the ability to create fellow Admins is a **reduction** in what the role
can do today. Implementing it needs the super-admin flag to exist first, or the
club is left with no one able to add an Admin.
