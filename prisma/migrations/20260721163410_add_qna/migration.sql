-- CreateTable
CREATE TABLE "QnaQuestion" (
    "id" TEXT NOT NULL,
    "nickname" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT '정책문의',
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QnaQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QnaAnswer" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "nickname" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QnaAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "QnaQuestion_createdAt_idx" ON "QnaQuestion"("createdAt");

-- CreateIndex
CREATE INDEX "QnaQuestion_isVisible_idx" ON "QnaQuestion"("isVisible");

-- CreateIndex
CREATE INDEX "QnaAnswer_questionId_idx" ON "QnaAnswer"("questionId");

-- CreateIndex
CREATE INDEX "QnaAnswer_createdAt_idx" ON "QnaAnswer"("createdAt");

-- AddForeignKey
ALTER TABLE "QnaAnswer" ADD CONSTRAINT "QnaAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "QnaQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
