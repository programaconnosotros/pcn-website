# create-pr

A portable agent skill for opening (or updating) a pull request: resolving the base branch from evidence, writing a description with a real structure and no hand-wrapped paragraphs, deriving a verification checklist from the tooling the repo actually has, spelling out tickable manual test cases for whoever reviews the PR's quality, and attaching screenshots via the GitHub CLI when the change is visible in the UI. Works with Claude Code, Cursor, GitHub Copilot, Codex, Amp, and any agentic coding tool that can read markdown files.

## What it covers

- Preflight checks — not standing on the base branch, an already-open PR for this branch (edit, don't duplicate), the installed `gh` version
- Base-branch resolution from evidence — an open PR's actual base, then config, then `git config branch.<name>.gh-merge-base`, then the branch's fork point — asking the user rather than assuming the repo's default branch, since plenty of repos merge into something other than `main`
- A description structure (`Summary` / `Problem` / `Solution` / `Screenshots` / `Test plan` / `Checklist`) that asks before replacing a repo's own `.github/pull_request_template.md`, never silently picking either side
- The no-hardcoded-line-wrap rule, with a self-check for catching hand-wrapped paragraphs before they ship
- A checklist derived from verification tooling actually detected in the repo (`package.json` scripts, `Rakefile`, `Makefile`, `bin/` scripts) — no fixed core, so a repo with no E2E suite doesn't get an E2E line, and items are filled in with the real observed result, never "ran the tests"
- `Test plan` split into `Automated` (commands and observed results) and `Manual` — tickable, self-contained scenarios (setup, steps, expected result) for whoever reviews the PR's quality, on by default with no scenario cap (writes as many real scenarios as the diff supports; `pr.manualTestCases.maxScenarios` opts into a cap), never padded or fabricated when the diff has nothing observable to test
- Screenshots and video, attached with the GitHub CLI's `--attach` flag (`gh` ≥ 2.99.0) — the first officially supported way to get an image into a PR body via automation, with an image-search ladder (user-given path → e2e artifact on disk → live capture with confirmation → ask) and an explicit placeholder instead of a fabricated URL when none is available
- Title format (Conventional Commits by default, `pr.titleFormat: "free"` to opt out), self-assignment, and label selection restricted to what `gh label list` actually has
- Optional per-repo configuration for the base branch, title format, labels, checklist, description sections, manual test cases, screenshot detection, and the language the PR is written in (`pr.language`, English by default regardless of what language the conversation is in)

## Layout

```
SKILL.md                        # hub: preflight, base branch, description, screenshots, gotchas (agent entrypoint)
references/
  workflow.md                   # end-to-end flow: preflight, commit, push, create, fix up, edit an existing PR
  base-branch.md                # base-branch resolution ladder for opening a PR
  description.md                # section structure, PR-template handling, line-wrap rule, checklist derivation
  screenshots.md                # image-search ladder, gh --attach, the version gate, what not to do
  manual-test-cases.md          # Test plan -> Manual: applicability, scenario/step shape, the fabrication ban
  config.md                     # .eagerworks/create-pr.json schema and resolution order
assets/
  create-pr.example.json        # copyable starter config (Rails + Node examples)
  pr-description.template.md    # copyable description skeleton
```

The agent loads [`SKILL.md`](SKILL.md) up front and opens the matching [`references/`](references/) file on demand, so the entrypoint stays lean while the full knowledge base is always available.

## Screenshots without a workaround

GitHub's API has never accepted a direct image upload for a PR body, which used to mean either a manual step or an unsupported endpoint. GitHub CLI `2.99.0` (2026-09-01) added an official `--attach` flag to `gh pr create`, `gh pr edit`, and `gh pr comment` (and the `gh issue` equivalents) that uploads a local image or video and rewrites its reference in the body in place. This skill uses that flag as the only supported path — see [`references/screenshots.md`](references/screenshots.md) for the version gate, the exact commands, and why the undocumented `uploads.github.com` endpoint and the GitHub MCP server (which has no attachment support — [github/github-mcp-server#738](https://github.com/github/github-mcp-server/issues/738)) aren't used instead.

## Configuration

The skill works with zero configuration — it resolves the base branch from evidence, derives the checklist from detected tooling, and infers whether a change is UI-visible from the repo's shape. To set a default base branch, force a fixed checklist or description structure, turn off the screenshot requirement for a UI-less repo, disable or cap manual test cases (`pr.manualTestCases`), or change the language the PR is written in (`pr.language`), add `.eagerworks/create-pr.json`. See [`references/config.md`](references/config.md) for the full schema and [`assets/create-pr.example.json`](assets/create-pr.example.json) for a starter.

## Install

See the [collection README](../../README.md#install). In short:

```bash
npx skills add eagerworks/skills --skill create-pr
```
