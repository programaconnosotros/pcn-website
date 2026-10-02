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

# ── 5. Write .env for this worktree ──────────────────────────────────────────
# Replace only the database name at the end of each connection URL; preserve
# every other variable (SMTP, AWS, etc.) verbatim from the main .env.
NEW_DB_URL=$(echo "$DATABASE_URL" | sed "s|/[^/?]*$|/$DB_NAME|")
NEW_DIRECT_URL=$(echo "$DIRECT_URL" | sed "s|/[^/?]*$|/$DB_NAME|")

cp "$MAIN_TREE/.env" "$CUR/.env"
sed -i.bak "s|^DATABASE_URL=.*|DATABASE_URL=\"$NEW_DB_URL\"|" "$CUR/.env"
sed -i.bak "s|^DIRECT_URL=.*|DIRECT_URL=\"$NEW_DIRECT_URL\"|" "$CUR/.env"
rm -f "$CUR/.env.bak"

echo "  .env written (DATABASE_URL → $NEW_DB_URL)"

# Override the env vars exported by the main .env source above, so Prisma and
# the seed script use the new worktree database, not the main one.
export DATABASE_URL="$NEW_DB_URL"
export DIRECT_URL="$NEW_DIRECT_URL"

# ── 6. Ensure Node dependencies are installed ─────────────────────────────────
cd "$CUR"
if [ ! -f "node_modules/.bin/prisma" ]; then
  echo "  Running pnpm install..."
  pnpm install
fi

# ── 7. Apply all pending migrations ──────────────────────────────────────────
# prisma migrate deploy creates the database if it doesn't exist, then applies
# all pending migrations non-interactively. Correct for automation.
echo "  Applying migrations..."
pnpm exec prisma migrate deploy

# ── 8. Seed with sample data ────────────────────────────────────────────────
echo "  Seeding database..."
pnpm populate-database

echo "✓ Worktree DB ready: $DB_NAME"
