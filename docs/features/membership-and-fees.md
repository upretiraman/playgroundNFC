# Membership & Fee Records

Tracking what each member has actually paid toward their membership tier,
and computing what they still owe. There is no payment processor —
contributions are entered by hand by an Admin after money changes hands
outside the app.

**Status**: Built — `Contribution` Prisma model, `/dashboard/fees`
(Admin list + Player's own view) and `/dashboard/fees/[id]` (Admin
per-member detail + record form). Writing to the audit log is target only
(the log itself doesn't exist yet).

## User stories

- As an **Admin**, I want to record a contribution (amount, date, which
  period/tier it covers) for a member, so there's a running record of what
  they've paid.
- As an **Admin**, I want to see every member's itemized contribution
  history and computed outstanding balance, so I can follow up on unpaid
  dues without doing the arithmetic by hand.
- As a **Player**, I want to see my own itemized contribution history and
  outstanding balance, so I know what I've paid and what I still owe.
- As a **club treasurer** (an Admin holding the Treasurer committee role,
  per [Public Content & Static Info](./public-content.md)'s roster of
  roles), I want the outstanding figure to be computed, not manually
  tracked, so it can't silently drift from reality.

## Acceptance criteria

- Each contribution record carries an amount, a date, and the period/tier
  it covers — an Admin enters these three fields; nothing else is required.
  **Built** (`src/app/dashboard/fees/actions.ts`'s `createContribution`),
  scoped to members holding the Player role — Admin can only record a
  contribution for a `User` whose `roles` includes `PLAYER`.
- "Outstanding" is **never** entered by hand. It's computed as the tier's
  fee amount minus the sum of contributions recorded for that period, so an
  Admin only ever enters what was actually paid. **Built** —
  `src/lib/contributions.ts`'s `groupContributionsByPeriod`, grouped by
  `(tierSlug, periodYear)`; shows "outstanding" (positive), "overpaid"
  (negative), or "Paid in full" (zero) rather than clamping at zero, since
  an overpayment is real information worth surfacing.
- A Player sees an itemized list of **their own** contributions (not a
  bare paid/outstanding summary) — every individual entry, plus the
  computed outstanding total. **Built** (`/dashboard/fees`).
- An Admin sees the same itemized view for **every** member. **Built**
  (`/dashboard/fees` lists every Player-role member with their all-time
  total; `/dashboard/fees/[id]` is the itemized per-member view).
- No other role (Guest, Trainer without an Admin role) can see any fee
  record, for anyone, including their own if they're a Trainer-only
  account. **Built** — both routes redirect to `/dashboard` for anyone
  without the Player or Admin role; the per-member detail route also
  404s if the target `User` doesn't hold the Player role.
- Every contribution entry an Admin creates is written to the
  [Audit Log](./audit-log.md). **Not built** — the audit log itself
  doesn't exist yet; this is the one acceptance criterion still open.

## Out of scope

- Payment processing / online payment collection — there is deliberately no
  processor integration; entries are always manual.
- Editing or deleting a past contribution — not specified either way by
  `docs/roles-and-permissions.md`; treat as **not supported** in the first
  pass (append-only) unless the club asks for correction support, since an
  audited financial record with silent edits is a bigger design question
  than this document should resolve implicitly.
- Automated payment reminders/notifications — not requested.

## Current vs. target

| Area | Today | Target |
|---|---|---|
| Fee records | Manual entry by Admin; amount, date, tier, period (year) per contribution (`Contribution` model) | Unchanged |
| Outstanding | Auto-computed per `(tierSlug, periodYear)`: tier fee minus recorded contributions | Unchanged |
| Membership tiers | Has a `feeAmount` field, now Prisma-backed (`MembershipTier`) — shared dependency with [Public Content & Static Info](./public-content.md), done there first | Unchanged — this document only consumes the field, doesn't own it |
| Player view | Own itemized contributions + outstanding (`/dashboard/fees`) | Unchanged |
| Admin view | All Player-role members' itemized contributions + outstanding (`/dashboard/fees`, `/dashboard/fees/[id]`) | Unchanged |
| Audit trail | Not written anywhere yet | Every contribution recorded is an audit-log entry |

## Data model changes

- **Built**: `Contribution` Prisma model — `amount` (Float), `date`,
  `tierSlug` (loose reference into `MembershipTier.slug`, same pattern as
  `Attendance.playerSlug` before `Player` became a table), `periodYear`
  (Int), `memberId` (→ `User.id`), `recordedById` (→ `User.id`,  the
  Admin), `createdAt`. Append-only — no update/delete action, matching
  [Out of scope](#out-of-scope). `tierSlug` stayed a plain string
  reference (never a foreign key) even after `MembershipTier` itself moved
  off JSON to Prisma in [Public Content & Static Info](./public-content.md)
  — no change needed here when that landed.
- `MembershipTier` gains a `feeAmount` field — **done**. This was the
  **same** schema change called out in
  [Public Content & Static Info](./public-content.md); it landed once,
  referenced from both documents, not twice.
- The "stable member reference" this depended on
  ([Account Management](./account-management.md)'s multi-role model) was
  already in place, so `Contribution.memberId` references `User.id`
  directly rather than `Player.id` — a contribution is about the account
  holding the Player role, not the public roster entry, and not every
  Player-role account is guaranteed a linked `Player` row.

## Permissions

Authoritative rule is the "Membership/fee records" cross-cutting section of
[docs/roles-and-permissions.md](../roles-and-permissions.md) — own-only for
Players, all-members for Admin, no access for Guest/Trainer-only. This
document does not restate it beyond the acceptance criteria above.

## Proposed issues

- [x] **Add `feeAmount` to `MembershipTier`** — done, see
      [Public Content & Static Info](./public-content.md#proposed-issues).
- [x] **Add a Prisma model for fee contributions** (amount, date, tier/period, member, recorded-by, timestamp) — done, `Contribution` in `prisma/schema.prisma`.
- [x] **Build the outstanding-balance computation** (tier fee minus recorded contributions for the period) — done, `groupContributionsByPeriod` in `src/lib/contributions.ts`.
- [x] **Admin dashboard: record a contribution for a member** — done, `/dashboard/fees/[id]`'s `RecordContributionForm`.
- [x] **Admin dashboard: view all members' itemized contributions + outstanding** — done, `/dashboard/fees` (list) + `/dashboard/fees/[id]` (itemized).
- [x] **Player dashboard: view own itemized contributions + outstanding** — done, `/dashboard/fees`.
- [ ] **Write audit-log entries for every contribution recorded** — coordinate with [Audit Log](./audit-log.md); blocked on that model existing.
