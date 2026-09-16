# Roles & Permissions

Specification of what each user role may and may not do on the NFC Nürnberg
site. Decided in conversation with the club, 2026-08-08.

**Status: specification only.** This describes the *target* model. Parts of it
are not built yet — each role page ends with a current-vs-target table, and
this page carries the consolidated one. Where this specification and the code
disagree, this is the intent and the code is the backlog.

## The roles

| Role | Summary |
|---|---|
| [Guest](roles/guest.md) | No account. Full public read access, names visible, no personal details. |
| [Player](roles/player.md) | Read-only member. Whole-club schedule, own attendance, own fee record. |
| [Trainer](roles/trainer.md) | Coach, club-wide. Owns events and attendance; nothing else. |
| [Admin](roles/admin.md) | Runs the club. Accounts, event override, full CMS, records. |
| [Super-admin](roles/super-admin.md) | Flag on an Admin. Manages Admins, holds the audit log. |

An account is not locked to a single role — a person can hold any combination
at once (a playing coach is Player + Trainer). See
[Multi-role accounts](#multi-role-accounts) below.

## Permission matrix

| | Guest | Player | Trainer | Admin | Super-admin |
|---|---|---|---|---|---|
| Read public pages | ✅ | ✅ | ✅ | ✅ | ✅ |
| See full club schedule (member area) | — | ✅ | ✅ | ✅ | ✅ |
| See own attendance record | — | ✅ | ✅ | ✅ | ✅ |
| See other members' attendance | — | ❌ | ✅ | ✅ | ✅ |
| Create/edit events (per team) | — | ❌ | ✅ any team | ✅ any team | ✅ |
| Create club-wide ("both") events | — | ❌ | ❌ | ✅ | ✅ |
| Cancel/delete events | — | ❌ | ✅ | ✅ | ✅ |
| Mark attendance | — | ❌ | ✅ | ✅ | ✅ |
| Attendance reports | — | ❌ | ✅ | ✅ | ✅ |
| Manage Player/Trainer accounts | — | ❌ | ❌ | ✅ | ✅ |
| Manage Admin accounts | — | ❌ | ❌ | ❌ | ✅ |
| Manage public content (CMS) | — | ❌ | ❌ | ✅ | ✅ |
| Manage shop/product catalog | — | ❌ | ❌ | ✅ | ✅ |
| Membership/fee records | — | own only | ❌ | ✅ all | ✅ all |
| Audit log | — | ❌ | ❌ | ❌ | ✅ |
| Set own password | — | on forced reset | on forced reset | on forced reset | on forced reset |

Roles are cumulative in practice but not in code: each check names the roles it
allows, rather than assuming a hierarchy.

---

## Cross-cutting rules

These apply to every role and are not repeated in full on the role pages.

### Passwords

- There is **no self-registration** and **no email-based password reset**.
  Accounts are created by an Admin (or, for Admins, by a super-admin).
- The creating Admin sets a **temporary password** and communicates it to the
  member out of band.
- On the member's next login after account creation or an Admin reset, they are
  **forced to set a new password** before reaching the dashboard.
- Outside that forced flow there is **no voluntary "change my password" page**.
  A member who wants a new password asks an Admin to reset it.

### Deactivation

Soft disable everywhere. A disabled account cannot authenticate, but no history
is deleted: events they created, attendance they recorded, and their roster
entry all survive. Hard deletion is not a supported operation in the app.

### Authorization is enforced server-side

Page-level role checks are UX — they keep the wrong buttons off the screen. The
**server action is the actual security boundary** and re-checks role and
permission independently. Every rule in this specification must hold even if a
user hand-crafts a request.

### Multi-role accounts

An account is not locked to a single role. A person can hold any combination
at once — most commonly Player + Trainer (a playing coach), but Player +
Admin or Trainer + Admin are equally valid. `role` is a **set**, not a single
value.

- **Permissions union**: an account's abilities are the union of every role it
  holds. Holding a broader role does not remove the narrower role's own
  view — a Player+Trainer still has their own roster entry and personal
  attendance record, in addition to full club-wide Trainer powers.
- **Broader supersedes narrower**: where a role's restriction would
  contradict a permission granted by another role on the same account (e.g.
  "Players cannot see teammates' attendance" vs. Trainer's attendance
  reports), the broader permission wins. The restriction is a ceiling for
  accounts that hold *only* the narrower role, not an active limit imposed on
  everyone who happens to also hold it.
- **Super-admin still requires Admin** in the role set — it is not a role of
  its own and cannot attach to a Player- or Trainer-only account. See
  [Super-admin](roles/super-admin.md).
- **Adding Player to an existing account** auto-creates a roster entry, the
  same as creating a fresh Player account (see [Player](roles/player.md)).
- **Removing Player from a multi-role account** unpublishes but retains the
  roster entry — consistent with soft-disable elsewhere, no history is lost.

This is a different concept from the cumulative-permissions note in the
matrix above: that note is about the matrix reading additively (an Admin
check doesn't assume superiority over a Trainer check), while this section is
about one account literally holding more than one role label at once.

### Membership/fee records

Recorded by manual Admin entry — there is no payment processor integration.
Each contribution carries an **amount**, a **date**, and the **period/tier**
it covers. "Outstanding" is not entered by hand: it is computed as the
tier's fee amount minus the contributions recorded for that period, so an
Admin only ever enters what was actually paid. **Built**: the `Contribution`
model (`prisma/schema.prisma`), `/dashboard/fees`, and `/dashboard/fees/[id]`
— see [Membership & Fee Records](features/membership-and-fees.md) for the
detailed spec, including the audit-log write on every contribution recorded.

A Player sees an itemized list of their own contributions (not just a
paid/outstanding summary); an Admin sees the same for every member.

### Audit log

Covers every mutation an Admin or super-admin can make — accounts, events,
content, and fee records — including super-admins' own actions; nothing is
exempted. Each entry is a simple record of who did what to what target and
when. It does not store a before/after diff of the changed values. Entries
are retained indefinitely. Restricted to super-admins to read; see
[Super-admin](roles/super-admin.md).

**Built**: `AuditEntry` model, `src/lib/audit.ts`'s `logAuditEntry`, wired
into every mutating server action that exists today (accounts, events,
attendance, roster CMS, contributions), plus `/dashboard/audit-log`
(super-admin-only). Also logs Trainer-authored event/attendance actions,
not just Admin's — those flow through the exact same server actions
(`canManageTeam` covers both roles), and branching the write on actor role
would add complexity for no benefit; see
[Audit Log](features/audit-log.md)'s Out of scope. Now also covers News
(`news.create`/`news.update`/`news.delete`), club info/committee roles
(`clubInfo.update`, `role.create`/`role.update`/`role.delete`), and
membership tiers (`membershipTier.create`/`membershipTier.update`/
`membershipTier.delete`). Not built: writing an entry for super-admin
grant/revoke — the only Admin/super-admin mutation without a write path
into this log, since that UI doesn't exist yet.

---

## Data model consequences

Decisions in this specification that the current schema and content layer do
not yet support:

1. ~~**All public content moves into the database.**~~ — **done.**
   Rosters, news, club info, committee roles, and membership tiers have
   all left `src/lib/data/*.json` and become Prisma models, because Admins
   now edit them from the dashboard. `src/lib/repository.ts` kept its
   interface throughout — only its implementation changed, so callers
   stayed untouched. Shop products, players, news, club info, committee
   roles, and now membership tiers are all in the DB. Player accounts
   still don't auto-create roster entries — that's item 2 below, a
   separate piece of work from the content migration itself.
2. **`Player` becomes a table** — **done**, with a `published` flag driving
   public visibility (`src/app/dashboard/roster/**`, Admin-only). Not yet
   done: the relation to the `User` who owns the login, and auto-creating a
   Player row when the Player role is added to an account — those still
   depend on the account-management flow, which continues to link by the
   loose `User.playerSlug` string today.
3. **`User.team` is dropped for Trainers** (club-wide) and is meaningful only
   for Players, whose team follows their roster entry.
4. **`User.role` becomes a set, not a single value.** An account can hold any
   combination of Player/Trainer/Admin (e.g. a playing coach is Player +
   Trainer). This replaces the current single-string `role` column — likely a
   join table or a small array column — and every `role === "X"` check in the
   codebase becomes a "does the set contain X" check. See
   [Multi-role accounts](#multi-role-accounts).
5. **New `User` fields**: `isSuperAdmin`, `isActive` (soft disable), and
   `mustChangePassword` (forced reset flow).
6. **New models**: membership/fee contributions (amount, date, tier/period
   reference), and an audit log of admin actions (actor, action, target,
   timestamp — no diff). See [Membership/fee records](#membershipfee-records)
   and [Audit log](#audit-log).
7. ~~**`MembershipTier` gains a fee amount.**~~ — **done.**
   `membership-tiers.json` now carries a `feeAmount` per tier (annual, EUR).
   The rest of this item — the contribution model and the outstanding
   computation that consumes this field — is still not built.
8. **Attendance** keeps its `playerSlug` link but points at the `Player` table
   rather than a JSON file.

---

## Current vs. target

What the code does **today** (2026-08-08), against the specification above.
Per-role detail lives on each role page.

| Area | Today | Target |
|---|---|---|
| Roles | A set — any combination, plus super-admin flag on Admin | Unchanged |
| Trainer scope | Club-wide, no team (`canManageTeam`) | Unchanged |
| Trainer `team` field | Dropped — always `null` | Unchanged |
| Player schedule | Whole club (`schedule/page.tsx`) | Unchanged |
| Admin over events | Full control of any team | Unchanged — full override |
| Club-wide events | Admin-only (`canManageEventTeam`) | Unchanged |
| Account management | Create, edit (incl. role set), reset, deactivate | Unchanged |
| Admin-manages-Admin | Super-admins only | Unchanged |
| Passwords | Forced change after create/reset | Unchanged |
| Roster link | Optional, picked from the `Player` table via `User.playerSlug` | Auto-created/removed as Player role is added/removed, publish-gated |
| Public content | All DB-backed, Admin-edited: player profiles (`/dashboard/roster`), news (`/dashboard/news`), club info (`/dashboard/club-info`), committee roles (`/dashboard/committee`), membership tiers (`/dashboard/membership-tiers`) | Unchanged — content migration complete |
| Shop/product catalog | Admin-only (`requireRole(["ADMIN"])` in `src/app/dashboard/shop/actions.ts`); `Product` model | Unchanged — confirmed Admin-only, see [Shop](features/shop.md) |
| Membership tiers | Fee amount per tier (`membership-tiers.json`, annual EUR) | Unchanged |
| Attendance | Trainer/Admin mark, player sees own | Unchanged |
| Attendance reports | Trainer + Admin (`/dashboard/attendance`) | Unchanged |
| Fee records | Manual entry (`/dashboard/fees`); Admin sees all, member sees own itemized, outstanding auto-computed; audit-logged | Unchanged |
| Audit log | Covers accounts, events/attendance, roster CMS, news, club info, committee roles, membership tiers, and fee-record changes (incl. super-admin and Trainer actions); super-admin only can view (`/dashboard/audit-log`) | Also covers super-admin grant/revoke, once that UI exists |
| Guest access | Full public read, names visible | Unchanged |

Two rows are worth calling out because they **reduce** existing access rather
than extend it — implementing them is a behavior change, not just a feature:
Trainers gaining club-wide reach removes the team boundary that currently
exists, and ordinary Admins lose the ability to create fellow Admins.

### Suggested build order

1. ~~**Super-admin flag**~~ — **done.** `isSuperAdmin` on `User`, enforced by
   `canManageAdmins` and re-checked in every account action. See
   [Super-admin](roles/super-admin.md).
2. ~~**Multi-role account model**~~ — **done.** `User.roles` is a
   comma-separated set (`PLAYER`/`TRAINER`/`ADMIN` in any combination),
   plus the `isActive` and `mustChangePassword` fields and the account
   edit/reset/disable UI at `/dashboard/users/[id]`. Audit-log writes on
   these mutations landed in step 10 below. Not done: any UI to
   grant/revoke `isSuperAdmin` (still DB/seed-only).
3. ~~**Trainer de-scoping**~~ — **done.** Trainers are club-wide: `canManageTeam`
   no longer checks `user.team`, the account creation/edit forms drop the team
   field for Trainer, and `/dashboard/schedule/new` offers any team (not
   locked to one). `User.team` is `null` for Trainer accounts going forward.
4. ~~**Player schedule widening**~~ — **done.** `/dashboard/schedule` and
   `/dashboard/schedule/[id]` no longer scope by `user.team` for any
   authenticated role — every member sees the whole club's schedule.
   Attendance visibility (own record only) is unchanged.
5. ~~**Attendance reports**~~ — **done.** `/dashboard/attendance` (Trainer +
   Admin, gated by `canManageTeam`) shows per-player and per-team attendance
   counts and a present-rate (excluding unmarked sessions), with optional
   team/date-range filters. See `src/lib/events.ts`'s
   `listAttendanceForReport`.
6. ~~**Player content migration**~~ — **done, partially.** `Player` is now a
   Prisma model (`prisma/schema.prisma`) with a `published` flag, and
   `/dashboard/roster` gives Admins a create/edit/publish CMS for it
   (`src/app/dashboard/roster/**`). `src/lib/repository.ts`'s
   `getPlayers`/`getPlayer` read from the DB, filtered to `published: true`
   by default; internal dashboard callers (attendance, scheduling, account
   linking) pass `{ includeUnpublished: true }` to see the full roster. The
   public roster/player pages (`/teams`, `/teams/[team]`,
   `/teams/[team]/[player]`) were switched to `force-dynamic` so publish/edit
   changes show up without a rebuild. **Not done as part of this**: news,
   club info, and membership tiers are still JSON; and the roster
   auto-create/unpublish tied to adding/removing the Player role on an
   account (`User.playerSlug` is still a loose string link, not a relation)
   — see [Data model consequences](#data-model-consequences) item 2.
7. ~~**`MembershipTier` fee amount**~~ — **done, ahead of the content
   migration below.** `membership-tiers.json` gained a `feeAmount` field
   (annual, EUR) — see [Data model consequences](#data-model-consequences)
   item 7. It's the one piece of the fee-records data model that didn't need
   to wait on `MembershipTier` moving to Prisma, since it's just a new field
   on the existing JSON shape.
8. ~~**News, club info, committee roles, and membership tiers to the DB**~~
   — **done.** ~~**News**~~: `NewsItem` Prisma model, `/dashboard/news`
   CMS (create/edit/delete), audit-logged, public `/news` and
   `/news/[slug]` switched to `force-dynamic` — see
   [News](features/news.md). ~~**Club info + committee roles**~~:
   `ClubInfo` (singleton) + `ClubRole` Prisma models, `/dashboard/club-info`
   and `/dashboard/committee` CMS, audit-logged, `/`, `/club`, `/contact`
   all `force-dynamic`. ~~**Membership tiers**~~: `MembershipTier` Prisma
   model, `/dashboard/membership-tiers` CMS (create/edit/delete),
   audit-logged; `Contribution.tierSlug` stayed a loose string reference
   into `MembershipTier.slug`, no change needed there — see
   [Public Content & Static Info](features/public-content.md). Content
   migration is now complete. **Not done**: roster
   auto-create/unpublish tied to Player role changes on an account — a
   separate piece of work, still untouched.
9. ~~**Fee records**~~ — **done.** `Contribution` model, `/dashboard/fees`,
   `/dashboard/fees/[id]` — see
   [Membership & Fee Records](features/membership-and-fees.md). Did not
   wait on step 8 (news/club-info/tiers to the DB); only needed the
   `feeAmount` field from step 7 and a stable member reference, both
   already in place.
10. ~~**Audit log**~~ — **done**, scoped to cover every write path that
    exists today rather than bolting content/fee mutations on later:
    `AuditEntry` model, `logAuditEntry` helper, wired into accounts
    (step 2), events/attendance (step 4), roster CMS (step 5), the
    step 8 content-migration CMS (news, club info, committee roles,
    membership tiers), and the step 9 fee-record write — see
    [Audit Log](features/audit-log.md). Not covered yet: super-admin
    grant/revoke — the only Admin/super-admin mutation without a write
    path into this log, since that UI doesn't exist yet.
