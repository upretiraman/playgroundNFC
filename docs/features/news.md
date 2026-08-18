# News

Hand-written articles announcing club milestones, match results, and
updates — separate from the training/game event system (an event is a
scheduled session; a news item is a write-up about something that happened
or was announced). Read-only for everyone but an Admin.

**Status**: Live, content is developer-edited JSON.

## User stories

- As a **Guest**, I want to browse a list of news articles (newest first),
  so I can catch up on what the club has been doing.
- As a **Guest**, I want to filter/recognize which team a story is about
  (boys, girls, or club-wide), so I can find news relevant to the team I
  follow.
- As a **Guest**, I want to open a single article and read its full body,
  so I get the complete story, not just the summary.
- As an **Admin**, I want to publish, edit, and remove news articles from
  the dashboard, so club updates don't require a developer and a deploy.

## Acceptance criteria

- `/news` lists every article sorted by date descending, showing date, team
  badge (if any), title, and summary.
- `/news/[slug]` renders the full article body for a valid slug; an invalid
  slug 404s.
- Home page teaser shows the 3 most recent articles (already implemented).
- Once Admin publishing ships: a newly published article appears on `/news`
  without a rebuild; a removed one disappears.
- Only an Admin can create, edit, or remove articles — Trainers and Players
  have the same read-only view as Guests.

## Out of scope

- Comments, reactions, or any reader interaction with articles.
- Rich media beyond a single optional cover image (`coverImage` already
  exists in the type; this doc doesn't add a gallery or video embed).
- Auto-generating news from event results — an Admin writes each article by
  hand, same as today.

## Current vs. target

| Area | Today | Target |
|---|---|---|
| Storage | `src/lib/data/news.json` (dev-edited, requires a deploy) | Prisma-backed |
| Publishing | Developer only, via a JSON commit | Admin, via a dashboard form |
| Article fields | slug, title, date, summary, body, team?, coverImage? | Unchanged shape |

## Data model changes

- New Prisma `NewsItem` model replacing `news.json`: slug (unique), title,
  date, summary, body, team (nullable, "boys" \| "girls" \| "both"),
  coverImage (nullable).
- `ClubRepository.getNews()` / `getNewsItem()` interface is unchanged; only
  `JsonClubRepository`'s implementation moves from JSON to Prisma. Callers
  (`news/page.tsx`, `news/[slug]/page.tsx`, the home page teaser) do not
  change.

## Permissions

Publishing is Admin-only ("Manage public content (CMS)" in the permission
matrix). See [docs/roles-and-permissions.md](../roles-and-permissions.md)
and [docs/roles/admin.md](../roles/admin.md) — this document does not
restate the rule.

## Proposed issues

- [ ] **Add `NewsItem` Prisma model, migrate off JSON** — schema + migration + repository implementation swap.
- [ ] **Admin dashboard: news list + create/edit form** — title, date, summary, body, team, cover image.
- [ ] **Admin dashboard: delete/unpublish a news article**.
