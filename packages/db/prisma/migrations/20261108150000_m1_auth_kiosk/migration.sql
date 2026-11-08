-- AlterTable
ALTER TABLE "Guardian" ADD COLUMN     "lastReminderAt" TIMESTAMP(3),
ADD COLUMN     "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "respondedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "KioskDevice" ADD COLUMN     "appVersion" TEXT,
ADD COLUMN     "battery" INTEGER,
ADD COLUMN     "queueDepth" INTEGER;

-- CreateTable
CREATE TABLE "IdempotencyRecord" (
    "id" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "route" TEXT NOT NULL,
    "requestHash" TEXT NOT NULL,
    "statusCode" INTEGER NOT NULL,
    "responseBody" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IdempotencyRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "IdempotencyRecord_createdAt_idx" ON "IdempotencyRecord"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "IdempotencyRecord_deviceId_key_key" ON "IdempotencyRecord"("deviceId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "KioskDevice_apiKeyHash_key" ON "KioskDevice"("apiKeyHash");

-- AddForeignKey
ALTER TABLE "IdempotencyRecord" ADD CONSTRAINT "IdempotencyRecord_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "KioskDevice"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Consent is append-only (PRD 16.4, D-015): block in-place edits at the database level.
-- Deletes stay possible so account erasure (cascade from Learner) still works.
CREATE OR REPLACE FUNCTION consent_no_update() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'Consent rows are append-only; insert a new row instead';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER consent_append_only
  BEFORE UPDATE ON "Consent"
  FOR EACH ROW EXECUTE FUNCTION consent_no_update();
