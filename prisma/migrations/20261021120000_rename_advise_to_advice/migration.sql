-- "Advise" was a misspelling of the noun: rename the table, its foreign keys and indexes
-- in place so every consejo, comment and like keeps its data.
ALTER TABLE "Advise" RENAME TO "Advice";
ALTER TABLE "Advice" RENAME CONSTRAINT "Advise_pkey" TO "Advice_pkey";
ALTER TABLE "Advice" RENAME CONSTRAINT "Advise_authorId_fkey" TO "Advice_authorId_fkey";
ALTER INDEX "Advise_authorId_idx" RENAME TO "Advice_authorId_idx";
ALTER INDEX "Advise_createdAt_idx" RENAME TO "Advice_createdAt_idx";

ALTER TABLE "Comment" RENAME COLUMN "adviseId" TO "adviceId";
ALTER TABLE "Comment" RENAME CONSTRAINT "Comment_adviseId_fkey" TO "Comment_adviceId_fkey";
ALTER INDEX "Comment_adviseId_idx" RENAME TO "Comment_adviceId_idx";

ALTER TABLE "Like" RENAME COLUMN "adviseId" TO "adviceId";
ALTER TABLE "Like" RENAME CONSTRAINT "Like_adviseId_fkey" TO "Like_adviceId_fkey";
ALTER INDEX "Like_userId_adviseId_key" RENAME TO "Like_userId_adviceId_key";
ALTER INDEX "Like_adviseId_idx" RENAME TO "Like_adviceId_idx";
