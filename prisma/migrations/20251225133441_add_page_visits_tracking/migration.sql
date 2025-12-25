-- CreateTable
CREATE TABLE "PageVisit" (
    "id" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "userId" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "referer" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PageVisit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PageVisit_path_idx" ON "PageVisit"("path");

-- CreateIndex
CREATE INDEX "PageVisit_userId_idx" ON "PageVisit"("userId");

-- CreateIndex
CREATE INDEX "PageVisit_createdAt_idx" ON "PageVisit"("createdAt");

-- AddForeignKey
ALTER TABLE "PageVisit" ADD CONSTRAINT "PageVisit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
