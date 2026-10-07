-- Consejos extracted from the conversations that the member they're attributed to took down
CREATE TABLE "HiddenConsejo" (
    "extractedId" TEXT NOT NULL,
    "hiddenById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HiddenConsejo_pkey" PRIMARY KEY ("extractedId")
);

CREATE INDEX "HiddenConsejo_hiddenById_idx" ON "HiddenConsejo"("hiddenById");

ALTER TABLE "HiddenConsejo" ADD CONSTRAINT "HiddenConsejo_hiddenById_fkey" FOREIGN KEY ("hiddenById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
