# Audit Log

A record of every mutation an Admin or super-admin makes — accounts,
events, content, and fee records — readable only by super-admins. Exists so
ordinary Admin actions stay reviewable by a smaller circle, even though the
site has no self-service undo or version history anywhere else. Nothing in
this capability exists in code today.

**Status**: Not built. Target only. Depends on nearly every other capability
existing first, since each one is a source of entries.

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
  contribution) writes one audit entry.
- Each entry records **who** (actor), **what action**, **what target**, and
  **when** — no before/after diff of changed values.
- Entries are **retained indefinitely** — no automatic pruning or
  expiration.
- Reading the log is restricted to accounts with `isSuperAdmin: true`; an
  ordinary Admin gets no UI entry point and the underlying query is denied
  server-side if attempted directly.
- Nothing is exempted — a super-admin's own actions appear in the log they
  can read, including actions only a super-admin can take.

## Out of scope

- Before/after diffs of changed values — explicitly not part of the
  target spec; an entry says an edit happened, not what changed.
- Log export, search UI polish, or filtering beyond what's needed to make
  an indefinitely-growing log usable — a first pass can be a simple
  reverse-chronological list; don't over-build this ahead of real usage.
- Logging Trainer or Player actions — the spec scopes this to Admin/
  super-admin mutations only; Trainers and Players don't have mutation
  rights this document would need to cover today.

## Current vs. target

| Area | Today | Target |
|---|---|---|
| Audit log | Does not exist | Covers accounts, events, content, and fee-record mutations (incl. super-admin actions) |
| Diff tracking | N/A | None — who/action/target/when only |
| Read access | N/A | Super-admin only |
| Retention | N/A | Indefinite |

## Data model changes

- New Prisma model: audit log entry (actor `User` reference, action
  string, target type + id, timestamp). No diff/payload field by design.
- This model should exist **before or alongside** the first write path that
  needs it — per the roles spec's suggested build order, scope it to cover
  content and fee mutations from the start rather than bolting those on
  later once the log already exists for accounts/events.
- Depends on the `isSuperAdmin` flag from
  [Account Management](./account-management.md) for the read-permission
  gate.

## Permissions

Authoritative rule is the "Audit log" cross-cutting section of
[docs/roles-and-permissions.md](../roles-and-permissions.md) and
[docs/roles/super-admin.md](../roles/super-admin.md) — this document does
not restate it beyond the acceptance criteria above.

## Proposed issues

- [ ] **Add an audit log entry Prisma model** (actor, action, target type/id, timestamp).
- [ ] **Add a shared `logAuditEntry` helper** called from every mutating server action across the other capability docs, so each capability's write path stays a one-line addition rather than a bespoke integration.
- [ ] **Wire audit writes into Account Management's mutations** (create/edit/reset/disable, super-admin grant/revoke).
- [ ] **Wire audit writes into Event Scheduling & Attendance's mutations** (create/edit/cancel event, mark attendance).
- [ ] **Wire audit writes into the CMS mutations** (Public Content, News, Teams & Rosters).
- [ ] **Wire audit writes into Membership & Fee Records' contribution entry**.
- [ ] **Build the super-admin-only audit log read view** (reverse-chronological list, no diff).
