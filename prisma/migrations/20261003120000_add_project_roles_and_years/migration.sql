-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "authorRole" TEXT,
ADD COLUMN     "startYear" INTEGER,
ADD COLUMN     "endYear" INTEGER;

-- AlterTable
ALTER TABLE "ProjectMember" ADD COLUMN     "role" TEXT;
