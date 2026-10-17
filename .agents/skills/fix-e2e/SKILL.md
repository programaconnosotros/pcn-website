---
name: fix-e2e
description: Triage and fix failing or flaky Playwright e2e tests in the website repo — iterate against a persistent e2e server, tell an outdated test from a real app regression, apply the repo's known fixes (displayName names, hidden duplicate copies, terminal empty states), confirm flakiness with repeats and leave the suite green with retries off. Use when pnpm test:e2e fails or shows flaky tests, when the user asks to fix the e2e suite, or after UI changes that may have broken e2e specs.
---

# Fix e2e

The suite lives in `tests/e2e` (helpers in `tests/e2e/support`). Each test is named after the
QA case it automates (`TC-AUT-001 …`). The goal is a full `pnpm test:e2e --retries=0` with
0 failed and 0 flaky.

## Iterate against a persistent server

A full run rebuilds production every time (~10 min). To iterate on a few specs:

```bash
pnpm test:e2e:serve                     # background: recreates the e2e DB, builds, serves :3300
E2E_REUSE_SERVER=1 npx playwright test tests/e2e/<spec>.ts --project=desktop --retries=0 --reporter=line
```

- Add `--project=setup` the first time (it logs in the seeded roles and saves
  `tests/e2e/.auth`); after that, `--no-deps` skips it. Mobile specs (`*.mobile.spec.ts`) run with
  `--project=mobile`.
- The server is a production build: **changes in `src/` need a rebuild** (stop it and start
  `test:e2e:serve` again). Changes to specs don't.
- Every test sends its own `x-forwarded-for` derived from the test and retry, so rate limits are
  per test. Rerunning the same test many times against the same server reuses that IP and can hit
  `sendCode`/`verifyCode`/`signIn` limits (15 min windows): restart the server, which resets the
  in-memory limits.
- Each run wipes `test-results/`. If several agents run specs in parallel, give each its own
  `--output <dir>` and delete those dirs afterwards.

## Find the cause

1. Group failures by error: for each `test-results/<test>/error-context.md`, read the error and
   the page snapshot (ARIA tree). The screenshot is `test-failed-1.png` next to it; the trace
   (`trace.zip`) has the network log and console when timing matters.
2. Decide **outdated test vs. regression** from history, not intuition: `git log -p` on the
   component or page involved. If a commit changed the UI on purpose (new copy, a confirm dialog,
   a redirect), update the test to the new intended behavior. If nothing explains it, it's a bug:
   fix the app (with a unit test), rebuild, rerun.

## Known causes in this repo

- **Names are shown through `displayName`** (`src/lib/people-names.ts`): every run of more than
  three letters starts with a capital, so a random id like `fdeddf62` renders as `Fdeddf62`.
  Exact comparisons (`toHaveText`, `toHaveValue`, `toBe`, a RegExp without `i`, Prisma
  `contains`) then fail _sometimes_. The helpers that create users already store
  `displayName(...)`; a test that creates a user by hand must do the same. (String locators —
  `getByText`, `getByRole({ name })`, `getByTitle` — are case-insensitive already.)
- **Hidden duplicate copies in the DOM**: the "Últimas novedades" ticker repeats titles, and
  some pages keep a hidden second copy of their content. A bare `getByText(...)` then hits a strict-mode
  violation. Scope to what the user sees: `getByRole('main')`, a heading role, `.visible()`.
- **Terminal empty states** (`src/components/empty-state.tsx`): empty results are a terminal
  panel with a heading (`role="status"`), not the old "0 resultados para…" text.
- **Confirm dialogs, redirects and copy** change with features: check the commit before
  "fixing" the test back.
- **Timing under load**: OS windows, double clicks and offline navigation depend on the machine
  being free. Don't add sleeps; wait for the state the user would see, or retry the gesture with
  `expect(...).toPass()` when repeating it is harmless.

## Confirm it's fixed, not lucky

- Repeat the test with the suite's real setup: `--repeat-each=20` (2 workers, the default). Use
  more workers only to provoke a timing bug; failures with 4–6 workers on this machine are often
  just CPU starvation.
- Finish with the full suite: `pnpm test:e2e --retries=0`, twice if the fix was about flakiness.
- If you renamed a test or a QA case, run `pnpm qa:cases` and update the manual case text in
  `src/app/(platform)/desarrollo/calidad/manual-cases/` if the behavior changed.
- Stop the persistent server (kill only the process listening on :3300) and delete temporary
  specs or scripts you created.
