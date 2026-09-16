# Shop

Club merchandise (caps, tote bags, t-shirts) browsable on the public site,
with an Admin-managed catalog in the dashboard. Fully built already — this
document exists mainly because **the Shop is not mentioned anywhere in
`CLAUDE.md` or `docs/roles-and-permissions.md`**, despite being live code
(`src/app/shop/`, `src/app/dashboard/shop/`, a `Product` Prisma model). This
doc closes that documentation gap and gives it a home for future issues.

**Status**: Live, including catalog management. No online checkout.

## User stories

- As a **Guest**, I want to browse active products with photos/illustrations,
  price, colorway, and description, so I can decide what to order.
- As a **Guest**, I want an "Order" action that takes me to Contact, so I
  can place an order without an online checkout existing yet.
- As an **Admin**, I want to add, edit, and delete products, so the catalog
  reflects what's actually available without a code change.
- As an **Admin**, I want to mark a product inactive without deleting it, so
  it disappears from the public shop but its record (and order history, if
  that's ever added) isn't lost.

## Acceptance criteria

- `/shop` lists only `active: true` products, oldest-created first, each
  showing image (or CSS illustration fallback via `artVariant`), category,
  name, description, colorway, and price.
- `/dashboard/shop` (Admin-only) lists every product regardless of `active`,
  with visibility, edit, and delete actions.
- Creating a product requires name, category, price (≥0), colorway,
  description; slug is derived from name if not supplied and must be unique.
- Editing and deleting immediately revalidate both `/shop` and
  `/dashboard/shop` (already implemented via `revalidatePath`).

## Out of scope

- Online checkout / payment processing — "Order" still routes to Contact.
  This document doesn't add a cart, payment, or order-tracking flow.
- Inventory/stock-level tracking — `active` is a simple visibility flag, not
  a stock count.
- Trainer access to shop management — resolved as out of scope, see
  Permissions below.

## Current vs. target

| Area | Today | Target |
|---|---|---|
| Catalog storage | `Product` Prisma model (already DB-backed, unlike every other content type on the site) | Unchanged |
| Public browsing | Live, active products only | Unchanged |
| Catalog management | Admin-only (`requireRole(["ADMIN"])` in `actions.ts`) | Unchanged — confirmed Admin-only, see Permissions below |
| Checkout | None — "Order" links to Contact | Not addressed by this document; a future capability if the club wants it |

## Data model changes

None — `Product` is already a Prisma model with everything this document's
acceptance criteria need.

## Permissions

**Resolved**: Shop/product management is Admin-only, matching current code
(`requireRole(["ADMIN"])`). The club confirmed no Trainer access is wanted
(issue #45) — Trainers do not manage merchandise, same as they don't manage
news, roster, or club info. `docs/roles-and-permissions.md`'s permission
matrix now has an explicit "Manage shop/product catalog" row (Admin/
super-admin only) covering this, and `docs/roles/admin.md` and
`docs/roles/trainer.md` already listed Shop under Admin's scope / excluded
from Trainer's.

## Proposed issues

- [x] **Add Shop to `docs/roles-and-permissions.md`'s permission matrix** — resolved Admin-only (issue #45).
- [ ] **(Future, out of current scope): online checkout** — tracked here only as a placeholder if the club later wants it; not part of this document's acceptance criteria.
