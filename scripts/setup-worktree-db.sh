#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# setup-worktree-db.sh
#
# Provisions an isolated Postgres database for the current git worktree and
# writes a matching .env pointing at that database.
#
# Safe to call on every session start:
#   • no-op when run from the main checkout
#   • fast-exits if .env already exists (already provisioned)
#
# Invoked automatically via .claude/settings.json SessionStart hook.
# Can also be run manually: pnpm setup-worktree-db
# ---------------------------------------------------------------------------
set -euo pipefail

# ── 1. Resolve main checkout vs current worktree ─────────────────────────────
CUR=$(git rev-parse --show-toplevel)
MAIN_TREE=$(git worktree list --porcelain | awk '/^worktree /{print $2; exit}')

if [ "$CUR" = "$MAIN_TREE" ]; then
  # Running in the main checkout — nothing to do.
  exit 0
fi

# ── 2. Fast exit if already provisioned ──────────────────────────────────────
if [ -f "$CUR/.env" ]; then
  exit 0
fi

# ── 3. Read credentials from the main .env ───────────────────────────────────
if [ ! -f "$MAIN_TREE/.env" ]; then
  echo "⚠️  setup-worktree-db: $MAIN_TREE/.env not found." >&2
  echo "   Copy .env.template → .env in the main checkout and fill in the values." >&2
  exit 1
fi

set -a
# shellcheck source=/dev/null
source "$MAIN_TREE/.env"
set +a

: "${POSTGRES_USER:?POSTGRES_USER not set in main .env}"
: "${POSTGRES_PASSWORD:?POSTGRES_PASSWORD not set in main .env}"
: "${DATABASE_URL:?DATABASE_URL not set in main .env}"
DIRECT_URL="${DIRECT_URL:-$DATABASE_URL}"

# ── 4. Derive the per-worktree database name ─────────────────────────────────
WORKTREE_BASENAME=$(basename "$CUR")
# lowercase, replace non-alphanumeric runs with _, strip trailing underscores
DB_NAME="pcn_$(echo "$WORKTREE_BASENAME" | tr '[:upper:]' '[:lower:]' | tr -cs 'a-z0-9' '_' | sed 's/_*$//')"

echo "→ Provisioning worktree DB: $DB_NAME"

# ── 5. Ensure the pcn-db container is running ─────────────────────────────────
if ! docker ps --format '{{.Names}}' | grep -q '^pcn-db$'; then
  echo "  Starting pcn-db container..."
  docker compose -f "$MAIN_TREE/docker-compose.yml" up -d database
  echo -n "  Waiting for Postgres..."
  until docker exec pcn-db pg_isready -U "$POSTGRES_USER" -q 2>/dev/null; do
    echo -n "."
    sleep 1
  done
  echo " ready."
fi

# ── 6. Create the database (idempotent) ───────────────────────────────────────
DB_EXISTS=$(docker exec pcn-db psql -U "$POSTGRES_USER" -tAc \
  "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'" 2>/dev/null || true)
if [ "$DB_EXISTS" != "1" ]; then
  echo "  Creating database..."
  docker exec pcn-db createdb -U "$POSTGRES_USER" "$DB_NAME"
fi

# ── 7. Write .env for this worktree ──────────────────────────────────────────
# Replace only the database name at the end of each connection URL; preserve
# every other variable (SMTP, AWS, etc.) verbatim from the main .env.
NEW_DB_URL=$(echo "$DATABASE_URL" | sed "s|/[^/?]*$|/$DB_NAME|")
NEW_DIRECT_URL=$(echo "$DIRECT_URL" | sed "s|/[^/?]*$|/$DB_NAME|")

cp "$MAIN_TREE/.env" "$CUR/.env"
sed -i.bak "s|^DATABASE_URL=.*|DATABASE_URL=\"$NEW_DB_URL\"|" "$CUR/.env"
sed -i.bak "s|^DIRECT_URL=.*|DIRECT_URL=\"$NEW_DIRECT_URL\"|" "$CUR/.env"
rm -f "$CUR/.env.bak"

echo "  .env written (DATABASE_URL → $NEW_DB_URL)"

# ── 8. Ensure Node dependencies are installed ─────────────────────────────────
cd "$CUR"
if [ ! -f "node_modules/.bin/prisma" ]; then
  echo "  Running pnpm install..."
  pnpm install
fi

# ── 9. Apply all pending migrations ──────────────────────────────────────────
echo "  Applying migrations..."
pnpm exec prisma migrate deploy

# ── 10. Seed with sample data ────────────────────────────────────────────────
echo "  Seeding database..."
pnpm populate-database

echo "✓ Worktree DB ready: $DB_NAME"
