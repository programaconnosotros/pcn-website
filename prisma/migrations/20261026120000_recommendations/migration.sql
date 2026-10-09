-- CreateEnum
CREATE TYPE "RecommendationKind" AS ENUM ('ARTICLE', 'BOOK', 'COURSE', 'VIDEO');

-- CreateEnum
CREATE TYPE "RecommendationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "Recommendation" (
    "id" TEXT NOT NULL,
    "kind" "RecommendationKind" NOT NULL,
    "slug" TEXT NOT NULL,
    "status" "RecommendationStatus" NOT NULL DEFAULT 'PENDING',
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "url" TEXT,
    "author" TEXT,
    "coauthors" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "source" TEXT,
    "categories" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "language" TEXT,
    "publishedAt" TIMESTAMP(3),
    "year" INTEGER,
    "imageUrl" TEXT,
    "isbn" TEXT,
    "durationSeconds" INTEGER,
    "hours" INTEGER,
    "youtubeUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isTalk" BOOLEAN NOT NULL DEFAULT false,
    "isMadeByCommunity" BOOLEAN NOT NULL DEFAULT false,
    "acceptDonations" BOOLEAN NOT NULL DEFAULT false,
    "position" INTEGER NOT NULL DEFAULT 0,
    "note" TEXT,
    "submittedById" TEXT,
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Recommendation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Recommendation_kind_status_idx" ON "Recommendation"("kind", "status");

-- CreateIndex
CREATE INDEX "Recommendation_status_createdAt_idx" ON "Recommendation"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Recommendation_submittedById_idx" ON "Recommendation"("submittedById");

-- CreateIndex
CREATE UNIQUE INDEX "Recommendation_kind_slug_key" ON "Recommendation"("kind", "slug");

-- AddForeignKey
ALTER TABLE "Recommendation" ADD CONSTRAINT "Recommendation_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recommendation" ADD CONSTRAINT "Recommendation_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
