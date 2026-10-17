# pr-review

A portable agent skill for reviewing a diff — a branch, a PR, staged changes, or working-tree changes — against a fixed five-lens rubric: correctness, security & data integrity, repo-convention conformance, test coverage, and documentation & decision capture. Built for Ruby on Rails and Node/TypeScript codebases. Works with Claude Code, Cursor, GitHub Copilot, Codex, Amp, and any agentic coding tool that can read markdown files.

## What it covers

- Scope detection: full branch vs. base, staged changes, working tree, or a specific GitHub PR
- Base-branch resolution from evidence — an open PR's actual base, then config, then the branch's fork point — asking the user rather than guessing when none of those is conclusive
- The five review lenses with Rails and Node/TypeScript examples for each
- A conservative severity ladder (critical / high / minor / not a finding) that avoids padding the list with style nits
- Reviewing against an issue or PR's acceptance criteria, with a test-coverage check that requires the test to actually assert the behavior — not just exercise the code path, and not be skipped, pending, or commented out
- Flags a diff that makes an existing doc (`AGENTS.md`/`CLAUDE.md`, a `docs/` page) assert something now false, and — on a high bar, capped and non-blocking — suggests a decision record for a non-obvious choice the repo has nowhere durable to explain, on by default and switchable off via config
- Two output formats: a readable markdown report by default, and a machine-parseable `### FINDINGS` block for automated consumers
- When the target is a GitHub PR, the same report is also posted to the PR so it stays there for the whole team to read — by default as a GitHub review that comments inline on each finding's line (`gh api .../pulls/<N>/reviews`), with a summary body for the verdict and anything that can't be anchored to a diff line; falls back to a single `gh pr comment` if the inline review can't post, or always uses that single-comment mode when `review.commentStyle: "summary"`. If the GitHub CLI isn't installed or authenticated, the report is still printed and the skill offers to post it once `gh auth login` is done; opt out of posting entirely per repo with `review.postToPr: false`
- An optional review → fix → re-review loop, off by default — the standard review never edits, commits, or pushes
- Optional per-repo configuration for the base branch, local verification commands, repo-specific risk areas (`extraFocus`), paths to exclude from the full-file read (`ignorePaths`), the documentation lens (`documentation.enabled`, `decisionRecordsPath`, `maxSuggestions`), and the report's language (`review.language`, English by default regardless of what language the conversation is in), with any exclusion or opt-out disclosed in the report

## Layout

```
SKILL.md                        # hub: scope detection, the five lenses, severity, gotchas (agent entrypoint)
references/
  rubric.md                     # full five-lens checklist, severity ladder, Rails + Node examples
  workflow.md                   # end-to-end review flow, issue/PR review, optional fix loop
  base-branch.md                # base-branch resolution ladder: open PR, config, fork point, or ask
  output-format.md              # markdown report format + the ### FINDINGS block
  config.md                     # .eagerworks/pr-review.json schema and resolution order
assets/
  pr-review.example.json        # copyable starter config (Rails + Node examples)
  code-reviewer.agent.md        # optional Claude Code subagent wrapper around this skill
```

The agent loads [`SKILL.md`](SKILL.md) up front and opens the matching [`references/`](references/) file on demand, so the entrypoint stays lean while the full knowledge base is always available.

## Harness and model

The skill is plain markdown, so it runs in whatever agentic tool loads it — Claude Code, Cursor, GitHub Copilot, Codex, Amp, or any [skills.sh](https://www.skills.sh)-compatible tool. It needs `git` for the diff and, only when the target is a GitHub PR, `gh` for the PR metadata and the report comment; without `gh` the review still runs and prints, it just doesn't post.

**The skill doesn't pick a model.** The review is performed by whatever model the host agent is already running — there is no model setting in `SKILL.md`, `references/`, or `.eagerworks/pr-review.json`. The one place a model is named is the optional Claude Code subagent below, whose frontmatter defaults to `model: opus`; change that line if you want the isolated review to use a different model. In every other harness, the main agent does the whole job — reading, reviewing, and posting to the PR — with its own model.

## Configuration

The skill works with zero configuration — it resolves the base branch from evidence (an open PR's actual base first, then this config, then the branch's fork point, asking the user if none is conclusive — see [`references/base-branch.md`](references/base-branch.md)) and reads whatever `AGENTS.md`/`CLAUDE.md` conventions exist in the target repo. To set a default base branch, point at a repo-specific risk area, turn off posting the report on the PR (`review.postToPr`), switch how it posts (`review.commentStyle: "inline"` (default) or `"summary"`), change the language the report and PR comments are written in (`review.language`, English by default — never inferred from the conversation), or wire up local verification commands for the optional fix loop, add `.eagerworks/pr-review.json`. See [`references/config.md`](references/config.md) for the full schema and [`assets/pr-review.example.json`](assets/pr-review.example.json) for a starter.

## Claude Code subagent (optional)

[`assets/code-reviewer.agent.md`](assets/code-reviewer.agent.md) is a copyable Claude Code subagent definition that wraps this skill's rubric in a dedicated, read-only reviewer — copy it to `.claude/agents/code-reviewer.md` in your project if you want the review to run as an isolated subagent call. It's optional: the skill works standalone in any agentic tool without it. The subagent points back at this skill's own `references/rubric.md`, `workflow.md`, `base-branch.md`, and `output-format.md`, so the `pr-review` skill itself must also be installed in the same project (e.g. `.claude/skills/pr-review/`) for those references to resolve — copying only the subagent file on its own leaves those paths unresolvable.

## Install

See the [collection README](../../README.md#install). In short:

```bash
npx skills add eagerworks/skills --skill pr-review
```
