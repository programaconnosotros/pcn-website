-- AlterTable
ALTER TABLE "Setup" ADD COLUMN "date" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Los setups que ya existían toman el día en que se publicaron.
UPDATE "Setup" SET "date" = "createdAt"::date;

-- CreateIndex
CREATE INDEX "Setup_date_idx" ON "Setup"("date");
