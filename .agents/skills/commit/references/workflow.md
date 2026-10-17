# Commit — End-to-End Workflow

## Standard flow

1. **Preflight.** Run the block in `SKILL.md`. If `git status` shows a rebase, merge, or cherry-pick in progress, stop and explain — this skill doesn't touch that state.
2. **Read conventions.** `.eagerworks/commit.json` (`references/config.md`), then `AGENTS.md`/`CLAUDE.md` for a stated commit convention, then `git log` to infer the real type/scope vocabulary when nothing is stated.
3. **Group the changes** per `references/grouping.md`. Print the proposed series — each commit's file list and subject line — before creating anything, so the user can redirect before any `git add` runs.
4. **Commit each group in order:**

   ```bash
   git add <explicit paths for this group>
   git commit -F - <<'EOF'
   <type>(<scope>): <description>

   <body, if any>
   EOF
   ```

5. **Handle hook outcomes** as they happen — see below.
6. **Verify and report:**
   ```bash
   git status
   git log --oneline -<n>
   ```
   State exactly which commits landed (short SHA + subject) and what, if anything, remains uncommitted and why.

## When the index is already staged

Commit the staged set first, exactly as-is — don't add or remove files from it. Then group whatever remains unstaged as its own series.

## When a hook rejects a commit mid-series

Stop the series at that commit. Report the hook's output verbatim. Don't use `--no-verify` and don't skip ahead to the next group — a failed commit usually means the working tree isn't in the state the later groups assume.

If the hook instead **rewrote** files (a formatter or `--fix` lint step) rather than rejecting the commit outright, re-stage the paths it touched and retry that one commit once. If it fails again, stop and report — don't loop.

## When there's nothing to commit

Say so plainly. Don't invent a change, and don't commit an empty tree just to produce output.

## When the user asks for a single commit

Honor it. The multi-commit series is this skill's default behavior, not a mandate — "just commit everything as one" or "one commit for all of this" overrides the grouping ladder entirely.

## Where this skill stops

This skill never runs `git push`, `git commit --amend`, `git rebase`, `git reset --hard`, or branch creation. Once the commits exist, pushing and opening a PR is `create-pr`'s job — see `skills/create-pr/SKILL.md`.
