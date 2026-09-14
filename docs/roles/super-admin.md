# Role: Super-admin

Not a separate role — a **flag on an Admin account**. `role` stays `"ADMIN"`;
a boolean marks the holder as a super-admin.

Part of the [Roles & Permissions](../roles-and-permissions.md) specification.
**Status: partially built** — the flag itself and Admin-on-Admin gating
exist; granting/revoking it from the dashboard and the audit log do not.
See [Current vs. target](#current-vs-target).

A super-admin holds **every [Admin](admin.md) permission**, plus the three
below.

## Can, exclusively

- **Manage Admin accounts** — create, edit, demote, or disable a fellow Admin.
  No ordinary Admin may do this.
- **Grant the super-admin flag** to another Admin. Multiple super-admins may
  exist at once, deliberately: the club should never be one lost account away
  from an unmanageable site.
- **View the audit log** of admin actions — covering every mutation an Admin
  or super-admin can make: accounts, events, content, and fee records,
  including super-admins' own actions. Each entry is a simple
  who/action/target/when record (no before/after diff), retained
  indefinitely. Restricting read access to super-admins keeps ordinary
  Admins accountable to a smaller circle rather than to no one.

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
| Grant/revoke the flag | **No** — DB/seed only, no dashboard UI | Yes, super-admin only |
| Lockout safeguard (can't zero out super-admins) | N/A — no UI to revoke it yet | Enforced when grant/revoke ships |
| Audit log | Does not exist | Covers accounts, events, content, and fee records; super-admin-only read |

What shipped: the flag itself and the gating it exists for — an ordinary
Admin cannot create, edit, reset, or deactivate a fellow Admin
(`src/app/dashboard/users/actions.ts`'s `loadManageableTarget` /
`readRoleSet` calls `canManageAdmins`), and the "Administrator" role
checkbox is hidden from them in `NewUserForm`/`EditUserForm`.

What's left:

1. UI for a super-admin to grant/revoke the flag on another Admin, plus the
   lockout safeguard (can't demote themselves or the last remaining
   super-admin to zero).
2. An audit log model (actor, action, target, timestamp) written on every
   Admin/super-admin mutation across accounts, events, content, and fee
   records, with read access gated to super-admins.
