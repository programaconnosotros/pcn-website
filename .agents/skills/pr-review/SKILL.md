---
name: pr-review
description: >-
  Reviews a branch, PR, staged, or working-tree diff for correctness, security, repo-convention, test-coverage, and documentation gaps, returning severity-rated findings without editing code. Use when asked to "review my branch/PR", "is this ready to merge", "check this diff before I push", "does this need an ADR", or to apply fixes for findings from a previous review round. When the target is a GitHub PR, the same report is also posted to the PR — as inline comments on each finding's line plus a summary, by default — so the whole team can read it.
metadata:
  author: eagerworks
  version: '1.0.0'
---

# PR Review Skill

Reviews a diff — a branch, a PR, staged changes, or working-tree changes — against five fixed lenses: correctness, security & data integrity, repo-convention conformance, test coverage, and documentation & decision capture. Returns structured, evidence-backed findings with severities. This is **not** a linter and does **not** replace CI: skip anything a linter or type checker already catches, and don't re-derive what a failing test already proves.

By default this is a **read-only** review: no file is edited, no commit is made, nothing is pushed. See `references/workflow.md` if the user explicitly wants findings fixed automatically.

When the review targets a GitHub PR (`review PR #N`, or the branch under review has an open PR), the report is printed to the console **and** posted to the PR so it stays with the PR and the whole team can read it — by default as a GitHub review with inline comments on each finding's line plus a summary body, or as a single plain comment when `.eagerworks/pr-review.json` sets `review.commentStyle: "summary"`. If `gh` isn't installed or authenticated, the report is still printed and the skill offers to post it once the user sets up the GitHub CLI. See `references/workflow.md` → "Posting to a PR". The report is written in English by default, regardless of what language the conversation is in — set `review.language` per repo to change it (`references/config.md`).

## Scope Detection — Do This First

Before reading a single line of the diff, resolve exactly what is being reviewed. In order of how requests are usually phrased:

```bash
# "review my branch" / "review this PR" — the normal case: full branch vs. its base
git diff origin/<base-branch>...HEAD      # note the THREE dots — diff since the branch forked

# "review what I'm about to commit"
git diff --staged

# "review my uncommitted changes"
git diff

# "review PR #<N>" on GitHub
gh pr diff <N>
gh pr view <N> --json body,title       # pull the description / acceptance criteria too
```

**Never guess the base branch.** If the user didn't name one, resolve it from evidence, in order: (1) the open PR for the branch under review — `gh pr view --json baseRefName` — which outranks the config file; (2) `.eagerworks/pr-review.json`'s `baseBranch` (see `references/config.md`); (3) the branch/worktree's fork point via `git reflog`, only if it resolves to exactly one candidate branch; (4) if none of those is conclusive, ask the user which branch to diff against rather than assuming one. Full procedure, commands, and anti-patterns: `references/base-branch.md`.

**The most common mistake is reviewing `HEAD~1..HEAD` instead of the full branch** — that only shows the last commit and silently skips everything the branch actually changed. Always use the three-dot range against the base, not the last commit.

## Read Before Reviewing

Read these before forming any opinion — lens 3 (repo-convention conformance) is a guess without them:

1. `AGENTS.md` / `CLAUDE.md` at the repo root — the project's own stated conventions.
2. `.eagerworks/pr-review.json`, if present — see `references/config.md` for its schema and how it layers with the two files above.
3. The full contents of every file the diff touches, not just the changed hunks — the diff alone hides the surrounding context (existing scoping patterns, error handling style, sibling tests) needed to judge lenses 1–3 correctly. On a very large diff, see `references/workflow.md` → "Reviewing a Large Diff" for how to triage instead of reading everything at equal depth. A repo can exclude generated/vendored paths from this read via `review.ignorePaths` (`references/config.md`) — any match must be disclosed in the report, never applied silently.
4. The repo's documentation surface — a `docs/` tree, an ADR directory, `README.md` — enough to know where a decision would be written down and whether this diff makes an existing page false. Lens 5 is a guess without it.

