# Feature Requirement Documents

An index of the site's capabilities, each documented separately in
`docs/features/` so it can be turned into GitHub issues independently of the
others. Companion to [docs/roles-and-permissions.md](roles-and-permissions.md),
which stays the single source of truth for **who can do what** — these
documents describe **what each capability does** and reference the roles
spec rather than repeating its matrix. See [CONTEXT.md](../CONTEXT.md) for
the vocabulary used across all of them (Feature/Capability, Requirement
document, Workitem).

## The capabilities

| Capability | Summary | Status |
|---|---|---|
| [Public Content & Static Info](features/public-content.md) | Home, Club, Contact — mission, values, committee, membership tier descriptions | Live, JSON-backed |
| [News](features/news.md) | Article listing + detail pages | Live, JSON-backed |
| [Teams & Player Rosters](features/teams-and-rosters.md) | Team/roster browsing, player profiles | Live browsing; roster auto-create/publish-gating is target only |
| [Shop](features/shop.md) | Public merchandise browsing + Admin catalog management | Live, fully built, previously undocumented |
| [Auth & Account Access](features/auth-and-account-access.md) | Sign-in, session/route protection, forced password change | Live sign-in; forced reset is target only |
| [Event Scheduling & Attendance](features/event-scheduling-and-attendance.md) | Training/game scheduling, attendance marking, public schedule | Live; Trainer de-scoping and Player schedule widening are target only |
| [Account Management](features/account-management.md) | Admin creates/edits/resets/disables other members' accounts; multi-role; super-admin flag | Create-only is live; everything else is target only |
| [Membership & Fee Records](features/membership-and-fees.md) | Manual contribution entry, auto-computed outstanding balance | Not built |
| [Audit Log](features/audit-log.md) | Who-did-what-to-what-when across every Admin/super-admin mutation | Not built |

## Suggested build order

This sequences work **across** the capabilities above; each document's own
"Proposed issues" section sequences the work **within** it. It follows the
dependency chain already laid out in
[docs/roles-and-permissions.md](roles-and-permissions.md#suggested-build-order),
expanded to cover the capabilities that spec doesn't itself track (Shop,
News, Public Content migration).

1. **Super-admin flag** ([Account Management](features/account-management.md)) —
   must land before Admins lose the ability to create fellow Admins, or
   nobody can add an Admin at all.
2. **Multi-role account model** ([Account Management](features/account-management.md)) —
   `User.role` becomes a set, plus `isActive` and `mustChangePassword`. This
   is the schema foundation that steps 3–7 below all touch.
3. **Forced password change flow** ([Auth & Account Access](features/auth-and-account-access.md)) —
   depends on `mustChangePassword` from step 2.
4. **Trainer de-scoping and Player schedule widening**
   ([Event Scheduling & Attendance](features/event-scheduling-and-attendance.md)) —
   depends on the `User.team` changes from step 2.
5. **Player/roster auto-create and publish-gating**
   ([Teams & Player Rosters](features/teams-and-rosters.md)) — depends on
   the multi-role model from step 2.
6. **Content migration to the database** ([Public Content & Static Info](features/public-content.md),
   [News](features/news.md)) — the largest single piece of work; mostly
   independent of steps 1–5, so it can run in parallel with them rather
   than strictly after. Unblocks the CMS and membership tier fee amounts.
7. **Shop permissions clarification** ([Shop](features/shop.md)) — no
   dependencies, low effort; slot in wherever convenient.
8. **Membership & fee records** ([Membership & Fee Records](features/membership-and-fees.md)) —
   depends on step 2 (stable member reference) and step 6 (`MembershipTier`
   gaining a fee amount).
9. **Audit log** ([Audit Log](features/audit-log.md)) — depends on steps
   2, 4, 5, 6, and 8 existing as write paths to wire into. Scope it to
   cover content and fee mutations from the start rather than adding those
   later, per the roles spec.

Two steps are worth calling out because they **reduce** existing access
rather than extend it: step 1 removes ordinary Admins' ability to create
fellow Admins, and step 4 removes the team boundary that currently scopes
Trainers. Both are intentional behavior changes, not side effects.
