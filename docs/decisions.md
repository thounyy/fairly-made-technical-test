# Decisions

What gets built. `GUIDELINES.md` is the problem. Only rows marked `accepted` are the solution.

These rows were confirmed in chat. Detail lives in `docs/architecture.md` and `docs/scope.md`. Do not add a row or change a status unless asked.

## Accepted

### D1 — Layout and boundaries

Sibling folders `api/` and `web/`, each with its own `package.json`. No workspace and no shared package.

The rules live in `api/src/domain` as plain TypeScript, with no Nest imports. One Nest module loads the seed, keeps process memory, joins supplier names, and maps HTTP onto the domain. Nuxt renders the response and does not apply corrections. No Pinia.

REST. `GET /products`. `GET /products/:id/working-tree`, with an origin mark on each supplier, country, composition, and added step. `POST` for each edit, for publish, and for refresh. `GET` of a published version is read-only. Errors are `{ code, message }`.

Jest, on the domain only. One test per behavior we ship. No Nest boot and no browser tests.

Status: `accepted`

### D2 — What we store per product

The latest declared tree, replaced whole on refresh, and a list of corrections. The working tree is computed by `apply` when the screen opens. A published version is a copy of that result.

Status: `accepted`

### D3 — What a correction is

One record per target. A new edit of the same target replaces it. Applied only when the target is still in the declared tree. If the target is gone, the record stays and does not put the item or step back.

- Set field: `{ stepId, field: "supplierId" | "countryCode", value: string | null }`. The server mints an added step's id.
- Add step: `{ itemId, step }`.
- Set composition: `{ componentId, composition }`, the whole list, which must sum to 100.

The working tree marks a value as a correction when a record was applied. A published version does not carry those marks.

Status: `accepted`

### D4 — What publish freezes

A copy of the resolved tree at publish time. Values only, with no link back to the declaration or the corrections. Opening it is read-only. A later edit or refresh leaves every copy as it was.

`lastChangedAt` moves only when the resolved tree actually changes. A never-published product shows that, and no dirty flag.

Status: `accepted`

### D5 — Refresh cases in the timebox

Implemented, through `apply` and the published copy:

- A saved supplier, country, added step, or composition is still applied after the tee refresh, when its target is still in the declaration.
- Applying that same refresh twice changes nothing.
- A step the refresh removes is not put back. Its correction stays in the list. There is no screen of those leftover records.
- A published version does not move.

Written up, not built as a screen or a second file:

- A later, different refresh. The same `apply` covers it. We ship one refresh file.
- A contradicting declaration is shown, and the manager can drop the correction. The correction still wins without that screen. Dyeing on the tee, Tintoria Nord in IT against Malhas do Ave in PT, is the example.

Status: `accepted`

### D6 — Persistence and triggering a refresh

In memory, inside the Nest process. Startup loads the three seed trees. A restart drops corrections and published versions.

The tee has a button that posts `data/refreshes/tshirt-mariniere.refresh-2026-09-20.json`. The route still accepts a whole tree. The jacket and the scarf have no button.

Status: `accepted`

### D7 — Cuts

No screen for these. The README says how the model covers them.

- What changed between two published versions. A past version opens read-only.
- "The declaration disagrees", and a way to drop a correction.
- A list of corrections whose target the refresh removed.
- A second, different refresh file.

If the tree editor is still unfinished at the two-hour mark, drop "add a step" first.

Status: `accepted`

## Open

_None._

## Slices

A slice stays locked until you say `go` and name it. The decisions it needs are accepted.

| Slice | Needs | Does |
|---|---|---|
| S0 | — | Note anything surprising in `data/`. No app code. |
| S1 | D1, D2 | Scaffold and load the three seed trees as the stored model. |
| S2 | D1, D2 | Browse: list products, latest published or never published, working tree changed or not, last change time. |
| S3 | D2, D3 | Edit the working tree: supplier, new step, composition. Reject a composition that does not sum to 100. No version created. |
| S4 | D4 | Publish. Past versions stay as they were. |
| S5 | D3, D5, D6 | Apply the tee refresh. Corrections behave as D5 says. |
