-- RedefineTables
PRAGMA foreign_keys=OFF;
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
    "category" TEXT NOT NULL DEFAULT 'guide',
    "content" TEXT,
    "photos" TEXT,
    "expiryDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Guide" ("avatar", "cities", "content", "createdAt", "expiryDate", "gender", "hasCar", "id", "intro", "isGlobal", "isTop", "name", "photos", "rank", "title", "updatedAt") SELECT "avatar", "cities", "content", "createdAt", "expiryDate", "gender", "hasCar", "id", "intro", "isGlobal", "isTop", "name", "photos", "rank", "title", "updatedAt" FROM "Guide";
DROP TABLE "Guide";
ALTER TABLE "new_Guide" RENAME TO "Guide";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
