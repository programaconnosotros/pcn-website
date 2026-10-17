-- CreateTable
CREATE TABLE "Photo" (
    "id" TEXT NOT NULL,
    "src" TEXT NOT NULL,
    "thumbSrc" TEXT NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "storageKeys" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "takenAt" TIMESTAMP(3) NOT NULL,
    "description" TEXT,
    "eventId" TEXT,
    "uploadedById" TEXT,
    "legacyId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Photo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PhotoTag" (
    "id" TEXT NOT NULL,
    "photoId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "taggedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PhotoTag_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Photo_legacyId_key" ON "Photo"("legacyId");

-- CreateIndex
CREATE INDEX "Photo_takenAt_idx" ON "Photo"("takenAt");

-- CreateIndex
CREATE INDEX "Photo_eventId_idx" ON "Photo"("eventId");

-- CreateIndex
CREATE INDEX "PhotoTag_userId_idx" ON "PhotoTag"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PhotoTag_photoId_userId_key" ON "PhotoTag"("photoId", "userId");

-- AddForeignKey
ALTER TABLE "Photo" ADD CONSTRAINT "Photo_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Photo" ADD CONSTRAINT "Photo_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhotoTag" ADD CONSTRAINT "PhotoTag_photoId_fkey" FOREIGN KEY ("photoId") REFERENCES "Photo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhotoTag" ADD CONSTRAINT "PhotoTag_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhotoTag" ADD CONSTRAINT "PhotoTag_taggedById_fkey" FOREIGN KEY ("taggedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Las fotos de la galería estática (/public) pasan a la base, con su id anterior.
INSERT INTO "Photo" ("id", "src", "thumbSrc", "takenAt", "description", "legacyId", "updatedAt") VALUES
  ('legacy-1', '/photos/agus-chelo-talk.webp', '/photos/agus-chelo-talk.webp', '2023-12-24 12:00:00', 'Agus y Chelo dando una charla de ingeniería de software en Tafí Viejo', 1, CURRENT_TIMESTAMP),
  ('legacy-2', '/photos/agus-chelo-tobias-watch-pc.webp', '/photos/agus-chelo-tobias-watch-pc.webp', '2024-07-30 12:00:00', 'Agus, Chelo y Tobi resolviendo problemas con Docker en la web de PCN', 2, CURRENT_TIMESTAMP),
  ('legacy-3', '/photos/agus-init.webp', '/photos/agus-init.webp', '2024-12-27 12:00:00', 'Agus luego de dar una lightning talk virtual en la pandemia', 3, CURRENT_TIMESTAMP),
  ('legacy-4', '/photos/agus-pc.webp', '/photos/agus-pc.webp', '2024-07-30 12:00:00', 'Agus desarrollando la web de PCN', 4, CURRENT_TIMESTAMP),
  ('legacy-5', '/photos/agus-talk.webp', '/photos/agus-talk.webp', '2024-10-16 12:00:00', 'Agus dando una charla de DDD y arquitectura hexagonal en la UTN-FRT', 5, CURRENT_TIMESTAMP),
  ('legacy-6', '/photos/boys-having-a-snack.webp', '/photos/boys-having-a-snack.webp', '2024-03-15 12:00:00', 'Cena de founders de PCN', 6, CURRENT_TIMESTAMP),
  ('legacy-7', '/photos/chelo-watch-pc.webp', '/photos/chelo-watch-pc.webp', '2024-03-15 12:00:00', 'Chelo dando una charla de paradigmas de programación en la UTN-FRT', 7, CURRENT_TIMESTAMP),
  ('legacy-8', '/photos/leno-time.webp', '/photos/leno-time.webp', '2024-03-15 12:00:00', 'Noche de hamburguesas en la casa de Tobi', 8, CURRENT_TIMESTAMP),
  ('legacy-9', '/photos/mauricio-talk.webp', '/photos/mauricio-talk.webp', '2024-03-15 12:00:00', 'Mauri dando una charla sobre diseño en la UTN-FRT', 9, CURRENT_TIMESTAMP),
  ('legacy-10', '/photos/photo-casual.webp', '/photos/photo-casual.webp', '2024-03-15 12:00:00', 'Agus, Facu y Chelo luego de una charla en Tafí Viejo', 10, CURRENT_TIMESTAMP),
  ('legacy-11', '/photos/talk-class.webp', '/photos/talk-class.webp', '2024-03-15 12:00:00', 'Esteban enseñando algoritmos de ordenamiento en la UTN-FRT', 11, CURRENT_TIMESTAMP),
  ('legacy-12', '/photos/tobias-talk.webp', '/photos/tobias-talk.webp', '2024-03-15 12:00:00', 'Tobi dando una charla sobre unit testing en la UTN-FRT', 12, CURRENT_TIMESTAMP),
  ('legacy-13', '/photos/tobias-watch-pc.webp', '/photos/tobias-watch-pc.webp', '2024-03-15 12:00:00', 'Tobi dando una charla sobre depuración de código en la UTN-FRT', 13, CURRENT_TIMESTAMP),
  ('legacy-14', '/IMG_2332.webp', '/IMG_2332.webp', '2024-03-15 12:00:00', NULL, 14, CURRENT_TIMESTAMP),
  ('legacy-15', '/IMG_8943.webp', '/IMG_8943.webp', '2024-03-15 12:00:00', NULL, 15, CURRENT_TIMESTAMP),
  ('legacy-16', '/pcn-header.webp', '/pcn-header.webp', '2024-03-15 12:00:00', 'Header de PCN', 16, CURRENT_TIMESTAMP),
  ('legacy-17', '/mauri-y-tobias.webp', '/mauri-y-tobias.webp', '2024-03-15 12:00:00', 'Mauri y Tobi en un evento de PCN', 17, CURRENT_TIMESTAMP),
  ('legacy-18', '/programando-1.webp', '/programando-1.webp', '2024-03-15 12:00:00', 'Miembros de PCN programando', 18, CURRENT_TIMESTAMP),
  ('legacy-19', '/pre-lightning-talks.webp', '/pre-lightning-talks.webp', '2024-03-15 12:00:00', 'Pre Lightning Talks', 19, CURRENT_TIMESTAMP),
  ('legacy-20', '/IMG_9143.webp', '/IMG_9143.webp', '2024-03-15 12:00:00', NULL, 20, CURRENT_TIMESTAMP),
  ('legacy-21', '/juntada.webp', '/juntada.webp', '2024-03-15 12:00:00', 'Juntada de PCN', 21, CURRENT_TIMESTAMP),
  ('legacy-22', '/IMG_9119.webp', '/IMG_9119.webp', '2024-03-15 12:00:00', NULL, 22, CURRENT_TIMESTAMP),
  ('legacy-23', '/agus-lightning-talk-1.webp', '/agus-lightning-talk-1.webp', '2024-03-15 12:00:00', 'Agus dando una lightning talk', 23, CURRENT_TIMESTAMP),
  ('legacy-24', '/galeria/814a45cf-d0dd-43f6-b4aa-8a3b93b4b6c7.webp', '/galeria/814a45cf-d0dd-43f6-b4aa-8a3b93b4b6c7.webp', '2024-03-15 12:00:00', NULL, 24, CURRENT_TIMESTAMP),
  ('legacy-25', '/galeria/FullSizeRender (1).webp', '/galeria/FullSizeRender (1).webp', '2024-03-15 12:00:00', NULL, 25, CURRENT_TIMESTAMP),
  ('legacy-26', '/galeria/IMG_0620.webp', '/galeria/IMG_0620.webp', '2024-03-15 12:00:00', NULL, 26, CURRENT_TIMESTAMP),
  ('legacy-27', '/galeria/IMG_1076.webp', '/galeria/IMG_1076.webp', '2024-03-15 12:00:00', NULL, 27, CURRENT_TIMESTAMP),
  ('legacy-28', '/galeria/IMG_1099.webp', '/galeria/IMG_1099.webp', '2024-03-15 12:00:00', NULL, 28, CURRENT_TIMESTAMP),
  ('legacy-29', '/galeria/IMG_1113.webp', '/galeria/IMG_1113.webp', '2024-03-15 12:00:00', NULL, 29, CURRENT_TIMESTAMP),
  ('legacy-30', '/galeria/IMG_1150.webp', '/galeria/IMG_1150.webp', '2024-03-15 12:00:00', NULL, 30, CURRENT_TIMESTAMP),
  ('legacy-31', '/galeria/IMG_2275.webp', '/galeria/IMG_2275.webp', '2024-03-15 12:00:00', NULL, 31, CURRENT_TIMESTAMP),
  ('legacy-32', '/galeria/IMG_2322.webp', '/galeria/IMG_2322.webp', '2024-03-15 12:00:00', NULL, 32, CURRENT_TIMESTAMP),
  ('legacy-33', '/galeria/IMG_2345.webp', '/galeria/IMG_2345.webp', '2024-03-15 12:00:00', NULL, 33, CURRENT_TIMESTAMP),
  ('legacy-34', '/galeria/IMG_2420.webp', '/galeria/IMG_2420.webp', '2024-03-15 12:00:00', NULL, 34, CURRENT_TIMESTAMP),
  ('legacy-35', '/galeria/IMG_2482.webp', '/galeria/IMG_2482.webp', '2024-03-15 12:00:00', NULL, 35, CURRENT_TIMESTAMP),
  ('legacy-36', '/galeria/IMG_2496.webp', '/galeria/IMG_2496.webp', '2024-03-15 12:00:00', NULL, 36, CURRENT_TIMESTAMP),
  ('legacy-37', '/galeria/IMG_2497.webp', '/galeria/IMG_2497.webp', '2024-03-15 12:00:00', NULL, 37, CURRENT_TIMESTAMP),
  ('legacy-38', '/galeria/IMG_3046.webp', '/galeria/IMG_3046.webp', '2024-03-15 12:00:00', NULL, 38, CURRENT_TIMESTAMP),
  ('legacy-39', '/galeria/IMG_3048.webp', '/galeria/IMG_3048.webp', '2024-03-15 12:00:00', NULL, 39, CURRENT_TIMESTAMP),
  ('legacy-40', '/galeria/IMG_3082.webp', '/galeria/IMG_3082.webp', '2024-03-15 12:00:00', NULL, 40, CURRENT_TIMESTAMP),
  ('legacy-41', '/galeria/IMG_3084.webp', '/galeria/IMG_3084.webp', '2024-03-15 12:00:00', NULL, 41, CURRENT_TIMESTAMP),
  ('legacy-42', '/galeria/IMG_3087.webp', '/galeria/IMG_3087.webp', '2024-03-15 12:00:00', NULL, 42, CURRENT_TIMESTAMP),
  ('legacy-43', '/galeria/IMG_3088.webp', '/galeria/IMG_3088.webp', '2024-03-15 12:00:00', NULL, 43, CURRENT_TIMESTAMP),
  ('legacy-44', '/galeria/IMG_3097.webp', '/galeria/IMG_3097.webp', '2024-03-15 12:00:00', NULL, 44, CURRENT_TIMESTAMP),
  ('legacy-45', '/galeria/IMG_3220.webp', '/galeria/IMG_3220.webp', '2024-03-15 12:00:00', NULL, 45, CURRENT_TIMESTAMP),
  ('legacy-46', '/galeria/IMG_3653.webp', '/galeria/IMG_3653.webp', '2024-03-15 12:00:00', NULL, 46, CURRENT_TIMESTAMP),
  ('legacy-47', '/galeria/IMG_3660.webp', '/galeria/IMG_3660.webp', '2024-03-15 12:00:00', NULL, 47, CURRENT_TIMESTAMP),
  ('legacy-48', '/galeria/IMG_4254.webp', '/galeria/IMG_4254.webp', '2024-03-15 12:00:00', NULL, 48, CURRENT_TIMESTAMP),
  ('legacy-49', '/galeria/IMG_4322.webp', '/galeria/IMG_4322.webp', '2024-03-15 12:00:00', NULL, 49, CURRENT_TIMESTAMP),
  ('legacy-50', '/galeria/IMG_4695.webp', '/galeria/IMG_4695.webp', '2024-03-15 12:00:00', NULL, 50, CURRENT_TIMESTAMP),
  ('legacy-51', '/galeria/IMG_4707.webp', '/galeria/IMG_4707.webp', '2024-03-15 12:00:00', NULL, 51, CURRENT_TIMESTAMP),
  ('legacy-52', '/galeria/IMG_4763.webp', '/galeria/IMG_4763.webp', '2024-03-15 12:00:00', NULL, 52, CURRENT_TIMESTAMP),
  ('legacy-53', '/galeria/IMG_4766.webp', '/galeria/IMG_4766.webp', '2024-03-15 12:00:00', NULL, 53, CURRENT_TIMESTAMP),
  ('legacy-54', '/galeria/IMG_4872.webp', '/galeria/IMG_4872.webp', '2024-03-15 12:00:00', NULL, 54, CURRENT_TIMESTAMP),
  ('legacy-55', '/galeria/IMG_4881.webp', '/galeria/IMG_4881.webp', '2024-03-15 12:00:00', NULL, 55, CURRENT_TIMESTAMP),
  ('legacy-56', '/galeria/IMG_4900.webp', '/galeria/IMG_4900.webp', '2024-03-15 12:00:00', NULL, 56, CURRENT_TIMESTAMP),
  ('legacy-57', '/galeria/IMG_5142.webp', '/galeria/IMG_5142.webp', '2024-03-15 12:00:00', NULL, 57, CURRENT_TIMESTAMP),
  ('legacy-58', '/galeria/IMG_5166.webp', '/galeria/IMG_5166.webp', '2024-03-15 12:00:00', NULL, 58, CURRENT_TIMESTAMP),
  ('legacy-59', '/galeria/IMG_5180.webp', '/galeria/IMG_5180.webp', '2024-03-15 12:00:00', NULL, 59, CURRENT_TIMESTAMP),
  ('legacy-60', '/galeria/IMG_5188.webp', '/galeria/IMG_5188.webp', '2024-03-15 12:00:00', NULL, 60, CURRENT_TIMESTAMP),
  ('legacy-61', '/galeria/IMG_5191.webp', '/galeria/IMG_5191.webp', '2024-03-15 12:00:00', NULL, 61, CURRENT_TIMESTAMP),
  ('legacy-62', '/galeria/IMG_5751.webp', '/galeria/IMG_5751.webp', '2024-03-15 12:00:00', NULL, 62, CURRENT_TIMESTAMP),
  ('legacy-63', '/galeria/IMG_5917.webp', '/galeria/IMG_5917.webp', '2024-03-15 12:00:00', NULL, 63, CURRENT_TIMESTAMP),
  ('legacy-64', '/galeria/IMG_6719.webp', '/galeria/IMG_6719.webp', '2024-03-15 12:00:00', NULL, 64, CURRENT_TIMESTAMP),
  ('legacy-65', '/galeria/IMG_7611.webp', '/galeria/IMG_7611.webp', '2024-03-15 12:00:00', NULL, 65, CURRENT_TIMESTAMP),
  ('legacy-66', '/galeria/IMG_8414.webp', '/galeria/IMG_8414.webp', '2024-03-15 12:00:00', NULL, 66, CURRENT_TIMESTAMP),
  ('legacy-67', '/galeria/IMG_8723.webp', '/galeria/IMG_8723.webp', '2024-03-15 12:00:00', NULL, 67, CURRENT_TIMESTAMP),
  ('legacy-68', '/galeria/IMG_8740.webp', '/galeria/IMG_8740.webp', '2024-03-15 12:00:00', NULL, 68, CURRENT_TIMESTAMP),
  ('legacy-69', '/galeria/IMG_8824.webp', '/galeria/IMG_8824.webp', '2024-03-15 12:00:00', NULL, 69, CURRENT_TIMESTAMP),
  ('legacy-70', '/galeria/IMG_8870.webp', '/galeria/IMG_8870.webp', '2024-03-15 12:00:00', NULL, 70, CURRENT_TIMESTAMP),
  ('legacy-71', '/galeria/IMG_8936.webp', '/galeria/IMG_8936.webp', '2024-03-15 12:00:00', NULL, 71, CURRENT_TIMESTAMP),
  ('legacy-72', '/galeria/IMG_8945.webp', '/galeria/IMG_8945.webp', '2024-03-15 12:00:00', NULL, 72, CURRENT_TIMESTAMP),
  ('legacy-73', '/galeria/IMG_8949.webp', '/galeria/IMG_8949.webp', '2024-03-15 12:00:00', NULL, 73, CURRENT_TIMESTAMP),
  ('legacy-74', '/galeria/IMG_8955.webp', '/galeria/IMG_8955.webp', '2024-03-15 12:00:00', NULL, 74, CURRENT_TIMESTAMP),
  ('legacy-75', '/galeria/IMG_8968.webp', '/galeria/IMG_8968.webp', '2024-03-15 12:00:00', NULL, 75, CURRENT_TIMESTAMP),
  ('legacy-76', '/galeria/IMG_8973.webp', '/galeria/IMG_8973.webp', '2024-03-15 12:00:00', NULL, 76, CURRENT_TIMESTAMP),
  ('legacy-77', '/galeria/IMG_8975.webp', '/galeria/IMG_8975.webp', '2024-03-15 12:00:00', NULL, 77, CURRENT_TIMESTAMP),
  ('legacy-78', '/galeria/IMG_8985.webp', '/galeria/IMG_8985.webp', '2024-03-15 12:00:00', NULL, 78, CURRENT_TIMESTAMP),
  ('legacy-79', '/galeria/IMG_8999 (1).webp', '/galeria/IMG_8999 (1).webp', '2024-03-15 12:00:00', NULL, 79, CURRENT_TIMESTAMP),
  ('legacy-80', '/galeria/IMG_8999.webp', '/galeria/IMG_8999.webp', '2024-03-15 12:00:00', NULL, 80, CURRENT_TIMESTAMP),
  ('legacy-81', '/galeria/IMG_9011.webp', '/galeria/IMG_9011.webp', '2024-03-15 12:00:00', NULL, 81, CURRENT_TIMESTAMP),
  ('legacy-82', '/galeria/IMG_9025.webp', '/galeria/IMG_9025.webp', '2024-03-15 12:00:00', NULL, 82, CURRENT_TIMESTAMP),
  ('legacy-83', '/galeria/IMG_9031.webp', '/galeria/IMG_9031.webp', '2024-03-15 12:00:00', NULL, 83, CURRENT_TIMESTAMP),
  ('legacy-84', '/galeria/IMG_9040.webp', '/galeria/IMG_9040.webp', '2024-03-15 12:00:00', NULL, 84, CURRENT_TIMESTAMP),
  ('legacy-85', '/galeria/IMG_9076.webp', '/galeria/IMG_9076.webp', '2024-03-15 12:00:00', NULL, 85, CURRENT_TIMESTAMP),
  ('legacy-86', '/galeria/IMG_9104.webp', '/galeria/IMG_9104.webp', '2024-03-15 12:00:00', NULL, 86, CURRENT_TIMESTAMP),
  ('legacy-87', '/galeria/IMG_9109.webp', '/galeria/IMG_9109.webp', '2024-03-15 12:00:00', NULL, 87, CURRENT_TIMESTAMP),
  ('legacy-88', '/galeria/IMG_9113.webp', '/galeria/IMG_9113.webp', '2024-03-15 12:00:00', NULL, 88, CURRENT_TIMESTAMP),
  ('legacy-89', '/galeria/IMG_9123.webp', '/galeria/IMG_9123.webp', '2024-03-15 12:00:00', NULL, 89, CURRENT_TIMESTAMP),
  ('legacy-90', '/galeria/IMG_9261.webp', '/galeria/IMG_9261.webp', '2024-03-15 12:00:00', NULL, 90, CURRENT_TIMESTAMP),
  ('legacy-91', '/galeria/IMG_9308.webp', '/galeria/IMG_9308.webp', '2024-03-15 12:00:00', NULL, 91, CURRENT_TIMESTAMP),
  ('legacy-92', '/galeria/IMG_9512.webp', '/galeria/IMG_9512.webp', '2024-03-15 12:00:00', NULL, 92, CURRENT_TIMESTAMP),
  ('legacy-93', '/galeria/photo_2019-10-14_01-58-24.webp', '/galeria/photo_2019-10-14_01-58-24.webp', '2024-03-15 12:00:00', NULL, 93, CURRENT_TIMESTAMP),
  ('legacy-94', '/IMG_1457.webp', '/IMG_1457.webp', '2024-03-15 12:00:00', NULL, 94, CURRENT_TIMESTAMP);

-- Las imágenes cargadas en eventos pasan a ser fotos del evento.
INSERT INTO "Photo" ("id", "src", "thumbSrc", "takenAt", "eventId", "updatedAt")
SELECT i."id", i."imgSrc", i."imgSrc", COALESCE(e."date", CURRENT_TIMESTAMP), i."eventId", CURRENT_TIMESTAMP
FROM "Image" i
LEFT JOIN "Event" e ON e."id" = i."eventId";

-- DropTable
DROP TABLE "Image";
