# Membership & Fee Records

Tracking what each member has actually paid toward their membership tier,
and computing what they still owe. There is no payment processor —
contributions are entered by hand by an Admin after money changes hands
outside the app. Nothing in this capability exists in code today; it's
entirely new.

**Status**: Not built. Target only.

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
- "Outstanding" is **never** entered by hand. It's computed as the tier's
  fee amount minus the sum of contributions recorded for that period, so an
  Admin only ever enters what was actually paid.
- A Player sees an itemized list of **their own** contributions (not a
  bare paid/outstanding summary) — every individual entry, plus the
  computed outstanding total.
- An Admin sees the same itemized view for **every** member.
- No other role (Guest, Trainer without an Admin role) can see any fee
  record, for anyone, including their own if they're a Trainer-only
  account.
- Every contribution entry an Admin creates is written to the
  [Audit Log](./audit-log.md).

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
| Fee records | Do not exist | Manual entry by Admin; amount, date, period/tier per contribution |
| Outstanding | N/A | Auto-computed: tier fee minus recorded contributions for the period |
| Membership tiers | No fee amount (`membership-tiers.json`) | Gains a `feeAmount` field — shared dependency with [Public Content & Static Info](./public-content.md) |
| Player view | N/A | Own itemized contributions + outstanding |
| Admin view | N/A | All members' itemized contributions + outstanding |

## Data model changes

- New Prisma model: membership/fee contribution (amount, date, period/tier
  reference, member reference, recorded-by Admin reference, timestamp).
- `MembershipTier` gains a `feeAmount` field — this is the **same** schema
  change called out in [Public Content & Static Info](./public-content.md);
  land it once, referenced from both documents, not twice.
- Depends on [Account Management](./account-management.md)'s multi-role
  `User`/`Player` model being in place, since a contribution needs a stable
  member reference. See the build order in
  [docs/features.md](../features.md).

## Permissions

Authoritative rule is the "Membership/fee records" cross-cutting section of
[docs/roles-and-permissions.md](../roles-and-permissions.md) — own-only for
Players, all-members for Admin, no access for Guest/Trainer-only. This
document does not restate it beyond the acceptance criteria above.

## Proposed issues

- [ ] **Add `feeAmount` to `MembershipTier`** — coordinate with [Public Content & Static Info](./public-content.md) so this lands once.
- [ ] **Add a Prisma model for fee contributions** (amount, date, tier/period, member, recorded-by, timestamp).
- [ ] **Build the outstanding-balance computation** (tier fee minus recorded contributions for the period).
- [ ] **Admin dashboard: record a contribution for a member**.
- [ ] **Admin dashboard: view all members' itemized contributions + outstanding**.
- [ ] **Player dashboard: view own itemized contributions + outstanding**.
- [ ] **Write audit-log entries for every contribution recorded** — coordinate with [Audit Log](./audit-log.md).
