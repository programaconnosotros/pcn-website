# Commit — Message Format

## Shape

```
<type>(<scope>): <description>

<body>

<footer>
```

- **type** — required. See "Types" below.
- **scope** — optional, parenthesized, a noun naming the affected area (`auth`, `api`, `web`). Omit it rather than inventing one when nothing in the repo's own scope vocabulary fits.
- **description** — imperative mood ("add", not "added" or "adds"), no trailing period, capped at 72 characters including `type(scope): `.
- **body** — optional, separated from the subject by a blank line. Earns its place only when it explains _why_, not a restatement of _what_ the diff already shows. Wrap at ~72 columns.
- **footer** — optional, separated by a blank line. Trailer tokens (`Refs:`, `Closes:`, `BREAKING CHANGE:`) each on their own line.

## Types

The full Conventional Commits type set:

| Type       | Use for                                                      |
| ---------- | ------------------------------------------------------------ |
| `feat`     | A new capability visible to the end user or API consumer     |
| `fix`      | A bug fix                                                    |
| `docs`     | Documentation only                                           |
| `style`    | Formatting, whitespace, semicolons — no code behavior change |
| `refactor` | Neither fixes a bug nor adds a feature                       |
| `perf`     | A performance improvement                                    |
| `test`     | Adding or correcting tests only                              |
| `build`    | Build system or external dependencies                        |
| `ci`       | CI configuration and scripts                                 |
| `chore`    | Everything else that doesn't touch source or tests           |
| `revert`   | Reverts a previous commit                                    |

## The repo's own vocabulary wins

Before defaulting to the full type set above, run `git log --format=%s -100` and extract the types and scopes actually in use. If a repo's history only ever uses `feat`, `fix`, `docs`, and `chore` — as this repo does — don't introduce `style:` or `refactor:` just because the spec defines them; stay inside the vocabulary the repo has already committed to. `.eagerworks/commit.json` can pin this list explicitly instead of inferring it — see `references/config.md`.

## Breaking changes

Mark a breaking change with `!` after the type/scope (`feat(api)!: drop the v1 token endpoint`) **and** a `BREAKING CHANGE:` footer describing the migration. Both together, not one or the other — the `!` is easy to miss in a scrollback, the footer is what tooling parses.

## Body and footer conventions

- Use a body when the _why_ isn't obvious from reading the diff — a workaround for an upstream bug, a decision that trades off two constraints, a link to the issue that prompted it.
- Don't restate the diff in prose ("changed `foo.ts` to add a new function") — that's what `git show` is for.
- Footer trailers go one per line: `Refs: #123`, `Closes: #123`, `Co-authored-by: Name <email>`.
- Always compose the message with `git commit -F -` and a HEREDOC, never `-m "line1\nline2"` — escaped `\n` sequences in a `-m` string are passed through literally by most shells rather than becoming real newlines.
