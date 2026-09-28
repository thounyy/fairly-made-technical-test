import { resolve } from 'node:path';
import { apply, findResolvedStep } from './apply';
import { setSupplier } from './edit-tree';
import { loadProducts } from './load-products';
import { toProductListItem } from './product-list';
import { findPublishedVersion, publish } from './publish';
import { ComponentItem, DomainError, Item, Product, Step } from './product';

const suppliers = new Set(['sup_1f3a', 'sup_7f60']);
const publishedAt = '2099-01-01T00:00:00.000Z';

function product(reference: string): Product {
  const found = loadProducts(resolve(__dirname, '../../../data/trees')).find(
    (entry) => entry.reference === reference,
  );
  if (!found) {
    throw new Error(`${reference} missing`);
  }
  return found;
}

function step(item: Item, stepId: string): Step | undefined {
  const found = item.steps.find((entry) => entry.id === stepId);
  if (found) {
    return found;
  }
  for (const child of item.children) {
    const nested = step(child, stepId);
    if (nested) {
      return nested;
    }
  }
  return undefined;
}

function component(item: Item, componentId: string): ComponentItem | undefined {
  if (item.kind === 'COMPONENT' && item.id === componentId) {
    return item;
  }
  for (const child of item.children) {
    const nested = component(child, componentId);
    if (nested) {
      return nested;
    }
  }
  return undefined;
}

describe('publish', () => {
  it('freezes the working tree as the next version and does not move the clock', () => {
    const original = product('FM-TS-0142');
    const corrected = setSupplier(original, 'stp_a1', 'sup_7f60', suppliers);
    const published = publish(corrected, publishedAt);
    const frozen = findPublishedVersion(published, 1).tree;
    const cutting = step(frozen, 'stp_a1');

    expect(cutting).toEqual({
      id: 'stp_a1',
      process: 'CUTTING',
      supplierId: 'sup_7f60',
      countryCode: 'PT',
    });
    expect(published.lastChangedAt).toBe(corrected.lastChangedAt);
    expect(published.corrections).toBe(corrected.corrections);
    expect(original.versions).toHaveLength(0);
    expect(toProductListItem(published)).toMatchObject({
      publication: 'published',
      version: 1,
      publishedAt,
      workingTreeChanged: false,
    });
  });

  it('leaves the published copy unchanged when the working tree is edited again', () => {
    const published = publish(
      product('FM-TS-0142'),
      '2026-09-01T00:00:00.000Z',
    );
    const edited = setSupplier(published, 'stp_a1', 'sup_7f60', suppliers);

    expect(step(findPublishedVersion(edited, 1).tree, 'stp_a1')).toMatchObject({
      supplierId: 'sup_1f3a',
    });
    expect(findResolvedStep(apply(edited), 'stp_a1')).toMatchObject({
      supplierId: 'sup_7f60',
      supplierOrigin: 'correction',
    });
    expect(toProductListItem(edited)).toMatchObject({
      version: 1,
      publishedAt: '2026-09-01T00:00:00.000Z',
      workingTreeChanged: true,
    });
  });

  it('keeps the earlier version when publishing again', () => {
    const first = publish(
      setSupplier(product('FM-TS-0142'), 'stp_a1', 'sup_7f60', suppliers),
      publishedAt,
    );
    const second = publish(
      setSupplier(first, 'stp_a1', 'sup_1f3a', suppliers),
      '2099-06-01T00:00:00.000Z',
    );

    expect(step(findPublishedVersion(second, 1).tree, 'stp_a1')).toMatchObject({
      supplierId: 'sup_7f60',
    });
    expect(step(findPublishedVersion(second, 2).tree, 'stp_a1')).toMatchObject({
      supplierId: 'sup_1f3a',
    });
    expect(toProductListItem(second)).toMatchObject({
      version: 2,
      publishedAt: '2099-06-01T00:00:00.000Z',
      workingTreeChanged: false,
    });
  });

  it('freezes the jacket composition that already sums to 98', () => {
    const published = publish(product('FM-JK-0207'), publishedAt);
    const denim = component(
      findPublishedVersion(published, 1).tree,
      'itm_jk0207_c1',
    );
    const sum = denim?.composition.reduce(
      (total, line) => total + line.percentage,
      0,
    );

    expect(sum).toBe(98);
    expect(Array.isArray(denim?.composition)).toBe(true);
  });

  it('rejects a version number that was never published', () => {
    const published = publish(product('FM-TS-0142'), publishedAt);

    expect(() => findPublishedVersion(published, 2)).toThrow(DomainError);
    expect(() => findPublishedVersion(published, 2)).toThrow(
      'Published version was not found.',
    );
  });
});
