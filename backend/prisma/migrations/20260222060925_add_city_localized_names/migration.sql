-- AlterTable
ALTER TABLE "Ad" ADD COLUMN "expiryDate" DATETIME;

-- AlterTable
ALTER TABLE "City" ADD COLUMN "nameEn" TEXT;
ALTER TABLE "City" ADD COLUMN "nameKo" TEXT;

-- AlterTable
ALTER TABLE "Guide" ADD COLUMN "expiryDate" DATETIME;

-- AlterTable
ALTER TABLE "Spot" ADD COLUMN "cnName" TEXT;
ALTER TABLE "Spot" ADD COLUMN "expiryDate" DATETIME;
ALTER TABLE "Spot" ADD COLUMN "intro" TEXT;

-- AlterTable
ALTER TABLE "Strategy" ADD COLUMN "expiryDate" DATETIME;
