# Create PR — Writing the Description

## PR template resolution — ask, never assume

Check for a repo-owned template before writing anything:

```bash
ls .github/pull_request_template.md .github/PULL_REQUEST_TEMPLATE/*.md 2>/dev/null
```

- **No template found** → use this skill's structure below, no question asked.
- **A template exists** → ask the user with `AskUserQuestion`: keep the repo's template as-is, or replace it with this skill's structure for this PR. Neither option is a safe silent default — a repo's template may encode review requirements (compliance sign-off, a specific reviewer checklist) that this skill has no way to know are load-bearing, and a stale or thin template may be exactly what the user wants replaced. Once answered, don't re-ask on every subsequent run in the same repo if `.eagerworks/create-pr.json` sets `pr.sections` explicitly — that config is the recorded answer.

## Default structure

In this exact order:

| Section                      | Contents                                                                                                                                                                                                                                                                                             |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `## Summary`                 | **Always first.** 1–3 sentences: what the PR does and why it matters.                                                                                                                                                                                                                                |
| `## Problem`                 | What was broken or missing, with concrete evidence — file paths, error messages, measured numbers.                                                                                                                                                                                                   |
| `## Solution`                | How it was solved and why that approach — key decisions and trade-offs, not a line-by-line retelling of the diff.                                                                                                                                                                                    |
| `## Screenshots` / `## Demo` | **Required when the change is visible in the UI.** Never invent an image or video URL — if none exists yet, see `references/screenshots.md` and leave an explicit placeholder rather than omitting the section.                                                                                      |
| `## Test plan`               | Two subsections. `### Automated` — reproducible steps with the exact commands **and the observed result** (e.g. `88/88 passed`, `338 passing`), not "ran the tests". `### Manual` — tickable, self-contained scenarios for whoever reviews the PR's quality — see `references/manual-test-cases.md`. |
| `## Checklist`               | Derived per-repo — see "Deriving the checklist" below — with boxes reflecting what was actually done.                                                                                                                                                                                                |

`pr.sections` in `.eagerworks/create-pr.json` overrides this list entirely when set.

## No hardcoded line wrapping

This is the rule most commonly broken.

- Each paragraph is **one single line** in the source. GitHub wraps it for display; never break a paragraph at 80/100 columns yourself.
- The only legitimate newlines are structural: headings, list items, table rows, code fences, and the blank line that separates blocks.
- Always pass the body with `--body-file`. **Never** use `--body "..."` with escaped `\n` sequences.
- Quick self-check before creating the PR: if two consecutive non-empty lines are both prose and neither one starts with `-`, `#`, `|`, ` ``` `, or `- [`, that is a hardcoded wrap — join them into one line.

```markdown
❌ wrong — hand-wrapped at ~80 columns
This change adds retry logic to the webhook delivery worker so a transient
5xx from the receiving endpoint no longer drops the event permanently.

✅ correct — one line, GitHub wraps it for display
This change adds retry logic to the webhook delivery worker so a transient 5xx from the receiving endpoint no longer drops the event permanently.
```

## Deriving the checklist

There is no fixed core — a repo with no end-to-end suite shouldn't get an E2E line, and a library with no UI shouldn't get a screenshots line. Emit an item only for what the repo actually has:

1. **Detect verification commands** from the repo itself — `package.json` scripts (`test`, `lint`, `typecheck`, `build`), a `Rakefile`, a `Makefile`, `bin/` scripts, a `justfile`. For each one found, add a checklist line naming the exact command, then run it (or ask before running it if it looks slow/destructive) and fill in **the observed result** — `88/88 passed`, `0 errors`, not "ran the tests."
2. **Tests added or updated** — one line, ticked only if the diff actually touches a test file.
3. **Documentation** — one line, only if the repo has a `docs/` tree, a `README`, or an ADR directory that this change plausibly touches.
4. **Screenshots or video attached** — only if the diff touches a UI path (see `references/screenshots.md` for what counts and how "UI path" is configured via `pr.screenshots.uiPaths`).
5. **No secrets or live keys in the diff** — always included; check the actual diff, don't assume.

`pr.checklist` in `.eagerworks/create-pr.json` overrides this derivation entirely when set; `pr.checklist: []` means no `## Checklist` section at all — don't ship an empty heading.

Items that don't apply to a given PR keep the item's own wording and append `— N/A, <reason>` (e.g. `- [x] Screenshots or video attached when the change is visible in the UI — N/A, not a UI change`), never silently deleted and never replaced outright with a bare `N/A — <reason>` that drops which checklist item it was answering. Never tick a box for something that wasn't actually run or added.

## Title

`<type>(<scope>): <description>` — Conventional Commits types, imperative mood, no trailing period, by default (`pr.titleFormat: "conventional"`). Match the style of recently merged PRs:

```bash
gh pr list --state merged --limit 20 --json title
```

Set `pr.titleFormat: "free"` in `.eagerworks/create-pr.json` to skip the Conventional Commits shape for a repo that doesn't use it.

## Assignee and labels

- **Self-assign by default** (`pr.assignSelf: true`): `--assignee @me`.
- **Apply labels that match the change**, picked from `gh label list` — never invent one that isn't listed. `pr.labels` controls this: `"auto"` (default, pick matching labels), `"off"` (skip labeling entirely), or an explicit array to always apply. Skip a label rather than force a weak match.

## Don'ts

- Don't wrap paragraphs by hand.
- Don't assume the repo's default branch is the base — see `references/base-branch.md`.
- Don't open the PR while standing on the base branch.
- Don't tick a checklist item that wasn't actually run.
- Don't collapse an N/A item down to a bare `N/A — <reason>` — keep the original item text so a reader can tell which check it's answering.
- Don't paste the whole diff into the description — summarize what matters.
- Don't leave a PR unassigned when `pr.assignSelf` is true, and don't invent labels that aren't in `gh label list`.
- Don't ship a manual test scenario the diff doesn't support, and don't tick a manual test box — `references/manual-test-cases.md`'s boxes always ship unticked.