## The Five Lenses

| Lens                                | Checks                                                                                                                        |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| 1. Correctness                      | Logic errors, edge cases, off-by-ones, unhandled states, races, wrong error handling                                          |
| 2. Security & data integrity        | Auth/tenant scoping, injection, secrets, unsafe migrations                                                                    |
| 3. Repo-convention conformance      | Violates `AGENTS.md`/`CLAUDE.md` or an evident surrounding pattern                                                            |
| 4. Test coverage                    | Every acceptance criterion (or new behavior) has a test that actually asserts it                                              |
| 5. Documentation & decision capture | A non-obvious decision in this diff has no durable home in the repo, or the diff makes an existing doc assert something false |

Full detail, decision rules, and Rails + Node/TS examples for each lens: `references/rubric.md` — read it before writing the report, it is the authoritative checklist. Unlike the other four, lens 5 can produce a non-blocking _suggestion_ instead of a severity-rated finding — it never counts toward the verdict.

## Severity at a Glance

Three labels — `critical`, `high`, `minor` — plus "not a finding" for anything without a concrete failure scenario or violated convention behind it. The full ladder and what qualifies each finding for its label lives in `references/rubric.md` — don't re-derive it here.

## Reference Files (read these on demand)

| Task                                                                                            | Read                          |
| ----------------------------------------------------------------------------------------------- | ----------------------------- |
| The five lenses in full, with Rails + Node/TS examples, severity ladder, conservatism rule      | `references/rubric.md`        |
| Running a review end-to-end, reviewing against an issue, the optional fix loop, posting to a PR | `references/workflow.md`      |
| Resolving which branch to diff against, when the user didn't say                                | `references/base-branch.md`   |
| The markdown report format and the machine-parseable `### FINDINGS` block                       | `references/output-format.md` |
| The optional `.eagerworks/pr-review.json` config schema                                         | `references/config.md`        |

Copyable templates live in `assets/`:

- `assets/pr-review.example.json` — starter config, with a Rails and a Node example
- `assets/code-reviewer.agent.md` — optional Claude Code subagent wrapper around this skill

## Critical Gotchas

1. **Read-only, with exactly two exceptions.** Never edit, create, or delete a file, and never `git commit`, `git push`, or open a PR on your own initiative. `git`/`gh` are for inspection only, except for: the optional fix loop (only on an explicit user request), and posting the report to the PR under review — a `gh api` review with inline comments by default, or `gh pr comment` when `commentStyle: "summary"` (automatic when the scope is a GitHub PR; opt-out with "don't post" or `review.postToPr: false`). Both are documented in `references/workflow.md`. No other mutation, ever.

2. **A finding needs evidence — see `references/rubric.md` → Conservatism.** No concrete failure scenario or cited convention means it's not a finding, no matter how confident the preference.

3. **Code that follows a documented convention is never a finding**, even if a different style would generally be preferable.

4. **"Already handled" is not evidence.** If a comment, commit message, or the diff's author claims something is intentional or already covered, verify it against the actual files before accepting the claim.

5. **Always diff the full branch against its base**, not just the last commit — see Scope Detection above.

6. **Never assume a base branch that isn't backed by evidence.** If the open PR, the config, and the fork point don't converge on one branch, ask the user — see `references/base-branch.md`.

7. **If you can't tell whether something is a real bug without running code, say so in the finding** rather than guessing either way.

8. **Never pad the list to look thorough.** Zero findings is a valid, correct result.

9. **A documentation suggestion (Lens 5B) is never a merge blocker and never counted as a finding** — keep it in its own report section, out of the verdict. And never fabricate a rationale for a decision you can't source from the PR, issue, commits, or code — an unsourced "why" is written as `TODO(author):`, never guessed.

10. **Report language is configured, not inferred.** Write the report in `review.language` (default English) — never in whatever language the conversation happens to be in. The `### FINDINGS` / `### DOCUMENTATION` keys and severity values are never translated. See `references/config.md`.
