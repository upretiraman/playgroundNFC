# Audit Log

A record of every mutation an Admin or super-admin makes — accounts,
events, content, and fee records — readable only by super-admins. Exists so
ordinary Admin actions stay reviewable by a smaller circle, even though the
site has no self-service undo or version history anywhere else.

**Status**: Built for every write path that exists today — `AuditEntry`
Prisma model, `src/lib/audit.ts`'s `logAuditEntry` helper, wired into
account mutations, event/attendance mutations, roster CMS mutations, and
contribution entry — plus `/dashboard/audit-log` (super-admin-only read
view). Not covered: super-admin grant/revoke (that UI doesn't exist yet)
and the rest of the CMS (Public Content, News — still JSON, no dashboard
mutations to log).

## User stories

- As a **super-admin**, I want to see who did what to what, and when, across
  the whole site's Admin-level actions, so I can review activity without
  trusting every Admin's account never to be misused.
- As a **super-admin**, I want my own actions logged too, including
  super-admin-exclusive ones (managing other Admins, granting the flag), so
  the log has no blind spot for the most powerful accounts.
- As an **Admin** (non-super-admin), I want my actions to be logged even
  though I can't read the log back, so accountability doesn't depend on
  trusting my own self-report.

## Acceptance criteria

- Every mutation covered by [Account Management](./account-management.md)
  (create/edit/reset/disable an account, grant/revoke super-admin),
  [Event Scheduling & Attendance](./event-scheduling-and-attendance.md)
  (create/edit/cancel an event, mark attendance),
  [Public Content & Static Info](./public-content.md) /
  [News](./news.md) / [Teams & Player Rosters](./teams-and-rosters.md)
  (any CMS edit), and
  [Membership & Fee Records](./membership-and-fees.md) (record a
  contribution) writes one audit entry. **Built**, except: super-admin
  grant/revoke (no UI yet), and Public Content/News (no dashboard
  mutations exist yet to log — still dev-edited JSON).
- Each entry records **who** (actor), **what action**, **what target**, and
  **when** — no before/after diff of changed values. **Built**
  (`AuditEntry.actorId`/`action`/`targetType`+`targetId`/`createdAt`).
- Entries are **retained indefinitely** — no automatic pruning or
  expiration. **Built** — no delete/prune path exists.
- Reading the log is restricted to accounts with `isSuperAdmin: true`; an
  ordinary Admin gets no UI entry point and the underlying query is denied
  server-side if attempted directly. **Built**
  (`/dashboard/audit-log` redirects anyone without `isSuperAdmin`; the
  dashboard-home link card is likewise gated).
- Nothing is exempted — a super-admin's own actions appear in the log they
  can read, including actions only a super-admin can take. **Built** — the
  log write happens inside the same action every actor calls, so a
  super-admin's own mutations are captured the same as anyone else's.

## Out of scope

- Before/after diffs of changed values — explicitly not part of the
  target spec; an entry says an edit happened, not what changed.
- Log export, search UI polish, or filtering beyond what's needed to make
  an indefinitely-growing log usable — a first pass can be a simple
  reverse-chronological list; don't over-build this ahead of real usage.
  **Built this way**: `/dashboard/audit-log` is an unpaginated list of the
  most recent 200 entries, nothing more.
- ~~Logging Trainer or Player actions~~ — **resolved, logged anyway**. The
  spec's original assumption that "Trainers and Players don't have
  mutation rights this document would need to cover today" doesn't hold:
  Trainers create/edit events and mark attendance through the exact same
  server actions an Admin uses (`canManageTeam` covers both). Since
  `createEvent`/`updatePlan`/`setAttendance` are one shared write path,
  branching the audit write on the actor's role would add complexity for
  no real benefit — logging every call, Trainer or Admin, is simpler and
  matches the "nothing is exempted" principle in
  [docs/roles-and-permissions.md](../roles-and-permissions.md) better than
  carving out an exception would.

## Current vs. target

| Area | Today | Target |
|---|---|---|
| Audit log | Covers account, event/attendance, roster CMS, and contribution mutations (incl. super-admin actions) | Also covers super-admin grant/revoke and the rest of the CMS, once those write paths exist |
| Diff tracking | None — who/action/target/when only | Unchanged |
| Read access | Super-admin only (`/dashboard/audit-log`) | Unchanged |
| Retention | Indefinite | Unchanged |

## Data model changes

- **Built**: `AuditEntry` Prisma model — `actorId` (→ `User.id`), `action`
  (a short dotted string like `"user.create"`, `"event.setAttendance"`,
  `"player.setPublished"`, `"contribution.create"`), `targetType`
  (`"User"` | `"Event"` | `"Attendance"` | `"Player"` | `"Contribution"`),
  `targetId`, `createdAt`. No diff/payload field, by design.
- The model landed alongside the first write paths that needed it — the
  account, event, roster, and fee-record actions were all instrumented in
  the same change, per the roles spec's suggested build order.
- Depends on the `isSuperAdmin` flag from
  [Account Management](./account-management.md) for the read-permission
  gate — already in place.

## Permissions

Authoritative rule is the "Audit log" cross-cutting section of
[docs/roles-and-permissions.md](../roles-and-permissions.md) and
[docs/roles/super-admin.md](../roles/super-admin.md) — this document does
not restate it beyond the acceptance criteria above.

## Proposed issues

- [x] **Add an audit log entry Prisma model** (actor, action, target type/id, timestamp) — done, `AuditEntry`.
- [x] **Add a shared `logAuditEntry` helper** called from every mutating server action across the other capability docs, so each capability's write path stays a one-line addition rather than a bespoke integration — done, `src/lib/audit.ts`.
- [x] **Wire audit writes into Account Management's mutations** (create/edit/reset/disable) — done, `src/app/dashboard/users/actions.ts`. Super-admin grant/revoke isn't wired in since that UI doesn't exist yet.
- [x] **Wire audit writes into Event Scheduling & Attendance's mutations** (create event, edit plan, mark attendance) — done, `src/app/dashboard/schedule/actions.ts`. There's no cancel/delete-event action yet for either role to wire in.
- [x] **Wire audit writes into the Teams & Player Rosters CMS mutations** (create, edit, publish/unpublish) — done, `src/app/dashboard/roster/actions.ts`. Public Content and News have no dashboard mutations yet to wire in.
- [x] **Wire audit writes into Membership & Fee Records' contribution entry** — done, `src/app/dashboard/fees/actions.ts`.
- [x] **Build the super-admin-only audit log read view** (reverse-chronological list, no diff) — done, `/dashboard/audit-log`.
