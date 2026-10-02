-- CreateTable
CREATE TABLE "AppLog" (
    "id" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "path" TEXT,
    "userId" TEXT,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "metadata" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AppLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AppLog_userId_idx" ON "AppLog"("userId");

-- CreateIndex
CREATE INDEX "AppLog_path_idx" ON "AppLog"("path");

-- CreateIndex
CREATE INDEX "AppLog_level_idx" ON "AppLog"("level");

-- CreateIndex
CREATE INDEX "AppLog_createdAt_idx" ON "AppLog"("createdAt");

-- AddForeignKey
ALTER TABLE "AppLog" ADD CONSTRAINT "AppLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
