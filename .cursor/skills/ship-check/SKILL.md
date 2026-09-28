---
name: ship-check
description: >-
  Closes the take-home: demo path, what was cut, residual risks, and the
  hand-back artifacts in GUIDELINES.md. Use before presenting or ending the session.
disable-model-invocation: true
---

# Ship check

## Instructions

Produce a closing brief the user can defend at the debrief.

### Output format

```markdown
## Demo script (2–3 min)
1. ...
2. ...
3. ...

## Done
- ...

## Not done (explicit)
- scenario — where the write-up should say how the model would cover it

## Hand-back still missing
- README sections: how to run, how you read the problem, model and architecture, how a correction survives a refresh, versioning, cuts, where AI was used
- TIMEBOX.md (about five lines)
- one-pager or slides: where this sits next to impact, eco-design, and the public page

## Verify commands
```bash
# paste exact commands
```

## Residual risks
- severity: note

## If we had one more hour
1. ...
```

### Rules

- Be honest about gaps. A written cut beats a half-working scenario.
- Prefer a working correction-survives-one-refresh path over a partial merge engine.
- Link risks to concrete code paths when possible.
