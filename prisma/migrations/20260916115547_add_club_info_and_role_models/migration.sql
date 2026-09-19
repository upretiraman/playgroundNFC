-- CreateTable
CREATE TABLE "ClubInfo" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'club-info',
    "name" TEXT NOT NULL,
    "shortName" TEXT NOT NULL,
    "foundedYear" INTEGER NOT NULL,
    "city" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "motto" TEXT NOT NULL,
    "values" TEXT NOT NULL,
    "mission" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "instagram" TEXT,
    "whatsapp" TEXT,
    "address" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ClubRole" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "reportsTo" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "duties" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "ClubRole_slug_key" ON "ClubRole"("slug");
