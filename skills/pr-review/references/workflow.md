# PR Review — Workflow

## Standard Review (Read-Only)

1. **Resolve the scope** — see `SKILL.md` → Scope Detection, and `references/base-branch.md` for how the base branch itself is resolved when the user didn't name one. Get the full diff since the branch forked from its base, not just the last commit.
2. **Read the repo's conventions, config, and documentation surface** — `AGENTS.md`/`CLAUDE.md`, `.eagerworks/pr-review.json` if present (`references/config.md`), and enough of the repo's `docs/` tree (an ADR directory, other pages) to know where a decision would be written down and whether this diff makes an existing page false. Lens 5 (`references/rubric.md`) is a guess without it.
3. **Read every touched file in full**, not just the changed hunks — the diff alone hides context (existing scoping patterns, sibling tests, error-handling style) needed to judge lenses 1–3 correctly. Skip a file only if it matches `review.ignorePaths` in `.eagerworks/pr-review.json` (`references/config.md`) — those files are excluded from the full-file read and produce no findings. If a configured pattern would exclude a schema migration or auth/scoping code, read and review that file anyway and name the mismatch in the report rather than silently applying the pattern.
4. **Pass all five lenses** from `references/rubric.md` over the change.
5. **Write the report** — see `references/output-format.md` for the format, in the language resolved from `review.language` (`references/config.md` → "Report Language" — never the language the conversation happens to be in). If any `ignorePaths` pattern actually matched a touched file, disclose it in the report — a skip is never silent. Same for `review.documentation.enabled: false` — disclose that Lens 5 didn't run rather than just omitting its section silently.
6. **Post the report to the PR** — only when the scope is a GitHub PR. See "Posting to a PR" below for the preflight, the command, and what to do when `gh` isn't ready.

## Reviewing Against an Issue or PR

When there's an issue or PR with a description, pull its acceptance criteria and use them as the primary input for lens 4 (test coverage):

```bash
gh issue view <N> --json title,body
gh pr view <N> --json title,body
```

If there is no issue and no PR description, fall back to reviewing every new behavior the diff introduces against its own tests — the same lens, just without a written acceptance-criteria list to check off.

## Optional Fix Loop

Only run this when the user explicitly asks for findings to be fixed, not by default. Read-only review stays the default behavior described in `SKILL.md`.

1. **Review** — produce the findings as usual.
2. **Fix** — implement a change for every `critical`/`high` and `minor` finding, or decline one only by citing a specific documented repo convention the code actually follows, or by demonstrating the claimed failure path can't occur. Record the decline reason in one sentence.

   **Documentation findings and suggestions.** Doc drift (Lens 5A, `references/rubric.md`) is fixed like any other finding: edit the stale lines so the doc matches what the diff made true. A documentation _suggestion_ (Lens 5B) under the fix loop means **drafting the proposed file** at its proposed path, matching the format of two existing entries in the same directory (read them first). Source every sentence of rationale from the PR/issue description, commit messages, code comments, or the diff itself — never invent one. Anything unsourceable is written as an explicit `TODO(author): why <X> over <Y>?` line rather than guessed at: a confidently wrong "why" in a repo's decision log is worse than no entry at all, because later readers and later reviews treat it as fact. Drafting a suggested doc needs no `localChecks` re-run, and never counts toward the round cap or the "identical findings" stop condition below — only `critical`/`high` findings drive another round.

3. **Re-verify** — re-run this repo's own local checks (tests, linter, type checker — see `references/config.md` → `localChecks`) against the new changes.
4. **Re-review** — review only what changed in this round against the same five lenses.
5. **Repeat or stop:**
   - Any `critical`/`high` finding in this round → go back to step 1.
   - This round was minor-only, or returned zero findings → the loop ends. Any minor findings from this final round are reported to the user as known remaining nits, not fixed — the loop's job is closing critical/high gaps, not zeroing out every style nit.
   - When the loop ends and the scope is a GitHub PR, post the **final** round's report only (see "Posting to a PR") — never one comment per intermediate round.

**Round cap** — default 3 rounds (`review.maxRounds` in `.eagerworks/pr-review.json` overrides it). Stop and report to the user, rather than continuing indefinitely, when:

- the round cap is reached with findings still open;
- two consecutive rounds produce a substantively identical set of findings — the fixes aren't landing and a human needs to look;
- a finding can't be confidently declined or fixed without more context from the user.

## Posting to a PR

When the scope is a GitHub PR — the user said `review PR #N`, or the branch under review has an open PR (`gh pr view --json number,url`, already run while resolving the base branch) — the report is posted on that PR, **automatically, after it has been printed to the console**. The point is that the review stays with the PR where the whole team can read it, instead of living only in one person's terminal.

Never post for a staged, working-tree, or branch-without-PR review — there is nothing to post to.

Two shapes, chosen by `review.commentStyle` in `.eagerworks/pr-review.json` (`references/config.md`), default `"inline"`:

- **`"inline"`** — a single GitHub review (`gh api .../pulls/<N>/reviews`) that comments directly on the line each anchorable finding names, plus a summary body carrying the verdict, the unanchorable findings in full, and the Documentation section. This is the mode described below.
- **`"summary"`** — today's single issue comment, unchanged: see "Summary mode" below.

### Preflight

```bash
command -v gh          # is the GitHub CLI installed?
gh auth status         # is it authenticated?
```

