-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Review" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "rating" INTEGER NOT NULL,
    "content" TEXT,
    "images" TEXT,
    "userId" INTEGER,
    "nickname" TEXT,
    "avatar" TEXT,
    "poiId" INTEGER,
    "spotId" INTEGER,
    "guideId" INTEGER,
    "strategyId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Review_poiId_fkey" FOREIGN KEY ("poiId") REFERENCES "Poi" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Review_spotId_fkey" FOREIGN KEY ("spotId") REFERENCES "Spot" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Review_guideId_fkey" FOREIGN KEY ("guideId") REFERENCES "Guide" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Review_strategyId_fkey" FOREIGN KEY ("strategyId") REFERENCES "Strategy" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Review" ("content", "createdAt", "id", "images", "poiId", "rating", "userId") SELECT "content", "createdAt", "id", "images", "poiId", "rating", "userId" FROM "Review";
DROP TABLE "Review";
ALTER TABLE "new_Review" RENAME TO "Review";
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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Spot" ("address", "city", "content", "createdAt", "id", "lat", "lng", "name", "photos", "tags", "updatedAt", "videos") SELECT "address", "city", "content", "createdAt", "id", "lat", "lng", "name", "photos", "tags", "updatedAt", "videos" FROM "Spot";
DROP TABLE "Spot";
ALTER TABLE "new_Spot" RENAME TO "Spot";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
