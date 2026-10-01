---
name: commit
description: >-
  Commits everything modified or new in the working tree by default, grouped into a series of
  coherent Conventional Commits — one commit per logical change, staged by path, with the
  type/scope vocabulary inferred from the repo's own git history — instead of sweeping
  everything into a single commit. Configurable per repo to ask before including new files.
  Use when asked to "commit this", "commit my changes", "commit everything", "make a commit",
  "split this into commits", or to write a commit message for work already staged.
metadata:
  author: eagerworks
  version: '1.0.0'
---

# Commit Skill

Turns whatever is uncommitted into a small series of well-formed [Conventional Commits](https://www.conventionalcommits.org/) — one commit per logical change, not one commit for the whole working tree. By default it commits **everything** modified or new that it safely can, including untracked files; a repo that wants it to stop and confirm instead sets `commit.includeUntracked` in `.eagerworks/commit.json` (`references/config.md`). It reads the repo's own git history to learn its real type/scope vocabulary rather than assuming the full spec is in use, and it never guesses at a genuine judgment call: an ambiguous file gets one question, not a silent decision.

**Mutation posture.** Committing is the point of this skill, so `git add` and `git commit` don't need a separate confirmation once the user has asked for a commit — but the mandate stops there. It never pushes, amends, rebases, resets, or creates a branch; that's `create-pr`'s job once the commits exist (see `docs/decision-records/2026-09-07--create-pr-write-posture.md` for the precedent this inherits).

## Preflight — Do This First

```bash
git status --porcelain=v1 --branch                          # what's changed; also reveals a rebase/merge in progress
git diff                                                     # unstaged content — the input to grouping
git diff --staged                                            # a non-empty index is a deliberate signal, not noise
git log --oneline -20                                        # the repo's real type/scope vocabulary
git log --name-only -20                                      # whether recent feat/fix commits bundle their test file — --oneline above never shows this
ls .eagerworks/commit.json AGENTS.md CLAUDE.md 2>/dev/null   # stated conventions override defaults
```

If `git status` shows a rebase, merge, or cherry-pick in progress, stop and say so — this skill doesn't touch that state.

## Grouping

The unit is the **file** — `git add -p` is interactive and will hang an agent, so a file with two unrelated changes stays together in one commit rather than being split by hunk. Groups are formed by change intent, not by directory: two files in different folders that implement one behavior belong in the same commit, and two unrelated changes in the same folder don't. An already-staged index is never touched — it's committed first, as-is. A new test defaults to its **own** commit, separate from the implementation it covers, unless recent history clearly shows this repo bundling them. Full ladder, default ordering, and what never gets staged at all: `references/grouping.md`.

## Message Format

`<type>(<scope>): <description>` — imperative mood, no trailing period, subject capped at 72 characters. Derive the type and scope vocabulary from `git log` before falling back to the Conventional Commits default set: a repo that only ever uses `feat`/`fix`/`docs`/`chore` shouldn't start receiving a `style:` commit. Full spec, scope rules, and body/footer conventions: `references/message-format.md`.

## Reference Files (read these on demand)

| Task                                                                       | Read                           |
| -------------------------------------------------------------------------- | ------------------------------ |
| The grouping ladder, default commit ordering, what never gets staged       | `references/grouping.md`       |
| The Conventional Commits spec, vocabulary inference, body and footer rules | `references/message-format.md` |
| End-to-end flow: preflight, group, commit, handle hook outcomes, report    | `references/workflow.md`       |
| The optional `.eagerworks/commit.json` config schema                       | `references/config.md`         |

Copyable templates live in `assets/`:

- `assets/commit.example.json` — starter config, with a Rails and a Node example

## Critical Gotchas

1. **Never `git add -A` or `git add .`.** Stage explicit paths, one group at a time, so each commit is exactly what its message says it is.
2. **Never `--no-verify`.** A hook that rejects the commit stops the run — report the hook's output verbatim rather than bypassing it.
3. **A hook that rewrites files (formatter, linter `--fix`) is not a failure** — re-stage the paths it touched and retry that one commit once, then stop if it still fails.
4. **Never push, amend, rebase, `reset --hard`, or create a branch.** Committing is the whole mandate; see `create-pr` for everything after.
5. **Never `git add -p`.** It's interactive and will hang the agent — see "Grouping" above.
6. **Report a partially-failed series honestly.** Name the commits that landed and what's still uncommitted; never claim the whole series succeeded when it didn't.
7. **Never commit `.env`, credentials, `node_modules`, build output, or screenshots.** Exclude them from every group and say why — a skip is never silent.
8. **Nothing to commit means saying so.** Never manufacture a change just to have something to commit.
9. **Commit message language is configured, not inferred.** Write in `commit.language` (default English) regardless of what language the conversation is in — see `references/config.md`.
10. **Pass the message with a HEREDOC (`git commit -F -`).** Never `-m "...\n..."` with escaped newlines — it mangles the body and footers.
