/*
  Warnings:

  - Made the column `city` on table `Spot` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Strategy" ADD COLUMN "city" TEXT;

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Spot" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "address" TEXT,
    "lng" REAL,
    "lat" REAL,
    "photos" TEXT,
    "videos" TEXT,
    "content" TEXT,
    "tags" TEXT NOT NULL,
    "reviews" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Spot" ("address", "city", "content", "createdAt", "id", "lat", "lng", "name", "photos", "tags", "updatedAt", "videos") SELECT "address", "city", "content", "createdAt", "id", "lat", "lng", "name", "photos", "tags", "updatedAt", "videos" FROM "Spot";
DROP TABLE "Spot";
ALTER TABLE "new_Spot" RENAME TO "Spot";
CREATE TABLE "new_ContactInfo" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "wechat" TEXT,
    "website" TEXT,
    "address" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_ContactInfo" ("address", "email", "id", "phone", "updatedAt", "website", "wechat") SELECT "address", "email", "id", "phone", "updatedAt", "website", "wechat" FROM "ContactInfo";
DROP TABLE "ContactInfo";
ALTER TABLE "new_ContactInfo" RENAME TO "ContactInfo";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
