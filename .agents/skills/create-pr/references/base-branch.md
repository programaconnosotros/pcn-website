# Create PR — Resolving the Base Branch

Never guess the base branch. Work down this ladder and stop at the first rung that gives an unambiguous answer.

## The ladder

**0. The user named it.** `open a PR against staging`, `--base develop` — nothing below runs.

**1. An already-open PR for this branch.** If one exists, this is an edit, not a create, and its actual base outranks everything below — the config file is a stale-able declaration, not a fact about this specific branch.

```bash
gh pr view --json number,baseRefName,headRefName
```

**2. `.eagerworks/create-pr.json` → `baseBranch`.** Only consulted when rung 1 found no open PR. See `references/config.md`.

**3. `git config branch.<current>.gh-merge-base`.** This is `gh pr create`'s own native per-branch base setting — if a maintainer already ran `git config branch.<name>.gh-merge-base <base>` for this branch, honor it before falling back to inference.

```bash
git config branch."$(git branch --show-current)".gh-merge-base
```

**4. The fork point of the branch.**

```bash
git reflog show <branch> | grep 'branch: Created from'
```

- The value after "Created from" is a branch name → that's the base, stop here.
- The value is a commit SHA, `HEAD`, or the reflog has nothing → widen the search:

```bash
git branch -a --contains <sha>
```

Drop the branch under review itself and its own remote-tracking ref (see Anti-patterns below) from the results. **Exactly one** remaining candidate → use it, stop here. Zero or more than one → go to rung 5.

**5. Ask.** Use `AskUserQuestion` and list the actual candidates found — survivors from rung 4, branches held by sibling worktrees (`git worktree list`), and the repo's default branch (`gh repo view --json defaultBranchRef`) as one labelled option among the others, never pre-selected or applied without confirmation. Do not push or open the PR until the user answers.

## The repo's default branch is not the base by default

`gh repo view --json defaultBranchRef` answers "what branch does `git clone` check out," not "what do PRs merge into." Plenty of repos ship from a branch other than their default — `main` may not even exist. Treat the default branch as one candidate at rung 5, never as a shortcut that skips the ladder.

## Anti-patterns

Each of these produces a wrong or ambiguous answer — don't reach for them as shortcuts:

- **`git rev-parse --abbrev-ref @{u}`** returns the branch's own upstream remote-tracking ref (e.g. `origin/feature-x`), not its base. It answers "where does this branch push to," a different question entirely.
- **`git symbolic-ref refs/remotes/origin/HEAD`** frequently fails with `fatal: ref refs/remotes/origin/HEAD is not a symbolic ref` on an ordinary clone — don't treat its absence as "no default branch exists"; fall through to `gh repo view --json defaultBranchRef` instead, and only as a rung-5 option, never silently.
- **`git branch -a --contains <sha>` returning several branches** is ambiguity, not an answer. Resolving that list to a single guess (e.g. "pick the shortest name" or "pick `main` if present") reintroduces exactly the silent-default failure mode this ladder exists to remove — route it to rung 5 instead.
- **Assuming `main` (or any specific name) is the base** without evidence. Confirm it via one of rungs 1–4, or ask.

## Worktree notes

`git reflog` is per-branch, so running it from inside a worktree checked out on `<branch>` reads that branch's own reflog correctly — no special-casing needed. `git worktree list` is still useful at rung 5: it surfaces branches actively checked out elsewhere in this checkout, which are plausible candidates a plain `git branch -a` line doesn't distinguish from stale ones.
