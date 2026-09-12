# Commit — Configuration

`.eagerworks/commit.json`, at the target repo's root, is **entirely optional**. The skill works with no config file at all — by default it commits everything modified or new that it safely can (see the hard exclusion list in `references/grouping.md`), infers the type and scope vocabulary from `git log`, groups by change intent, and writes English commit messages. Add the file only when a repo needs to override a default — for example, to have the skill ask before including new files instead of committing them outright.

## Resolution order

`.eagerworks/commit.json` → conventions stated in `AGENTS.md`/`CLAUDE.md` → inference from `git log` → the skill's built-in default. A later source only fills in what an earlier one didn't set.

## Commit message language

`commit.language` has its own ladder, separate from Resolution Order above — the same shape `create-pr` uses for `pr.language`:

1. An explicit instruction in the user's request for this run (e.g. "commit this in English") — wins, once, without touching the config file.
2. `commit.language` in `.eagerworks/commit.json`.
3. A stated convention in the target repo's `AGENTS.md`/`CLAUDE.md`.
4. Built-in default: **English.**

**The language the user is chatting in is never an input to this ladder.** A developer working in English still gets a commit message in `es` if that's what the repo's config says — the commit message is a permanent part of the repo's history, not a reply to the user.

## Schema

All fields optional.

```jsonc
{
  "commit": {
    // Allowed types. Unset infers from `git log`, falling back to the
    // Conventional Commits default set — see references/message-format.md.
    "types": [],

    // Allowed scopes. Unset infers from `git log`. "off" never emits a scope.
    "scopes": [],

    // Require every commit to carry a scope. Default false.
    "requireScope": false,

    // Hard cap on the subject line, type and scope included.
    "subjectMaxLength": 72,

    // Language the commit message is written in — a BCP-47 tag or a plain
    // language name ("en", "es", "pt-BR"). Default "en", regardless of what
    // language the conversation is in. An explicit one-off instruction in the
    // user's request for this run overrides this for that run only — see
    // "Commit message language" above.
    "language": "en",

    // Untracked files found in the working tree: "always" (default) includes
    // them like any other change — the skill commits everything modified or
    // new that it can, by default. "ask" confirms before including any of
    // them in a group instead. "never" leaves them out of every commit
    // entirely. The hard exclusion list (.env, credentials, node_modules,
    // build output, screenshots — see references/grouping.md) applies
    // regardless of this setting.
    "includeUntracked": "always",

    // Stop and check in after this many commits in a single run, rather than
    // creating an unbounded series unattended.
    "maxCommitsPerRun": 5,

    // Append a `Signed-off-by` trailer via `git commit -s`.
    "signoff": false,

    // Fixed trailers appended to every commit's footer, verbatim.
    "trailers": [],
  },
}
```

`commit.types`/`commit.scopes` deliberately share vocabulary with `create-pr`'s `pr.titleFormat: "conventional"`, so a repo's PR titles and commit subjects stay consistent with each other.

## Example — Rails app with a fixed type list

```jsonc
{
  "commit": {
    "types": ["feat", "fix", "docs", "chore"],
    "scopes": ["api", "billing", "admin"],
    "requireScope": false,
  },
}
```

## Example — Node/TypeScript app requiring scopes, non-English messages, and confirmation on new files

```jsonc
{
  "commit": {
    "types": ["feat", "fix", "perf", "refactor", "test", "chore"],
    "requireScope": true,
    "language": "pt-BR",
    "includeUntracked": "ask",
    "trailers": ["Reviewed-by: platform-team"],
  },
}
```

See `assets/commit.example.json` for a copyable starter combining both.
