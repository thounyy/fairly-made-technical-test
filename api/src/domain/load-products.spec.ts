import { resolve } from 'node:path';
import { loadProducts } from './load-products';
import { ComponentItem, Item } from './product';

const treesDirectory = resolve(__dirname, '../../../data/trees');

describe('loadProducts', () => {
  it('loads the three seed trees with empty corrections and keeps the jacket composition', () => {
    const products = loadProducts(treesDirectory);

    expect(products.map((product) => product.reference).sort()).toEqual([
      'FM-AC-0031',
      'FM-JK-0207',
      'FM-TS-0142',
    ]);

    for (const product of products) {
      expect(product.corrections).toEqual([]);
      expect(product.versions).toEqual([]);
    }

    const tee = products.find((product) => product.reference === 'FM-TS-0142');
    expect(tee?.lastChangedAt).toBe('2026-06-14T09:12:00.000Z');
    const packaging = tee?.declaredTree.steps.find(
      (step) => step.id === 'stp_a3',
    );
    expect(packaging?.supplierId).toBeNull();
    expect(packaging?.countryCode).toBe('PT');

    const jacket = products.find(
      (product) => product.reference === 'FM-JK-0207',
    );
    const denim = jacket
      ? findComponent(jacket.declaredTree, 'itm_jk0207_c1')
      : undefined;
    const compositionSum =
      denim?.composition.reduce((total, line) => total + line.percentage, 0) ??
      0;
    expect(compositionSum).toBe(98);
  });
});

function findComponent(item: Item, id: string): ComponentItem | undefined {
  if (item.kind === 'COMPONENT' && item.id === id) {
    return item;
  }
  for (const child of item.children) {
    const found = findComponent(child, id);
    if (found) {
      return found;
    }
  }
  return undefined;
}
