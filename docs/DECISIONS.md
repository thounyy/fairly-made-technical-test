# Decisions

What gets built. `GUIDELINES.md` is the problem. Only rows marked `accepted` are the solution.

The agent does not edit this file. Accept a row by changing its status here, or by saying `accept D3` in chat.

## Accepted

_None yet._

## Open

### D1 — Layout and boundaries

Where the repo, the Nest modules, and the Nuxt app split. API style (REST or GraphQL). Test runner. Which boundaries exist before any scaffold.

Status: `open`

### D2 — What we store per product

The working view has two writers: a full declared tree from collection, and brand corrections. What is stored, and what is computed when the screen opens.

Status: `open`

### D3 — What a correction is

Which fields can be corrected. What is persisted (the new value, the field it overrides, how it points at an item or step). What the screen shows so a value is visibly a declaration or a correction.

Status: `open`

### D4 — What publish freezes

What a version contains, and why a later edit or refresh cannot change it. Whether a past version can be opened read-only in this timebox.

Status: `open`

### D5 — Refresh cases in the timebox

Which of these will be implemented, and which will be written up only:

- one correction still applied after a refresh
- the same correction still applied after later refreshes
- applying the same refresh twice changes nothing
- a contradicting declaration is shown, and the correction can be dropped
- a removed step is not resurrected, and its correction is not silently deleted
- a published version does not move

Status: `open`

### D6 — Persistence and triggering a refresh

In-memory or SQLite. How a refresh is fed in (endpoint, button, or both).

Status: `open`

### D7 — Cuts

What we will not build in the 4 hours, and the one-line reason.

Status: `open`

## Slices

A slice stays locked until the decisions in its row are `accepted`. Then say `go` and name the slice.

| Slice | Needs | Does |
|---|---|---|
| S0 | — | Note anything surprising in `data/`. No app code. |
| S1 | D1, D2 | Scaffold and load the three seed trees as the stored model. |
| S2 | D1, D2 | Browse: list products, latest published or never published, working tree changed or not, last change time. |
| S3 | D2, D3 | Edit the working tree: supplier, new step, composition. Reject a composition that does not sum to 100. No version created. |
| S4 | D4 | Publish. Past versions stay as they were. |
| S5 | D3, D5, D6 | Apply the tee refresh. Corrections behave as D5 says. |
