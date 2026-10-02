-- CreateTable
CREATE TABLE "ContentMark" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "mark" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContentMark_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ContentMark_userId_contentType_idx" ON "ContentMark"("userId", "contentType");

-- CreateIndex
CREATE UNIQUE INDEX "ContentMark_userId_contentType_contentId_mark_key" ON "ContentMark"("userId", "contentType", "contentId", "mark");

-- AddForeignKey
ALTER TABLE "ContentMark" ADD CONSTRAINT "ContentMark_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
