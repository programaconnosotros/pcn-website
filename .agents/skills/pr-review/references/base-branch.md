# PR Review — Resolving the Base Branch

Never guess the base branch. Work down this ladder and stop at the first rung that gives an unambiguous answer. See `docs/decision-records/2026-08-21--base-branch-resolution.md` for why it's ordered this way.

## The ladder

**0. The user named it.** An explicit branch, `review PR #<N>`, `--staged`, or working-tree changes — nothing below runs.

**1. The open PR for the branch under review.** This outranks `.eagerworks/pr-review.json` — the PR's base is where the code actually merges; the config file is a stale-able declaration, not a fact about this specific review.

```bash
gh pr view --json number,baseRefName,headRefName        # for the current branch
gh pr view <N> --json number,baseRefName,headRefName     # when the user gave a PR number
```

`baseRefName` is the base. If this succeeds, stop here.

**2. `.eagerworks/pr-review.json` → `baseBranch`.** Only consulted when rung 1 found no open PR. See `references/config.md`.

**3. The fork point of the branch or worktree.**

```bash
git reflog show <branch> | grep 'branch: Created from'
```

- The value after "Created from" is a branch name → that's the base, stop here.
- The value is a commit SHA, `HEAD`, or the reflog has nothing → widen the search:

```bash
git branch -a --contains <sha>
```

Drop the branch under review itself and its own remote-tracking ref (see Anti-patterns below) from the results. **Exactly one** remaining candidate → use it, stop here. Zero or more than one → go to rung 4.

**4. Ask.** Use `AskUserQuestion` and list the actual candidates found — survivors from rung 3, branches held by sibling worktrees (`git worktree list`), and the repo's default branch (`gh repo view --json defaultBranchRef`) as one labelled option among the others, never pre-selected or applied without confirmation. Do not proceed with the review until the user answers.

Once a base is resolved, the diff range is unchanged from Scope Detection in `SKILL.md`: `git diff origin/<base>...HEAD`, three dots.

## Worktree notes

`git reflog` is per-branch, so running it from inside a worktree checked out on `<branch>` reads that branch's own reflog correctly — no special-casing needed. `git worktree list` is still useful at rung 4: it surfaces branches that are actively checked out elsewhere in this checkout, which are plausible candidates a plain `git branch -a` line doesn't distinguish from stale ones.

## Anti-patterns

Each of these has produced a wrong or broken answer when tried against this repo — don't reach for them as shortcuts:

- **`git rev-parse --abbrev-ref @{u}`** returns the branch's own upstream remote-tracking ref (e.g. `origin/worktree-code-review-skill`), not its base. It answers "where does this branch push to," a different question entirely.
- **`git symbolic-ref refs/remotes/origin/HEAD`** frequently fails with `fatal: ref refs/remotes/origin/HEAD is not a symbolic ref` on an ordinary clone — don't treat its absence as "no default branch exists"; fall through to `gh repo view --json defaultBranchRef` instead, and only as the rung-4 fallback option, never silently.
- **`git branch -a --contains <sha>` returning several branches** is ambiguity, not an answer. In this repo alone it returned 7 candidates for one fork-point SHA. Resolving that list to a single guess (e.g. "pick the shortest name" or "pick `main` if present") reintroduces exactly the silent-default failure mode this ladder exists to remove — route it to rung 4 instead.
- **`HEAD~1..HEAD`** instead of the three-dot range against the resolved base — the pre-existing mistake documented in `SKILL.md`'s Scope Detection section. It silently reviews only the last commit.

## Subagent caveat

`assets/code-reviewer.agent.md` runs with `tools: Read, Grep, Glob, Bash` and no way to prompt the user. When it reaches rung 4, it must stop and report the candidates it found as part of its output, rather than picking one — see the subagent's own Non-negotiables section.
