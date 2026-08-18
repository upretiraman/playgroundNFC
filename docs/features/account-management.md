# Account Management

An Admin's control over everyone else's accounts: creating, editing,
resetting, and deactivating Player/Trainer/Admin logins, plus the
super-admin flag that gates Admin-on-Admin management. This is the
foundation the roles specification's suggested build order puts first —
almost every other capability's target state depends on the multi-role
`User.role` set landing here. Distinct from
[Auth & Account Access](./auth-and-account-access.md), which is a member
acting on their *own* session.

**Status**: Create-only exists today. Edit, reset, deactivate, multi-role,
and the super-admin flag are all target only.

## User stories

- As an **Admin**, I want to create Player, Trainer, or Admin accounts with
  a temporary password, so new members and coaches get access.
- As an **Admin**, I want to edit an existing account (name, email, role
  set), so I can fix mistakes or reflect a real change without deleting and
  recreating the account.
- As an **Admin**, I want to reset a member's password, issuing a new
  temporary one they're forced to change on next login, so I can help
  someone locked out without emailing them a permanent password.
- As an **Admin**, I want to deactivate (not delete) an account when
  someone leaves the club, so their event/attendance/roster history stays
  intact.
- As an **Admin**, I want to grant an account more than one role (e.g. a
  playing coach gets both Player and Trainer), so one person doesn't need
  two logins.
- As a **super-admin**, I want to be the only one who can create, edit,
  disable, or promote a fellow Admin, so the club's most powerful role
  isn't self-managing.
- As a **super-admin**, I want to grant or revoke the super-admin flag on
  another Admin, so the club is never one lost account away from an
  unmanageable site.

## Acceptance criteria

- Creating an account already works for a single role (`createUser` in
  `src/app/dashboard/users/actions.ts`); the target adds: editing an
  existing account, resetting its password (sets `mustChangePassword`, see
  [Auth & Account Access](./auth-and-account-access.md)), and deactivating
  it.
- `role` becomes a **set** — an account can hold any combination of
  Player/Trainer/Admin. Every `role === "X"` check in the codebase becomes
  a "does the set contain X" check. See
  [Multi-role accounts](../roles-and-permissions.md#multi-role-accounts).
- Adding Player to an account's role set auto-creates its roster entry
  (unpublished); removing Player unpublishes but retains it — see
  [Teams & Player Rosters](./teams-and-rosters.md).
- Deactivation is a **soft disable** everywhere: the account can no longer
  authenticate, but nothing it created or is linked to is deleted.
- An `isSuperAdmin` boolean gates: creating/editing/disabling/promoting
  **other Admins**, and granting/revoking the super-admin flag itself. An
  ordinary Admin cannot do any of the three, even via a hand-crafted
  request — the server action re-checks, not just the page.
- A super-admin cannot demote or disable themselves, nor the last remaining
  super-admin, if doing so would leave zero super-admins.
- Every mutation this document describes is written to the
  [Audit Log](./audit-log.md) — implement the write path alongside each
  action rather than bolting it on afterward, even though only a
  super-admin can read the log back.

## Out of scope

- The forced-password-change screen itself (the member-facing flow) — see
  [Auth & Account Access](./auth-and-account-access.md); this document only
  covers the Admin triggering a reset.
- Reading the audit log — see [Audit Log](./audit-log.md); this document
  only covers writing to it.
- Self-registration — still none, by design.

## Current vs. target

| Area | Today | Target |
|---|---|---|
| Create accounts | Yes, single role | Unchanged, but role becomes a set |
| Edit accounts | No | Yes (name, email, role set) |
| Reset passwords | No | Yes, forces change on next login |
| Deactivate accounts | No | Yes, soft disable |
| Admin-manages-Admin | Any Admin can create Admins | Super-admin only |
| Roles | Single value | A set — any combination, plus the `isSuperAdmin` flag |
| Roster auto-create | N/A | Adding Player role auto-creates a `Player` row |
| `User.team` | Required for Player/Trainer at creation | Meaningful only for Players (follows roster entry); dropped for Trainers |

## Data model changes

- `User.role` moves from a single string to a set — likely a join table or
  a small array column; every `role === "X"` check across the codebase
  becomes a "set contains X" check.
- New `User` fields: `isSuperAdmin: Boolean` (default `false`,
  `prisma/seed.ts`'s bootstrap Admin gets `true`), `isActive: Boolean`
  (soft disable), `mustChangePassword: Boolean` (see
  [Auth & Account Access](./auth-and-account-access.md)).
- `User.team` is dropped for Trainers (club-wide, see
  [Event Scheduling & Attendance](./event-scheduling-and-attendance.md))
  and becomes meaningful only for Players, whose team follows their roster
  entry rather than being set independently.
- New permission helper alongside `canManageTeam` in
  `src/lib/auth-helpers.ts` enforcing the `isSuperAdmin` checks, called from
  the server action layer, not only the page.
- This is the **schema foundation** every later capability in the roles
  spec touches — see the suggested build order in
  [docs/features.md](../features.md).

## Permissions

Authoritative rule lives in
[docs/roles-and-permissions.md](../roles-and-permissions.md),
[docs/roles/admin.md](../roles/admin.md), and
[docs/roles/super-admin.md](../roles/super-admin.md) — this document does
not restate the matrix, only the acceptance criteria that follow from it.

## Proposed issues

- [ ] **Add `isSuperAdmin` to `User`, set on bootstrap Admin in `prisma/seed.ts`** — must land before anything below that depends on Admins losing Admin-management, per the roles spec's suggested build order.
- [ ] **Add super-admin permission helper + server-action gating for Admin-on-Admin actions**.
- [ ] **Convert `User.role` to a set** — schema, every `role === "X"` check, migration for existing single-role rows.
- [ ] **Add `isActive` and `mustChangePassword` to `User`**.
- [ ] **Build account edit UI/action** (name, email, role set).
- [ ] **Build password-reset UI/action** (sets `mustChangePassword`).
- [ ] **Build account deactivate/reactivate UI/action** (soft disable).
- [ ] **Wire Player-role-add/remove to roster auto-create/unpublish** — coordinate with [Teams & Player Rosters](./teams-and-rosters.md).
- [ ] **Drop the `team` field from Trainer account creation** — coordinate with [Event Scheduling & Attendance](./event-scheduling-and-attendance.md).
- [ ] **Write audit-log entries for every account mutation above** — coordinate with [Audit Log](./audit-log.md) so the model lands before or alongside the first write.
