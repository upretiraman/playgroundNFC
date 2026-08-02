/**
 * Checked-in smoke test for the NFC Nürnberg site.
 *
 * Requires the dev server already running (npm run dev) against the same
 * database this script connects to via DATABASE_URL. Creates its own
 * throwaway Admin/Trainer/Player accounts and one training event, runs
 * through the Guest/Admin/Trainer/Player flows via a headless browser, and
 * deletes everything it created — safe to run against a real dev database.
 *
 * Usage:
 *   npm run test:smoke
 *   SMOKE_TEST_URL=http://localhost:3100 npm run test:smoke
 */
import { randomBytes } from "node:crypto";
import { existsSync } from "node:fs";
import bcrypt from "bcryptjs";
import { chromium, type Browser } from "playwright";
import { db } from "../src/lib/db";
import playersJson from "../src/lib/data/players.json";

const BASE_URL = process.env.SMOKE_TEST_URL ?? "http://localhost:3000";

// Some sandboxed dev environments pre-install a specific Chromium build at a
// fixed path instead of the revision this Playwright version would normally
// fetch. Use it when present; otherwise fall back to Playwright's normal
// browser resolution (run `npx playwright install chromium` if that's missing).
const SANDBOX_CHROMIUM = "/opt/pw-browsers/chromium";
const launchOptions = existsSync(SANDBOX_CHROMIUM)
  ? { headless: true, executablePath: SANDBOX_CHROMIUM }
  : { headless: true };
const suffix = randomBytes(4).toString("hex");

const creds = {
  admin: { email: `smoketest-admin-${suffix}@local.test`, password: "SmokeTestAdmin123!" },
  trainer: { email: `smoketest-trainer-${suffix}@local.test`, password: "SmokeTestTrainer123!" },
  player: { email: `smoketest-player-${suffix}@local.test`, password: "SmokeTestPlayer123!" },
};

const rosterPlayer = (playersJson as Array<{ slug: string; team: string; name: string }>).find(
  (p) => p.team === "boys"
);
if (!rosterPlayer) {
  throw new Error("No boys-team player found in src/lib/data/players.json to link a test account to.");
}

const createdUserIds: string[] = [];
const createdEventIds: string[] = [];

type Result = { name: string; ok: boolean; detail?: string };
const results: Result[] = [];

async function step(name: string, fn: () => Promise<void>) {
  try {
    await fn();
    results.push({ name, ok: true });
    console.log(`  ✓ ${name}`);
  } catch (e) {
    const detail = e instanceof Error ? e.message : String(e);
    results.push({ name, ok: false, detail });
    console.log(`  ✗ ${name} — ${detail}`);
  }
}

async function checkServerUp() {
  try {
    const res = await fetch(BASE_URL, { signal: AbortSignal.timeout(5000) });
    return res.ok || res.status < 500;
  } catch {
    return false;
  }
}

async function seedAccounts() {
  const admin = await db.user.create({
    data: {
      email: creds.admin.email,
      name: "Smoke Test Admin",
      role: "ADMIN",
      passwordHash: await bcrypt.hash(creds.admin.password, 10),
    },
  });
  createdUserIds.push(admin.id);

  const trainer = await db.user.create({
    data: {
      email: creds.trainer.email,
      name: "Smoke Test Trainer",
      role: "TRAINER",
      team: "boys",
      passwordHash: await bcrypt.hash(creds.trainer.password, 10),
    },
  });
  createdUserIds.push(trainer.id);

  const player = await db.user.create({
    data: {
      email: creds.player.email,
      name: rosterPlayer!.name,
      role: "PLAYER",
      team: "boys",
      playerSlug: rosterPlayer!.slug,
      passwordHash: await bcrypt.hash(creds.player.password, 10),
    },
  });
  createdUserIds.push(player.id);
}

async function cleanup() {
  await db.attendance.deleteMany({ where: { eventId: { in: createdEventIds } } });
  await db.event.deleteMany({ where: { id: { in: createdEventIds } } });
  await db.user.deleteMany({ where: { id: { in: createdUserIds } } });
  await db.$disconnect();
}

