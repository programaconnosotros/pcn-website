# PCN Website

## Development

- Package manager: pnpm
- Dev server: `pnpm dev` (port 3000) or `pnpm dev:portless` (recommended in worktrees)

## Worktrees

Each worktree gets an isolated Postgres database (provisioned automatically by the SessionStart hook) and its own URL when using `pnpm dev:portless`:

- Main checkout → `https://pcn-website.localhost`
- Linked worktree on branch `<name>` → `https://<name>.pcn-website.localhost`

No port conflicts, no extra config needed.
