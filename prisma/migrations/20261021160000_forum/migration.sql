-- The community forum (ported from the forum v1 PR, #197)
CREATE TABLE "ForumCategory" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ForumCategory_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ForumPost" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "isLocked" BOOLEAN NOT NULL DEFAULT false,
    "authorId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "activeAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ForumPost_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ForumComment" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "parentCommentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ForumComment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ForumPostLike" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ForumPostLike_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ForumCategory_slug_key" ON "ForumCategory"("slug");
CREATE INDEX "ForumPost_categoryId_activeAt_idx" ON "ForumPost"("categoryId", "activeAt");
CREATE INDEX "ForumPost_activeAt_idx" ON "ForumPost"("activeAt");
CREATE INDEX "ForumPost_authorId_idx" ON "ForumPost"("authorId");
CREATE INDEX "ForumComment_postId_createdAt_idx" ON "ForumComment"("postId", "createdAt");
CREATE INDEX "ForumComment_authorId_idx" ON "ForumComment"("authorId");
CREATE INDEX "ForumComment_parentCommentId_idx" ON "ForumComment"("parentCommentId");
CREATE UNIQUE INDEX "ForumPostLike_userId_postId_key" ON "ForumPostLike"("userId", "postId");
CREATE INDEX "ForumPostLike_postId_idx" ON "ForumPostLike"("postId");

ALTER TABLE "ForumPost" ADD CONSTRAINT "ForumPost_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ForumPost" ADD CONSTRAINT "ForumPost_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ForumCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ForumComment" ADD CONSTRAINT "ForumComment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ForumComment" ADD CONSTRAINT "ForumComment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "ForumPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ForumComment" ADD CONSTRAINT "ForumComment_parentCommentId_fkey" FOREIGN KEY ("parentCommentId") REFERENCES "ForumComment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ForumPostLike" ADD CONSTRAINT "ForumPostLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ForumPostLike" ADD CONSTRAINT "ForumPostLike_postId_fkey" FOREIGN KEY ("postId") REFERENCES "ForumPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- The categories the forum starts with; admins can add more later.
INSERT INTO "ForumCategory" ("id", "slug", "name", "description", "position") VALUES
  ('forum-cat-general', 'general', 'General', 'Charlas de la comunidad que no entran en otra categoría.', 0),
  ('forum-cat-ayuda', 'ayuda', 'Ayuda técnica', 'Preguntas sobre código, errores y herramientas: contá qué probaste y qué esperabas.', 1),
  ('forum-cat-carrera', 'carrera', 'Carrera', 'Primer trabajo, entrevistas, crecer en el rubro y trabajar remoto.', 2),
  ('forum-cat-proyectos', 'proyectos', 'Proyectos', 'Mostrá lo que estás construyendo y pedí feedback.', 3),
  ('forum-cat-recursos', 'recursos', 'Recursos', 'Cursos, libros, artículos y charlas que valen la pena.', 4),
  ('forum-cat-off-topic', 'off-topic', 'Off-topic', 'Todo lo demás: setups, juegos, música y lo que pinte.', 5);
