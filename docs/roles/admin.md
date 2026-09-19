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

- News articles — **built**: `/dashboard/news` (create, edit, delete)
- Team rosters, including publishing or unpublishing auto-created entries
  — **built**: `/dashboard/roster` (see [Player](player.md))
- Shop products
- Club info — mission, motto, values, contact details — **built**:
  `/dashboard/club-info`
- Committee roles — **built**: `/dashboard/committee` (create, edit,
  delete; display order set by an editable number, not drag-and-drop)
- Membership tiers — **built**: `/dashboard/membership-tiers` (create,
  edit, delete)

This is what moves the site off dev-edited JSON files; see
[Data model consequences](../roles-and-permissions.md#data-model-consequences).
Player profiles, news, club info, committee roles, and membership tiers
have all made that move — the content migration this bullet list
describes is complete.

## Records

- **Attendance reports** across the club — per-player and per-team summaries.
- **Membership/fee contribution records** for all members, entered manually
  — amount, date, and period/tier per contribution. Outstanding is computed
  automatically from the tier's fee, not entered by hand. Sees an itemized
  view per member, the same shape a member sees for themselves. Built:
  `/dashboard/fees` (list of every Player-role member) and
  `/dashboard/fees/[id]` (itemized view + record-contribution form).

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
| Create accounts | Yes (`src/app/dashboard/users/actions.ts`) | Unchanged |
| Edit accounts | Yes | Unchanged |
| Reset passwords | Yes, with forced change | Unchanged |
| Deactivate accounts | Yes, soft disable | Unchanged |
| Create other Admins | **No** — super-admin only | Unchanged |
| Events | Full control, any team | Unchanged |
| Club-wide events | Admin-only | Unchanged |
| Public content | All full CMS from the dashboard: player profiles (`/dashboard/roster`, create/edit/publish/unpublish), news (`/dashboard/news`), club info (`/dashboard/club-info`), committee roles (`/dashboard/committee`), membership tiers (`/dashboard/membership-tiers`) | Unchanged — content migration complete |
| Attendance reports | Can view (`/dashboard/attendance`) | Unchanged |
| Fee records | Sees all, itemized (`/dashboard/fees`); manual entry, outstanding auto-computed | Unchanged |
| Audit log | Covers accounts, events/attendance, roster CMS, and fee records (incl. super-admin actions) — **no access** to read it, super-admin only | Also covers the rest of the CMS once those write paths exist |
| Roles | Can combine with Trainer/Player | Unchanged |

Losing the ability to create fellow Admins was a **reduction** from what the
role could do before the super-admin flag existed — already built, so an
ordinary Admin cannot create, edit, reset, or deactivate a fellow Admin
today.