async function login(page: import("playwright").Page, email: string, password: string) {
  await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle" });
  await page.fill("input#email", email);
  await page.fill("input#password", password);
  await page.click('button[type="submit"]');
  await page.waitForURL("**/dashboard", { timeout: 10000 });
}

async function main() {
  console.log(`Smoke testing ${BASE_URL} ...`);

  if (!(await checkServerUp())) {
    console.error(
      `\nCould not reach ${BASE_URL}. Start the dev server first: npm run dev\n` +
        `(or set SMOKE_TEST_URL if it's running on a different port)`
    );
    process.exit(1);
  }

  await seedAccounts();

  let browser: Browser | undefined;
  try {
    browser = await chromium.launch(launchOptions);

    // --- Guest ---
    await step("guest is redirected away from /dashboard", async () => {
      const context = await browser!.newContext();
      const page = await context.newPage();
      await page.goto(`${BASE_URL}/dashboard`, { waitUntil: "networkidle" });
      if (!page.url().includes("/login")) {
        throw new Error(`expected redirect to /login, got ${page.url()}`);
      }
      await context.close();
    });

    await step("public home page renders", async () => {
      const context = await browser!.newContext();
      const page = await context.newPage();
      await page.goto(BASE_URL, { waitUntil: "networkidle" });
      const title = await page.title();
      if (!title.includes("NFC Nürnberg")) {
        throw new Error(`unexpected title: ${title}`);
      }
      await context.close();
    });

    // --- Admin ---
    const adminContext = await browser.newContext();
    const adminPage = await adminContext.newPage();
    await step("admin can log in", async () => {
      await login(adminPage, creds.admin.email, creds.admin.password);
    });
    await adminContext.close();

    // --- Trainer schedules a session and marks attendance ---
    const trainerContext = await browser.newContext();
    const trainerPage = await trainerContext.newPage();
    let eventUrl = "";
    await step("trainer can log in", async () => {
      await login(trainerPage, creds.trainer.email, creds.trainer.password);
    });
    await step("trainer can schedule a training session", async () => {
      await trainerPage.goto(`${BASE_URL}/dashboard/schedule/new`, { waitUntil: "networkidle" });
      const future = new Date();
      future.setDate(future.getDate() + 14);
      await trainerPage.fill("#date", future.toISOString().slice(0, 10));
      await trainerPage.fill("#startTime", "19:00");
      await trainerPage.fill("#endTime", "20:30");
      await trainerPage.fill("#plan", "Smoke test plan.");
      await trainerPage.click('button[type="submit"]');
      await trainerPage.waitForFunction(() => !location.pathname.endsWith("/new"), null, {
        timeout: 10000,
      });
      eventUrl = trainerPage.url();
      const id = eventUrl.split("/").pop();
      if (id) createdEventIds.push(id);
    });
    await step("trainer can mark attendance", async () => {
      const row = trainerPage.locator("form", { has: trainerPage.getByText(rosterPlayer!.name) }).first();
      await row.locator('select[name="status"]').selectOption("PRESENT");
      await row.locator('button[type="submit"]').click();
      await trainerPage.waitForTimeout(1000);
    });
    await trainerContext.close();

    // --- Player sees own schedule read-only ---
    const playerContext = await browser.newContext();
    const playerPage = await playerContext.newPage();
    await step("player can log in", async () => {
      await login(playerPage, creds.player.email, creds.player.password);
    });
    await step("player sees the scheduled session read-only", async () => {
      await playerPage.goto(eventUrl, { waitUntil: "networkidle" });
      const editButtons = await playerPage.locator('button:has-text("Save")').count();
      if (editButtons > 0) {
        throw new Error("player view unexpectedly has editable attendance controls");
      }
    });
    await step("player is blocked from /dashboard/users", async () => {
      await playerPage.goto(`${BASE_URL}/dashboard/users`, { waitUntil: "networkidle" });
      if (playerPage.url().includes("/dashboard/users")) {
        throw new Error("player was able to reach /dashboard/users");
      }
    });
    await playerContext.close();
  } finally {
    await browser?.close();
    await cleanup();
  }

  const failed = results.filter((r) => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} checks passed.`);
  if (failed.length > 0) {
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
