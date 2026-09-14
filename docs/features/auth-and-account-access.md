# Auth & Account Access

How a member gets into their own account and controls over their own
session — sign-in, route protection, and the forced-password-change flow.
Distinct from [Account Management](./account-management.md): this document
is a member acting on *their own* access; Account Management is an Admin
acting on *someone else's* account.

**Status**: Sign-in, route protection, and forced password change are all
live. One deviation from the target below: since the app has no live
session-update mechanism, changing the password signs the member out and
sends them to `/login` rather than clearing the flag in place and continuing
to the originally requested page — see the note under
[Current vs. target](#current-vs-target).

## User stories

- As a **Player, Trainer, or Admin**, I want to sign in with my email and
  password, so I can reach the dashboard.
- As a **Guest**, if I try to reach `/dashboard/**` without signing in, I
  want to be redirected to `/login` and returned to where I was headed
  after I sign in, so I don't lose my place.
- As any member, when an Admin creates my account or resets my password, I
  want to be forced to set my own new password on my very next login before
  reaching the dashboard, so the temporary password the Admin gave me out of
  band doesn't stay valid indefinitely.
- As any member, I want no "change my password" page outside that forced
  flow, so there's exactly one, well-understood path to a password change
  (an Admin resets it) rather than two divergent ones.

## Acceptance criteria

- `/login` accepts email + password; invalid credentials show an error and
  do not sign in (already implemented via the Credentials provider).
- Signing in issues a JWT session carrying `role`, `team`, and `playerSlug`
  (already implemented; see `src/auth.ts`).
- Any request under `/dashboard/**` without a valid session redirects to
  `/login?callbackUrl=<original path>` (already implemented via
  `src/proxy.ts` — **not** `middleware.ts`, see `CLAUDE.md`'s gotchas).
- A `User` with `mustChangePassword: true` who signs in successfully is
  routed to `/dashboard/change-password` before any other `/dashboard/**`
  page is reachable (`src/proxy.ts`), and cannot navigate around it.
- After setting a new password, `mustChangePassword` clears
  (`src/app/dashboard/change-password/actions.ts`). Rather than continuing
  to the originally requested page in the same session, the member is
  signed out and sent to `/login` — the session JWT would otherwise keep
  carrying the stale `mustChangePassword: true` claim until it next
  refreshes, re-triggering the same redirect loop.
- There is no page anywhere in the app for a signed-in member to
  voluntarily change their password outside that forced flow.

## Out of scope

- Self-registration — there is none, by design; not part of this document.
- Email-based password reset (a "forgot password" link/email flow) — the
  spec explicitly rules this out; resets are Admin-initiated, not
  self-service. See [Account Management](./account-management.md) for the
  Admin side of a reset.
- Multi-factor authentication — not requested, not in the target spec.

## Current vs. target

| Area | Today | Target |
|---|---|---|
| Sign-in | Credentials provider, JWT session | Unchanged |
| Route protection | `src/proxy.ts`, `/dashboard/:path*` | Unchanged |
| Password lifecycle | Forced change after account creation or an Admin-initiated reset | Unchanged |
| Post-change flow | Signs the member out to `/login` (session JWT can't be live-patched) | Clears the flag in place, continues to the originally requested page |
| Voluntary password change | None | Still none — this is intentional, not a gap |

## Data model changes

- `User.mustChangePassword: Boolean` (default `true` on creation, set `true`
  again on an Admin-triggered reset — see
  [Account Management](./account-management.md), cleared once the member
  sets their own password).
- `SessionUser` (`src/lib/auth-types.ts`) carries `mustChangePassword`
  alongside the multi-role `roles` array from
  [Account Management](./account-management.md).

## Permissions

Applies identically to every role once authenticated; Guest access rules
(never gate a public page behind login) are covered in
[docs/roles/guest.md](../roles/guest.md). The password-lifecycle rules above
are the "Passwords" cross-cutting section of
[docs/roles-and-permissions.md](../roles-and-permissions.md) — this document
restates them as acceptance criteria but does not change the rule.

## Proposed issues

- [x] **Add `mustChangePassword` to `User`, default `true` on creation**.
- [x] **Build the forced "set new password" screen and route guard** — intercepts `/dashboard/**` navigation while the flag is set.
- [x] **Clear `mustChangePassword` on successful password set** — ships as sign-out-and-relogin rather than an in-place redirect; see the deviation noted above.
- [ ] **Revisit the post-change flow to avoid the forced sign-out** — would need a live session-update mechanism (e.g. NextAuth's `update()` trigger) to clear the JWT claim without ending the session.
