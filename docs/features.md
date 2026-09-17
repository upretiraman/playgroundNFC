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
| [Public Content & Static Info](features/public-content.md) | Home, Club, Contact — mission, values, committee, membership tier descriptions | Live, fully DB-backed (`ClubInfo`/`ClubRole`/`MembershipTier` + `/dashboard/club-info`/`/dashboard/committee`/`/dashboard/membership-tiers`) — content migration for this capability is complete |
| [News](features/news.md) | Article listing + detail pages | Live, DB-backed (`NewsItem` + `/dashboard/news` CMS) |
| [Teams & Player Rosters](features/teams-and-rosters.md) | Team/roster browsing, player profiles | Live, including the `Player` DB migration and Admin roster CMS; roster auto-create/unpublish on account role changes is target only |
| [Shop](features/shop.md) | Public merchandise browsing + Admin catalog management | Live, fully built, previously undocumented |
| [Auth & Account Access](features/auth-and-account-access.md) | Sign-in, session/route protection, forced password change | Live, including forced password change |
| [Event Scheduling & Attendance](features/event-scheduling-and-attendance.md) | Training/game scheduling, attendance marking, public schedule | Live, including Trainer de-scoping and Player schedule widening; attendance reports are target only |
| [Account Management](features/account-management.md) | Admin creates/edits/resets/disables other members' accounts; multi-role; super-admin flag | Live, including edit/reset/disable, multi-role, audit-log writes, and granting/revoking the super-admin flag from the dashboard |
| [Membership & Fee Records](features/membership-and-fees.md) | Manual contribution entry, auto-computed outstanding balance | Live (`/dashboard/fees`), including the audit-log write |
| [Audit Log](features/audit-log.md) | Who-did-what-to-what-when across every Admin/super-admin mutation | Live (`/dashboard/audit-log`) for every write path that exists, including News, club info/committee roles, membership tiers, and super-admin grant/revoke |

## Suggested build order

This sequences work **across** the capabilities above; each document's own
"Proposed issues" section sequences the work **within** it. It follows the
dependency chain already laid out in
[docs/roles-and-permissions.md](roles-and-permissions.md#suggested-build-order),
expanded to cover the capabilities that spec doesn't itself track (Shop,
News, Public Content migration).

1. ~~**Super-admin flag**~~ ([Account Management](features/account-management.md)) —
   **done.** Must land before Admins lose the ability to create fellow
   Admins, or nobody can add an Admin at all.
2. ~~**Multi-role account model**~~ ([Account Management](features/account-management.md)) —
   **done.** `User.roles` is a set, plus `isActive` and
   `mustChangePassword`, and the account edit/reset/disable UI. This is the
   schema foundation that steps 4–7 below all touch.
3. ~~**Forced password change flow**~~ ([Auth & Account Access](features/auth-and-account-access.md)) —
   **done**, depended on `mustChangePassword` from step 2. Ships as
   sign-out-and-relogin after the change rather than an in-place redirect —
   see that document's Current vs. target for why.
4. ~~**Trainer de-scoping and Player schedule widening**~~
   ([Event Scheduling & Attendance](features/event-scheduling-and-attendance.md)) —
   **done.** Trainers are club-wide (`User.team` is now `null` for Trainer
   accounts) and every member role sees the whole club's schedule, not just
   their own team. Attendance visibility (own record only) is unchanged.
5. ~~**Player/roster publish-gating**~~ ([Teams & Player Rosters](features/teams-and-rosters.md)) —
   **done.** `Player` is a Prisma model with a `published` flag and an
   Admin CMS (`/dashboard/roster`). **Not done**: auto-create/unpublish
   tied to adding/removing the Player role on an account, and a real
   `User` → `Player` foreign key (still `User.playerSlug`, a loose string
   match) — both still depend on the multi-role model from step 2, which
   has landed, so they're unblocked whenever picked up.
6. ~~**Content migration to the database**~~ ([Public Content & Static Info](features/public-content.md),
   [News](features/news.md)) — **done.** Player profiles (step 5), **News**
   (`NewsItem` + `/dashboard/news`), **club info + committee roles**
   (`ClubInfo` singleton + `ClubRole` Prisma models, `/dashboard/club-info`
   and `/dashboard/committee` CMS), and now **membership tiers**
   (`MembershipTier` + `/dashboard/membership-tiers`) have all made this
   move — `club.json`, `roles.json`, and `membership-tiers.json` are
   demoted to one-time seed sources, same as `players.json`/`news.json`
   before them.
6a. ~~**`MembershipTier` fee amount**~~ — **done, ahead of step 6.**
   `membership-tiers.json` gained a `feeAmount` field (annual, EUR) before
   the table itself moved to Prisma in step 6, since it's just a new field
   on the existing JSON shape and the fee-records work (step 8) needed it
   sooner.
7. **Shop permissions clarification** ([Shop](features/shop.md)) — no
   dependencies, low effort; slot in wherever convenient.
8. ~~**Membership & fee records**~~ ([Membership & Fee Records](features/membership-and-fees.md)) —
   **done.** `Contribution` model, `/dashboard/fees` (Admin list of every
   Player-role member + a Player's own itemized view) and
   `/dashboard/fees/[id]` (Admin per-member detail + record-contribution
   form). Depended on step 2 (stable member reference — `Contribution`
   references `User.id` directly, not `Player.id`, since not every
   Player-role account has a linked roster entry) and step 6a
   (`MembershipTier` fee amount), both done.
9. ~~**Audit log**~~ ([Audit Log](features/audit-log.md)) — **done** for
   every write path that exists today: `AuditEntry` model,
   `src/lib/audit.ts`'s `logAuditEntry`, wired into account (step 2),
   event/attendance (step 4), roster CMS (step 5), and contribution (step
   8) mutations, plus `/dashboard/audit-log` (super-admin-only read).
   Logs Trainer-authored event/attendance actions too, not just Admin's —
   see that document's Out of scope for why. Extended in step 6's content
   migration to cover `news.create`/`news.update`/`news.delete`,
   `clubInfo.update`, `role.create`/`role.update`/`role.delete`, and
   `membershipTier.create`/`membershipTier.update`/`membershipTier.delete`
   too, plus `user.grantSuperAdmin`/`user.revokeSuperAdmin` once that UI
   shipped — every Admin/super-admin mutation now has an audit-log write.

Two steps are worth calling out because they **reduce** existing access
rather than extend it: step 1 removes ordinary Admins' ability to create
fellow Admins, and step 4 removes the team boundary that currently scopes
Trainers. Both are intentional behavior changes, not side effects.
