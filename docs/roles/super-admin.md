# Role: Super-admin

Not a separate role — a **flag on an Admin account**. `role` stays `"ADMIN"`;
a boolean marks the holder as a super-admin.

Part of the [Roles & Permissions](../roles-and-permissions.md) specification.
**Status: specification** — none of this is built yet.

A super-admin holds **every [Admin](admin.md) permission**, plus the three
below.

## Can, exclusively

- **Manage Admin accounts** — create, edit, demote, or disable a fellow Admin.
  No ordinary Admin may do this.
- **Grant the super-admin flag** to another Admin. Multiple super-admins may
  exist at once, deliberately: the club should never be one lost account away
  from an unmanageable site.
- **View the audit log** of admin actions — who created, edited, or disabled
  which account or event, and when. Restricting this to super-admins keeps
  ordinary Admins accountable to a smaller circle rather than to no one.

## Where the flag comes from

The bootstrap Administrator created by `prisma/seed.ts` gets the flag
automatically. From there it spreads only by an existing super-admin granting
it — there is no self-promotion path and no UI for an ordinary Admin to request
it.

Granting **copies** the flag rather than moving it; the granting super-admin
keeps their own. Revoking is possible, and a super-admin may demote another
super-admin to ordinary Admin.

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
- Whether a super-admin may disable *themselves* or the last remaining
  super-admin is **undecided** — the safe implementation refuses to remove the
  final flag, and that is what should be built unless the club says otherwise.

## Current vs. target

Nothing exists today. Every Admin is equal, any Admin can create another Admin,
and there is no audit log.

Implementation needs, at minimum:

1. An `isSuperAdmin` boolean on `User`, defaulting to false.
2. `prisma/seed.ts` setting it on the bootstrap Administrator.
3. A permission helper alongside `canManageTeam` in `src/lib/auth-helpers.ts`,
   enforced in the server action — not only on the page.
4. The Admin-management and audit-log UI gated behind it.

This is the **first thing to build** out of the whole specification: the
[Admin](admin.md) role loses the ability to create fellow Admins, so without
the flag in place the club would end up with no one able to add an Admin at
all.
