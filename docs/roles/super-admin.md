# Role: Super-admin

Not a separate role — a **flag on an Admin account**. `role` stays `"ADMIN"`;
a boolean marks the holder as a super-admin.

Part of the [Roles & Permissions](../roles-and-permissions.md) specification.
**Status: built.** The flag itself, Admin-on-Admin gating, the audit log
(`/dashboard/audit-log`), and granting/revoking the flag from the dashboard
all exist. See [Current vs. target](#current-vs-target).

A super-admin holds **every [Admin](admin.md) permission**, plus the three
below.

## Can, exclusively

- **Manage Admin accounts** — create, edit, demote, or disable a fellow Admin.
  No ordinary Admin may do this.
- **Grant the super-admin flag** to another Admin. Multiple super-admins may
  exist at once, deliberately: the club should never be one lost account away
  from an unmanageable site.
- **View the audit log** (`/dashboard/audit-log`) of admin actions —
  covering every mutation an Admin or super-admin can make: accounts,
  events, content, and fee records, including super-admins' own actions.
  Each entry is a simple who/action/target/when record (no before/after
  diff), retained indefinitely. Restricting read access to super-admins
  keeps ordinary Admins accountable to a smaller circle rather than to no
  one. Covers Trainer-authored event/attendance mutations too, since they
  flow through the same server actions as an Admin's.

## Where the flag comes from

The bootstrap Administrator created by `prisma/seed.ts` gets the flag
automatically. From there it spreads only by an existing super-admin granting
it — there is no self-promotion path and no UI for an ordinary Admin to request
it.

Granting **copies** the flag rather than moving it; the granting super-admin
keeps their own. Revoking is possible, and a super-admin may demote another
super-admin to ordinary Admin.

This is unrelated to
[multi-role accounts](../roles-and-permissions.md#multi-role-accounts): an
account's `role` set (Player/Trainer/Admin) and the `isSuperAdmin` flag are
independent concepts, but the flag still requires Admin present in that set.

## Why a flag and not a fourth role

Adding `SUPER_ADMIN` to `ROLES` would mean revisiting every role check in the
codebase, and every check that currently reads `role === "ADMIN"` would silently
stop matching the club's most powerful account. A separate boolean leaves all
existing Admin checks correct and adds a second, narrower check only where the
three exclusive powers are enforced.

## Lockout considerations

- Because multiple super-admins are allowed, the intended safeguard against
  losing access is **having more than one**, not a recovery flow. There is no
  email-based recovery and no self-service escalation.
- If every super-admin account is lost, recovery means a developer setting the
  flag directly in the database.
- A super-admin may **not** disable or demote themselves, nor disable or
  demote the last remaining super-admin, if doing so would leave zero
  super-admins. This applies whether it's self-demotion or removing the last
  other one — the flag can never hit zero holders through normal use.

## Current vs. target

| | Today | Target |
|---|---|---|
| `isSuperAdmin` flag on `User` | Yes, defaults false | Unchanged |
| Bootstrap Admin gets the flag | Yes (`prisma/seed.ts`) | Unchanged |
| Admin-on-Admin gating | Yes — `canManageAdmins` in `src/lib/auth-helpers.ts`, re-checked in every account action (`src/app/dashboard/users/actions.ts`) | Unchanged |
| Grant/revoke the flag | Yes — `setSuperAdmin` action, `SuperAdminToggleButton` on `/dashboard/users/[id]`, super-admin only | Unchanged |
| Lockout safeguard (can't zero out super-admins) | Enforced — `setSuperAdmin`, `setUserActive`, and `updateUser` (dropping the Administrator role) all block the action that would leave zero *active* super-admins | Unchanged |
| Audit log | Covers accounts (incl. `user.grantSuperAdmin`/`user.revokeSuperAdmin`), events/attendance, roster CMS, news, club info, committee roles, membership tiers, and fee records (incl. Trainer and super-admin actions); super-admin-only read (`/dashboard/audit-log`) | Unchanged |

What shipped: the flag itself and the gating it exists for — an ordinary
Admin cannot create, edit, reset, or deactivate a fellow Admin
(`src/app/dashboard/users/actions.ts`'s `loadManageableTarget` /
`readRoleSet` calls `canManageAdmins`), and the "Administrator" role
checkbox is hidden from them in `NewUserForm`/`EditUserForm`. Also shipped:
the `AuditEntry` model and `/dashboard/audit-log` (see
[Audit Log](../features/audit-log.md)), and grant/revoke itself —
`setSuperAdmin` (`src/app/dashboard/users/actions.ts`) is callable only by
an existing super-admin, only targets accounts that hold the Administrator
role, and is wired into a "Super-admin Access" card on
`/dashboard/users/[id]` via `SuperAdminToggleButton`. The lockout
safeguard counts *active* super-admins (a disabled account's flag doesn't
count as a usable safety net) and applies uniformly whether the flag would
hit zero through an explicit revoke, a deactivation
(`setUserActive`), or removing the Administrator role from the account's
role set (`updateUser`) — self-revocation is allowed as long as another
active super-admin remains, matching "the flag can never hit zero holders
through normal use" above.
