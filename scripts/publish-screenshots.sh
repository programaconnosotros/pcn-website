#!/usr/bin/env bash
# Publish .pr-screenshots/ PNGs to the orphan `pr-screenshots` branch and print
# ready-to-paste GitHub Markdown for the PR body.
#
# Usage: pnpm screenshot:publish
# Requires: git, the working tree must be in a git repo.

set -euo pipefail

REPO="programaconnosotros/pcn-website"
ASSETS_BRANCH="pr-screenshots"
SRC_DIR=".pr-screenshots"

# --- sanity checks ---
if [ ! -d "$SRC_DIR" ] || [ -z "$(ls -A "$SRC_DIR"/*.png 2>/dev/null)" ]; then
  echo "❌  No PNGs found in $SRC_DIR. Run 'pnpm screenshot <routes>' first."
  exit 1
fi

# Namespace images by current branch so PRs don't stomp on each other.
BRANCH_SLUG="$(git rev-parse --abbrev-ref HEAD | tr '/' '-')"

TMP_WT="$(mktemp -d)"
trap 'git worktree remove --force "$TMP_WT" 2>/dev/null || true; rm -rf "$TMP_WT"' EXIT

echo "⬇️   Fetching $ASSETS_BRANCH..."
git fetch origin "$ASSETS_BRANCH" --quiet

git worktree add --quiet "$TMP_WT" "$ASSETS_BRANCH"

# Copy screenshots into the branch, namespaced by PR branch slug.
DEST="$TMP_WT/$BRANCH_SLUG"
mkdir -p "$DEST"
cp "$SRC_DIR"/*.png "$DEST/"

cd "$TMP_WT"
git add -A
if git diff --cached --quiet; then
  echo "ℹ️   No changes to publish (screenshots already up to date)."
else
  git commit -m "screenshots: $BRANCH_SLUG"
  echo "⬆️   Pushing to $ASSETS_BRANCH..."
  git push origin "$ASSETS_BRANCH" --quiet
  echo "✅  Published."
fi
cd - >/dev/null

# Print Markdown — referencing the raw URL directly works because the repo is public.
echo ""
echo "---"
echo "## Screenshots"
echo ""
for PNG in "$SRC_DIR"/*.png; do
  FILENAME="$(basename "$PNG")"
  RAW_URL="https://raw.githubusercontent.com/$REPO/$ASSETS_BRANCH/$BRANCH_SLUG/$FILENAME"
  ALT="${FILENAME%.png}"
  echo "### $ALT"
  echo ""
  echo "![$ALT]($RAW_URL)"
  echo ""
done
echo "---"
echo ""
echo "👆  Paste the block above (between the '---' lines) into the PR description."