- **`gh` is not installed** → print the report as usual, then offer: _"I can post this report on PR #N so the team can read it — install the GitHub CLI (https://cli.github.com) and run `gh auth login`, then tell me and I'll post it."_ Don't retry on your own.
- **`gh` is installed but `gh auth status` fails** → same offer, minus the install step: _"…run `gh auth login`, then tell me and I'll post it."_
- **Authenticated** → continue to posting, then print the URL `gh` returns so the user can find it.

These two offer strings are part of the report artifact — speak them in the language resolved from `review.language`, same as the report itself.

The console report is delivered in every case — a missing or unauthenticated `gh` never blocks or fails the review.

### Inline mode

**1. Compute which lines are anchorable.** A GitHub review comment can only land on a line that is actually part of the PR's diff (an added, deleted, or context line inside a hunk) — commenting on any other line is rejected. Before writing a single comment, get the diff's commentable lines:

```bash
gh api --paginate "repos/<owner>/<repo>/pulls/<N>/files" \
  --jq '.[] | {path: .filename, status, patch: (.patch // null)}'
```

A file with `patch: null` (binary, too large, or generated) has nothing commentable. For every other file, walk its `patch` to build the set of `path:line` pairs available on `side: RIGHT` (added and context lines) — v1 only anchors to `RIGHT`, single lines, never a `start_line` range.

**2. Split the findings.** A finding is **anchorable** only if it names a `file:line` and that exact pair is in the set from step 1. Everything else — a finding with no line, a line outside a hunk, anything in a `patch: null` file, every Lens 5B documentation suggestion — is **unanchorable** and goes in the summary body instead, in full, under its normal severity heading. Never drop a finding for being unanchorable.

**3. Build and post the review.** Pin the head SHA up front so the review lands on the commit the diff was actually taken from:

```bash
REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner)
SHA=$(gh api "repos/$REPO/pulls/<N>" --jq .head.sha)

jq -n --arg sha "$SHA" --rawfile body summary.md '{
  commit_id: $sha,
  body: $body,
  event: "COMMENT",
  comments: [
    { path: "app/controllers/invoices_controller.rb", line: 12, side: "RIGHT",
      body: "**Critical** — not scoped to the current user'\''s organization.\n\n**Failure:** an authenticated user from Org A can read any invoice by guessing or incrementing the id.\n\n**Fix:** scope through the caller — `current_user.organization.invoices.find(params[:id])`." }
  ]
}' | gh api --method POST "repos/$REPO/pulls/<N>/reviews" --input - --jq .html_url
```

`event` is always `"COMMENT"` — never `APPROVE` (a 422 on your own PR, and a merge-blocking policy change this skill doesn't make) or `REQUEST_CHANGES` (same policy concern; the verdict line already says whether it's mergeable).

Exact body content for each half: `references/output-format.md` → "Inline Review Comments".

**4. Handle a 422.** The whole POST is atomic — one bad comment rejects the entire review, nothing posts. If it 422s:

- Re-fetch `head.sha`. If it moved (someone pushed in between), re-diff and go back to step 1 — retry **once**.
- Still failing → fall back to summary mode below, using the full console report as the body, and disclose the fallback in one line under the console report: `_Posted as a single summary comment on PR #42 — the inline review failed; see the report above for every finding._` (in `review.language`, like the rest of the report)

### Summary mode

Write the report to a temp file and post it as an issue comment. The body is the **same markdown report** shown in the console, plus a footer — see `references/output-format.md` → "PR Comment". Every run creates a new comment; don't edit a previous one (`--edit-last`), so each review round stays visible in the PR timeline.

```bash
gh pr comment <N> --body-file <report.md>
```

Never hard-wrap lines in the body — let GitHub wrap them.

### Opting out

Skip posting entirely when the user says so ("don't post", "just show me") or when `.eagerworks/pr-review.json` sets `review.postToPr: false` (`references/config.md`). Disclose the skip in one line under the console report:

```markdown
_Not posted to PR #42 — postToPr is false._
```

This disclosure line is written in `review.language` too, same as every other line in the report.

`review.commentStyle` only chooses _how_ to post — it never skips posting on its own; use `postToPr: false` for that.

### ✅ / ❌

```text
✅ correct: print the report → gh auth status → compute anchorable lines from the diff → post one review with inline comments + summary body → print the review URL
✅ correct: a finding names a line outside any diff hunk → keep it in the summary body under its severity heading, don't drop it, don't 422 the review over it
✅ correct: the review POST 422s even after a retry → fall back to `gh pr comment <N> --body-file` with the full report, and say so in one line
✅ correct: gh not installed → print the report → offer to post once the user installs gh and runs `gh auth login`
✅ correct: `review.commentStyle: "summary"` → post exactly like before, one `gh pr comment`, no inline comments
✅ correct: `review.language: "es"` → console report, inline comments, and summary body all in Spanish; the `### FINDINGS` keys and severity values stay English
❌ wrong:   write the report in whatever language the user happened to chat in
❌ wrong:   post the review and skip the console report because "it's on the PR now"
❌ wrong:   post for `git diff --staged` — there is no PR to post to
❌ wrong:   post a reformatted summary instead of the same report the console shows
❌ wrong:   post one review per fix-loop round
❌ wrong:   drop an unanchorable finding instead of moving it into the summary body
❌ wrong:   use `event: "APPROVE"` or `"REQUEST_CHANGES"` — always `"COMMENT"`
```

## Reviewing a Large Diff

When the diff is too large to review every line with equal depth, prioritize in this order: schema migrations, auth/scoping guards, state-transition logic, then everything else. Say explicitly in the report which areas got a lighter pass so the reader knows what wasn't covered in depth — never let a partial review read as if it were exhaustive.
