import { resolve } from 'node:path';
import { apply, findResolvedComponent, findResolvedStep } from './apply';
import { addStep, setComposition, setCountry, setSupplier } from './edit-tree';
import { loadProducts } from './load-products';
import { DomainError, Product } from './product';

const suppliers = new Set(['sup_1f3a', 'sup_7f60']);
const processes = new Set(['KNITTING']);

function tee(): Product {
  const product = loadProducts(resolve(__dirname, '../../../data/trees')).find(
    (entry) => entry.reference === 'FM-TS-0142',
  );
  if (!product) {
    throw new Error('tee missing');
  }
  return product;
}

describe('edit the working tree', () => {
  it('changes a supplier on the working tree and creates no version', () => {
    const original = tee();
    const edited = setSupplier(original, 'stp_a1', 'sup_7f60', suppliers);
    const cutting = findResolvedStep(apply(edited), 'stp_a1');

    expect(cutting).toMatchObject({
      supplierId: 'sup_7f60',
      supplierOrigin: 'correction',
      countryCode: 'PT',
      countryOrigin: 'declaration',
    });
    expect(edited.versions).toBe(original.versions);
    expect(edited.corrections).toHaveLength(1);
    expect(edited.lastChangedAt).not.toBe(original.lastChangedAt);
  });

  it('changes a country and leaves the supplier as a declaration', () => {
    const edited = setCountry(tee(), 'stp_a1', 'FR');
    expect(findResolvedStep(apply(edited), 'stp_a1')).toMatchObject({
      countryCode: 'FR',
      countryOrigin: 'correction',
      supplierId: 'sup_1f3a',
      supplierOrigin: 'declaration',
    });
    expect(edited.versions).toHaveLength(0);
  });

  it('does not move the clock when the same correction is saved again', () => {
    const once = setSupplier(tee(), 'stp_a1', 'sup_7f60', suppliers);
    const twice = setSupplier(once, 'stp_a1', 'sup_7f60', suppliers);

    expect(twice.lastChangedAt).toBe(once.lastChangedAt);
    expect(twice.corrections).toHaveLength(1);
  });

  it('rejects a composition that does not sum to 100 and leaves the tree unchanged', () => {
    const original = tee();
    expect(() =>
      setComposition(original, 'itm_ts0142_c1', [
        { id: 'cmp_c1_1', percentage: 40 },
        { id: 'cmp_c1_2', percentage: 40 },
      ]),
    ).toThrow(DomainError);
    try {
      setComposition(original, 'itm_ts0142_c1', [
        { id: 'cmp_c1_1', percentage: 40 },
        { id: 'cmp_c1_2', percentage: 40 },
      ]);
    } catch (error) {
      expect(error).toMatchObject({
        code: 'COMPOSITION_INVALID',
        message: 'Composition percentages must sum to 100.',
      });
    }
    expect(original.corrections).toEqual([]);
  });

  it('saves a composition that sums to 100 as a correction and creates no version', () => {
    const original = tee();
    const edited = setComposition(original, 'itm_ts0142_c1', [
      { id: 'cmp_c1_1', percentage: 90 },
      { id: 'cmp_c1_2', percentage: 10 },
    ]);
    const jersey = findResolvedComponent(apply(edited), 'itm_ts0142_c1');

    expect(jersey?.composition.origin).toBe('correction');
    expect(jersey?.composition.lines.map((line) => line.percentage)).toEqual([
      90, 10,
    ]);
    expect(edited.versions).toBe(original.versions);
  });

  it('adds a step on the item and marks it as a correction', () => {
    const edited = addStep(
      tee(),
      'itm_ts0142_root',
      { process: 'KNITTING', supplierId: null, countryCode: 'FR' },
      processes,
      suppliers,
    );
    const added = apply(edited).steps.find(
      (step) => step.origin === 'correction',
    );

    expect(added).toMatchObject({
      process: 'KNITTING',
      supplierId: null,
      countryCode: 'FR',
      origin: 'correction',
    });
    expect(edited.versions).toHaveLength(0);
  });

  it('keeps a correction whose step is gone and does not put the step back', () => {
    const original = tee();
    const withGhost: Product = {
      ...original,
      corrections: [
        {
          kind: 'set-field',
          stepId: 'stp_missing',
          field: 'countryCode',
          value: 'FR',
        },
      ],
    };
    const tree = apply(withGhost);

    expect(findResolvedStep(tree, 'stp_missing')).toBeUndefined();
    expect(findResolvedStep(tree, 'stp_a3')).toMatchObject({
      supplierId: null,
      countryCode: 'PT',
    });
    expect(withGhost.corrections).toHaveLength(1);
  });

  it('shows the jacket composition that sums to 98 as a declaration', () => {
    const jacket = loadProducts(resolve(__dirname, '../../../data/trees')).find(
      (entry) => entry.reference === 'FM-JK-0207',
    );
    const denim = jacket
      ? findResolvedComponent(apply(jacket), 'itm_jk0207_c1')
      : undefined;
    const sum =
      denim?.composition.lines.reduce(
        (total, line) => total + line.percentage,
        0,
      ) ?? 0;

    expect(sum).toBe(98);
    expect(denim?.composition.origin).toBe('declaration');
  });
});
