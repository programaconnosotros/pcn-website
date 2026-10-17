-- Full-text search for the global search (/api/search) over the tables that keep growing: forum
-- topics and replies, consejos and members. tsvector finds every word by prefix (as you type) and
-- ranks the results; pg_trgm finds the ones with a typo.
CREATE EXTENSION IF NOT EXISTS unaccent;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- The same normalization as normalizeSearchText (src/lib/search/search-index.ts): lowercase,
-- without accents, punctuation turned into spaces, so "CI/CD" indexes as "ci cd". unaccent() is
-- only STABLE, because its dictionary could change; naming the dictionary lets this wrapper be
-- IMMUTABLE, which an index expression requires.
CREATE OR REPLACE FUNCTION search_text(text) RETURNS text
  LANGUAGE sql IMMUTABLE PARALLEL SAFE STRICT
  AS $$ SELECT btrim(regexp_replace(lower(public.unaccent('public.unaccent'::regdictionary, $1)), '[^a-z0-9]+', ' ', 'g')) $$;

-- Each query in src/lib/search/full-text.ts repeats these expressions exactly, or Postgres won't
-- use the index.
CREATE INDEX "ForumPost_search_fts_idx" ON "ForumPost"
  USING GIN (to_tsvector('simple', search_text("title" || ' ' || "content")));
CREATE INDEX "ForumPost_search_trgm_idx" ON "ForumPost"
  USING GIN (search_text("title" || ' ' || "content") gin_trgm_ops);

CREATE INDEX "ForumComment_search_fts_idx" ON "ForumComment"
  USING GIN (to_tsvector('simple', search_text("content")));
CREATE INDEX "ForumComment_search_trgm_idx" ON "ForumComment"
  USING GIN (search_text("content") gin_trgm_ops);

CREATE INDEX "Advice_search_fts_idx" ON "Advice"
  USING GIN (to_tsvector('simple', search_text("content")));
CREATE INDEX "Advice_search_trgm_idx" ON "Advice"
  USING GIN (search_text("content") gin_trgm_ops);

-- What a public profile shows, never emails or phones.
CREATE INDEX "User_search_fts_idx" ON "User"
  USING GIN (to_tsvector('simple', search_text("name" || ' ' || coalesce("jobTitle", '') || ' ' || coalesce("enterprise", '') || ' ' || coalesce("slogan", '') || ' ' || coalesce("career", '') || ' ' || coalesce("studyPlace", ''))));
CREATE INDEX "User_search_trgm_idx" ON "User"
  USING GIN (search_text("name" || ' ' || coalesce("jobTitle", '') || ' ' || coalesce("enterprise", '') || ' ' || coalesce("slogan", '') || ' ' || coalesce("career", '') || ' ' || coalesce("studyPlace", '')) gin_trgm_ops);
