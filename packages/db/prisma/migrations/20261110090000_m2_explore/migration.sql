-- CreateEnum
CREATE TYPE "LearnerInterestKind" AS ENUM ('WORLD_TOGGLE', 'CAREER_TOGGLE', 'WORLD_VIEW', 'CAREER_VIEW');

-- AlterTable
ALTER TABLE "Career" ADD COLUMN     "sortOrder" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Industry" ADD COLUMN     "translations" JSONB,
ADD COLUMN     "vrSummary" TEXT;

-- CreateTable
CREATE TABLE "LearnerInterest" (
    "id" TEXT NOT NULL,
    "learnerId" TEXT NOT NULL,
    "kind" "LearnerInterestKind" NOT NULL,
    "industryCode" TEXT NOT NULL,
    "careerId" TEXT,
    "targetKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LearnerInterest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LearnerInterest_learnerId_industryCode_idx" ON "LearnerInterest"("learnerId", "industryCode");

-- CreateIndex
CREATE UNIQUE INDEX "LearnerInterest_learnerId_kind_targetKey_key" ON "LearnerInterest"("learnerId", "kind", "targetKey");

-- CreateIndex
CREATE INDEX "Career_industryCode_sortOrder_idx" ON "Career"("industryCode", "sortOrder");

-- CreateIndex
CREATE INDEX "InterestSignal_learnerHash_signalType_occurredAt_idx" ON "InterestSignal"("learnerHash", "signalType", "occurredAt");

-- AddForeignKey
ALTER TABLE "Industry" ADD CONSTRAINT "Industry_heroAssetId_fkey" FOREIGN KEY ("heroAssetId") REFERENCES "Asset3D"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Industry" ADD CONSTRAINT "Industry_sponsorOrgId_fkey" FOREIGN KEY ("sponsorOrgId") REFERENCES "Organisation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Career" ADD CONSTRAINT "Career_heroAssetId_fkey" FOREIGN KEY ("heroAssetId") REFERENCES "Asset3D"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearnerInterest" ADD CONSTRAINT "LearnerInterest_learnerId_fkey" FOREIGN KEY ("learnerId") REFERENCES "Learner"("id") ON DELETE CASCADE ON UPDATE CASCADE;
