# PCN Website

## Development

- Package manager: pnpm
- Dev server: `pnpm dev` (uses portless by default — requires Node 24+)
- Plain next dev (Docker / no portless): `pnpm dev:docker`

## Worktrees

Each worktree gets an isolated Postgres database (provisioned automatically by the SessionStart hook) and its own URL when running `pnpm dev`:

- Main checkout → `https://pcn-website.localhost`
- Linked worktree on branch `<name>` → `https://<name>.pcn-website.localhost`

No port conflicts, no extra config needed.

## Pull requests

When opening a PR that changes any UI, include screenshots in the description:

1. Start the app: `docker-compose up -d` (or `pnpm dev` with the DB running).
2. Capture the affected routes: `pnpm screenshot /route-a /route-b`
3. Publish and get Markdown: `pnpm screenshot:publish`
4. Paste the printed Markdown block under a `## Screenshots` heading in the PR body.

Screenshots are pushed to the orphan `pr-screenshots` branch (never merged to main)
and referenced via `raw.githubusercontent.com` URLs.
See `scripts/pr-screenshots.mjs` and `scripts/publish-screenshots.sh`.
