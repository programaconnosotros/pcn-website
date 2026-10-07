-- Likes and comments on consejos extracted from the conversations, which have no Advice row:
-- they point at the consejo's `auto-` id instead, and every row points at exactly one consejo.
ALTER TABLE "Comment" ALTER COLUMN "adviceId" DROP NOT NULL;
ALTER TABLE "Comment" ADD COLUMN "extractedId" TEXT;
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_one_consejo_check"
  CHECK (("adviceId" IS NULL) <> ("extractedId" IS NULL));
CREATE INDEX "Comment_extractedId_idx" ON "Comment"("extractedId");

ALTER TABLE "Like" ALTER COLUMN "adviceId" DROP NOT NULL;
ALTER TABLE "Like" ADD COLUMN "extractedId" TEXT;
ALTER TABLE "Like" ADD CONSTRAINT "Like_one_consejo_check"
  CHECK (("adviceId" IS NULL) <> ("extractedId" IS NULL));
CREATE UNIQUE INDEX "Like_userId_extractedId_key" ON "Like"("userId", "extractedId");
CREATE INDEX "Like_extractedId_idx" ON "Like"("extractedId");
