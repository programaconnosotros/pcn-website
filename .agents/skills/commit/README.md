# commit

A portable agent skill that commits everything modified or new in the working tree by default — grouped into a series of well-formed [Conventional Commits](https://www.conventionalcommits.org/), one commit per logical change, staged by explicit path, instead of a single commit for everything that happens to be uncommitted. A repo that wants confirmation before new files get committed can turn that off in config. Works with Claude Code, Cursor, GitHub Copilot, Codex, Amp, and any agentic coding tool that can read markdown files.

## What it covers

- A grouping ladder that decides where commit boundaries go: an already-staged index first, then an explicit instruction, then change intent, then mechanical companions (lockfile with manifest, migration with schema dump), then everything else on its own — never `git add -A` and never `git add -p` (interactive, hangs an agent)
- A default dependency-first ordering for the resulting series: config → schema → implementation → tests → docs
- Message vocabulary inferred from the repo's own `git log`, falling back to the full Conventional Commits type set only when the repo's history doesn't already show a narrower one in use
- A hard exclusion list — `.env`, credentials, `node_modules`, build output, screenshots, uncommented debug leftovers — disclosed in the report rather than silently dropped
- Honest handling of git hooks: a rejection stops the series and reports the hook's output; a formatter that rewrites files gets one retry, never `--no-verify`
- Commits untracked (new) files by default like any other change (`commit.includeUntracked: "always"`) — a repo that wants a confirmation step instead, or wants new files left out entirely, sets `"ask"` or `"never"` in config
- Optional per-repo configuration for allowed types/scopes, whether a scope is required, untracked-file handling, a per-run commit cap, and the language commit messages are written in (`commit.language`, English by default regardless of what language the conversation is in)

## What it doesn't do

This skill stops at the commit. It never pushes, amends, rebases, resets, or creates a branch — see [`skills/create-pr/`](../create-pr/) for opening or updating a PR once the commits exist. `create-pr`'s own workflow already hands off to this skill for the commit step (`references/workflow.md` → "Commit anything pending").

## Layout

```
SKILL.md                     # hub: preflight, grouping, message format, gotchas (agent entrypoint)
references/
  grouping.md                # the grouping ladder, default ordering, the exclusion list
  message-format.md          # the Conventional Commits spec, vocabulary inference, body/footer rules
  workflow.md                # end-to-end flow: preflight, group, commit, hook handling, report
  config.md                  # .eagerworks/commit.json schema and resolution order
assets/
  commit.example.json        # copyable starter config
```

The agent loads [`SKILL.md`](SKILL.md) up front and opens the matching [`references/`](references/) file on demand, so the entrypoint stays lean while the full knowledge base is always available.

## Example

Six uncommitted files:

```
src/auth/refresh.ts
src/auth/routes.ts
spec/auth/refresh_spec.ts
package.json
package-lock.json
.env
```

become three commits and one disclosed exclusion:

```
feat(auth): add token refresh endpoint      src/auth/refresh.ts, src/auth/routes.ts
test(auth): cover token refresh expiry      spec/auth/refresh_spec.ts
chore: bump dependency for token rotation   package.json, package-lock.json

Excluded: .env (credential material, never committed)
```

## Configuration

The skill works with zero configuration — it commits everything it safely can by default, infers the type/scope vocabulary from `git log`, and defaults to English commit messages. To pin a fixed type or scope list, require a scope, cap commits per run, have it ask before including new files (`commit.includeUntracked: "ask"`), or change the language messages are written in (`commit.language`), add `.eagerworks/commit.json`. See [`references/config.md`](references/config.md) for the full schema and [`assets/commit.example.json`](assets/commit.example.json) for a starter.

## Install

See the [collection README](../../README.md#install). In short:

```bash
npx skills add eagerworks/skills --skill commit
```
