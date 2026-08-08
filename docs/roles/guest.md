# Role: Guest

Anyone visiting the site without logging in. No account, no session.

Part of the [Roles & Permissions](../roles-and-permissions.md) specification.
**Status: specification.** Guest is the one role whose target matches what the
site already does.

## Can

- Read every public page: home, club info, teams, news, training and game
  schedule, shop, contact.
- See the public roster — player **names and avatars** for both teams.
- See training and game times, venues, and opponents.

## Cannot

- See any personal detail beyond a name: no email addresses, no phone numbers,
  no attendance data, no fee records. The rule is "public, minus personal
  details" — names themselves stay public.
- Reach anything under `/dashboard/**`. `src/proxy.ts` redirects to
  `/login?callbackUrl=…`.
- Create an account. There is no self-registration; an Admin creates accounts.

## Rules

**Never gate a public page behind login.** The public site is the club's shop
window and must stay fully readable to a stranger. A new feature that would
require a visitor to log in to see club information is out of bounds unless
this document changes first.

**Roster visibility is publish-gated on the other side.** A Guest sees only
roster entries an Admin has published, so an auto-created entry for a new
Player account is not exposed until someone decides it should be. See
[Player](player.md) and [Admin](admin.md).

## Current vs. target

No change. Guests already have full public read access with names visible and
no personal details exposed. Implementing the rest of this specification must
not alter that.
