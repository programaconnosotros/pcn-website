---
name: create-pr
description: >-
  Opens (or updates) a pull request with a conventional title, an evidence-backed description, and a real verification checklist — resolving the base branch from evidence, attaching screenshots via the GitHub CLI when the change is visible in the UI, and asking rather than guessing at every genuine judgment call. Use when asked to "open a PR", "create a pull request", "push this and make a PR", "ship this branch", or to fix up an existing PR's title, description, or checklist.
metadata:
  author: eagerworks
  version: '1.0.0'
---

# Create Pull Request Skill

Opens a pull request for the current branch, or updates one that's already open. Unlike a read-only review skill, this one **mutates**: it can commit pending work, push the branch, and create or edit a PR on GitHub. It still never guesses on a genuine judgment call — base branch, an existing repo PR template, and an unavailable screenshot are all resolved by evidence or by asking, never assumed.

**Mutation posture.** Committing, pushing, and creating/editing the PR are the point of this skill, so they don't need a separate confirmation once the user has asked for a PR — but stop and confirm before pushing or opening anything if the request was ambiguous about whether to actually ship (e.g. "help me write a PR description" is not "open the PR").

## Preflight — Do This First

```bash
git branch --show-current                          # never open a PR while standing on the base branch
git status                                          # anything pending that needs a commit first?
gh pr view --json number,url,baseRefName 2>/dev/null # a PR may already exist for this branch — edit, don't duplicate
gh --version                                        # gates screenshot attachment: needs >= 2.99.0, see references/screenshots.md
```

If `gh pr view` succeeds, this is an **edit**, not a create — see `references/workflow.md` → "When a PR already exists".

## Base Branch

Never guess. In order: (1) an already-open PR's actual base; (2) `.eagerworks/create-pr.json` → `baseBranch`; (3) `git config branch.<current>.gh-merge-base`; (4) the branch's fork point via `git reflog`, only if it resolves to exactly one candidate; (5) ask, listing real candidates. **The repo's default branch is not the base by default** — plenty of repos merge into `staging` or `develop`, not `main`. Full ladder and anti-patterns: `references/base-branch.md`.

## Description

Default structure, in order: `Summary` → `Problem` → `Solution` → `Screenshots`/`Demo` (required when the change is UI-visible) → `Test plan` → `Checklist`. `Test plan` splits into `### Automated` (commands and observed results) and `### Manual` (tickable, self-contained scenarios for whoever reviews the PR's quality — `references/manual-test-cases.md`). If the repo has its own `.github/pull_request_template.md`, **ask** whether to use it as-is or replace it with this structure — never decide silently either way. Every paragraph is one line in the source (GitHub wraps it for display); never hand-wrap at 80/100 columns. The checklist has no fixed core — it's derived from tooling actually detected in the repo, or from `.eagerworks/create-pr.json`. Full detail: `references/description.md`.

## Screenshots

Required when the diff touches a UI path and none is available yet. Look for one in this order: a path the user gave, an e2e artifact already on disk, a live capture (only with confirmation), then ask and leave an explicit placeholder. Attach with the GitHub CLI's `--attach` flag (`gh` ≥ 2.99.0) — reference the file in the body so the URL lands in place. Never fabricate an image URL and never use an undocumented upload endpoint. Full detail, version gate, and the exact commands: `references/screenshots.md`.

## Reference Files (read these on demand)

| Task                                                                                             | Read                              |
| ------------------------------------------------------------------------------------------------ | --------------------------------- |
| End-to-end flow: preflight, commit, push, create, fix up assignee/labels, editing an existing PR | `references/workflow.md`          |
| Resolving which branch to open the PR against                                                    | `references/base-branch.md`       |
| Description structure, PR-template handling, the no-hand-wrap rule, deriving the checklist       | `references/description.md`       |
| Getting and attaching screenshots, the `gh` version gate, the placeholder rule                   | `references/screenshots.md`       |
| Deriving manual test cases, scenario and step shape, the applicability rule                      | `references/manual-test-cases.md` |
| The optional `.eagerworks/create-pr.json` config schema                                          | `references/config.md`            |

Copyable templates live in `assets/`:

- `assets/create-pr.example.json` — starter config, with a Rails and a Node example
- `assets/pr-description.template.md` — copyable description skeleton, including a commented manual-scenario skeleton

## Critical Gotchas

1. **This skill mutates, unlike a read-only review skill** — but only in service of the PR the user actually asked for. If it's unclear whether they want it opened now or just drafted, ask before pushing or calling `gh pr create`.
2. **Never open a PR while standing on the base branch.** Check `git branch --show-current` first.
3. **Never guess the base branch.** If the open PR, the config, `gh-merge-base`, and the fork point don't converge on one branch, ask — see `references/base-branch.md`.
4. **Never hand-wrap paragraphs.** Always pass the body with `--body-file`; never `--body "...\n..."` with escaped newlines.
5. **Never tick a checklist box for something that wasn't actually run or added.** An inapplicable item keeps its own wording and appends `— N/A, <reason>`; it's never silently deleted or replaced with a bare `N/A — <reason>`.
6. **Never invent an image or video URL, and never commit a screenshot into the repo just to reference it.** No screenshot available yet means an explicit placeholder and a question to the user, not a guessed link or a binary added to git history — see `references/screenshots.md`.
7. **A PR already open for this branch gets edited, never duplicated.** `gh pr edit`, not a second `gh pr create`.
8. **Never invent labels.** Pick only from `gh label list`; an empty label set beats a wrong one.
9. **Don't paste the whole diff into the description.** Summarize what matters; `git diff --stat` and `git log --oneline` are for your own context, not the PR body.
10. **PR title and description language is configured, not inferred.** Write in `pr.language` (default English) regardless of what language the conversation is in, unless the user explicitly names a language for this one PR — see `references/config.md`.
11. **Never fabricate a manual test step, a credential, or a scenario the diff doesn't support.** An unknown (a staging URL, a test account) becomes a `TODO(author):` line, not a guess; manual test boxes always ship unticked — see `references/manual-test-cases.md`.
