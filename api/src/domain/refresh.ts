import { apply, treesMatch } from './apply';
import { parseDeclaredTree } from './load-products';
import { DomainError, Product } from './product';

export function refresh(
  product: Product,
  document: unknown,
  changedAt: string,
): Product {
  const incoming = parseDeclaredTree(document);
  if (incoming.id !== product.id) {
    throw new DomainError(
      'INVALID_TREE',
      'Refresh is for a different product.',
    );
  }

  const next: Product = { ...product, declaredTree: incoming.root };
  if (treesMatch(apply(product), apply(next))) {
    return next;
  }
  return { ...next, lastChangedAt: changedAt };
}
