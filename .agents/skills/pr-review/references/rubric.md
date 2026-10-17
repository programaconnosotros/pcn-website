# PR Review — Rubric

The authoritative checklist and severity ladder. Read this in full before writing a report — `SKILL.md` only summarizes it. Examples below are drawn from both Rails and Node/TypeScript so either studio recognizes its own code; apply the same lens regardless of stack.

## Lens 1 — Correctness

Logic errors, edge cases, off-by-ones, unhandled states or inputs, races between concurrent operations, incorrect error handling (swallowed errors, wrong status codes, wrong fallback behavior).

```ruby
# ❌ wrong — off-by-one, misses the last page
def paginate(items, page:, per_page: 20)
  items[(page - 1) * per_page...page * per_page - 1]
end

# ✅ correct
def paginate(items, page:, per_page: 20)
  items[(page - 1) * per_page...page * per_page]
end
```

```ts
// ❌ wrong — error swallowed, caller can't tell the write failed
async function saveDraft(draft: Draft) {
  try {
    await db.draft.update({ where: { id: draft.id }, data: draft });
  } catch {
    console.log('save failed');
  }
}

// ✅ correct — caller (and its own caller) can react to the failure
async function saveDraft(draft: Draft) {
  try {
    await db.draft.update({ where: { id: draft.id }, data: draft });
  } catch (err) {
    throw new Error(`Failed to save draft ${draft.id}: ${err.message}`);
  }
}
```

## Lens 2 — Security & Data Integrity

**Multi-tenant / auth scoping.** Every query and mutation touching tenant- or user-scoped data filters by the caller's identity, not just by an id supplied in the request. A missing scope check is always `critical`.

```ruby
# ❌ wrong — any authenticated user can fetch any org's invoice by guessing the id
def show
  @invoice = Invoice.find(params[:id])
end

# ✅ correct — scoped through the caller's own organization
def show
  @invoice = current_user.organization.invoices.find(params[:id])
end
```

```ts
// ❌ wrong — orgId never enters the query
const project = await prisma.project.findUnique({ where: { id: params.id } });

// ✅ correct
const project = await prisma.project.findFirst({
  where: { id: params.id, orgId: session.orgId },
});
```

**Injection.** SQL/command/template injection from unsanitized input.

```ruby
# ❌ wrong — string-interpolated SQL
Invoice.where("customer_name LIKE '%#{params[:q]}%'")

# ✅ correct — bound parameter
Invoice.where("customer_name LIKE ?", "%#{params[:q]}%")
```

```ts
// ❌ wrong — raw query built with interpolation
await prisma.$queryRawUnsafe(`SELECT * FROM users WHERE email = '${email}'`);

// ✅ correct — tagged template, parameters are bound
await prisma.$queryRaw`SELECT * FROM users WHERE email = ${email}`;
```

**Secrets.** No credential, token, or key written to logs, error messages, or a client-visible response.

```ts
// ❌ wrong — leaks the API key into application logs on every failure
logger.error(`Stripe call failed with key ${stripeApiKey}: ${err.message}`);

// ✅ correct — no secret in the log line
logger.error(`Stripe call failed: ${err.message}`);
```

**Migration safety.** A schema migration doesn't lock or lose data on a table that already has rows in production; a destructive migration is paired with a backfill or an explicit rollback path.

```ruby
# ❌ wrong — locks the table for the duration of the index build
add_index :orders, :customer_id

# ✅ correct — Rails/PG allow building without a full table lock
add_index :orders, :customer_id, algorithm: :concurrently
```

```ts
// ❌ wrong — NOT NULL with no default on a populated table fails outright
await queryRunner.query(`ALTER TABLE "orders" ADD COLUMN "status" varchar NOT NULL`);

// ✅ correct — backfill first, then tighten the constraint in a follow-up migration
await queryRunner.query(`ALTER TABLE "orders" ADD COLUMN "status" varchar DEFAULT 'pending'`);
```

