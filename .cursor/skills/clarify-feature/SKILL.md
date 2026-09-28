---
name: clarify-feature
description: >-
  Turns a vague feature request into a short spec with acceptance criteria,
  out-of-scope list, and an implementation slice plan. Use at the start of a
  pair session or when requirements are unclear before coding.
disable-model-invocation: true
---

# Clarify feature

## Instructions

Before writing code, produce a compact spec the human can approve in under a minute. Ground it in one scenario from `GUIDELINES.md`. Do not close a row in `docs/DECISIONS.md`.

### Output format

```markdown
## Goal
<1–2 sentences>

## Acceptance criteria
- [ ] ...
- [ ] ...

## Out of scope
- ...

## Decisions this needs
- D? still open | accepted — why this slice needs it

## Data touchpoints
- Items, steps, or versions involved
- Nulls that are information, not errors

## API
- Only if an API style is already accepted. Otherwise say "blocked on D1".

## UI
- Screens / states (loading, empty, unknown, error, success)

## Slice plan (order)
1. ...

## Open questions
- <only unresolved blockers>
```

### Rules

- Max ~1 screen of text. Prefer bullets over prose.
- A default you would pick goes under **Assumptions**. It is not accepted until the user says so.
- Stop and wait for human confirmation before implementing.
