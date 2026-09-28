import { apply, ResolvedItem } from './apply';
import {
  ComponentItem,
  DomainError,
  Item,
  MaterialItem,
  Product,
  ProductItem,
  PublishedVersion,
  Step,
} from './product';

export function publish(product: Product, publishedAt: string): Product {
  const version: PublishedVersion = {
    number: nextNumber(product.versions),
    publishedAt,
    tree: freeze(apply(product)),
  };
  return {
    ...product,
    versions: [...product.versions, version],
  };
}

export function findPublishedVersion(
  product: Product,
  number: number,
): PublishedVersion {
  const version = product.versions.find((entry) => entry.number === number);
  if (!version) {
    throw new DomainError(
      'VERSION_NOT_FOUND',
      'Published version was not found.',
    );
  }
  return version;
}

function nextNumber(versions: PublishedVersion[]): number {
  return (
    versions.reduce(
      (highest, version) => Math.max(highest, version.number),
      0,
    ) + 1
  );
}

function freeze(item: ResolvedItem): Item {
  const steps: Step[] = item.steps.map((step) => ({
    id: step.id,
    process: step.process,
    supplierId: step.supplierId,
    countryCode: step.countryCode,
  }));
  const children = item.children.map((child) => freeze(child));
  if (item.kind === 'PRODUCT') {
    const frozen: ProductItem = {
      kind: 'PRODUCT',
      id: item.id,
      label: item.label,
      steps,
      children,
    };
    return frozen;
  }
  if (item.kind === 'MATERIAL') {
    const frozen: MaterialItem = {
      kind: 'MATERIAL',
      id: item.id,
      label: item.label,
      steps,
      children,
      rawMaterial: item.rawMaterial,
      originCountryCode: item.originCountryCode,
    };
    return frozen;
  }
  const frozen: ComponentItem = {
    kind: 'COMPONENT',
    id: item.id,
    label: item.label,
    steps,
    children,
    usageCategory: item.usageCategory,
    usagePercentage: item.usagePercentage,
    composition: item.composition.lines.map((line) => ({ ...line })),
  };
  return frozen;
}
