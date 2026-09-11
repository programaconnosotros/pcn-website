# PR Review — Configuration

`.eagerworks/pr-review.json`, at the target repo's root, is **entirely optional**. The skill works with no config file at all — it resolves the base branch from evidence (see `references/base-branch.md`) and reads whatever `AGENTS.md`/`CLAUDE.md` conventions it finds. Add the file only when a repo needs to override a default or point at repo-specific risk areas.

## Resolution Order

For most settings: `.eagerworks/pr-review.json` → conventions stated in `AGENTS.md`/`CLAUDE.md` → the skill's built-in default. A later source only fills in what an earlier one didn't set.

`baseBranch` is the one exception: an open PR's actual base (`gh pr view --json baseRefName`) outranks `baseBranch` when the branch under review already has one. See `references/base-branch.md` for the full ladder.

## Report Language

`review.language` picks the language of the report artifact — the console report, the inline comments, the review summary body, and every disclosure line. It has its own ladder, separate from Resolution Order above:

1. An explicit instruction in the user's request for this run (e.g. "write the review in Spanish") — wins, once, without touching the config file.
2. `review.language` in `.eagerworks/pr-review.json`.
3. A stated convention in the target repo's `AGENTS.md`/`CLAUDE.md` (e.g. "PR reviews are written in Spanish").
4. Built-in default: **English.**

**The language the user is chatting in is never an input to this ladder.** A developer reviewing in Spanish still gets an English report unless step 2 or 3 says otherwise — the report is a team-facing artifact posted to GitHub, not a reply to the user, and its language must be deterministic regardless of which language happens to drive the conversation. See `references/output-format.md` → "Report Language" for exactly what does and doesn't get translated once a non-default language is resolved.

If the resolved value isn't a language the agent can confidently write in, fall back to English and disclose the fallback in one line under the console report — a skip here is never silent, same rule `ignorePaths` already follows.

## Schema

All fields optional.

```jsonc
{
  // Branch to diff against. Overridden by an open PR's actual base when one exists.
  // If neither is set and the fork point is ambiguous, the skill asks rather than
  // guessing — see references/base-branch.md.
  "baseBranch": "main",

  "review": {
    // Review -> fix -> re-review rounds before the optional fix loop stops and reports
    // (see references/workflow.md). Only relevant when the user explicitly asked for fixes.
    "maxRounds": 3,

    // Repo-specific concerns appended to the five lenses in references/rubric.md, one
    // sentence each. Treat these as known risk areas for this codebase specifically.
    "extraFocus": [],

    // Glob patterns excluded from the full-file read and from producing findings —
    // for generated or vendored files (lockfiles, generated clients, snapshots).
    // Matches are always disclosed in the report (see references/output-format.md);
    // this is a skip, never a silent one. A pattern that would exclude a schema
    // migration or auth/scoping code gets named in the report rather than dropped.
    "ignorePaths": [],

    // Lens 5 (references/rubric.md) — flags a diff that makes an existing doc
    // (AGENTS.md/CLAUDE.md, a docs/ page) assert something false, and suggests
    // (never requires) a decision record for an undocumented, non-obvious choice.
    "documentation": {
      // On by default. Set false to turn the whole lens off — no doc-drift
      // findings, no suggestions. A review run this way discloses it in the
      // report rather than silently omitting the section (references/output-format.md).
      "enabled": true,

      // Where a new decision record belongs in this repo. Unset, the skill infers
      // it from the existing layout and proposes docs/decision-records/ when the
      // repo has no documentation home at all.
      "decisionRecordsPath": "docs/decision-records/",

      // Cap on documentation suggestions per review.
      "maxSuggestions": 2,
    },

    // Post the report to the PR under review (see references/workflow.md
    // → "Posting to a PR"). On by default; only relevant when the scope is a GitHub PR.
    // Set false to keep the review in the console only — the skip is disclosed in the
    // report, never silent.
    "postToPr": true,

    // How the report is posted, when postToPr is true. "inline" (default) posts a
    // GitHub review that comments directly on each finding's line, with a summary
    // body for the verdict and any finding that can't be anchored to a diff line.
    // "summary" posts one plain issue comment with the full report, same as this
    // skill's original behavior — also the automatic fallback if an inline review
    // fails to post (references/workflow.md → "Handle a 422").
    "commentStyle": "inline",

    // Language the report, inline comments, and summary body are written in — a
    // BCP-47 tag or a plain language name ("en", "es", "pt-BR", "Spanish"). Default
    // "en", always, regardless of what language the conversation is in — see
    // "Report Language" above.
    "language": "en",
  },

  // Commands this repo uses to verify a fix during the optional fix loop. Run as-is, in order.
  "localChecks": [],
}
```

## Example — Rails Studio

```jsonc
{
  "baseBranch": "main",
  "review": {
    "maxRounds": 3,
    "extraFocus": [
      "Every query scoped to an Organization filters through current_user.organization, not just organization_id from params",
    ],
    "ignorePaths": ["db/schema.rb"],
    "documentation": { "enabled": true, "decisionRecordsPath": "docs/adr/" },
    "postToPr": true,
    "commentStyle": "inline",
    "language": "es",
  },
  "localChecks": ["bundle exec rspec", "bundle exec rubocop"],
}
```

## Example — Node Studio

```jsonc
{
  "baseBranch": "main",
  "review": {
    "maxRounds": 3,
    "extraFocus": [
      "Every Prisma query on a tenant-scoped model includes orgId from the session, never only from the request body",
    ],
    "ignorePaths": ["package-lock.json", "src/generated/**"],
    "documentation": { "enabled": true, "decisionRecordsPath": "docs/decision-records/" },
    "postToPr": false,
  },
  "localChecks": ["npm test", "npm run lint", "npm run typecheck"],
}
```

See `assets/pr-review.example.json` for a copyable starter combining both.
