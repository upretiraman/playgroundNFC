-- CreateTable
CREATE TABLE "NewsItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "summary" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "team" TEXT,
    "coverImage" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "NewsItem_slug_key" ON "NewsItem"("slug");
