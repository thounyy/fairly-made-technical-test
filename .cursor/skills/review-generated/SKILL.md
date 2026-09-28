---
name: review-generated
description: >-
  Reviews AI-generated or freshly written diffs for correctness against
  GUIDELINES.md and accepted decisions, before calling a slice done.
disable-model-invocation: true
---

# Review generated code

## Instructions

Review the current change set (git diff and/or files just edited). Be adversarial. The user has to explain this diff without AI.

### Checklist

**Ownership**
- [ ] Every behavior maps to an accepted decision or a given fact in the brief
- [ ] No new domain term the user did not accept
- [ ] The user could explain the control flow out loud

**Correctness**
- [ ] Matches the slice; no silent scope drop or scope add
- [ ] A null supplier or country is kept, not defaulted and not rejected
- [ ] Composition sum-to-100 is enforced only if this slice edits composition. `usagePercentage` is not that check
- [ ] A refresh does not rewrite a published version, if this slice touches either
- [ ] Identity uses stable ids, not labels

**Types & structure**
- [ ] No unjustified `any`
- [ ] Domain rules are not buried in a controller, resolver, or Vue component

**UI**
- [ ] Unknown, loading, and error are distinguishable
- [ ] A corrected value can be told from a declaration, if this slice shows corrections

**Tests**
- [ ] At least one verification path exists
- [ ] The test name states the behavior

### Output format

```markdown
## Verdict
SHIP | SHIP WITH FIXES | BLOCK

## Must fix
- file:line (if known) — issue — suggested fix

## Should fix
- ...

## Acceptable debt (time-box)
- ...

## What I would test manually
1. ...
```

### Rules

- Prefer concrete file references over generic advice.
- If nothing is wrong, say SHIP and still list the manual test path.
- Do not rewrite the feature unless the user asks. List fixes first.
