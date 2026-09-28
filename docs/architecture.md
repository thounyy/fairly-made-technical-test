# Architecture

How the session stores a tree, applies a correction, and freezes a version. `docs/scope.md` says which behaviors we build. This file says how. The same choices are marked `accepted` in `docs/DECISIONS.md`.

## What we store

Each product has three things.

- **Declared tree.** The latest whole document from the seed, or from a refresh. A refresh replaces it. It is not a patch.
- **Corrections.** A list of records the manager saved. A new edit of the same target replaces the previous record.
- **Published versions.** Copies of the working tree as it stood at publish time. Values only. A version has no link back to the declaration or the corrections.

The **working tree** is not stored. It is computed when the screen opens: start from the declared tree, then apply the corrections.

`lastChangedAt` is the last time that computed tree actually changed. Publishing does not move it. Applying the same refresh twice does not move it, and does not mark the product dirty. A product that has never been published shows that, and no dirty flag. It is dirty when a published version exists and `lastChangedAt` is later than that version's time.

Supplier names are joined from `data/suppliers.json` when the API answers. The domain keeps the supplier id. A null supplier or country stays null.

## A correction

One record per target. It is applied only when that target is still in the declared tree. When the target is gone, the record stays in the list and does not put the item or step back. There is no screen that lists those leftover records.

- **Set field.** `{ stepId, field: "supplierId" | "countryCode", value: string | null }`. A null value is a real correction. Applied when that step exists. An untouched field on the same step still comes from the declaration.
- **Add step.** `{ itemId, step }`. The server mints the step id. Applied when that item exists and the step id is not already in the declaration.
- **Set composition.** `{ componentId, composition }`. The whole list. The percentages must sum to 100. Applied when that component exists. A component the manager never edited still takes the refresh, including the jersey moving from 95/5 to 92/8.

The working tree marks each supplier, country, composition, and added step as a declaration or as a correction, because a record was applied there. A published version does not carry those marks.

## Publish

Publish copies the working tree and stores that copy as the next version. Opening it is read-only. A later edit rebuilds the working tree and leaves every copy as it was. A later refresh replaces the declared tree, rebuilds the working tree, and leaves every copy as it was.

## Where the rules live

```
api/src/domain/     plain TypeScript, no Nest imports
api/                one Nest module: load the seed, keep memory, map HTTP
web/                Nuxt. Renders the API response. Does not apply corrections.
```

Two sibling folders, two `package.json` files. No shared package and no workspace tool.

`apply`, the sum-to-100 check, and making the published copy live in the domain. Nest turns a failed check into `{ code, message }`. Vue has no store. The page loads what the route returns.

A restart loads the three seed trees again. Corrections and published versions, which live in the process, are gone. The README says that.

## Routes

- `GET /products` — the three products, the latest published version or never published, whether the working tree has changed since that publication, and `lastChangedAt`.
- `GET /products/:id/working-tree` — the resolved tree, with an origin mark on each supplier, country, composition, and added step.
- `POST` — one route for each edit (set field, add step, set composition), one to publish, one to refresh.
- `GET` a published version — the frozen copy, read-only.

The refresh route accepts a whole tree. The tee screen has one button, which posts `data/refreshes/tshirt-mariniere.refresh-2026-09-20.json`. The jacket and the scarf have no button.

## Tests

Jest, on the domain only. A test imports the plain functions and does not boot Nest or a browser. One test per behavior we ship: a correction applied, a composition that does not sum to 100 rejected, a published copy unchanged by a later refresh, the same refresh applied twice.

## Still a write-up, not a screen

The version diff, a screen that says the declaration disagrees and offers to drop a correction, a second refresh file, and a screen of corrections whose target has disappeared. The removal rule itself is `apply`: the record stays, the step does not come back. Packaging on the tee is the example, and the demo does not correct it.
