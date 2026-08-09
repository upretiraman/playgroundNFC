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
Admin only ever enters what was actually paid. This requires each
membership tier to carry a fee amount, which `membership-tiers.json` does
not today.

A Player sees an itemized list of their own contributions (not just a
paid/outstanding summary); an Admin sees the same for every member.

### Audit log

Covers every mutation an Admin or super-admin can make — accounts, events,
content, and fee records — including super-admins' own actions; nothing is
exempted. Each entry is a simple record of who did what to what target and
when. It does not store a before/after diff of the changed values. Entries
are retained indefinitely. Restricted to super-admins to read; see
[Super-admin](roles/super-admin.md).

---

## Data model consequences

Decisions in this specification that the current schema and content layer do
not yet support:

1. **All public content moves into the database.** Rosters, news, club info,
   and membership tiers leave `src/lib/data/*.json` and become Prisma models,
   because Admins now edit them from the dashboard and Player accounts
   auto-create roster entries. `src/lib/repository.ts` keeps its interface —
   only its implementation changes, so callers stay untouched. Shop products
   are already in the DB.
2. **`Player` becomes a table**, with a `published` flag driving public
   visibility and a relation to the `User` who owns the login.
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
7. **`MembershipTier` gains a fee amount.** `membership-tiers.json` today has
   no price field; computing "outstanding" requires one per tier.
8. **Attendance** keeps its `playerSlug` link but points at the `Player` table
   rather than a JSON file.

---

## Current vs. target

What the code does **today** (2026-08-08), against the specification above.
Per-role detail lives on each role page.

| Area | Today | Target |
|---|---|---|
| Roles | Single value: `PLAYER`, `TRAINER`, or `ADMIN` | A set — any combination, plus super-admin flag on Admin |
| Trainer scope | Scoped to one team (`canManageTeam`) | Club-wide, no team |
| Trainer `team` field | Required at account creation | Dropped |
| Player schedule | Own team only (`schedule/page.tsx:16`) | Whole club |
| Admin over events | Full control of any team | Unchanged — full override |
| Club-wide events | Admin-only (`canManageEventTeam`) | Unchanged |
| Account management | Create only | Create, edit (incl. role set), reset, deactivate |
| Admin-manages-Admin | Any Admin can create Admins | Super-admins only |
| Passwords | Admin-set, permanent | Forced change after create/reset |
| Roster link | Optional, picked from `players.json` | Auto-created/removed as Player role is added/removed, publish-gated |
| Public content | JSON files, dev-edited | DB-backed, Admin-edited |
| Membership tiers | No fee amount | Fee amount per tier |
| Attendance | Trainer/Admin mark, player sees own | Unchanged |
| Attendance reports | None | Trainer + Admin |
| Fee records | None | Manual entry; Admin sees all, member sees own itemized, outstanding auto-computed |
| Audit log | None | Covers accounts, events, content, and fee-record changes (incl. super-admin actions); super-admin only can view |
| Guest access | Full public read, names visible | Unchanged |

Two rows are worth calling out because they **reduce** existing access rather
than extend it — implementing them is a behavior change, not just a feature:
Trainers gaining club-wide reach removes the team boundary that currently
exists, and ordinary Admins lose the ability to create fellow Admins.

### Suggested build order

1. **Super-admin flag** — must land before Admins lose Admin-management, or
   nobody can add an Admin. See [Super-admin](roles/super-admin.md).
2. **Multi-role account model** — `User.role` becomes a set. This is a schema
   and auth-helpers foundation change that every later step touches, so it
   should land before the team-scoping and content work below, alongside the
   other `User` field additions (`isActive`, `mustChangePassword`) and the
   account edit/reset/disable UI.
3. **Trainer de-scoping** — removes `team` checks, touches forms and helpers.
4. **Player schedule widening** — a one-line scope change plus tests.
5. **Content migration to the DB** — the largest piece; unblocks roster
   auto-create, publish gating, the CMS, and membership tier fee amounts.
6. **Attendance reports, fee records, audit log** — new features on top of the
   migrated model. The audit log should be scoped to cover content and fee
   mutations from the start, not bolted on later.
