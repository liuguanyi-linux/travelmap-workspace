-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Spot" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "cnName" TEXT,
    "city" TEXT NOT NULL,
    "address" TEXT,
    "lng" REAL,
    "lat" REAL,
    "photos" TEXT,
    "videos" TEXT,
    "intro" TEXT,
    "content" TEXT,
    "tags" TEXT NOT NULL,
    "rank" INTEGER NOT NULL DEFAULT 99,
    "isTop" BOOLEAN NOT NULL DEFAULT false,
    "expiryDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Spot" ("address", "city", "cnName", "content", "createdAt", "expiryDate", "id", "intro", "lat", "lng", "name", "photos", "tags", "updatedAt", "videos") SELECT "address", "city", "cnName", "content", "createdAt", "expiryDate", "id", "intro", "lat", "lng", "name", "photos", "tags", "updatedAt", "videos" FROM "Spot";
DROP TABLE "Spot";
ALTER TABLE "new_Spot" RENAME TO "Spot";
CREATE TABLE "new_Guide" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "hasCar" BOOLEAN NOT NULL DEFAULT false,
    "title" TEXT NOT NULL,
    "avatar" TEXT NOT NULL,
    "intro" TEXT NOT NULL,
    "cities" TEXT NOT NULL,
    "rank" INTEGER NOT NULL DEFAULT 99,
    "isTop" BOOLEAN NOT NULL DEFAULT false,
    "isGlobal" BOOLEAN NOT NULL DEFAULT false,
    "content" TEXT,
    "photos" TEXT,
    "expiryDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Guide" ("avatar", "cities", "content", "createdAt", "expiryDate", "gender", "hasCar", "id", "intro", "name", "photos", "rank", "title", "updatedAt") SELECT "avatar", "cities", "content", "createdAt", "expiryDate", "gender", "hasCar", "id", "intro", "name", "photos", "rank", "title", "updatedAt" FROM "Guide";
DROP TABLE "Guide";
ALTER TABLE "new_Guide" RENAME TO "Guide";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
