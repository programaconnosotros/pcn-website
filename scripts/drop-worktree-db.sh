#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# drop-worktree-db.sh
#
# Drops the per-worktree Postgres database created by setup-worktree-db.sh.
# Idempotent (uses DROP DATABASE IF EXISTS); safe if the DB was never created.
#
# Usage:
#   Called automatically by the WorktreeRemove hook when you choose
#   "remove worktree" at the end of a claude -w session.
#
#   Can also be run manually: pnpm drop-worktree-db [/path/to/worktree]
#
# When called from the WorktreeRemove hook, Claude Code sends a JSON payload
# on stdin:  { "worktree_path": "/path/to/worktree", ... }
# When called manually, stdin is a TTY (or you pass the path as $1).
# ---------------------------------------------------------------------------
set -euo pipefail

# ── 1. Determine the target worktree path ────────────────────────────────────
if [ -n "${1:-}" ]; then
  # Explicit path argument
  WORKTREE_PATH="$1"
elif [ ! -t 0 ]; then
  # Non-interactive stdin → WorktreeRemove hook JSON payload
  WORKTREE_PATH=$(node -e "
process.stdin.setEncoding('utf8');
let data = '';
process.stdin.on('data', chunk => { data += chunk; });
process.stdin.on('end', () => {
  try { process.stdout.write(JSON.parse(data).worktree_path || ''); }
  catch (e) { process.exit(1); }
});
")
else
  # Fallback: current worktree
  WORKTREE_PATH=$(git rev-parse --show-toplevel)
fi

if [ -z "$WORKTREE_PATH" ]; then
  echo "⚠️  drop-worktree-db: could not determine worktree path." >&2
  exit 1
fi

# ── 2. Derive the database name ───────────────────────────────────────────────
WORKTREE_BASENAME=$(basename "$WORKTREE_PATH")
DB_NAME="pcn_$(echo "$WORKTREE_BASENAME" | tr '[:upper:]' '[:lower:]' | tr -cs 'a-z0-9' '_' | sed 's/_*$//')"

# ── 3. Safety guard: never drop the main/default database ────────────────────
MAIN_TREE=$(git worktree list --porcelain | awk '/^worktree /{print $2; exit}')

if [ "$WORKTREE_PATH" = "$MAIN_TREE" ]; then
  echo "⚠️  drop-worktree-db: refusing to run against the main checkout." >&2
  exit 1
fi

if [ -f "$MAIN_TREE/.env" ]; then
  set -a
  # shellcheck source=/dev/null
  source "$MAIN_TREE/.env"
  set +a
  if [ "${POSTGRES_DB:-}" = "$DB_NAME" ]; then
    echo "⚠️  drop-worktree-db: refusing to drop the main database ($DB_NAME)." >&2
    exit 1
  fi
fi

: "${DATABASE_URL:?DATABASE_URL not set in main .env}"

# ── 4. Build a maintenance connection URL ────────────────────────────────────
# Replace the database name in DATABASE_URL with the maintenance DB (postgres).
# psql needs an existing database to connect to before it can drop another one.
MAINTENANCE_URL=$(echo "$DATABASE_URL" | sed "s|/[^/?]*$|/postgres|")

# ── 5. Drop the database ─────────────────────────────────────────────────────
echo "→ Dropping worktree DB: $DB_NAME"
psql "$MAINTENANCE_URL" -c "DROP DATABASE IF EXISTS \"$DB_NAME\";"
echo "✓ Done."
