-- CreateTable
CREATE TABLE "JobOffers" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "enterprise" TEXT NOT NULL,
    "available" BOOLEAN NOT NULL,
    "logoPath" TEXT NOT NULL,
    "tags" TEXT[],
    "location" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "salaryAmount" INTEGER,
    "currency" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobOffers_pkey" PRIMARY KEY ("id")
);
