-- Indexes for the queries every page runs (upcoming events in the layout, the unread
-- notifications count) and for the foreign keys the listings join and count on. Postgres doesn't
-- index foreign keys by itself.

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "Advise_authorId_idx" ON "Advise"("authorId");

-- CreateIndex
CREATE INDEX "Advise_createdAt_idx" ON "Advise"("createdAt");

-- CreateIndex
CREATE INDEX "Comment_adviseId_idx" ON "Comment"("adviseId");

-- CreateIndex
CREATE INDEX "Comment_authorId_idx" ON "Comment"("authorId");

-- CreateIndex
CREATE INDEX "Comment_parentCommentId_idx" ON "Comment"("parentCommentId");

-- CreateIndex
CREATE INDEX "Like_adviseId_idx" ON "Like"("adviseId");

-- CreateIndex
CREATE INDEX "Event_deletedAt_date_idx" ON "Event"("deletedAt", "date");

-- CreateIndex
CREATE INDEX "GalleryItem_uploadedById_idx" ON "GalleryItem"("uploadedById");

-- CreateIndex
CREATE INDEX "GalleryItem_createdAt_idx" ON "GalleryItem"("createdAt");

-- DropIndex
DROP INDEX "Notification_userId_idx";

-- CreateIndex
CREATE INDEX "Notification_userId_read_idx" ON "Notification"("userId", "read");
