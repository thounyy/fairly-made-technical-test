# Scope

Four hours, from `GUIDELINES.md`. This file is what this session builds, and what it leaves as a written explanation.

It answers D5 and D7. It does not choose how the tree is stored. D1, D2, D3, D4, and D6 stay open until you accept them. Close those before scaffolding.

## Done

A sustainability manager can open the three seed products, see what is still unknown, correct the supplier or the country of a step, publish a version that stays put, and apply the tee refresh without losing that correction.

## Build

### List

- The three seed products: the striped tee `FM-TS-0142`, the denim jacket `FM-JK-0207`, the merino scarf `FM-AC-0031`.
- For each: the latest published version, or that it has never been published.
- Whether the working tree has changed since that publication. A product that was never published shows that, and no dirty flag.
- When the working tree last changed.

### Working tree

- The product, its components, and its materials. Each step shows its process, supplier, and country.
- A null supplier or country is shown as unknown. It stays null.
- Change the supplier of an existing step, chosen from `data/suppliers.json`.
- Change the country of an existing step.
- Add a step to an item: a process from `data/processes.json`, a supplier or unknown, a country or unknown.
- Edit a component's composition percentages. An edit whose percentages do not sum to 100 is rejected, with a clear message. `usagePercentage` is not that check.
- The seed is shown as it is. The jacket component `Denim 12 oz` (`itm_jk0207_c1`) sums to 98. We do not rewrite `data/`. The sum-to-100 rule applies to an edit the manager submits.
- Any of these edits shows on the working tree immediately and creates no version.

### One correction survives the tee refresh

Only a supplier or a country on a step that already exists.

- That value is still there after `data/refreshes/tshirt-mariniere.refresh-2026-09-20.json`.
- A supplier or country the manager did not change is taken from the refresh.
- Those two fields are marked as a declaration or as the manager's correction.
- Applying that same refresh again changes nothing.
- The jacket and the scarf have no refresh.

Demo, so a case we did not build stays out of it: on the tee, change the cutting step (`stp_a1`) country from PT to FR. That step is still in the refresh, still declared PT. After the refresh the country shown is FR, and it is marked as a correction. Leave packaging (`stp_a3`) and dyeing (`stp_b2`) alone. Finishing (`stp_b3`) and the jersey composition show the refresh, because they were not corrected.

### Publish

- Publish stores the working tree as it stands and makes that the latest published version.
- The manager can open any published version read-only.
- A later edit leaves every published version as it was.
- A later refresh leaves every published version as it was.

## Leave out

Each of these is still part of the problem. The README says how the model covers it. We do not code it.

| Left out | Why |
|---|---|
| What changed between two published versions | A second screen. The brief names this as a sound cut. Opening a past version read-only is enough to show that it held still. |
| "The declaration disagrees", and a way to drop a correction | The correction still wins without that screen. The jersey dyeing step, Tintoria Nord in IT against Malhas do Ave in PT, is the example to write up. |
| A corrected step that the refresh removes | Packaging disappears in the refresh. The demo does not correct it. The write-up says the step stays gone and the correction is kept. |
| A second, different refresh | One file ships with the brief. Applying that file twice shows the operation is stable. A later refresh is the same rule, described in writing. |
| A step the manager added, kept after a refresh | Adding a step works on the working tree. Keeping a step the declaration does not contain is the removal case from the other direction. |
| A composition the manager edited, kept after a refresh | The sum-to-100 check is in the editor. The jersey moving from 95/5 to 92/8 is an untouched fact, so the refresh is shown. A composition the manager had fixed is a correction we only explain. |

If the tree editor is still unfinished at the two-hour mark, drop "add a step" first. Supplier, country, publish, and the one refresh stay.

## Outside this product

The brief takes these off the table. They are not cuts.

- Authentication, permissions, several users, several brands.
- Creating products, suppliers, or process codes. `data/` is the catalogue.
- Supplier forms, impact scoring, eco-design, and the public passport page. They explain why a published version must hold still.
- Deployment, Docker, CI, observability.
- Pixel-perfect layout.
- Matching an item or a step by its label.
- A partial refresh, or a refresh that arrives out of order.
- A general merge engine.

## Check before stopping

- Editing a supplier creates no version.
- A composition edit that sums to anything but 100 is rejected. The jacket's existing 98 is still shown.
- Publishing, then editing, leaves the published version unchanged.
- The cutting-country correction is still FR after the tee refresh, and it is marked as a correction.
- Finishing, or the jersey composition, shows the refresh.
- Applying the refresh again changes nothing.
- The published version is unchanged by that refresh.
