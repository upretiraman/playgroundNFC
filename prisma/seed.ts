import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import playersData from "../src/lib/data/players.json";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
});
const db = new PrismaClient({ adapter });

const DAY_INDEX: Record<string, number> = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
};

function nextDateForDay(dayName: string, weeksAhead = 0): Date {
  const target = DAY_INDEX[dayName];
  const now = new Date();
  const date = new Date(now);
  const diff = (target - now.getDay() + 7) % 7 || 7;
  date.setDate(now.getDate() + diff + weeksAhead * 7);
  date.setHours(0, 0, 0, 0);
  return date;
}

async function main() {
  const adminEmail = "admin@nfcnuernberg.example";
  const existingAdmin = await db.user.findUnique({
    where: { email: adminEmail },
  });

  let adminPassword: string | null = null;
  let admin = existingAdmin;

  if (!admin) {
    adminPassword = randomBytes(9).toString("base64url");
    const passwordHash = await bcrypt.hash(adminPassword, 12);
    admin = await db.user.create({
      data: {
        email: adminEmail,
        passwordHash,
        name: "Club Administrator",
        role: "ADMIN",
      },
    });
  }

  const players = playersData as Array<{ slug: string; team: string }>;

  const boysTraining = await db.event.upsert({
    where: { id: "seed-boys-training" },
    update: {},
    create: {
      id: "seed-boys-training",
      type: "TRAINING",
      team: "boys",
      date: nextDateForDay("Tuesday"),
      startTime: "19:00",
      endTime: "20:30",
      venue: "Sportpark Valznerweiher",
      address: "Nürnberg, Germany (exact pitch to be confirmed)",
      plan: "Warm-up (10 min) → passing & possession drills (20 min) → small-sided games (30 min) → finishing drills (15 min) → cool-down/stretch (5 min).",
      createdById: admin.id,
      attendances: {
        create: players
          .filter((p) => p.team === "boys")
          .map((p) => ({ playerSlug: p.slug, status: "UNKNOWN" })),
      },
    },
  });

  const girlsTraining = await db.event.upsert({
    where: { id: "seed-girls-training" },
    update: {},
    create: {
      id: "seed-girls-training",
      type: "TRAINING",
      team: "girls",
      date: nextDateForDay("Wednesday"),
      startTime: "18:30",
      endTime: "20:00",
      venue: "Sportpark Valznerweiher",
      address: "Nürnberg, Germany (exact pitch to be confirmed)",
      plan: "Warm-up & ball control (15 min) → passing patterns (20 min) → 4v4 small-sided games (25 min) → shooting practice (15 min) → cool-down/stretch (5 min).",
      createdById: admin.id,
      attendances: {
        create: players
          .filter((p) => p.team === "girls")
          .map((p) => ({ playerSlug: p.slug, status: "UNKNOWN" })),
      },
    },
  });

  await db.event.upsert({
    where: { id: "seed-boys-training-2" },
    update: {},
    create: {
      id: "seed-boys-training-2",
      type: "TRAINING",
      team: "boys",
      date: nextDateForDay("Thursday"),
      startTime: "19:00",
      endTime: "20:30",
      venue: "Sportpark Valznerweiher",
      address: "Nürnberg, Germany (exact pitch to be confirmed)",
      createdById: admin.id,
      attendances: {
        create: players
          .filter((p) => p.team === "boys")
          .map((p) => ({ playerSlug: p.slug, status: "UNKNOWN" })),
      },
    },
  });

  await db.event.upsert({
    where: { id: "seed-girls-training-2" },
    update: {},
    create: {
      id: "seed-girls-training-2",
      type: "TRAINING",
      team: "girls",
      date: nextDateForDay("Saturday"),
      startTime: "10:00",
      endTime: "11:30",
      venue: "Sportpark Valznerweiher",
      address: "Nürnberg, Germany (exact pitch to be confirmed)",
      createdById: admin.id,
      attendances: {
        create: players
          .filter((p) => p.team === "girls")
          .map((p) => ({ playerSlug: p.slug, status: "UNKNOWN" })),
      },
    },
  });

  await db.event.upsert({
    where: { id: "seed-both-training" },
    update: {},
    create: {
      id: "seed-both-training",
      type: "TRAINING",
      team: "both",
      date: nextDateForDay("Sunday"),
      startTime: "11:00",
      endTime: "13:00",
      venue: "Sportpark Valznerweiher",
      address: "Nürnberg, Germany (exact pitch to be confirmed)",
      notes: "Open scrimmage / match day for both teams, followed by team lunch.",
      createdById: admin.id,
      attendances: {
        create: players.map((p) => ({ playerSlug: p.slug, status: "UNKNOWN" })),
      },
    },
  });

  await db.event.upsert({
    where: { id: "seed-boys-game" },
    update: {},
    create: {
      id: "seed-boys-game",
      type: "GAME",
      team: "boys",
      date: nextDateForDay("Sunday", 1),
      startTime: "11:00",
      endTime: "13:00",
      venue: "Sportpark Valznerweiher",
      address: "Nürnberg, Germany (exact pitch to be confirmed)",
      opponent: "FC Community Friendly XI",
      notes: "Friendly match — arrive 30 minutes early for warm-up.",
      createdById: admin.id,
    },
  });

  console.log("Seed complete.");
  console.log(`Boys training seeded: ${boysTraining.id}`);
  console.log(`Girls training seeded: ${girlsTraining.id}`);

  if (adminPassword) {
    console.log("\n=== Bootstrap Administrator account created ===");
    console.log(`Email:    ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
    console.log("Log in and create Trainer/Player accounts from /dashboard/users.");
    console.log("This password is shown only this once — store it somewhere safe.\n");
  } else {
    console.log("\nAdmin account already exists — no new password generated.\n");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
