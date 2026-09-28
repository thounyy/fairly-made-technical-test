import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  apply,
  findResolvedComponent,
  findResolvedItem,
  findResolvedStep,
} from './apply';
import { addStep, setComposition, setCountry } from './edit-tree';
import { loadProducts } from './load-products';
import { toProductListItem } from './product-list';
import { DomainError, Product } from './product';
import { publish } from './publish';
import { refresh } from './refresh';

const processes = new Set(['KNITTING']);
const changedAt = '2099-01-01T00:00:00.000Z';

function product(reference: string): Product {
  const found = loadProducts(resolve(__dirname, '../../../data/trees')).find(
    (entry) => entry.reference === reference,
  );
  if (!found) {
    throw new Error(`${reference} missing`);
  }
  return found;
}

function teeRefresh(): unknown {
  const contents = readFileSync(
    resolve(
      __dirname,
      '../../../data/refreshes/tshirt-mariniere.refresh-2026-09-20.json',
    ),
    'utf8',
  );
  return JSON.parse(contents) as unknown;
}

describe('refresh', () => {
  it('keeps a corrected country and takes the refresh for everything left untouched', () => {
    const corrected = setCountry(product('FM-TS-0142'), 'stp_a1', 'FR');
    const refreshed = refresh(corrected, teeRefresh(), changedAt);
    const tree = apply(refreshed);
    const jersey = findResolvedComponent(tree, 'itm_ts0142_c1');

    expect(findResolvedStep(tree, 'stp_a1')).toMatchObject({
      countryCode: 'FR',
      countryOrigin: 'correction',
      supplierId: 'sup_1f3a',
      supplierOrigin: 'declaration',
    });
    expect(findResolvedStep(tree, 'stp_b2')).toMatchObject({
      supplierId: 'sup_2b7c',
      countryCode: 'PT',
      supplierOrigin: 'declaration',
      countryOrigin: 'declaration',
    });
    expect(findResolvedStep(tree, 'stp_b3')).toMatchObject({
      supplierId: 'sup_1f3a',
      countryCode: 'PT',
      supplierOrigin: 'declaration',
      countryOrigin: 'declaration',
    });
    expect(jersey?.composition).toMatchObject({
      origin: 'declaration',
      lines: [
        { id: 'cmp_c1_1', percentage: 92 },
        { id: 'cmp_c1_2', percentage: 8 },
      ],
    });
    expect(findResolvedStep(tree, 'stp_a3')).toBeUndefined();
    expect(findResolvedItem(tree, 'itm_ts0142_c5')?.label).toBe(
      'Renfort col thermocollant',
    );
    expect(findResolvedStep(tree, 'stp_c3')).toMatchObject({
      process: 'SPINNING',
      supplierId: 'sup_6a15',
      countryCode: 'CN',
    });
    expect(refreshed.lastChangedAt).toBe(changedAt);
    expect(refreshed.corrections).toBe(corrected.corrections);
  });

  it('keeps a saved composition after the refresh', () => {
    const corrected = setComposition(product('FM-TS-0142'), 'itm_ts0142_c1', [
      { id: 'cmp_c1_1', percentage: 90 },
      { id: 'cmp_c1_2', percentage: 10 },
    ]);
    const jersey = findResolvedComponent(
      apply(refresh(corrected, teeRefresh(), changedAt)),
      'itm_ts0142_c1',
    );

    expect(jersey?.composition).toMatchObject({
      origin: 'correction',
      lines: [
        { id: 'cmp_c1_1', percentage: 90 },
        { id: 'cmp_c1_2', percentage: 10 },
      ],
    });
  });

  it('keeps an added step on an item the refresh still contains', () => {
    const corrected = addStep(
      product('FM-TS-0142'),
      'itm_ts0142_root',
      { process: 'KNITTING', supplierId: null, countryCode: 'FR' },
      processes,
      new Set(),
    );
    const added = apply(refresh(corrected, teeRefresh(), changedAt)).steps.find(
      (step) => step.origin === 'correction',
    );

    expect(added).toMatchObject({
      process: 'KNITTING',
      supplierId: null,
      countryCode: 'FR',
    });
  });

  it('does not put back a removed step, and keeps that correction', () => {
    const corrected = setCountry(product('FM-TS-0142'), 'stp_a3', 'FR');
    const refreshed = refresh(corrected, teeRefresh(), changedAt);

    expect(findResolvedStep(apply(refreshed), 'stp_a3')).toBeUndefined();
    expect(refreshed.corrections).toEqual([
      {
        kind: 'set-field',
        stepId: 'stp_a3',
        field: 'countryCode',
        value: 'FR',
      },
    ]);
  });

  it('changes nothing when the same refresh is applied twice', () => {
    const once = refresh(product('FM-TS-0142'), teeRefresh(), changedAt);
    const twice = refresh(once, teeRefresh(), '2099-06-01T00:00:00.000Z');

    expect(twice.lastChangedAt).toBe(once.lastChangedAt);
    expect(twice.corrections).toBe(once.corrections);
    expect(twice.versions).toBe(once.versions);
    expect(apply(twice)).toEqual(apply(once));
  });

  it('leaves a published version unchanged', () => {
    const published = publish(
      product('FM-TS-0142'),
      '2026-09-01T00:00:00.000Z',
    );
    const refreshed = refresh(published, teeRefresh(), changedAt);
    const frozen = refreshed.versions[0]?.tree;

    expect(frozen).toBe(published.versions[0]?.tree);
    expect(findResolvedStep(apply(refreshed), 'stp_a3')).toBeUndefined();
    expect(frozen?.steps.map((step) => step.id)).toContain('stp_a3');
    expect(toProductListItem(refreshed)).toMatchObject({
      version: 1,
      workingTreeChanged: true,
    });
  });

  it('rejects a refresh for a different product', () => {
    expect(() =>
      refresh(product('FM-JK-0207'), teeRefresh(), changedAt),
    ).toThrow(DomainError);
    expect(() =>
      refresh(product('FM-JK-0207'), teeRefresh(), changedAt),
    ).toThrow('Refresh is for a different product.');
  });
});
