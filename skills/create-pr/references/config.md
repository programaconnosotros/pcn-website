# Create PR — Configuration

`.eagerworks/create-pr.json`, at the target repo's root, is **entirely optional**. The skill works with no config file at all — it resolves the base branch from evidence (see `references/base-branch.md`), derives the checklist from whatever verification tooling it finds, and infers whether the change is UI-visible from the repo's shape. Add the file only when a repo needs to override a default.

## Resolution order

`.eagerworks/create-pr.json` → conventions stated in `AGENTS.md`/`CLAUDE.md` → the skill's built-in default. A later source only fills in what an earlier one didn't set.

`baseBranch` is one exception: an already-open PR's actual base outranks it whenever the branch under review already has one — see `references/base-branch.md`.

## PR language

`pr.language` has its own ladder, separate from Resolution Order above — the same shape `pr-review` uses for `review.language`:

1. An explicit instruction in the user's request for this run (e.g. "open this PR in English") — wins, once, without touching the config file.
2. `pr.language` in `.eagerworks/create-pr.json`.
3. A stated convention in the target repo's `AGENTS.md`/`CLAUDE.md`.
4. Built-in default: **English.**

**The language the user is chatting in is never an input to this ladder.** A developer working in English still gets a PR written in `es` if that's what the repo's config says — the PR is a team-facing artifact on GitHub, not a reply to the user, and its language must be deterministic regardless of which language happens to drive the conversation.

## Schema

All fields optional.

```jsonc
{
  // Branch to open the PR against. Overridden by an open PR's actual base when one
  // exists. If unset and no other rung resolves it, the skill asks — see
  // references/base-branch.md. Not necessarily the repo's default branch.
  "baseBranch": "main",

  "pr": {
    // "conventional" (default) enforces "<type>(<scope>): <description>", matched
    // against recently merged PR titles. "free" skips that shape for a repo that
    // doesn't use Conventional Commits.
    "titleFormat": "conventional",

    // Self-assign the PR to the current gh account on creation.
    "assignSelf": true,

    // "auto" (default) picks matching labels from `gh label list`, never inventing
    // one. "off" skips labeling entirely. An array always applies exactly those
    // labels (still validated against `gh label list`).
    "labels": "auto",

    // Open as a draft PR.
    "draft": false,

    // GitHub logins or team slugs to request review from at creation time.
    "reviewers": [],

    // Language the PR title and description are written in — a BCP-47 tag or a
    // plain language name ("en", "es", "pt-BR"). Default "en", regardless of what
    // language the conversation is in. An explicit one-off instruction in the
    // user's request for this run overrides this for that run only — see
    // "PR language" above.
    "language": "en",

    // Section headings and order for the description. Unset uses the default:
    // Summary, Problem, Solution, Screenshots/Demo, Test plan, Checklist. See
    // references/description.md for what each section covers.
    "sections": [],

    // Checklist items, verbatim, in order. Unset derives the checklist from
    // verification tooling actually detected in the repo (references/description.md
    // -> "Deriving the checklist"). An explicit [] means no ## Checklist section
    // at all, rather than an empty one.
    "checklist": [],

    "screenshots": {
      // "auto" (default) requires a screenshot when the diff touches a UI path.
      // "off" turns the requirement off entirely — for a repo with no UI at all.
      "mode": "auto",

      // Glob patterns that mark a change as UI-visible. Unset infers from the
      // repo's shape (an apps/web, apps/mobile, resources/views, or similar
      // directory touched by the diff).
      "uiPaths": [],

      // Glob patterns to check for already-captured screenshots before attempting
      // a live capture — e.g. e2e test-run output.
      "artifactPaths": [],

      // A command that produces a fresh screenshot on demand. Never run without
      // confirming with the user first, since it may start a server or a browser.
      "captureCommand": null,
    },

    // Manual test cases under "## Test plan" -> "### Manual" — see
    // references/manual-test-cases.md. On by default.
    "manualTestCases": {
      // Set false to drop the ### Manual subsection entirely. A run that does so
      // discloses it in the description rather than silently omitting it.
      "enabled": true,

      // Optional cap on scenarios in the subsection. Unset (default): no cap —
      // the skill writes as many real scenarios as the diff supports. When set,
      // over the cap the highest-risk scenarios are kept (security/permissions,
      // then data integrity, then regression-prone paths) and the description
      // says how many were dropped.
      "maxScenarios": null,
    },
  },
}
```

## Example — Rails app merging into `staging`

```jsonc
{
  "baseBranch": "staging",
  "pr": {
    "titleFormat": "conventional",
    "checklist": [
      "RSpec — `bundle exec rspec` — result: …",
      "Rubocop — `bundle exec rubocop` — result: …",
      "No secrets or live keys in the diff",
    ],
    "screenshots": { "mode": "off" },
  },
}
```

## Example — Node/TypeScript app with Playwright screenshots

```jsonc
{
  "baseBranch": "main",
  "pr": {
    "labels": ["ui"],
    "language": "es",
    "screenshots": {
      "mode": "auto",
      "uiPaths": ["apps/web/**"],
      "artifactPaths": ["playwright-report/**/*.png", "test-results/**/*.png"],
    },
    "manualTestCases": { "maxScenarios": 3 },
  },
}
```

See `assets/create-pr.example.json` for a copyable starter combining both.
