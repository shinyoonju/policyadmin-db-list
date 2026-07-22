-- AlterTable
ALTER TABLE "Policy" ADD COLUMN     "contact" TEXT,
ADD COLUMN     "department" TEXT,
ADD COLUMN     "externalSourceId" TEXT,
ADD COLUMN     "householdTypes" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "lifeCycles" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "ministry" TEXT,
ADD COLUMN     "onlineApplyAvailable" BOOLEAN,
ADD COLUMN     "provisionType" TEXT,
ADD COLUMN     "sourceRegisteredAt" TEXT,
ADD COLUMN     "supportCycle" TEXT,
ADD COLUMN     "themes" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "viewCount" INTEGER;

-- CreateIndex
CREATE INDEX "Policy_externalSourceId_idx" ON "Policy"("externalSourceId");
