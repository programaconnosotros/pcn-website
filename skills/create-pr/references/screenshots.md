# Create PR — Screenshots and Video

GitHub's REST/GraphQL API has never accepted a direct image upload for an issue or PR body — the web UI's drag-and-drop goes through an internal, undocumented pipeline. For a long time that made screenshots the one part of a PR an agent couldn't reliably produce. As of **2026-09-01**, GitHub CLI closes that gap officially: `gh` gained a documented `--attach` flag that uploads a local image or video and rewrites its reference in the body. Use that. Do not use the undocumented upload endpoint some workaround guides reach for, and do not fabricate a URL.

## When a screenshot is required

The diff touches a UI path — configured via `pr.screenshots.uiPaths` in `.eagerworks/create-pr.json`, or inferred from the repo's shape (an `apps/web`, `apps/mobile`, a `resources/views`, a `templates/` directory, component files under the diff). `pr.screenshots.mode: "off"` disables the requirement entirely for repos with no UI.

## A. Getting the image

Stop at the first rung that produces an actual file on disk.

1. **A path the user already gave you.** Use it as-is; don't re-derive it.
2. **An e2e artifact already on disk**, matched against `pr.screenshots.artifactPaths` (defaults to common locations if unset: `playwright-report/**/*.png`, `test-results/**/*.png`, `cypress/screenshots/**/*.png`).
3. **Live capture**, only with confirmation first:
   - `pr.screenshots.captureCommand`, if configured — confirm before running it, since it may start a server or a browser.
   - Otherwise, the agent's own browser automation (e.g. Claude in Chrome), only if the app is already running and reachable — never boot infrastructure (`docker compose up`, a dev server, a deploy) just to get a screenshot.
4. **Ask the user.** Leave an explicit placeholder in the description in the meantime:
   ```markdown
   <!-- TODO(author): attach a screenshot of the updated settings page here -->
   ```
   Never fabricate an image or video URL, and never link to a file that doesn't exist in the repo or on disk.

The image only needs to exist on local disk long enough for `--attach` to upload it — it is never added to the git tree for this purpose. See "What not to do" below.

## B. Attaching with the GitHub CLI

```bash
gh --version   # must be >= 2.99.0 — this flag shipped 2026-09-01
```

**`gh` ≥ 2.99.0 — use `--attach`.** Reference the local path in the body first (so the alt text is preserved and the URL lands in place, not appended at the end), then attach:

```markdown
<!-- body.md -->

## Screenshots

![Login error state](./screenshots/login-error.png)
```

```bash
gh pr create --base main --title "fix(auth): show inline error on failed login" \
  --body-file body.md \
  --attach './screenshots/login-error.png#Login error state'
```

Adding to an already-open PR uses the same flag on `gh pr edit`:

```bash
gh pr edit 123 --attach './screenshots/login-error.png#Login error state'
```

Alt text goes after `#` in the `--attach` value; it's what makes the uploaded asset's alt text match what was already in the markdown. `--attach` is repeatable — pass it once per file. Anything attached but never referenced in the body is appended at the end of the PR instead of being inlined.

**`gh` < 2.99.0 — stop and say so.** Tell the user to upgrade (`brew upgrade gh` on macOS, or the platform's package manager) and re-run with `gh pr edit --attach` once done. Do not fall back to any other upload path — see "What not to do" below.

## Constraints

|                   |                                                                        |
| ----------------- | ---------------------------------------------------------------------- |
| Supported formats | PNG, JPEG, GIF, WebP, SVG, MP4, MOV, WebM                              |
| Size limits       | 10 MB for images/GIFs; video 10 MB on Free plans, 100 MB on paid plans |
| Access required   | Write access to the repository being attached to                       |
| Not supported     | GitHub Enterprise Server (as of this flag's initial release)           |

## What not to do

- **Don't use the undocumented `uploads.github.com/user-attachments/assets` endpoint.** It works with a bearer token today, but it's an unsupported internal API with no stability guarantee — the same job now has an official, documented flag.
- **Don't rely on the GitHub MCP server for this.** The official `github/github-mcp-server` has no attachment-upload capability as of this writing ([github/github-mcp-server#738](https://github.com/github/github-mcp-server/issues/738), open) — it's blocked on GitHub not exposing a public upload API, which `--attach` bypasses by driving the same client-side flow the web UI uses.
- **Don't host the image externally** (S3, a GitHub Release asset, a base64 data URI) as a first resort — that's a heavier workaround for a problem `--attach` now solves directly. Reach for it only if the user explicitly asks for external hosting for some other reason (e.g. the file exceeds `--attach`'s size limit).
- **Don't commit the screenshot into the repo's git history** (e.g. `git add screenshots/foo.png && git push`, then linking it via a `raw.githubusercontent.com` URL) as a way to get it into the PR body. This permanently adds a review-only binary to the project's history for every future clone, and it's exactly the kind of workaround `--attach` exists to make unnecessary. The one exception is a screenshot that belongs in the repo for an unrelated reason the user asked for (e.g. `assets/PrivacyInfo.xcprivacy`-style fixtures, documentation images meant to live in `docs/`) — never do it solely to work around not having `--attach`.
- **Don't invent a URL** of any kind — an unavailable screenshot is a placeholder and a question, never a guess.
