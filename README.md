# Traceability

One brand user browses three products, corrects the working tree, publishes a version, and applies one refresh. A published version stays as it was. A correction stays when the refresh still contains its target.

The design record is `docs/architecture.md`. What we build and what we leave out is `docs/scope.md`.

## Run

Install once in each folder, then start the API from `api/` so it can read `../data`.

```bash
cd api && npm install && npm run start:dev
cd web && npm install && npm run dev
```

The API is http://localhost:3000. The app is http://localhost:3001.

```bash
cd api && npm test
```

Restarting the API loads the three seed trees again. Corrections and published versions live in the process, so a restart drops them.

## What is stored

Each product keeps three things.

- The **declared tree** is the latest whole document, from the seed or from a refresh. A refresh replaces it. It is not a patch.
- A **correction** is one record for one target. Editing that target again replaces the record. The record is applied only while the target is still in the declared tree.
- A **published version** is a copy of the working tree at publish time. Values only. It has no link back to the declaration or the corrections.

The **working tree** is not stored. Opening the page starts from the declared tree and applies the corrections. A supplier, a country, a composition, or an added step is marked as a declaration or as a correction. A published version has no such marks.

`lastChangedAt` moves only when that computed tree actually changes. Publishing does not move it. Applying the same refresh twice does not move it. The list shows a product as never published until a version exists. After that, it is changed only when `lastChangedAt` is later than that version.

A null supplier or country is information. It stays null. The API joins supplier names when it answers. The domain keeps the supplier id.

A submitted composition must sum to 100. `usagePercentage` is not that check. The jacket component Denim 12 oz (`itm_jk0207_c1`) already sums to 98. We show it and we do not rewrite `data/`.

## Walk-through

On the striped tee, `FM-TS-0142`:

1. Change the cutting step (`stp_a1`) country from PT to FR. The working tree shows FR, marked as a correction. No version exists yet.
2. Publish. Version 1 is that tree, including FR, and it is read-only.
3. Apply refresh. The button posts `data/refreshes/tshirt-mariniere.refresh-2026-09-20.json`. Cutting is still FR and still marked as a correction, because that step is still in the file and the file still says PT. The jersey composition, which was not edited, shows 92/8 from the refresh. Finishing (`stp_b3`) shows the refresh, Textil Duarte in PT, because it was not corrected. Packaging (`stp_a3`) is gone. Version 1 still has packaging and the jersey at 95/5.
4. Apply refresh again. The working tree and `lastChangedAt` stay as they are.

The jacket and the scarf have no refresh button.

## What we did not build a screen for

These four are still part of the problem. The same model covers them. We did not add a screen.

### What changed between two versions

Each published version is a plain tree, copied at publish time. A diff would walk two copies by item id and step id and list the values that differ. Opening a past version read-only is enough to see that the copy held still. We do not compute the diff.

### The declaration disagrees

The correction wins, and we do not show the disagreement or offer to drop it.

The jersey dyeing step (`stp_b2`) is the example. The seed says Tintoria Nord (`sup_3e91`) in IT. The 20 September refresh says Malhas do Ave (`sup_2b7c`) in PT. If the manager had saved a supplier on that step, the refresh would still show the saved supplier, marked as a correction. Dropping it would delete that one record and apply again, so the declared supplier would show through. There is no such action. Left untouched, dyeing shows the refresh.

### A correction whose target disappeared

Packaging (`stp_a3`) is in the seed and absent from the refresh. If the manager had corrected it, the record would stay in the list and `apply` would not put the step back. There is no page that lists those leftover records. The walk-through does not correct packaging, so the step simply disappears.

### A later, different refresh

One refresh file ships with the brief. Applying that file twice shows the replacement is stable. A later file is the same operation: replace the declared tree, then apply. A correction stays when its item or step id is still in the new document. A new id is a new item or step. An id that is gone is not matched by its label.

## Out of scope

Authentication, several users, and creating products or suppliers. `data/` is the whole catalogue. No deployment, and no partial or out-of-order refresh.

## Using AI

I used AI from end to end, with a harness that constrained how it could work. The harness is `AGENTS.md` and the rules in `.cursor/rules/`. It could implement only a decision marked accepted in `docs/decisions.md`, one slice at a time, and it could not accept a decision itself. Scope, architecture, and the cuts were chosen before the code that depends on them.
