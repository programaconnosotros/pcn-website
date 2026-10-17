-- CreateTable
CREATE TABLE "IdentityLink" (
    "id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "externalName" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IdentityLink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "IdentityLink_userId_idx" ON "IdentityLink"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "IdentityLink_source_externalName_key" ON "IdentityLink"("source", "externalName");

-- AddForeignKey
ALTER TABLE "IdentityLink" ADD CONSTRAINT "IdentityLink_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
