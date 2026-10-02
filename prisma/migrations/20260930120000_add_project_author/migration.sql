-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "authorId" TEXT;

-- CreateIndex
CREATE INDEX "Project_authorId_idx" ON "Project"("authorId");

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

