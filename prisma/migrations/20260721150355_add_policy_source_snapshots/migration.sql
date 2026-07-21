-- CreateTable
CREATE TABLE "Policy" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "amount" TEXT NOT NULL,
    "deadline" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "target" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "documents" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "applyUrl" TEXT NOT NULL,
    "keywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "sourceName" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "reviewStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "lastCheckedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Policy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Article" (
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "sections" JSONB NOT NULL,
    "keywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Article_pkey" PRIMARY KEY ("slug")
);

-- CreateTable
CREATE TABLE "PolicyCheck" (
    "id" TEXT NOT NULL,
    "policyId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "officialUrl" TEXT NOT NULL,
    "httpStatus" INTEGER,
    "checkStatus" TEXT NOT NULL,
    "reasons" JSONB NOT NULL,
    "diffSummary" TEXT,
    "sourceHash" TEXT,
    "oldSnapshot" TEXT,
    "newSnapshot" TEXT,
    "checkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "reviewerStatus" TEXT,

    CONSTRAINT "PolicyCheck_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SearchLog" (
    "id" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "resultCount" INTEGER NOT NULL,
    "path" TEXT,
    "userAgent" TEXT,
    "ip" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SearchLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MenuClickLog" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "href" TEXT NOT NULL,
    "path" TEXT,
    "userAgent" TEXT,
    "ip" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MenuClickLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Policy_category_idx" ON "Policy"("category");

-- CreateIndex
CREATE INDEX "Policy_region_idx" ON "Policy"("region");

-- CreateIndex
CREATE INDEX "Policy_reviewStatus_idx" ON "Policy"("reviewStatus");

-- CreateIndex
CREATE INDEX "Policy_isActive_idx" ON "Policy"("isActive");

-- CreateIndex
CREATE INDEX "Article_category_idx" ON "Article"("category");

-- CreateIndex
CREATE INDEX "Article_isPublished_idx" ON "Article"("isPublished");

-- CreateIndex
CREATE INDEX "PolicyCheck_policyId_idx" ON "PolicyCheck"("policyId");

-- CreateIndex
CREATE INDEX "PolicyCheck_checkStatus_idx" ON "PolicyCheck"("checkStatus");

-- CreateIndex
CREATE INDEX "PolicyCheck_checkedAt_idx" ON "PolicyCheck"("checkedAt");

-- CreateIndex
CREATE INDEX "SearchLog_query_idx" ON "SearchLog"("query");

-- CreateIndex
CREATE INDEX "SearchLog_createdAt_idx" ON "SearchLog"("createdAt");

-- CreateIndex
CREATE INDEX "MenuClickLog_label_idx" ON "MenuClickLog"("label");

-- CreateIndex
CREATE INDEX "MenuClickLog_createdAt_idx" ON "MenuClickLog"("createdAt");

-- AddForeignKey
ALTER TABLE "PolicyCheck" ADD CONSTRAINT "PolicyCheck_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "Policy"("id") ON DELETE CASCADE ON UPDATE CASCADE;
