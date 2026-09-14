-- Multi-role account model: `role` (single value) becomes `roles` (comma-separated
-- set, e.g. "PLAYER,TRAINER"). Renaming preserves existing single-role values
-- unchanged ("ADMIN" is already a valid one-item set). Also adds `isActive`
-- (soft disable) and `mustChangePassword` (forced reset flow).

ALTER TABLE "User" RENAME COLUMN "role" TO "roles";
ALTER TABLE "User" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "User" ADD COLUMN "mustChangePassword" BOOLEAN NOT NULL DEFAULT true;

-- Existing accounts predate the forced-reset flow — don't force them through it.
-- New accounts get mustChangePassword = true explicitly at creation.
UPDATE "User" SET "mustChangePassword" = false;
