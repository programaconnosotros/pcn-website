-- CreateTable
CREATE TABLE "ForumCommentLike" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "commentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ForumCommentLike_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ForumCommentLike_userId_commentId_key" ON "ForumCommentLike"("userId", "commentId");

-- CreateIndex
CREATE INDEX "ForumCommentLike_commentId_idx" ON "ForumCommentLike"("commentId");

-- AddForeignKey
ALTER TABLE "ForumCommentLike" ADD CONSTRAINT "ForumCommentLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ForumCommentLike" ADD CONSTRAINT "ForumCommentLike_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "ForumComment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
