-- CreateTable
CREATE TABLE "UserPosition" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "jobTitle" TEXT NOT NULL,
    "enterprise" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserPosition_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserPosition_userId_idx" ON "UserPosition"("userId");

-- AddForeignKey
ALTER TABLE "UserPosition" ADD CONSTRAINT "UserPosition_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill: the single job each user already had becomes their first position.
INSERT INTO "UserPosition" ("id", "userId", "jobTitle", "enterprise", "order")
SELECT 'pos_' || md5(random()::text || "id"), "id", "jobTitle", NULLIF(btrim("enterprise"), ''), 0
FROM "User"
WHERE "jobTitle" IS NOT NULL AND btrim("jobTitle") <> '';
