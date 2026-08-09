import { PrismaClient } from "@/generated/prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";

declare global {
  var __prisma: PrismaClient | undefined;
}

function createPrismaClient() {
  // libSQL is SQLite-wire-compatible: a local "file:./dev.db" URL behaves
  // like plain SQLite for dev, while a "libsql://..." URL + authToken talks
  // to a remote Turso database in production. See CLAUDE.md's Turso gotcha.
  const adapter = new PrismaLibSQL({
    url: process.env.DATABASE_URL ?? "file:./dev.db",
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
  return new PrismaClient({ adapter });
}

export const db = globalThis.__prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.__prisma = db;
}
