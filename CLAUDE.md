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
