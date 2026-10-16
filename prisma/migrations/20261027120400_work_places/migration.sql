-- CreateTable
CREATE TABLE "WorkPlace" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "address" TEXT,
    "googleMapsUrl" TEXT,
    "wifi" INTEGER NOT NULL,
    "plugs" INTEGER NOT NULL,
    "calls" INTEGER NOT NULL,
    "foodQuality" INTEGER,
    "foodVariety" INTEGER,
    "notes" TEXT,
    "photoUrl" TEXT,
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkPlace_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WorkPlace_authorId_idx" ON "WorkPlace"("authorId");

-- CreateIndex
CREATE INDEX "WorkPlace_city_idx" ON "WorkPlace"("city");

-- AddForeignKey
ALTER TABLE "WorkPlace" ADD CONSTRAINT "WorkPlace_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
