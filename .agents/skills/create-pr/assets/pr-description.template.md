<!--
  Copyable PR description skeleton. Fill in every section with real content —
  delete a section only if references/description.md's checklist derivation or
  pr.sections says it doesn't apply. Every paragraph below is one line in the
  source; don't hand-wrap it. See references/description.md for the full rules,
  and references/manual-test-cases.md for the Test plan -> Manual subsection.
-->

## Summary

<One to three sentences: what this PR does and why it matters.>

## Problem

<What was broken or missing — concrete evidence: file paths, error messages, measured numbers.>

## Solution

<How it was solved and why that approach — key decisions and trade-offs, not a line-by-line retelling of the diff.>

## Screenshots

<!-- Required when the change is visible in the UI. See references/screenshots.md. -->
<!-- ![Alt text](./path/to/screenshot.png) -->

## Test plan

### Automated

<!-- Exact commands and the observed result, e.g. "npm test — 88/88 passed" -->

### Manual

<!-- Tickable scenarios for whoever reviews this PR's quality — see references/manual-test-cases.md. -->
<!-- Say "_None — <reason>_" instead of omitting this subsection when nothing observable changed. -->
<!--
#### 1. <Actor + outcome, e.g. "A Viewer cannot delete a project">

**Setup:** <environment, actor/role, data state>.

- [ ] <one concrete, self-contained action>
- [ ] **Expected:** <the precise pass condition>
-->

## Checklist

<!-- Derived per-repo — see references/description.md. Example shape: -->

- [ ] `<test command>` — result: …
- [ ] Tests were added or updated for this change
- [ ] Documentation added or updated where it applies
- [ ] Screenshots or video attached when the change is visible in the UI
- [ ] No secrets or live keys in the diff