## Lens 3 — Repo-Convention Conformance

Cross-check against this repo's own `AGENTS.md`/`CLAUDE.md`, and against any project-specific pattern evident from the surrounding code that this change breaks without a stated reason — existing service-object structure, error-handling style, naming, file organization.

**Code that follows a documented convention is never a finding**, even if a different style is generally preferable. Only flag a deviation, not a preference.

## Lens 4 — Test Coverage

For every acceptance criterion in the issue or PR description (or, if none is given, for every new behavior the diff introduces), find the test that proves it and confirm it actually **asserts** the behavior — not just exercises the code path.

```ts
// ❌ does NOT count as covering "a user cannot read another org's project"
it('returns a project', async () => {
  const res = await request(app).get(`/projects/${project.id}`).set(authHeader(user));
  expect(res.status).toBe(200); // never asserts the scoping behavior
});

// ✅ actually proves the acceptance criterion
it('404s when the project belongs to a different org', async () => {
  const res = await request(app).get(`/projects/${otherOrgProject.id}`).set(authHeader(user));
  expect(res.status).toBe(404);
});
```

An acceptance criterion with no proving test is always `high`.

A test that already existed and still passes can be stale rather than proving anything: if the diff changes the behavior a pre-existing test was written to assert, and that test's assertions weren't updated to match, treat it the same as a missing test for that behavior.

A skipped, pending, or commented-out test does not cover its acceptance criterion either — treat it exactly like a missing test. Recognize `it.skip` / `xit` / `describe.skip` / `test.todo` in Jest/Vitest, and `xit` / `skip` / `pending` in RSpec. `.only` on a sibling test deserves its own mention even when the criterion's own test looks fine: it silently disables every other test in the file, which can hide an unrelated regression.

## Lens 5 — Documentation & Decision Capture

Two separate outputs come out of this lens. Keep them apart: one is a finding with a severity, the other is a non-blocking suggestion that is never counted in the verdict.

**A. Doc drift.** The diff makes a document already in the repo assert something that is now false. This is a normal finding.

- `high` when the stale doc is `AGENTS.md`/`CLAUDE.md`, or another doc the repo treats as authoritative for how code gets written — code gets written from a stale instruction file, and Lens 3 of the _next_ review checks against it.
- `minor` for any other stale doc — a README usage example, a `docs/` page.
- Needs evidence like any finding: quote the doc line that is now false and the diff line that made it false. **"The doc doesn't mention the new thing" is not drift** — drift is the doc _asserting_ something the diff falsified, not the doc being merely incomplete.

```ts
// CLAUDE.md (existing, unmodified by the diff):
// "Every tenant-scoped query goes through withOrg(session) — no exceptions."

// ❌ wrong — diff adds an escape hatch CLAUDE.md now falsely claims doesn't exist
export async function listProjects(session: Session, opts: { admin?: boolean }) {
  if (opts.admin) return prisma.project.findMany(); // bypasses withOrg entirely
  return withOrg(session, (org) => prisma.project.findMany({ where: { orgId: org.id } }));
}

// ✅ correct — CLAUDE.md updated in the same diff to state the admin exception
export async function listProjects(session: Session, opts: { admin?: boolean }) {
  if (opts.admin) return prisma.project.findMany(); // admin bypass — see CLAUDE.md
  return withOrg(session, (org) => prisma.project.findMany({ where: { orgId: org.id } }));
}
```

**B. Undocumented decision.** A suggestion, not a finding — no severity, never counted in the verdict, never a merge blocker. All three must hold before it qualifies:

