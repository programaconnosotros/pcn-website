-- Projects are now ordered by an admin with drag and drop and new ones go last, so give every
-- project a distinct position that keeps the order the list showed until now.
UPDATE "Project" AS p
SET "order" = ranked.position
FROM (
  SELECT id, ROW_NUMBER() OVER (ORDER BY "order" ASC, "createdAt" DESC) - 1 AS position
  FROM "Project"
) AS ranked
WHERE p.id = ranked.id;
