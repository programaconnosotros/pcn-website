# Create PR — Manual Test Cases

`### Manual` (under `## Test plan`) tells whoever reviews the PR's quality — a dev, a QA person, anyone but the author — exactly what to exercise by hand, with steps concrete enough to run without having read the diff. It is the QA-facing counterpart to `### Automated`, which stays exactly as documented in `references/description.md`.

Controlled by `pr.manualTestCases` in `.eagerworks/create-pr.json` — see `references/config.md`. On by default.

## When it applies

Generate scenarios when the diff changes behavior a person could observe by using the app, calling an endpoint, or running a command:

- a UI path — reuse the detection already documented for screenshots: `pr.screenshots.uiPaths`, or inferred from the repo's shape (`apps/web`, `apps/mobile`, `resources/views`, `templates/`, component files touched by the diff)
- an HTTP endpoint, controller, or route
- a job, worker, or scheduled/cron task
- a CLI command
- an email, notification, or webhook
- a migration or data change with an effect a user or operator can see

**Does not apply** — the anti-nag list, mirroring `pr-review`'s Lens 5:

- a behavior-preserving refactor
- a dependency bump
- a CI or tooling config change
- a docs-only change
- a test-only change
- a type-only change

When nothing qualifies, say so in one line instead of omitting the subsection — this is what tells the reviewer the section was evaluated and correctly came up empty, not skipped:

```markdown
### Manual

_None — this change has no observable surface: `OrderSerializer` was refactored with no behavior change, covered by the existing specs._
```

## Deriving scenarios from evidence

In this order:

1. **The linked issue's acceptance criteria**, when the branch or PR references one — `gh issue view <N> --json body`.
2. **The PR's own Problem/Solution**, as already drafted for this description.
3. **The diff itself** — the paths touched and the behavior they change.

Behavior already asserted by a test added in this diff does not need a manual scenario too — note that in the scenario list rather than duplicating it. Manually re-testing what the automated suite already covers is the fastest way to get this section ignored.

## Scenario shape

```markdown
#### 1. A Viewer cannot delete a project

**Setup:** staging, signed in as a user with the Viewer role on project 42.

- [ ] Open `/projects/42/settings` and scroll to the "Danger zone" card
- [ ] Confirm the "Delete project" button is not rendered
- [ ] Request `DELETE /api/projects/42` directly (curl or devtools) with that session
- [ ] **Expected:** the button is absent, and the direct request returns 403 with a JSON error body — not 500, not a redirect
```

- **Title** (`#### N. <title>`) — one line, actor + outcome (`A Viewer cannot delete a project`), not a restatement of the diff.
- **`**Setup:**`** — one line: environment, the actor/role, and the data state the scenario needs.
- **Steps** — `- [ ]`, one observable action per step.
- **Last step is always `- [ ] **Expected:** …`** — the pass condition, precise enough to fail on the near-miss (`403 with a JSON error body — not 500, not a redirect`, not just "it's blocked").

Number scenarios sequentially starting at 1.

## Step-writing rules

This is the part that makes a scenario actually testable by someone who hasn't read the diff:

- Name the exact route, screen, endpoint, or command — never "go to settings."
- Name the actor and the account state the step needs (role, plan, permissions).
- Name concrete data — ids, amounts, flags — preferring the repo's own seed/fixture data when it exists; otherwise state what to create first.
- A step must be executable without reading the diff or this PR's code.
- Each step is one line — the no-hand-wrap self-check in `references/description.md` already allows lines starting with `- [`.

Anything the skill cannot source from the repo, the issue, or the conversation — a staging URL, a test account, a feature-flag name — becomes a `TODO(author):` line, never a guess. The missing detail is what gets flagged, not the rest of the step: still name the actual feature, screen, or route the step exercises, even when the account or flag it needs is TODO'd — a step that only says "sign in" and drops the feature it was meant to unlock isn't executable either.

```markdown
❌ wrong — a fabricated credential

- [ ] Sign in as `admin@acme.com` / `Password123!`

❌ wrong — the missing account swallowed the rest of the step

<!-- TODO(author): which staging account has the Admin role for this test? -->

- [ ] Sign in as an Admin (account TBD — see TODO above)

✅ correct — flagged for the author to fill in, feature still named

<!-- TODO(author): which staging account has the Admin role for this test? -->

- [ ] Sign in as an Admin (account TBD — see TODO above) and open `/admin/exports/bulk`
```

## Hard rules

1. **Never invent a credential, token, or real-looking email.** Placeholders only (`qa+viewer@acme.test`), the same secret-hygiene rule this repo's skills already model.
2. **Every box ships unticked.** `create-pr` does not run manual tests; Critical Gotcha #5 in `SKILL.md` already forbids ticking anything that wasn't actually done, and that includes manual scenarios.
3. **No cap by default, and never pad.** `pr.manualTestCases.maxScenarios` is unset by default — write as many scenarios as the diff genuinely supports, however many that is. Two real scenarios beat five padded ones; ten real scenarios beat five arbitrarily dropped ones — zero is a valid, correct result when nothing qualifies.
4. **Only when a repo sets `maxScenarios` explicitly**, keep the highest-risk scenarios first — security/permissions, then data integrity, then regression-prone paths — and say in one line how many were kept and on what basis:

   ```markdown
   _Showing 5 of 7 scenarios — kept the ones touching permissions and data integrity; see the diff for the rest (pr.manualTestCases.maxScenarios: 5)._
   ```

## Language and disclosure

- The section is written in `pr.language`, same as the rest of the description. The literal `TODO(author):` prefix is never translated.
- `pr.manualTestCases.enabled: false` drops the `### Manual` subsection entirely — disclose that in the description rather than silently omitting it, the same non-silent-skip rule this collection applies to every other opt-out (`pr-review`'s `ignorePaths`, this skill's own screenshot placeholder):

  ```markdown
  ### Manual

  _Manual test cases disabled by config (pr.manualTestCases.enabled: false)._
  ```
