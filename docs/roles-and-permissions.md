# Roles & Permissions

Specification of what each user role may and may not do on the NFC Nürnberg
site. Decided in conversation with the club, 2026-08-08.

**Status: specification only.** This describes the *target* model. Parts of it
are not built yet — see [Current vs. target](#current-vs-target) at the end for
the gap between this document and the code as it stands. Where the two differ,
this document is the intent and the code is the backlog.

## Roles at a glance

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

## Guest

Anyone visiting the site without logging in. No account, no session.

**Can:**
- Read every public page: home, club info, teams, news, training/game
  schedule, shop, contact.
- See the public roster: player **names and avatars** for both teams.

**Cannot:**
- See any personal detail beyond a name — no email addresses, no phone
  numbers, no attendance data, no fee records. "Public, minus personal
  details" is the rule; names themselves stay public.
- Reach anything under `/dashboard/**`.

**Rule:** never gate a public page behind login. The public site is the club's
shop window and must stay fully readable to a stranger.

---

## Player

A club member on a team roster. The role is **read-only**.

**Can:**
- See the **entire club schedule** — both teams' training sessions and games,
  plus club-wide events. Nothing is hidden between teams.
- See **their own attendance record only**: whether they were marked present,
  absent, or excused, across past sessions.
- See **their own membership/fee contribution status** — what they have paid
  and what is outstanding. Their own record only, never anyone else's.
- Set a new password **when forced to** after an Admin reset (see
  [Passwords](#passwords)).

**Cannot:**
- See any teammate's attendance, individually or in aggregate.
- See anyone else's fee records.
- Mark or RSVP their own attendance — attendance is the Trainer's record
  alone. A Player who cannot attend tells the Trainer outside the app.
- Change their own password voluntarily, edit their contact details, create or
  edit anything at all.

**Roster link:** creating a Player account **auto-creates their roster entry**,
so a login and a roster record can never drift apart. The auto-created entry is
**hidden from the public site until an Admin publishes it** — real names go on a
public website only by deliberate act, not as a side effect of account creation.

**No self-registration.** Player accounts are created by an Admin.

---

## Trainer

A coach. **Club-wide, not scoped to a team** — any Trainer may run sessions for
any team.

**Can:**
- Create and edit **training sessions** for any team: date, time, venue,
  address, training plan, notes.
- Create and edit **games/matches** for any team, including the opponent.
- **Cancel or delete** events, so a called-off session stops showing on the
  public site.
- **Mark attendance** for any session (present / absent / excused / unknown).
  Attendance is the Trainer's record; players do not self-mark.
- View **attendance reports** — per-player and per-team summaries over time,
  the same figures the Admin sees.

**Cannot:**
- Create or edit **club-wide ("both teams") events** — Admin only.
- Create, edit, disable, or delete **user accounts** of any kind, including
  Player logins for players they coach.
- Manage **public content** — no news, no roster editing, no shop, no club
  info.
- See **membership or fee records** for anyone.
- See the **audit log**.
- See members' **contact details** — a Trainer reaches players through channels
  the club already uses, not through the site.

**No team field.** Because Trainers are club-wide, a Trainer account carries no
`team` value at all — like an Admin. The account form stops asking for one.

---

## Admin

Runs the club's day-to-day operations in the app.

**Accounts (Players and Trainers):**
- **Create** accounts — name, email, temporary password, role, and (for
  Players) the auto-created roster entry.
- **Edit** existing accounts — name, email, role, roster link.
- **Reset passwords**, issuing a new temporary password.
- **Deactivate** accounts. Deactivation is a **soft disable**: the member can no
  longer log in, but their events, attendance history, and roster entry are all
  retained. Club records are never destroyed by a departure.

**Events — full override:**
- Create, edit, cancel, and delete **any event of any team**, including events a
  Trainer created. Admin is the backstop when a Trainer is unavailable.
- **Club-wide ("both teams") events are Admin-only** — no Trainer may create
  them.
- Mark attendance on any session.

**Content — full CMS:**
Admins manage all public website content from the dashboard: news articles,
team rosters, shop products, club info (mission, motto, values, contact), and
membership tiers. This is what moves the site off dev-edited JSON files
(see [Data model consequences](#data-model-consequences)).

**Also:**
- Publish or unpublish auto-created roster entries.
- View **attendance reports** across the club.
- View **membership/fee contribution records** for all members.

**Cannot:**
- Create, edit, promote, demote, or disable **another Admin** — that is
  super-admin territory.
- Grant or revoke the super-admin flag.
- View the **audit log**.

---

## Super-admin

Not a separate role — a **flag on an Admin account**. `role` stays `ADMIN`; a
boolean marks the holder as a super-admin. The bootstrap Administrator created
by `prisma/seed.ts` gets the flag automatically.

**Only a super-admin can:**
- Create, edit, demote, or disable **Admin accounts**.
- **Grant the super-admin flag** to another Admin. Multiple super-admins may
  exist at once, deliberately: the club should never be one lost account away
  from an unmanageable site.
- View the **audit log** of admin actions — who created, edited, or disabled
  which account or event, and when. Restricting this to super-admins keeps
  ordinary Admins accountable to a smaller circle.

A super-admin holds every Admin permission in addition to the above.

---

## Cross-cutting rules

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

Soft disable everywhere. A disabled account cannot authenticate, but no
history is deleted: events they created, attendance they recorded, and their
roster entry all survive. Hard deletion is not a supported operation in the app.

### Authorization is enforced server-side

Page-level role checks are UX — they keep the wrong buttons off the screen.
The **server action is the actual security boundary** and re-checks role and
permission independently. Every rule above must hold even if a user hand-crafts
a request.

---

## Data model consequences

Decisions above that the current schema and content layer do not yet support:

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

What the code does **today** (2026-08-08), against the spec above:

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
