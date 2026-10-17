---
name: verify-all
description: Run every check the website repo has — ESLint, TypeScript, Prettier, the unit suite, the Postgres integration suite, the Playwright e2e suite and the production build — in the right order, read the results correctly and report them. Use when the user asks to verify everything, make sure nothing is broken, run all the tests, check for errors or warnings anywhere, or confirm a change is safe before committing, pushing or opening a PR.
---

# Verify all

"Everything passes" here means seven checks, and none of them run in CI (on purpose: the GitHub
Actions workflow only deploys). Run them locally, in this order, and report each one
with its numbers. Don't call something green that you didn't run.

## 1. Static checks (fast, run them together)

```bash
pnpm lint            # ESLint; passing prints nothing after the header
npx tsc --noEmit     # TypeScript
pnpm format:check    # Prettier
```

- `format:check` also flags stray files in the repo root (temporary scripts you wrote). Delete
  them; don't format them.
- A build with a custom `NEXT_DIST_DIR` (`.next-check`, …) makes Next **rewrite `tsconfig.json`**
  (it adds the folder to `include` and expands the arrays). Restore it with
  `git checkout tsconfig.json` before reporting.

## 2. Unit suite

```bash
pnpm test
```

Jest with two projects (`node` for `*.test.ts`, `dom` for `*.test.tsx`), Prisma mocked.

- **"A worker process has failed to exit gracefully"** is a real problem, not noise: some code
  leaves a timer (or socket) alive. `--detectOpenHandles` runs in band and usually shows nothing;
  find the file with `npx jest --shard=i/N` (bisect until one file reproduces it with
  `--maxWorkers=2`), then clear the timer in the source (`clearTimeout` in a `finally`), not in
  the test.
- If the run renamed or added tests, regenerate the QA catalog: `pnpm qa:cases` (rewrites
  `src/app/(platform)/desarrollo/calidad/automated-cases.ts` and `coverage.ts`; commit them).

## 3. Integration suite (real Postgres)

```bash
pnpm test:db
```

Needs the local Postgres (`pg_isready`). It creates a throwaway database from the migrations and
runs `*.db.test.ts` one file at a time. When a server action changes behavior on purpose, these
are the tests that go stale (thrown error classes, which rows count): update the test to the
intended behavior after checking the commit that changed it.

## 4. E2E suite (Playwright, ~10 minutes)

```bash
pnpm test:e2e --retries=0 --reporter=list
```

- It recreates `<db>_e2e`, builds production into `.next-e2e` and serves it on :3300. Run it in
  the background and wait; don't run anything heavy alongside it (another build, Docker
  containers): load alone makes OS-window and timing tests fail.
- Use `--retries=0`. With the default retry, a flaky test shows as "flaky" and the run passes;
  that is a bug to fix, not a pass.
- 2 tests are always skipped on purpose (`TC-PWA-001`, `TC-PLT-009`: manual cases that can't be
  automated), and a few skip themselves when the data doesn't allow them. Report "N passed,
  2 skipped".
- The `[WebServer] ⨯ Error: …` lines (No autorizado, RATE_LIMIT, Código inválido) are the negative
  tests exercising the app, not failures.
- When something fails, switch to the `fix-e2e` skill.

## 5. Production build

`pnpm test:e2e` already builds production, so a separate `pnpm build` is only needed when e2e
isn't run. Read the whole log, not just the exit code: a page that touches the database while
being prerendered logs a Prisma error even though the build passes (fix: `await connection()`
before the query — see CLAUDE.md).

## Reporting

One line per check with its numbers (e.g. "unit: 3842 passed · db: 521 passed · e2e: 352 passed,
2 skipped, retries off"). Name anything you didn't run and why (no database, Docker down, …).
If the user asked to commit, commit only after everything above is green.
