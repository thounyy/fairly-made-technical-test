# Fairly Made — traceability take-home

Agent harness for a 4-hour Nuxt + NestJS take-home. The user owns every line and explains it at the debrief, without AI.

`GUIDELINES.md` is the problem. `docs/DECISIONS.md` is the only solution the agent may implement. Given facts live in `.cursor/rules/brief.mdc`. They are not choices.

## When to use what

| Situation | Invoke |
|---|---|
| Ambiguous task / new feature brief | `@clarify-feature` |
| Implementing one vertical slice | `@feature-slice` |
| After AI wrote code / before saying done | `@review-generated` |
| Closing the session / hand-back readiness | `@ship-check` |

Rules under `.cursor/rules/` apply automatically (core always; others by file glob).

## Session contract

1. Clarify success criteria before coding. An open decision blocks the slice that needs it.
2. One thin slice. Name it, the accepted decision it depends on, and the files. Wait for "go".
3. Stop after each slice: files touched, a plain-language explanation, risks, and what to verify.
4. Never call a slice done without a human review pass (`@review-generated`).
5. Browse and edit are the warm-up. A correction that survives a refresh is the heart. Record a cut in `docs/DECISIONS.md` instead of half-building every scenario.

## Out of scope

- Authentication, permissions, multi-tenancy
- Product or supplier creation — `data/` is the whole universe
- Deployment, Docker, CI, observability
- Pixel-perfect UI
- A persistence setup that costs real time
- Matching items or steps by label
- Partial or out-of-order refreshes
