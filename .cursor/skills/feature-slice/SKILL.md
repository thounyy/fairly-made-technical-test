---
name: feature-slice
description: >-
  Implements one vertical feature slice end-to-end, then stops for review.
  Use when building a slice whose decision in docs/DECISIONS.md is accepted
  and the user has said go.
disable-model-invocation: true
---

# Feature slice

## Instructions

Implement **exactly one** agreed slice, then stop. If the decision it needs is still `open`, do not write code. Name the decision and wait.

### Workflow

1. Restate the slice in one sentence, the accepted decision id, and the files you expect to touch.
2. Read existing patterns in neighboring modules; copy structure, naming, test style.
3. Implement the minimal change set.
4. Add or update the smallest useful verification. The test name states the behavior from `GUIDELINES.md` or the accepted decision.
5. Stop and report — do not start the next slice.

### Stop report format

```markdown
## Slice done
<one sentence>

## Decision
<id> — <what it says>

## Files
- path — why

## In plain language
<what the code does, so the user can say it at the debrief>

## Verify
<commands or manual steps>

## Risks / follow-ups
- ...

## Ready for
`@review-generated` then next slice: <name>
```

### Constraints

- No drive-by refactors.
- No new dependencies unless required and the user has accepted them.
- If blocked by an open decision, stop. Do not guess the correction model, the stored shape, or persistence.
