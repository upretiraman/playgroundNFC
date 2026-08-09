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
4. **New `User` fields**: `isSuperAdmin`, `isActive` (soft disable), and
   `mustChangePassword` (forced reset flow).
5. **New models**: membership/fee contributions, and an audit log of admin
   actions.
6. **Attendance** keeps its `playerSlug` link but points at the `Player` table
   rather than a JSON file.

---

## Current vs. target

What the code does **today** (2026-08-08), against the specification above.
Per-role detail lives on each role page.

| Area | Today | Target |
|---|---|---|
| Roles | `PLAYER`, `TRAINER`, `ADMIN` | Same three + super-admin flag |
| Trainer scope | Scoped to one team (`canManageTeam`) | Club-wide, no team |
| Trainer `team` field | Required at account creation | Dropped |
| Player schedule | Own team only (`schedule/page.tsx:16`) | Whole club |
| Admin over events | Full control of any team | Unchanged — full override |
| Club-wide events | Admin-only (`canManageEventTeam`) | Unchanged |
| Account management | Create only | Create, edit, reset, deactivate |
| Admin-manages-Admin | Any Admin can create Admins | Super-admins only |
| Passwords | Admin-set, permanent | Forced change after create/reset |
| Roster link | Optional, picked from `players.json` | Auto-created, publish-gated |
| Public content | JSON files, dev-edited | DB-backed, Admin-edited |
| Attendance | Trainer/Admin mark, player sees own | Unchanged |
| Attendance reports | None | Trainer + Admin |
| Fee records | None | Admin sees all, member sees own |
| Audit log | None | Super-admin only |
| Guest access | Full public read, names visible | Unchanged |

Two rows are worth calling out because they **reduce** existing access rather
than extend it — implementing them is a behavior change, not just a feature:
Trainers gaining club-wide reach removes the team boundary that currently
exists, and ordinary Admins lose the ability to create fellow Admins.

### Suggested build order

1. **Super-admin flag** — must land before Admins lose Admin-management, or
   nobody can add an Admin. See [Super-admin](roles/super-admin.md).
2. **`User` field additions** (`isActive`, `mustChangePassword`) and the
   account edit/reset/disable UI — additive, no content migration needed.
3. **Trainer de-scoping** — removes `team` checks, touches forms and helpers.
4. **Player schedule widening** — a one-line scope change plus tests.
5. **Content migration to the DB** — the largest piece; unblocks roster
   auto-create, publish gating, and the CMS.
6. **Attendance reports, fee records, audit log** — new features on top of the
   migrated model.
