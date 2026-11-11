-- Email OTP login (D-039). Login moves from SMS/phone to email; phone becomes optional.

-- OtpChallenge: key on email instead of phone.
DROP INDEX IF EXISTS "OtpChallenge_phoneE164_createdAt_idx";
ALTER TABLE "OtpChallenge" DROP COLUMN IF EXISTS "phoneE164";
ALTER TABLE "OtpChallenge" ADD COLUMN "email" TEXT NOT NULL DEFAULT 'legacy@veza.local';
ALTER TABLE "OtpChallenge" ALTER COLUMN "email" DROP DEFAULT;
CREATE INDEX "OtpChallenge_email_createdAt_idx" ON "OtpChallenge"("email", "createdAt");

-- User: phone optional, email required.
ALTER TABLE "User" ALTER COLUMN "phoneE164" DROP NOT NULL;
ALTER TABLE "User" ALTER COLUMN "email" SET NOT NULL;
