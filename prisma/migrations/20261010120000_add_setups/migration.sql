-- CreateTable
CREATE TABLE "Setup" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "thumbUrl" TEXT NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "storageKeys" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Setup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SetupLike" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "setupId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SetupLike_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Setup_authorId_idx" ON "Setup"("authorId");

-- CreateIndex
CREATE INDEX "Setup_createdAt_idx" ON "Setup"("createdAt");

-- CreateIndex
CREATE INDEX "SetupLike_userId_idx" ON "SetupLike"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SetupLike_setupId_userId_key" ON "SetupLike"("setupId", "userId");

-- AddForeignKey
ALTER TABLE "Setup" ADD CONSTRAINT "Setup_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SetupLike" ADD CONSTRAINT "SetupLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SetupLike" ADD CONSTRAINT "SetupLike_setupId_fkey" FOREIGN KEY ("setupId") REFERENCES "Setup"("id") ON DELETE CASCADE ON UPDATE CASCADE;
