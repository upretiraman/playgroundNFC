---
name: prisma-stale-client
description: Diagnose and fix "Cannot read properties of undefined (reading 'findMany'/'findUnique'/etc.)" or "db.<model> is not a function" errors on this NFC Nürnberg site — these come from a stale or missing generated Prisma client, not a real application bug. Use this whenever a page that reads from Prisma (schedule, dashboard, shop, or any page under src/lib/repository.ts or src/lib/events.ts) throws in the browser or dev server logs but the database itself seems fine, especially right after checking out a new branch/worktree, pulling changes that touched prisma/schema.prisma, or adding a new Prisma model. Also use it if `npx prisma generate` was already run but the error persists in the browser — that's the second half of this bug, not a sign the fix didn't work.
license: MIT
---

# Diagnosing stale Prisma clients on this site

This site (`CLAUDE.md` gotcha section already flags the general rule) hits a
specific two-layer failure mode often enough that it's worth a dedicated
playbook instead of re-deriving it from scratch each time. The symptom is
always some variant of:

```
TypeError: Cannot read properties of undefined (reading 'findMany')
  at JsonClubRepository.getProducts (src/lib/repository.ts:80:39)
```

where `db.<model>` itself is `undefined` — not a query error, not a missing
table, the delegate object for that model doesn't exist on the client at
all. This is never a logic bug in the calling code. It's caused by one or
both of two things stacking on top of each other:

## Layer 1 — the generated client on disk is stale or missing

`src/generated/prisma` (the actual `PrismaClient` code, delegates included)
is **gitignored** — see `.gitignore` and the Prisma gotcha in `CLAUDE.md`.
It only exists because someone ran `npx prisma generate` locally. That means:

- A fresh `git worktree` or fresh clone has no generated client at all until
  `prisma generate` runs once.
- If `prisma/schema.prisma` gained a model (or a migration was added) since
  the last generate, the on-disk client is missing that model's delegate —
  `db.product` etc. is simply not there, because the client was built from
  an older schema.

**Check and fix:**

```bash
npx prisma migrate status     # confirms the migration/table actually exists
npx prisma generate           # rebuilds src/generated/prisma from current schema.prisma
```

Don't skip the `migrate status` check — if the migration itself is missing
(not just the generated client), `prisma generate` alone won't help; you'd
need `npx prisma migrate dev` first, which is a different problem (a schema
change that was never migrated at all, not just never generated).

**Verify the regenerated client actually works, independent of the running
dev server**, before touching anything else. Write a throwaway script next
to the repo root (not in `/tmp` — relative imports need to resolve against
the project) that imports the client directly and runs the failing query:

```js
// scratch-check.mjs — delete after use
import { PrismaClient } from "./src/generated/prisma/client.js";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const db = new PrismaClient({ adapter: new PrismaBetterSqlite3({ url: "file:./dev.db" }) });
console.log("has model:", typeof db.product);       // swap "product" for the failing model
console.log("rows:", (await db.product.findMany()).length);
```

Run with `npx tsx scratch-check.mjs`. If this succeeds, the on-disk client
is fixed and the bug — if it persists in the browser — is Layer 2, not a
lingering Layer 1 problem. Delete the scratch file when done; it's not part
of the app.

## Layer 2 — the running dev server cached the old client in memory

Even after `prisma generate` fixes the files on disk, **an already-running
`next dev` process may still show the exact same error**, with the exact
same error digest, because `src/lib/db.ts` deliberately does this:

```ts
export const db = globalThis.__prisma ?? createPrismaClient();
if (process.env.NODE_ENV !== "production") globalThis.__prisma = db;
```

That `globalThis` caching is intentional — it's the standard workaround to
stop Next.js dev-mode hot reloads from spawning a fresh `PrismaClient` (and
a fresh SQLite connection) on every file save. The tradeoff is that this
cached instance survives across Fast Refresh/Turbopack recompiles within
the same Node process. Regenerating the client changes what's on disk and
webpack/turbopack will happily recompile *modules that changed*, but the
already-constructed client object sitting in `globalThis.__prisma` doesn't
get replaced — recompiling `db.ts` doesn't re-execute code that already ran
once and cached its result globally. Only a fresh Node process gets a fresh
`globalThis`.

**So: if the standalone script above works but the browser still shows the
identical error (same digest), the dev server process itself is stale and
needs restarting** — not the code.

**How to actually restart it in this environment:** don't assume a plain
reload or even navigating away and back will do it — that just re-requests
from the same stale process. Killing it by PID is often not possible from
here even when `netstat`/`ss` can see the listening port: the process may
live in a different namespace than the shell tools can reach (you'll see
`netstat` list a PID that `tasklist`/`ps`/`kill` then can't find or can't
touch — access denied or "no such process" is the tell). Don't burn time
fighting this — it usually means the process belongs to the outer
harness/preview infrastructure, not something to force-kill.

Instead, use the browser preview tool's own server management, which
starts a server it tracks and controls rather than trying to reuse
whatever is already bound to the port:

```
mcp__Claude_Browser__preview_start with { "name": "nfc-nurnberg-dev" }
```

(the named config from `.claude/launch.json`). A response with
`"reused": false` confirms a genuinely new process started, not a
reattachment to the old one. Then navigate to the page that was failing and
confirm via `read_console_messages` (no errors) and `get_page_text` (real
content, not a "server error" boundary) that it's actually fixed — don't
take a 200 status alone as proof; Next.js renders its own error boundary
with a 200.

## Quick reference: which layer am I in?

| Symptom | Layer |
|---|---|
| `db.product` undefined immediately, haven't run `prisma generate` since the schema/migration changed | 1 |
| Standalone script (Layer 1 check) also fails | 1 — check `migrate status` too |
| Standalone script works, browser still shows the *same* error digest | 2 |
| Browser error digest changes or a different error appears after generating | Something else — stop following this playbook and debug normally |

## Why this matters enough for a dedicated skill

This isn't a one-off — it recurs specifically because of two reasonable
engineering decisions compounding: gitignoring generated code (correct,
avoids committing derived/large files) and caching the Prisma client across
HMR (correct, avoids connection exhaustion). Neither decision is wrong, but
together they mean "the fix is on disk" and "the fix is live" are two
separate facts that don't imply each other. Treat both checks as required,
not either/or.
