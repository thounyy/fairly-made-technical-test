import { resolve } from 'node:path';
import { loadProducts } from './load-products';
import { toProductListItem } from './product-list';
import { Item, Product, PublishedVersion } from './product';

const root: Item = {
  kind: 'PRODUCT',
  id: 'root',
  label: 'Tee',
  steps: [],
  children: [],
};

function product(versions: PublishedVersion[], lastChangedAt: string): Product {
  return {
    id: 'prd_ts0142',
    name: 'Marinière Manches Longues',
    reference: 'FM-TS-0142',
    declaredTree: root,
    corrections: [],
    versions,
    lastChangedAt,
  };
}

function version(number: number, publishedAt: string): PublishedVersion {
  return { number, publishedAt, tree: root };
}

describe('toProductListItem', () => {
  it('shows a seed product as never published, with no dirty flag', () => {
    const products = loadProducts(resolve(__dirname, '../../../data/trees'));
    const items = products.map(toProductListItem);

    expect(items.map((item) => item.reference).sort()).toEqual([
      'FM-AC-0031',
      'FM-JK-0207',
      'FM-TS-0142',
    ]);
    for (const item of items) {
      expect(item.publication).toBe('never-published');
      expect(item).not.toHaveProperty('workingTreeChanged');
      expect(item.lastChangedAt).toEqual(expect.any(String));
    }
  });

  it('marks the working tree changed only when it is later than the latest publication', () => {
    const changed = toProductListItem(
      product(
        [
          version(1, '2026-06-01T00:00:00.000Z'),
          version(2, '2026-06-10T00:00:00.000Z'),
        ],
        '2026-06-14T09:12:00.000Z',
      ),
    );
    const unchanged = toProductListItem(
      product(
        [version(1, '2026-06-14T09:12:00.000Z')],
        '2026-06-14T09:12:00.000Z',
      ),
    );

    expect(changed).toMatchObject({
      publication: 'published',
      version: 2,
      publishedAt: '2026-06-10T00:00:00.000Z',
      workingTreeChanged: true,
    });
    expect(unchanged).toMatchObject({
      publication: 'published',
      version: 1,
      workingTreeChanged: false,
    });
  });
});
