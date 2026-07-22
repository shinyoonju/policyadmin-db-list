-- AlterTable
ALTER TABLE "Policy" ADD COLUMN     "additionalInfo" TEXT,
ADD COLUMN     "applicationMethod" TEXT,
ADD COLUMN     "detailCheckedAt" TIMESTAMP(3),
ADD COLUMN     "detailHash" TEXT,
ADD COLUMN     "detailRetryCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "detailStatus" TEXT NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "selectionCriteria" TEXT,
ADD COLUMN     "supportDetails" TEXT;

-- CreateIndex
CREATE INDEX "Policy_detailStatus_idx" ON "Policy"("detailStatus");

-- CreateIndex
CREATE INDEX "Policy_detailCheckedAt_idx" ON "Policy"("detailCheckedAt");
