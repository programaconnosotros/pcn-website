-- CreateTable
CREATE TABLE "ZeroToAgent" (
    "id" TEXT NOT NULL,
    "allowedEmails" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "waitlistEmails" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "waitlistUnlockAt" TIMESTAMP(3) NOT NULL,
    "creditsClaimedBy" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "creditsClaimed" INTEGER NOT NULL DEFAULT 0,
    "creditsUnclaimed" INTEGER NOT NULL DEFAULT 0,
    "creditsUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ZeroToAgent_pkey" PRIMARY KEY ("id")
);
