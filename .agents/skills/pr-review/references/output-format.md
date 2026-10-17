# PR Review — Output Format

## Report Language

Every template on this page is shown in English — that's the built-in default. When `review.language` resolves to something else (`references/config.md` → "Report Language"), translate every human-facing string — headings, the verdict sentence, `**Failure:**`/`**Fix:**`/`**Where:**`/`**Rationale found:**` labels, `_(none)_`, captions, disclosure lines, and the footer — while keeping markdown structure, section order, severity ordering, finding counts, `file:line` anchors, code, commands, and URLs byte-identical to what the English template would produce.

**Never translated, in any language:** the `### FINDINGS` / `### END FINDINGS` / `### DOCUMENTATION` / `### END DOCUMENTATION` sentinels, their field keys (`id`, `severity`, `file`, `claim`, `failure`, `fix`, `subject`, `where`, `why`, `rationale`), the `critical | high | minor` enum, the literal `not stated`, and the `TODO(author):` prefix — these are a machine contract (see "Machine-Parseable Block" below) and translating them would break every parser. Only the prose _values_ inside those blocks (the `claim`/`failure`/`fix` sentences) follow `review.language`.

A Spanish worked example, `review.language: "es"`:

```markdown
## Revisión de PR

**Veredicto:** 1 crítico, 0 alto, 0 menor — no mergear hasta resolver el hallazgo crítico.

### Crítico

- **app/controllers/invoices_controller.rb:12** — `Invoice.find(params[:id])` no está scopeado a la organización del usuario actual.
  - **Falla:** un usuario autenticado de la Org A puede leer cualquier factura adivinando o incrementando el id, sin importar a qué organización pertenece.
  - **Arreglo:** scopear a través del caller — `current_user.organization.invoices.find(params[:id])`.

### Alto

_(ninguno)_

### Menor

_(ninguno)_
```

Its inline comment body (same finding, `commentStyle: "inline"`):

```markdown
**Crítico** — `Invoice.find(params[:id])` no está scopeado a la organización del usuario actual.

**Falla:** un usuario autenticado de la Org A puede leer cualquier factura adivinando o incrementando el id, sin importar a qué organización pertenece.

**Arreglo:** scopear a través del caller — `current_user.organization.invoices.find(params[:id])`.
```

Its machine-parseable block, **unchanged** — this is the exception in practice, not just in the abstract:

```text
### FINDINGS
- id: F1
  severity: critical
  file: app/controllers/invoices_controller.rb:12
  claim: Invoice.find(params[:id]) no está scopeado a la organización del usuario actual.
  failure: un usuario autenticado de la Org A puede leer cualquier factura adivinando o incrementando el id.
  fix: scopear a través del caller — current_user.organization.invoices.find(params[:id]).
### END FINDINGS
```

## Markdown Report (Default)

Use this format for a human reading the review in an IDE or terminal. One verdict line at the top, then findings grouped by severity, each with `file:line`, the claim, the concrete failure scenario, and a one-line fix.

```markdown
## PR Review

**Verdict:** 1 critical, 1 high, 0 minor — do not merge until the critical finding is fixed.

### Critical

- **app/controllers/invoices_controller.rb:12** — `Invoice.find(params[:id])` is not scoped to the current user's organization.
  - **Failure:** an authenticated user from Org A can read any invoice by guessing or incrementing the id, regardless of which org it belongs to.
  - **Fix:** scope through the caller — `current_user.organization.invoices.find(params[:id])`.

### High

- **spec/requests/invoices_spec.rb** — acceptance criterion "a user cannot view another org's invoice" has no test.
  - **Failure:** nothing currently asserts the 404/403 behavior for a cross-org request; the scoping bug above could regress silently.
  - **Fix:** add a request spec that logs in as a user from Org B and asserts a 404 on Org A's invoice id.

### Minor

_(none)_

### Documentation

_(suggestions — not merge blockers, not counted in the verdict)_

- **Pessimistic lock in `SeatReservation#reserve!` instead of the repo's usual optimistic `lock_version`** — no comment or doc explains why; a future reader can't tell this was deliberate.
  - **Where:** `docs/decision-records/2026-08-21--seat-reservation-locking.md` — matching this repo's existing `YYYY-MM-DD--slug.md` convention.
  - **Rationale found:** the PR description says "optimistic retries were thrashing under the checkout-page burst" — worth capturing; it isn't in the repo anywhere.

_Skipped by ignorePaths: package-lock.json, src/generated/\*\*_
```

Only include the `_Skipped by ignorePaths: ..._` line when `.eagerworks/pr-review.json` sets `review.ignorePaths` and at least one touched file matched — see `references/config.md`. Omit it entirely otherwise; never print it empty.

Only include the `### Documentation` section when there's at least one suggestion — unlike the severity sections, **do not** print `_(none)_` for an empty documentation section; the verdict line already proves the review ran, and a section that's always present even when empty is exactly the noise this lens is designed to avoid. The `**Verdict:**` line itself only counts findings — a review with documentation suggestions and zero findings still reads e.g. "0 critical, 0 high, 0 minor".

When `.eagerworks/pr-review.json` sets `review.documentation.enabled: false` (`references/config.md`), Lens 5 doesn't run at all — no doc-drift findings, no suggestions — and the report says so with its own disclosure line, same principle as `ignorePaths`:

```markdown
_Documentation lens disabled by config._
```

When there is nothing to report, say so plainly instead of omitting the section:

```markdown
## PR Review

**Verdict:** 0 findings. The diff follows the repo's existing scoping and error-handling patterns; no correctness, security, or coverage gaps found.
```

