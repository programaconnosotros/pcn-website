-- Categories an author picks for their consejo
ALTER TABLE "Advice" ADD COLUMN "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];
