# Create PR — End-to-End Workflow

## Standard flow (no PR open yet)

1. **Preflight** (see `SKILL.md`): confirm you're not on the base branch, check `git status`, check `gh pr view` for an existing PR, check `gh --version` for the `--attach` gate.
2. **Resolve the base branch** — `references/base-branch.md`.
3. **Read repo conventions**: `AGENTS.md`/`CLAUDE.md` at the repo root, and `.eagerworks/create-pr.json` if present (`references/config.md`). A repo's own PR-authoring conventions (title style, required sections, a `commit` skill's message rules) take precedence over this skill's defaults.
4. **Gather the real diff context** instead of guessing what changed:
   ```bash
   git status
   git diff --stat origin/<base>...HEAD
   git log origin/<base>..HEAD --oneline
   ```
5. **Commit anything pending.** If the repo has its own `commit` skill or documented commit-message convention, follow it; otherwise use Conventional Commits.
6. **Push**: `git push -u origin <branch>`.
7. **Get screenshots if the change is UI-visible** — `references/screenshots.md`.
8. **Write the description** to a temp file per `references/description.md`, then create:
   ```bash
   gh pr create --base <base> --title "<type>(<scope>): <description>" \
     --body-file <file> \
     --assignee @me \
     --label <label1>,<label2> \
     --attach './screenshots/foo.png#Alt text'   # repeat per screenshot, omit if none
   ```
9. **Fix up anything that wasn't set at creation time**, or that only became clear afterward:
   ```bash
   gh pr edit <number> --add-assignee @me --add-label <label>
   ```

## When a PR already exists

Rung 1 of the base-branch ladder already told you this. Don't call `gh pr create` again — update in place:

```bash
gh pr edit <number> --title "..." --body-file <file>
gh pr edit <number> --attach './screenshots/foo.png#Alt text'
```

If the user only asked to fix the title or description, touch only that — don't force-push new commits or re-run the whole checklist unless asked.

## When `gh` is missing or unauthenticated

```bash
gh auth status
```

If `gh` isn't installed or isn't authenticated, don't fail the task: write the resolved title, body, and checklist, print them in full, and tell the user how to open the PR themselves (or ask them to run `gh auth login` and offer to run the `gh pr create` command once they have). The branch can still be pushed with plain `git push` in the meantime if that part was requested.

## Reviewing an existing PR before editing it

If the user is asking to fix up a PR someone already opened (not necessarily the current branch's own), pull its real state before touching anything:

```bash
gh pr view <N> --json number,title,body,baseRefName,headRefName,labels,assignees
```

Diff the resolved changes against that state rather than starting from a blank template — don't overwrite a description section the user didn't ask you to touch.
