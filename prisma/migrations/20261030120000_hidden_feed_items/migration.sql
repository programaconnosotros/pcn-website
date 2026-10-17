-- CreateTable
CREATE TABLE "HiddenFeedItem" (
    "itemId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "href" TEXT NOT NULL,
    "hiddenById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HiddenFeedItem_pkey" PRIMARY KEY ("itemId")
);

-- AddForeignKey
ALTER TABLE "HiddenFeedItem" ADD CONSTRAINT "HiddenFeedItem_hiddenById_fkey" FOREIGN KEY ("hiddenById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