1. **A real alternative existed.** The change commits to one of several defensible approaches with visible trade-offs: a concurrency/locking strategy, sync vs. queued, a new runtime dependency or external service, a data-model or tenancy shape, a retry/idempotency/timeout policy, a backfill or cutover strategy, an auth boundary, a public API contract, or a new convention future code will copy.
2. **The "why" is nowhere durable in the repo** — not in a doc, not in a comment at the decision site. A PR description, issue, or commit message does **not** count as durable — it's invisible to whoever opens the file later. But when the rationale _is_ there, quote it in the suggestion so the author can paste it in rather than rewrite it.
3. **A future reader would ask "why this way?" and be unable to answer from the code.**

Never suggest for: routine CRUD, a bug fix restoring already-intended behavior, a change that follows a convention the repo already documents, a dependency version bump, a behavior-preserving refactor, or anything a comment at the site already explains. Same discipline as Lens 4's conservatism — padding here is worse than silence.

```ruby
# ❌ wrong — a pessimistic lock where the rest of the repo uses optimistic
# locking (lock_version), with nothing explaining the departure
class SeatReservation
  def reserve!(seat)
    seat.with_lock { seat.update!(status: "reserved") }
  end
end

# ✅ correct — the rejected alternative and the reason are on record
class SeatReservation
  # Pessimistic lock, not the repo's usual lock_version: optimistic retries
  # were thrashing under the checkout-page burst. See decision record:
  # docs/decision-records/2026-08-21--seat-reservation-locking.md
  def reserve!(seat)
    seat.with_lock { seat.update!(status: "reserved") }
  end
end
```

Cap at **two suggestions per review** (`review.documentation.maxSuggestions`, default 2, see `references/config.md`). If more than two qualify, keep the two with the longest-lived consequences and drop the rest rather than listing every one.

Every suggestion proposes a concrete path for the doc, checked in this order:

1. An existing decision-records/ADR directory (`docs/decision-records/`, `docs/adr/`, `adr/`) — read two existing entries first and match their filename convention and heading structure exactly.
2. A `docs/` tree with no ADR directory — the existing page closest to the subject, or a new page beside it.
3. No `docs/` tree, but `AGENTS.md`/`CLAUDE.md` is where the repo states its conventions and the decision sets one — a section there.
4. No documentation home at all — propose creating `docs/decision-records/YYYY-MM-DD--<slug>.md`, and say plainly this introduces a new convention for the repo so the author can decline it as a one-off.

`review.documentation.decisionRecordsPath`, when set, overrides rungs 1–4 (`references/config.md`).

## Severity Ladder

- **critical** — exploitable now, or causes data loss/corruption, or leaks one tenant's/user's data to another. A missing auth/tenant scope check is always `critical` (see Lens 2).
- **high** — everything else in the correctness/security/coverage tier that isn't yet `critical`: correctness bugs without an active exploit path, a change touching a lot of logic (state transitions, auth/scoping guards, migrations) without a confirmed concrete failure, an uncovered (or stale-tested) acceptance criterion, and a diff that makes an authoritative doc (`AGENTS.md`/`CLAUDE.md`) assert something false (see Lens 5).
- **minor** — local style/naming nits with no behavioral risk, and a diff that makes a non-authoritative doc (a README, a `docs/` page) assert something false (see Lens 5).
- **Not a finding** — anything that conflicts with a documented repo convention the code correctly follows, or a preference with no concrete failure path or cited convention behind it.

Documentation _suggestions_ (Lens 5B) carry no severity, are never counted in the verdict, and never block a merge — they're reported separately from findings.

## Conservatism

Every finding needs either a concrete failure scenario (specific inputs or state that produce a wrong result or crash) or a cited convention it violates. A preference with no behavioral or documented-convention basis is not a finding — leave it out rather than padding the list. Zero findings on a clean diff is the correct, expected outcome, not a sign the review was too shallow.

## Repo-Specific Focus (extraFocus)

If `.eagerworks/pr-review.json` supplies `review.extraFocus` entries (see `references/config.md`), treat each as an additional required check on top of the five lenses above — read them as repo-specific known risk areas, e.g. "every quiz-scoped query must filter by `orgId`, not just `quizId`".
