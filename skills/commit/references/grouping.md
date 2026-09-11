# Commit — Grouping

The hard part of this skill isn't writing a Conventional Commit message — it's deciding where the boundaries between commits go. Get the grouping wrong and every message downstream is a lie about what actually changed.

## The unit is the file

`git add -p` is interactive: it opens a hunk-by-hunk prompt that blocks on stdin, which an agent can't drive. So the smallest unit this skill ever stages is one whole file. A file that contains two unrelated changes stays in a single commit — don't attempt to split it by hunk, and say in the report that the file mixed concerns.

## Grouping ladder

Work down this ladder; each rung only applies to what the rung above it didn't already claim.

0. **An untracked file follows `commit.includeUntracked` before anything else applies.** Default is `always` — a new file is committed like any other change, no confirmation needed, so the skill actually commits everything modified or new by default. A repo that wants a confirmation step instead sets `includeUntracked: "ask"`; `"never"` leaves new files out of every commit entirely. The hard exclusion list below applies regardless of this setting — an untracked `.env` is still never staged. See `references/config.md`.
1. **A non-empty index is already a decision.** If `git diff --staged` shows anything, that exact set is commit #1, unmodified — the user (or an earlier step) already curated it. Don't add or remove files from it before committing it.
2. **An explicit instruction in the request.** "Commit just the auth stuff" or "put the migration in its own commit" wins over any inference below.
3. **Change intent — implementation files.** Files that implement one behavior change belong together.
4. **Change intent — its test.** A test for that behavior change is a separate commit from rung 3 **by default**. Only bundle a test into the implementation commit when `git log --name-only -20` shows recent `feat`/`fix` commits actually listing their test file alongside the source file — `git log --oneline` alone never shows this, since it omits the file list. When the signal is unclear or absent (a short history, a squash-merge workflow, no prior feature+test pattern to observe), default to keeping the test in its own commit; a wrong guess to bundle is harder to undo than an extra commit.
5. **Mechanical companions.** A lockfile rides with its manifest (`package-lock.json` with `package.json`, `Gemfile.lock` with `Gemfile`); a migration rides with its schema dump (`db/schema.rb`, `structure.sql`); a generated file rides with its source.
6. **Everything left over that shares no intent with anything else** becomes its own commit rather than being folded into an unrelated one.

## Default ordering of the series

Order commits so each one is plausibly buildable on its own, dependency-first:

1. Dependencies / config (`chore`)
2. Schema / migrations
3. Implementation (`feat` / `fix`)
4. Tests (unless rung 4 above found clear evidence this repo commits them with the implementation)
5. Docs

## When to ask instead of guess

Ask once, listing the real candidate groupings, when:

- A file plausibly belongs to two different groups and the diff doesn't make the intent legible.
- The working tree contains changes that don't obviously relate to each other at all, and splitting by rung 3 would be a guess rather than a read.

Ask once for the whole series, not once per file — a barrage of per-file questions defeats the purpose of automating this.

## Never staged, in any group

Exclude these from every commit and say so explicitly in the report — a skip is never silent:

- `.env`, `.env.*`, and any other credential or key material
- `node_modules/`, `vendor/`, build output (`dist/`, `build/`, `.next/`, etc.)
- Large binaries and screenshots (see `skills/create-pr/SKILL.md` gotcha #6 — a screenshot belongs in a PR attachment, never committed to the repo)
- Obvious debug leftovers left uncommented (`console.log`, `binding.pry`, `debugger`, a `TODO(me)` marker) — flag these rather than silently dropping the whole file; only exclude the file if removing the leftover isn't the agent's call to make unasked

```text
✅ correct: git add src/auth/refresh.ts src/auth/routes.ts → commit → git add spec/auth/refresh_spec.ts → commit
❌ wrong:   git add -A → one commit titled "feat: various changes"
❌ wrong:   git add -p to split one file's hunks (interactive — hangs)
❌ wrong:   grouping by directory when two directories implement one change
❌ wrong:   staging a .env file because it was sitting in the working tree
```