## Machine-Parseable Block (Optional)

Use this when another skill, script, or agent needs to parse the output mechanically — for example, feeding findings into an automated fix loop. Not needed for a human reading the review directly. The `claim`/`failure`/`fix` (and `subject`/`where`/`why`/`rationale`) prose values follow `review.language` like everything else, but the sentinels, field keys, and severity enum never do — see "Report Language" above.

```text
### FINDINGS
- id: F1
  severity: critical | high | minor
  file: path/to/file.rb:12
  claim: <one line — what is wrong>
  failure: <one line — concrete inputs/state producing the wrong outcome>
  fix: <one line — the concrete change>
### END FINDINGS
```

If there is nothing to report, return the literal empty block — never replace it with prose like "looks good" or "no issues found", since a caller parsing this block mechanically expects exactly one of the two shapes:

```text
### FINDINGS
### END FINDINGS
```

Doc drift (Lens 5A) is a normal finding and belongs in the `### FINDINGS` block above like any other. Documentation _suggestions_ (Lens 5B) get their own parallel block, since they carry no severity and aren't findings:

```text
### DOCUMENTATION
- id: D1
  subject: <one line — the decision that was made>
  where: <proposed path, e.g. docs/decision-records/2026-08-21--seat-reservation-locking.md>
  why: <one line — the alternative it beat and why a future reader can't tell>
  rationale: <sourced quote from the PR/issue/commit/code, or the literal `not stated`>
### END DOCUMENTATION
```

If there are no suggestions, return the literal empty block, same rule as `### FINDINGS`:

```text
### DOCUMENTATION
### END DOCUMENTATION
```

## Inline Review Comments (default `commentStyle`)

When `review.commentStyle` is `"inline"` (the default — `references/config.md`), the report is split across a GitHub review's inline comments and its summary body instead of one flat comment. See `references/workflow.md` → "Inline mode" for how a finding is decided anchorable vs. unanchorable. Both halves follow `review.language` — they're never posted in different languages from each other or from the console report.

**Inline comment body** — one per anchorable finding, posted on its exact line. Same prose the console report uses for that finding, just without repeating the `file:line` prefix (GitHub already shows the line):

```markdown
**Critical** — `Invoice.find(params[:id])` is not scoped to the current user's organization.

**Failure:** an authenticated user from Org A can read any invoice by guessing or incrementing the id, regardless of which org it belongs to.

**Fix:** scope through the caller — `current_user.organization.invoices.find(params[:id])`.
```

**Review summary body** — the verdict line, then every severity section as a one-line scannable index for anchored findings, with unanchorable findings kept in full (same shape as the plain markdown report above) so nothing is lost:

```markdown
## PR Review

**Verdict:** 1 critical, 1 high, 0 minor — do not merge until the critical finding is fixed.

### Critical

- **app/controllers/invoices_controller.rb:12** — not scoped to the current user's organization. _(commented inline)_

### High

- **spec/requests/invoices_spec.rb** — acceptance criterion "a user cannot view another org's invoice" has no test.
  - **Failure:** nothing currently asserts the 404/403 behavior for a cross-org request; the scoping bug above could regress silently.
  - **Fix:** add a request spec that logs in as a user from Org B and asserts a 404 on Org A's invoice id.

### Minor

_(none)_

### Documentation

_(suggestions — not merge blockers, not counted in the verdict)_

...

---

_Posted by the [eagerworks pr-review](https://github.com/eagerworks/skills/tree/main/skills/pr-review) skill._
```

The High-severity example above stays in the body **in full** because it has no line number to anchor to (it names a whole file, `spec/requests/invoices_spec.rb`) — never shorten an unanchorable finding to an index line just because anchored ones are shortened. The verdict counts every finding regardless of where it ended up.

Never post the `### FINDINGS` / `### DOCUMENTATION` machine-parseable blocks in either the inline comments or the summary body — those are for scripts, not for people reading the PR. Never hard-wrap lines — let GitHub wrap them.

Zero findings still posts a review — just with an empty `comments` array and the same two-line "0 findings" summary body plus footer, same rule as the summary format below.

## PR Comment (`commentStyle: "summary"`, and the inline-mode fallback)

This is the format used when `review.commentStyle` is `"summary"`, and also the fallback body when inline mode's review POST fails even after a retry (`references/workflow.md` → "Handle a 422"). The comment body is the **markdown report above, verbatim** — same verdict line, same severity sections, same Documentation section, same disclosure lines. Don't reformat, summarize, or reorder it for the PR: the comment must read exactly like the console output, so a teammate reading the PR sees what the author saw. Append one footer line so readers know where the comment came from:

```markdown
## PR Review

**Verdict:** 1 critical, 1 high, 0 minor — do not merge until the critical finding is fixed.

### Critical

- **app/controllers/invoices_controller.rb:12** — `Invoice.find(params[:id])` is not scoped to the current user's organization.
  - **Failure:** an authenticated user from Org A can read any invoice by guessing or incrementing the id, regardless of which org it belongs to.
  - **Fix:** scope through the caller — `current_user.organization.invoices.find(params[:id])`.

### High

…

---

_Posted by the [eagerworks pr-review](https://github.com/eagerworks/skills/tree/main/skills/pr-review) skill._
```

Never hard-wrap lines — let GitHub wrap them. Never post an empty comment: a review with zero findings posts the same two-line "0 findings" report shown above, plus the footer. Never post the `### FINDINGS` / `### DOCUMENTATION` machine-parseable blocks — those are for scripts, not for people reading the PR.
